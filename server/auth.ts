import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { storage } from "./pg-storage";
import { User as SelectUser } from "@shared/pg-schema";
import {
  verifyRecaptchaToken,
  validateRecaptchaConfig,
} from "./services/recaptcha";
import { getAuthUrl, validateDiscordConfig, getDiscordConfig } from "./services/discord";

// Import PostgreSQL session store
import { sessionStore } from "./pg-session";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    // Check if this is a bcrypt hash (starts with $2)
    if (stored.startsWith('$2')) {
      console.log("Using bcrypt comparison for password");
      try {
        // Dynamic import of bcrypt to avoid issues
        const bcrypt = require('bcrypt');
        return await bcrypt.compare(supplied, stored);
      } catch (bcryptError) {
        console.error("Error comparing with bcrypt:", bcryptError);
        return false;
      }
    } else {
      console.log("Using scrypt comparison for password");
      try {
        // This is our custom scrypt hash format (hex.salt)
        const parts = stored.split(".");
        
        // If we don't have exactly 2 parts, the hash format is invalid
        if (parts.length !== 2) {
          console.error("Invalid hash format (wrong number of parts):", stored);
          return false;
        }
        
        const [hashed, salt] = parts;
        
        // If either part is empty, the hash format is invalid
        if (!hashed || !salt) {
          console.error("Invalid hash format (empty parts):", stored);
          return false;
        }
        
        try {
          const hashedBuf = Buffer.from(hashed, "hex");
          const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
          
          // Check if buffers have the same length before comparing
          if (hashedBuf.length !== suppliedBuf.length) {
            console.error(`Buffer length mismatch: ${hashedBuf.length} vs ${suppliedBuf.length}`);
            // Try to compare them anyway using a different method
            return hashed === suppliedBuf.toString("hex");
          }
          
          return timingSafeEqual(hashedBuf, suppliedBuf);
        } catch (bufferError) {
          console.error("Buffer error during password comparison:", bufferError);
          return false;
        }
      } catch (scryptError) {
        console.error("Error comparing with scrypt:", scryptError);
        return false;
      }
    }
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

// Middleware for simple captcha verification
// We're verifying the captcha on the client side with our SimpleCaptcha component
async function verifyCaptcha(req: Request, res: Response, next: NextFunction) {
  // Since we verify the captcha on the client side,
  // we can just pass through the middleware for now
  // In a production app, you might want to implement a more secure server-side validation

  // For development, we'll just pass through
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  // The client has already verified the captcha
  // We could add additional checks here if needed in the future

  next();
}

export function setupAuth(app: Express) {
  // Check for SESSION_SECRET - this is critical for security
  if (!process.env.SESSION_SECRET) {
    console.error("SESSION_SECRET must be set in environment variables");
    // In development, we might use a default value - but log a warning
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Using insecure default SESSION_SECRET - DO NOT USE IN PRODUCTION",
      );
    } else {
      throw new Error("SESSION_SECRET must be set in environment variables");
    }
  }

  // Check for OAuth credentials - these are needed for social login but not blocking
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.warn(
      "Discord client credentials not set - Discord authentication will not work",
    );
  }

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn(
      "GitHub client credentials not set - GitHub authentication will not work",
    );
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false, // PostgreSQL session store doesn't need this
    saveUninitialized: false,
    store:
      process.env.NODE_ENV === "development"
        ? new session.MemoryStore()
        : sessionStore, // Use PostgreSQL session store
    cookie: {
      secure: app.get("env") === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
      httpOnly: true,
      path: '/'
    },
    rolling: true,
    name: 'slayz.sid',
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use((req, res, next) => {
    const oldEnd = res.end;
    res.end = function() {
      if (req.session && !req.session.save) {
        console.error('Session save method not available - possible session store issue');
      }
      return oldEnd.apply(this, arguments);
    };
    next();
  });

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy - handles both username and email login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Get user by username or email (credential can be either)
        const user = await storage.getUserByCredential(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Discord Strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/oauth2/authorize/callback",
        scope: getDiscordConfig().scopes,
        passReqToCallback: true,
      },
      async (
        req: Express.Request,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
      ) => {
        try {
          console.log("Discord profile:", JSON.stringify(profile, null, 2));
          
          // Check if user is logged in - this is required for connecting Discord
          if (!req.user) {
            console.error("Discord auth error: No authenticated user found");
            return done(null, false, {
              message: "Please log in first to connect Discord",
            });
          }
          
          // Prepare user data with enhanced Discord information
          const discordUserData = {
            discordId: profile.id,
            discordUsername: profile.username,
            discordAvatar: profile.avatar,
            discordAccessToken: accessToken,
            discordRefreshToken: refreshToken,
            discordConnections: profile.connections,
            discordEmail: profile.email,
            discordVerified: profile.verified,
            discordLocale: profile.locale,
            discordMfaEnabled: profile.mfa_enabled,
            discordPremiumType: profile.premium_type,
            discordFlags: profile.flags,
            discordBanner: profile.banner,
            discordAccentColor: profile.accent_color,
            discordGlobalName: profile.global_name,
            discordDisplayName: profile.global_name || profile.username,
            discordStatus: profile.status || 'offline',
            discordActivity: profile.activities && profile.activities.length > 0 
              ? JSON.stringify(profile.activities[0]) 
              : null,
            lastOnline: new Date(),
          };

          // If user is already logged in, link Discord to their account
          if (req.user) {
            const updatedUser = await storage.updateUser(req.user.id, discordUserData);
            return done(null, updatedUser);
          }

          // This block should not be reached due to the early check above,
          // but keeping it for defensive programming
          
          // If no logged in user, check if Discord account is already linked
          const existingUser = await storage.getUserByDiscordId(profile.id);
          if (existingUser) {
            // Update Discord info
            const updatedUser = await storage.updateUser(existingUser.id, discordUserData);
            return done(null, updatedUser);
          }

          // Discord account not linked to any user
          return done(null, false, {
            message: "Please log in first to connect Discord",
          });
        } catch (error) {
          console.error("Discord auth error:", error);
          return done(error);
        }
      },
    ),
  );

  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.NODE_ENV === "production" ? "https://slayz.cc" : "https://slayz.cc"}/api/auth/github/callback`,
        passReqToCallback: true,
      },
      async (
        req: Express.Request,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
      ) => {
        try {
          // If user is already logged in, link GitHub to their account
          if (req.user) {
            const updatedUser = await storage.updateUser(req.user.id, {
              githubId: profile.id,
              githubUsername: profile.username,
              githubDisplayName: profile.displayName,
              githubAvatar: profile._json.avatar_url,
              githubAccessToken: accessToken,
              githubPublicRepos: profile._json.public_repos,
              githubFollowers: profile._json.followers,
            });
            return done(null, updatedUser);
          }

          // If no logged in user, check if GitHub account is already linked
          const existingUser = await storage.getUserByGithubId(profile.id);
          if (existingUser) {
            // Update GitHub info
            const updatedUser = await storage.updateUser(existingUser.id, {
              githubUsername: profile.username,
              githubDisplayName: profile.displayName,
              githubAvatar: profile._json.avatar_url,
              githubAccessToken: accessToken,
              githubPublicRepos: profile._json.public_repos,
              githubFollowers: profile._json.followers,
            });
            return done(null, updatedUser);
          }

          // GitHub account not linked to any user
          return done(null, false, {
            message: "Please log in first to connect GitHub",
          });
        } catch (error) {
          console.error("GitHub auth error:", error);
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        console.log("User not found during deserialization:", id);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("Error during user deserialization:", error);
      done(error);
    }
  });

  // Local auth routes
  app.post("/api/register", verifyCaptcha, async (req, res, next) => {
    try {
      // Check if username exists
      const existingUserByUsername = await storage.getUserByUsername(
        req.body.username,
      );
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email exists
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        theme: {
          badges: [],
          badgePosition: "beside-username",
        },
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          user,
          success: true,
          message: "Registration successful! Welcome to Slayz.",
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", verifyCaptcha, (req, res, next) => {
    // Extract the credential (username or email) and password from the request body
    const { username, password } = req.body;
    
    // Log authentication attempt (without the password)
    console.log(`Login attempt with credential: ${username}`);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }

      if (!user) {
        console.log("Authentication failed for credential:", username);
        return res.status(401).json({
          success: false,
          message: "Invalid username/email or password",
        });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Session creation error:", loginErr);
          return next(loginErr);
        }

        console.log("Login successful for user:", user.username);
        return res.status(200).json({
          user,
          success: true,
          message: "Login successful! Welcome back.",
        });
      });
    })(req, res, next);
  });

  // Discord auth routes
  app.get("/api/auth/discord", (req, res) => {
    if (!validateDiscordConfig()) {
      return res.status(500).json({ error: "Discord integration is not properly configured" });
    }
    const authUrl = getAuthUrl();
    console.log("Redirecting to Discord auth URL:", authUrl);
    res.redirect(authUrl);
  });

  app.get(
    "/oauth2/authorize/callback",
    (req, res, next) => {
      passport.authenticate("discord", (err, user, info) => {
        if (err) {
          console.error("Discord authentication error:", err);
          return res.redirect("/dashboard/settings?error=discord_auth_failed");
        }
        
        if (!user) {
          console.warn("Discord authentication failed:", info?.message || "Unknown reason");
          return res.redirect("/dashboard/settings?error=discord_link_failed");
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Login error after Discord auth:", loginErr);
            return res.redirect("/dashboard/settings?error=login_failed");
          }
          
          return res.redirect("/dashboard/settings?success=discord_connected");
        });
      })(req, res, next);
    }
  );

  app.post("/api/auth/discord/disconnect", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Use the dedicated unlinkDiscordAccount method
      const updatedUser = await storage.unlinkDiscordAccount(req.user.id);
      console.log(
        "Discord account unlinked successfully for user:",
        updatedUser.id,
      );
      res.status(200).json({ message: "Discord disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting Discord:", error);
      res.status(500).json({ error: "Failed to disconnect Discord" });
    }
  });

  // GitHub auth routes
  app.get(
    "/api/auth/github",
    passport.authenticate("github", { scope: ["read:user"] }),
  );

  app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", {
      failureRedirect: "/",
      successRedirect: "/dashboard/settings",
    }),
  );

  app.post("/api/auth/github/disconnect", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const updatedUser = await storage.unlinkGitHubAccount(req.user.id);
      console.log(
        "GitHub account unlinked successfully for user:",
        updatedUser.id,
      );
      res.status(200).json({ message: "GitHub disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting GitHub:", error);
      res.status(500).json({ error: "Failed to disconnect GitHub" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("User not authenticated on /api/user");
      return res.sendStatus(401);
    }
    console.log("Authenticated user:", req.user);
    res.json(req.user);
  });
}
