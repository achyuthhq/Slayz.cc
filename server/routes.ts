import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { WebSocketServer, WebSocket } from 'ws';
import { setupAuth } from "./auth";
import { storage } from "./pg-storage";
import { insertSocialLinkSchema, insertSubscriptionSchema, insertProfileSchema } from "../shared/pg-schema";
import { subscriptions, users, socialLinks } from "../shared/pg-schema";
import multer from "multer";
import path from "node:path";
import express from 'express';
import fs from 'node:fs';
import crypto from 'crypto';
import * as UAParser from 'ua-parser-js';
import Stripe from 'stripe';
import { getSpotifyTrack, getSpotifyAlbum, getSpotifyArtist } from "./lib/spotify";
import { comparePasswords, hashPassword } from "./auth"; // Import necessary functions
import { db } from "./pg-db";
import { eq, and, gt } from "drizzle-orm";
import { 
  createInvoice, 
  validateNOWPaymentsConfig, 
  getNOWPaymentsConfig, 
  verifyIPNSignature,
  SUPPORTED_CURRENCIES 
} from './services/nowpayments';
import bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { passwordResetTokens } from './schema';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Session, SessionData } from 'express-session';

// Extend the Session interface to include our custom properties
declare module 'express-session' {
  interface Session {
    user?: {
      id: string;
      username: string;
      email: string;
    };
    isAdmin?: boolean;
    adminLastActivity?: number;
  }
}

// Initialize Stripe with secret key
// Only initialize Stripe if the key is available
const stripeKey = process.env.STRIPE_SECRET_KEY;
// @ts-ignore - Stripe version compatibility
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2023-10-16' as any
}) : null;

const PREMIUM_PRICE_ID = 'price_H5ggYwtDq4fbrJ'; // Replace with your actual Stripe price ID

// Ensure uploads directory exists with absolute path
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Update file upload configuration with proper MIME types for cursor files
const upload = multer({
  storage: uploadStorage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Expanded list of allowed MIME types
    const allowedImageTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif',
      'image/webp',
      'image/avif',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/x-icon'
    ];
    
    const allowedCursorTypes = [
      'image/x-win-bitmap',    // .cur files
      'image/vnd.microsoft.icon', // .ico files
      'application/x-win-bitmap', // Alternative MIME for .cur
      'application/octet-stream' // Some browsers send this for .cur files
    ];
    
    const allowedAudioTypes = [
      'audio/mpeg',           // MP3 files
      'audio/mp3',            // Alternative MP3 MIME
      'audio/wav',            // WAV files
      'audio/ogg',            // OGG files
      'audio/flac',           // FLAC files
      'audio/aac',            // AAC files
      'audio/m4a',            // M4A files
      'audio/x-m4a'           // Alternative M4A MIME
    ];
    
    const allowedVideoTypes = [
      'video/mp4',            // MP4 files
      'video/webm',           // WebM files
      'video/ogg'             // OGV files
    ];

    // Check file type by extension for more reliable detection
    const isImageFile = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff|tif|ico)$/i.test(file.originalname);
    const isCursorFile = /\.(cur|ani|ico)$/i.test(file.originalname);
    const isAudioFile = /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(file.originalname);
    const isVideoFile = /\.(mp4|webm|ogg)$/i.test(file.originalname);
    
    // Check if the file type is allowed based on both MIME type and extension
    const isAllowedMime = 
      allowedImageTypes.includes(file.mimetype) || 
      allowedCursorTypes.includes(file.mimetype) || 
      allowedAudioTypes.includes(file.mimetype) ||
      allowedVideoTypes.includes(file.mimetype);
      
    if (isAllowedMime || isImageFile || isCursorFile || isAudioFile || isVideoFile) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a valid image, cursor, audio, or video file.'));
      return;
    }
  }
});

// Fixed admin password for development
const adminPassword = '$2b$10$7vHpPlAD/UG/yc2e05vlPu.zgCsGIjvbws5mMu5K4YNZiioKbpYgO'; // Hashed version of 'AchyuthGotRizz@7989698070$343#!'

// Initialize Resend with API key
let resend: Resend | null = null;
try {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    console.log('Initializing Resend with API key');
    resend = new Resend(resendApiKey);
  } else {
    console.warn('No Resend API key found in environment variables');
  }
} catch (error) {
  console.error('Error initializing Resend:', error);
}

// Admin authentication middleware
function requireAdmin(req: any, res: any, next: any) {
  // Log session data for debugging
  console.log('Admin session check:', { 
    hasSession: !!req.session,
    isAdmin: req.session?.isAdmin,
    sessionID: req.sessionID,
    lastActivity: req.session?.adminLastActivity
  });
  
  // Check if session exists
  if (!req.session) {
    console.error('Session object missing in requireAdmin middleware');
    return res.status(401).json({ 
      error: "Authentication required", 
      details: "Session not found"
    });
  }
  
  // Check if admin flag is set
  if (!req.session.isAdmin) {
    console.error('Admin flag not set in session');
    return res.status(401).json({ 
      error: "Admin authentication required",
      details: "Not authenticated as admin" 
    });
  }

  // Check for session expiration (30 minutes of inactivity)
  const now = Date.now();
  const lastActivity = req.session.adminLastActivity || 0;
  const inactiveTime = now - lastActivity;
  const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

  if (inactiveTime > maxInactiveTime) {
    console.log('Admin session expired after inactivity:', {
      lastActivity: new Date(lastActivity).toISOString(),
      inactiveTime: Math.round(inactiveTime / 1000 / 60) + ' minutes'
    });
    
    // Clear admin flag
    req.session.isAdmin = false;
    req.session.adminLastActivity = null;
    
    // Save session changes
    req.session.save((err) => {
      if (err) console.error('Error saving session after expiry:', err);
      
      return res.status(401).json({ 
        error: "Authentication expired", 
        details: "Your admin session has expired due to inactivity"
      });
    });
    
    return;
  }
  
  // Update last activity timestamp
  req.session.adminLastActivity = now;
  
  // Save session with updated activity timestamp
  req.session.save((err) => {
    if (err) {
      console.error('Error updating admin activity timestamp:', err);
    }
    
    // Session and admin flag are valid, proceed
    console.log('Admin authentication successful, proceeding with request');
    next();
  });
}

// Discord status types
type DiscordStatus = 'online' | 'idle' | 'dnd' | 'offline';

// Discord status cache to reduce API calls
const discordStatusCache = new Map<string, {
  status: DiscordStatus;
  timestamp: number;
}>();

// Add middleware to check premium features
function requirePremiumFeature(feature: string) {
  return async (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const isPremium = req.user.subscriptionStatus === 'premium';
    const freeFeatures = {
      'overview': true,
      'home.logo': true,
      'home.displayName': true,
      'home.audio': true,
      'home.background.basic': true,
      'home.pageSettings': true,
      'analytics': true,
      'socials.original': true,
      'badges': true,
      'settings': true,
      'chatbot.enabled': true,
      'home.decorations': true,
      'socials.unlimited': true,
      'profile.effects': true,
      'cursor.custom': true
    };

    // Block premium features for free users
    if (!isPremium && !freeFeatures[feature]) {
      return res.status(403).json({ 
        error: "Premium required",
        feature: feature,
        message: "This feature requires a premium subscription. Please upgrade to access " + feature,
        upgrade: true
      });
    }

    // Additional validation for social links
    if (feature === 'socials.unlimited') {
      const currentLinks = await storage.getUserSocialLinks(req.user.id);
      if (!isPremium && currentLinks.length >= 5) {
        return res.status(403).json({
          error: "Social links limit reached",
          feature: "socials.unlimited",
          message: "Free users are limited to 5 social links. Upgrade to Premium for unlimited links.",
          upgrade: true
        });
      }
    }

    // Additional theme validation for free users
    if (!isPremium && req.body?.theme) {
      const theme = req.body.theme;
      if (theme.chatbot?.enabled || 
          theme.decoration?.enabled ||
          theme.particleEffect?.enabled ||
          theme.sparkleEffect?.enabled ||
          theme.cursor?.enabled) {
        return res.status(403).json({
          error: "Premium required",
          feature: "premium_themes",
          message: "Theme customization requires a premium subscription",
          upgrade: true
        });
      }
    }

    next();
  };
}

// Middleware to validate social links limit
async function validateSocialLinksLimit(req: Request, res: Response, next: NextFunction) {
  try {
    // Get the user ID from the session
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if the user is premium
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        subscriptionStatus: true,
      },
    });

    const isPremium = user?.subscriptionStatus === "premium";
    
    // Get the current number of social links for this user
    const userLinks = await db.query.socialLinks.findMany({
      where: eq(socialLinks.userId, userId),
    });

    // Get the platform being added from the request body
    const { icon } = req.body;

    // Check if the user already has a link for this platform (except for website)
    if (icon && icon !== 'website') {
      const existingPlatformLink = userLinks.find((link) => link.icon === icon);
      if (existingPlatformLink) {
        return res.status(403).json({ 
          error: `You already have a link for this platform. Each social platform can only be added once.` 
        });
      }
    }

    // For website links, check if non-premium users already have one
    if (icon === 'website' && !isPremium) {
      const websiteLinks = userLinks.filter((link) => link.icon === 'website');
      if (websiteLinks.length >= 1) {
        return res.status(403).json({ 
          error: `You have reached the maximum number of website links for a free account. Upgrade to Premium to add more.` 
        });
      }
    }

    // For free users, check if they've reached the maximum total links limit
    if (!isPremium && userLinks.length >= 5) {
      return res.status(403).json({ 
        error: `You have reached the maximum number of social links for a free account. Upgrade to Premium to add more.` 
      });
    }

    // If all checks pass, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error validating social links limit:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function to retry API calls with exponential backoff
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  label: string = 'API call'
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[Steam] Attempting ${label} (attempt ${attempt + 1}/${maxRetries})`);
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      
      // Check if this is a rate limit error (429)
      const isRateLimit = error.response?.status === 429;
      
      // Only retry on rate limit errors or network errors
      if (!isRateLimit && error.response?.status) {
        console.error(`[Steam] ${label} failed with status ${error.response.status}:`, error.message);
        throw error;
      }
      
      // If we've reached the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        console.error(`[Steam] ${label} failed after ${maxRetries} attempts:`, error.message);
        throw error;
      }
      
      // Calculate delay with exponential backoff (1s, 2s, 4s, etc.)
      const delay = initialDelay * Math.pow(2, attempt);
      
      if (isRateLimit) {
        console.log(`[Steam] Rate limit hit, retrying ${label} in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      } else {
        console.log(`[Steam] Network error, retrying ${label} in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Track connected clients
  const clients = new Map<WebSocket, string>();

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'identify') {
          clients.set(ws, data.userId);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Broadcast view count updates
  const broadcastViewCount = (userId: string, count: number) => {
    const message = JSON.stringify({
      type: 'viewCount',
      userId,
      count
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Discord status API endpoint
  app.get("/api/discord/status", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { discordId } = req.query;
      
      // Validate the Discord ID
      if (!discordId || typeof discordId !== 'string') {
        return res.status(400).json({ error: "Valid Discord ID is required" });
      }

      // Check if we have a recent cached status (less than 30 seconds old)
      const cachedStatus = discordStatusCache.get(discordId);
      const now = Date.now();
      if (cachedStatus && (now - cachedStatus.timestamp < 30000)) {
        console.log(`Returning cached Discord status for ID ${discordId}: ${cachedStatus.status}`);
        return res.json({ status: cachedStatus.status });
      }

      // Get user from database to check if they have a Discord account connected
      const user = await storage.getUser(req.user.id);
      if (!user?.discordId) {
        return res.status(400).json({ error: "No Discord account connected" });
      }

      // For Discord OAuth2, we need to use the user's access token
      // This is typically stored when they connect their Discord account
      // We'll use the status stored in the user object if available
      let status: DiscordStatus = 'offline';
      
      try {
        // Use the stored Discord status if available
        if (user.discordStatus) {
          status = user.discordStatus as DiscordStatus;
        } else {
          // Make a best effort to determine user's status
          // This is a simplified approach since we don't have Gateway access
          
          // Check when the user was last active based on available timestamps
          const lastActive = user.lastOnline ? new Date(user.lastOnline).getTime() : 0;
          const fiveMinutesAgo = now - 5 * 60 * 1000;
          
          if (lastActive > fiveMinutesAgo) {
            status = 'online';
          }
        }
        
        // Cache the status
        discordStatusCache.set(discordId, {
          status,
          timestamp: now
        });
        
        return res.json({ status });
      } catch (error) {
        console.error("Error fetching Discord status:", error);
        
        // Cache the offline status
        discordStatusCache.set(discordId, {
          status: 'offline',
          timestamp: now
        });
        
        return res.json({ status: 'offline' });
      }
    } catch (error) {
      console.error("Error in Discord status endpoint:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Generate URL for the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Error handling file upload:', error);
      res.status(500).json({ error: "Failed to process file upload" });
    }
  });

  // Add this endpoint for user search  
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      console.log('User search request received:', { 
        query: req.query,
        sessionID: req.sessionID,
        isAdmin: req.session?.isAdmin
      });
      
      // Set cache control headers to prevent stale responses
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // IMPORTANT FIX: Allow empty username parameter for wildcard search
      const searchTerm = req.query.username ? req.query.username.toString() : '*';
      
      // Handle wildcard search by getting all users
      if (searchTerm === '*') {
        console.log('Performing wildcard search for all users');
        try {
          const allUsers = await storage.getAllUsers();
          // Limit to 100 users for performance
          console.log(`Found ${allUsers.length} users, returning first 100`);
          return res.json(allUsers.slice(0, 100));
        } catch (dbError) {
          console.error('Database error during wildcard search:', dbError);
          return res.status(500).json({ error: "Database error during user search" });
        }
      }
      
      // Normal search by username
      console.log(`Searching for users matching: ${searchTerm}`);
      try {
        const users = await storage.searchUsers(searchTerm);
        console.log(`Found ${users.length} matching users`);
        return res.json(users);
      } catch (dbError) {
        console.error('Database error during username search:', dbError);
        return res.status(500).json({ error: "Database error during user search" });
      }
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: "Failed to search users" });
    }
  });

  // Add badge assignment endpoint
  app.post("/api/admin/badge", requireAdmin, async (req, res) => {
    try {
      console.log("Badge API called with:", req.body);
      const { userId, badgeId, action } = req.body;

      // Validate required fields
      if (!userId || !badgeId || !action) {
        return res.status(400).json({ message: "userId, badgeId, and action are required" });
      }

      // Validate action
      if (action !== "assign" && action !== "remove") {
        return res.status(400).json({ message: "Action must be either 'assign' or 'remove'" });
      }

      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log('Current user theme:', JSON.stringify(user.theme, null, 2)); // Enhanced debug log

      // Initialize currentTheme as a proper object
      let currentTheme = {};
      
      // Handle various formats of user.theme
      if (user.theme) {
        if (typeof user.theme === 'string') {
          try {
            currentTheme = JSON.parse(user.theme);
          } catch (e) {
            console.error('Error parsing theme string:', e);
            currentTheme = {};
          }
        } else if (typeof user.theme === 'object') {
          currentTheme = { ...user.theme };
        }
      }

      // Ensure badges array exists
      if (!currentTheme.badges || !Array.isArray(currentTheme.badges)) {
        currentTheme.badges = [];
      }
      
      const currentBadges = currentTheme.badges;
      console.log('Current badges array:', currentBadges); // Debug log

      let updatedBadges;
      let statusMessage = "";
      
      if (action === "assign") {
        // Only add the badge if the user doesn't already have it
        if (!currentBadges.includes(badgeId)) {
          updatedBadges = [...currentBadges, badgeId];
          statusMessage = `Badge '${badgeId}' assigned successfully`;
          console.log(`Assigning badge ${badgeId} to user ${userId}`);
        } else {
          // User already has the badge
          console.log(`User already has badge ${badgeId}`);
          return res.json({ 
            success: true, 
            message: `User already has the '${badgeId}' badge`,
            user
          });
        }
      } else {
        // Remove badge
        updatedBadges = currentBadges.filter(badge => badge !== badgeId);
        if (updatedBadges.length === currentBadges.length) {
          // Badge wasn't found
          console.log(`Badge ${badgeId} not found on user ${userId}`);
          return res.json({ 
            success: true, 
            message: `User does not have the '${badgeId}' badge`,
            user
          });
        }
        statusMessage = `Badge '${badgeId}' removed successfully`;
        console.log(`Removing badge ${badgeId} from user ${userId}`);
      }

      console.log('Updated badges array:', updatedBadges); // Debug log

      // Update the theme with new badges
      currentTheme.badges = updatedBadges;
      
      // Update user with the modified theme
      const updatedUser = await storage.updateUser(userId, {
        theme: currentTheme
      });

      console.log('Updated user theme:', JSON.stringify(updatedUser.theme, null, 2)); // Enhanced debug log
      
      return res.json({
        success: true,
        message: statusMessage,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error in badge API:', error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to process badge operation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Add admin endpoint for deleting a user
  app.delete("/api/admin/user", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.body;

      // Validate required fields
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete the user and all associated data
      await storage.deleteUser(userId);

      res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Admin authentication endpoint
  app.post("/api/admin/auth", async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      console.log('Admin auth attempt with session ID:', req.sessionID);

      // Rate limiting - check for repeated failed attempts
      const now = Date.now();
      const failedAttempts = req.session.adminFailedAttempts || 0;
      const lastAttemptTime = req.session.adminLastAttemptTime || 0;
      
      // If there have been 5+ failed attempts in the last 15 minutes, implement exponential backoff
      if (failedAttempts >= 5 && (now - lastAttemptTime) < 15 * 60 * 1000) {
        // Calculate lockout time (increases exponentially with failed attempts)
        const lockoutSeconds = Math.min(Math.pow(2, failedAttempts - 4), 3600); // Max 1 hour
        const remainingLockout = lockoutSeconds * 1000 - (now - lastAttemptTime);
        
        if (remainingLockout > 0) {
          console.log(`Account locked due to too many failed attempts. Try again in ${Math.ceil(remainingLockout / 1000)} seconds`);
          return res.status(429).json({ 
            error: "Too many failed attempts", 
            details: `Account locked due to too many failed attempts. Try again in ${Math.ceil(remainingLockout / 1000)} seconds`,
            lockoutRemaining: Math.ceil(remainingLockout / 1000)
          });
        }
      }

      // Update attempt tracking
      req.session.adminLastAttemptTime = now;

      try {
        // Compare with admin password using bcrypt for secure comparison
        const isPasswordValid = await bcrypt.compare(password, adminPassword);
        
        if (isPasswordValid) {
          // Reset failed attempts on successful login
          req.session.adminFailedAttempts = 0;
          
          // Set admin session flag and activity timestamp
          req.session.isAdmin = true;
          req.session.adminLastActivity = now;
          
          // Generate a CSRF token for admin operations
          const csrfToken = crypto.randomBytes(32).toString('hex');
          req.session.adminCsrfToken = csrfToken;
          
          // Force session save to ensure it's persisted
          req.session.save((err) => {
            if (err) {
              console.error('Error saving admin session:', err);
              return res.status(500).json({ 
                error: "Failed to save session", 
                details: err.message 
              });
            }
            
            console.log('Admin session saved successfully with ID:', req.sessionID);
            
            // Set cache control headers to prevent stale responses
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            return res.status(200).json({ 
              success: true,
              sessionID: req.sessionID,
              csrfToken: csrfToken
            });
          });
        } else {
          // Increment failed attempts
          req.session.adminFailedAttempts = (req.session.adminFailedAttempts || 0) + 1;
          req.session.save();
          
          console.log('Invalid admin password attempt');
          return res.status(401).json({ error: "Invalid credentials" });
        }
      } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: "Internal server error" });
      }
    } catch (error) {
      console.error('Admin auth error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin stats endpoint
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = {
        totalUsers: users.length,
        premiumUsers: users.filter(u => u.subscriptionStatus === 'premium').length,
        freeUsers: users.filter(u => u.subscriptionStatus !== 'premium').length,
        activeUsers: users.filter(u => {
          const lastOnline = u.lastOnline ? new Date(u.lastOnline) : null;
          return lastOnline && lastOnline > thirtyDaysAgo;
        }).length
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      res.status(500).json({ error: "Failed to fetch user statistics" });
    }
  });

  // Admin subscription management endpoint
  app.post("/api/admin/subscription", requireAdmin, async (req, res) => {
    try {
      const { userId, status } = req.body;

      // Validate required fields
      if (!userId || !status || !['free', 'premium'].includes(status)) {
        return res.status(400).json({ 
          error: "Invalid request. userId and status (free/premium) are required" 
        });
      }

      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update subscription status
      const subscriptionEnd = status === 'premium' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        : null;

      const updatedUser = await storage.updateUser(userId, {
        subscriptionStatus: status,
        subscriptionEnd: subscriptionEnd
      });

      // If setting to premium, ensure there's a subscription record
      if (status === 'premium') {
        const existingSubscription = await storage.getSubscriptionByUserId(userId);

        if (!existingSubscription) {
          await storage.createSubscription({
            userId,
            stripeSubscriptionId: null,
            nowPaymentsInvoiceId: null,
            paymentMethod: 'admin',
            paymentCurrency: null,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: subscriptionEnd!,
            cancelAtPeriodEnd: true
          });
        } else {
          await storage.updateSubscription(existingSubscription.id, {
            status: 'active',
            currentPeriodEnd: subscriptionEnd!
          });
        }
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ error: "Failed to update subscription status" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

  // Serve decoration files from public/decorations
  const decorationsDir = path.join(process.cwd(), 'public/decorations');
  app.use('/decorations', express.static(decorationsDir, {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

  // Profile route
  app.get("/api/profile/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) return res.status(404).json({ error: "User not found" });

      const links = await storage.getUserSocialLinks(user.id);
      
      // Fetch page views for the user
      const views = await storage.getPageViews(user.id);
      
      // Only count views from the last 30 days (consistent with analytics endpoint)
      const now = new Date().getTime();
      const recentViews = views.filter(view => {
        const viewTime = new Date(view.timestamp).getTime();
        return now - viewTime <= 30 * 24 * 60 * 60 * 1000;
      });
      
      let viewCount = recentViews.length;

      // Record page view without IP filtering - but only if this isn't the user viewing their own profile
      if (!req.user || req.user.id !== user.id) {
        // Parse user agent for device and browser info
        const parser = new UAParser.UAParser(req.headers['user-agent']);
        const browser = parser.getBrowser();
        const device = parser.getDevice();
        const os = parser.getOS();

        // Record page view with device info
        await storage.createPageView({
          userId: user.id,
          timestamp: new Date(),
          browser: browser.name || 'Unknown',
          device: device.type || 'desktop',
          os: os.name || 'Unknown',
          referrer: req.headers.referer || null,
          country: req.headers['cf-ipcountry'] as string || null,
          city: null
        });

        // Update view count for response to include current view
        viewCount += 1;

        // Broadcast the updated count
        broadcastViewCount(user.id, viewCount);
      }

      // Add absolute URLs for uploaded files
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const userWithAbsoluteUrls = {
        ...user,
        logo: user.logo ? `${baseUrl}${user.logo}` : null,
        backgroundImage: user.backgroundImage ? `${baseUrl}${user.backgroundImage}` : null,
        theme: user.theme || { viewCountPlacement: "top-left", badges: [] } as any
      };

      res.json({ user: userWithAbsoluteUrls, links, viewCount });
    } catch (error) {
      console.error('Error in profile route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update profile with file uploads and JSON updates
  app.patch("/api/profile", upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'cursor', maxCount: 1 }
  ]), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates: Record<string, any> = {};
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      // Handle file uploads if present
      if (files && Object.keys(files).length > 0) {
        if (files.logo && files.logo[0]) {
          updates.logo = `/uploads/${files.logo[0].filename}`;
        }

        if (files.backgroundImage && files.backgroundImage[0]) {
          updates.backgroundImage = `/uploads/${files.backgroundImage[0].filename}`;
        }

        if (files.cursor && files.cursor[0]) {
          const cursorUrl = `/uploads/${files.cursor[0].filename}`;
          // Get current theme
          const user = await storage.getUser(req.user.id);
          const currentTheme = user?.theme || {};

          // Update theme with new cursor settings
          updates.theme = {
            ...currentTheme,
            cursor: {
              enabled: true,
              type: 'custom',
              value: cursorUrl,
              size: currentTheme.cursor?.size || 32
            }
          };
        }
      }

      // Handle JSON updates
      const contentType = req.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // Merge JSON updates with any file updates
        Object.assign(updates, req.body);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No updates provided',
          details: 'Request must include either file uploads or profile data to update'
        });
      }

      // Update user in database
      const user = await storage.updateUser(req.user.id, updates);

      // Add absolute URLs in the response
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const userWithAbsoluteUrls = {
        ...user,
        logo: user.logo ? `${baseUrl}${user.logo}` : null,
        backgroundImage: user.backgroundImage ? `${baseUrl}${user.backgroundImage}` : null,
        theme: user.theme || {}
      };

      res.json(userWithAbsoluteUrls);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error?.message || 'Failed to update profile'
      });
    }
  });

  // Profile management routes
  app.get("/api/profiles", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const profiles = await storage.getProfilesByUser(req.user.id);
    res.json(profiles);
  });

  app.post("/api/profiles", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    // Normalize theme to ensure it's either null or conforms to Theme type
    const requestData = { ...req.body };
    if (requestData.theme === undefined) {
      requestData.theme = null;
    }

    const data = insertProfileSchema.parse(requestData);
    const profile = await storage.createProfile(req.user.id, data as any);
    res.status(201).json(profile);
  });

  app.patch("/api/profiles/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const profile = await storage.updateProfile(req.params.id, req.body);
    res.json(profile);
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    await storage.deleteProfile(req.params.id);
    res.sendStatus(204);
  });

  // Social links routes
  app.get("/api/links", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const links = await storage.getUserSocialLinks(req.user.id);
    res.json(links);
  });

  app.post("/api/links", validateSocialLinksLimit, async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    
    try {
      // Ensure required fields are present
      const requestData = { 
        ...req.body,
        // Ensure icon is not undefined
        icon: req.body.icon || null,
        // Ensure order is a number
        order: typeof req.body.order === 'number' ? req.body.order : 0
      };
      
      // Validate the data against the schema
      const validatedData = insertSocialLinkSchema.parse(requestData);
      
      // Create the social link with user ID
      // Cast the validated data to the correct type to match the function parameter
      const link = await storage.createSocialLink(req.user.id, {
        title: validatedData.title,
        url: validatedData.url,
        icon: validatedData.icon || null,
        order: validatedData.order,
        clickCount: 0
      });
      
      res.status(201).json(link);
    } catch (error: any) {
      console.error("Error creating social link:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Invalid data format", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to create social link",
        details: error.message 
      });
    }
  });

  app.patch("/api/links/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const link = await storage.updateSocialLink(req.params.id, req.body);
    res.json(link);
  });

  app.delete("/api/links/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    await storage.deleteSocialLink(req.params.id);
    res.sendStatus(204);
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      // Get page views excluding the user's own views
      const views = await storage.getPageViews(req.user.id);

      //Add rate limiting to prevent abuse
      const now = new Date().getTime();
      res.json(views.filter(view => {
        // Only include views from last 30 days
        const viewTime = new Date(view.timestamp).getTime();
        return now - viewTime <= 30 * 24 * 60 * 60 * 1000;
      }));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return empty array instead of error for better user experience
      res.json([]);
    }
  });

  // Add a new route to fetch analytics for a specific username
  // This will be used by the profile page to show the correct view count
  app.get("/api/analytics/:username", async (req, res) => {
    try {
      const targetUser = await storage.getUserByUsername(req.params.username);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get page views for the specified user
      const views = await storage.getPageViews(targetUser.id);

      // Filter for last 30 days
      const now = new Date().getTime();
      const filteredViews = views.filter(view => {
        const viewTime = new Date(view.timestamp).getTime();
        return now - viewTime <= 30 * 24 * 60 * 60 * 1000;
      });

      res.json(filteredViews);
    } catch (error) {
      console.error('Error fetching analytics for username:', error);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Track link clicks
  app.post("/api/links/:id/click", async (req, res) => {
    try {
      const parser = new UAParser.UAParser(req.headers['user-agent']);
      const browser = parser.getBrowser();
      const device = parser.getDevice();
      const os = parser.getOS();

      await storage.trackLinkClick(req.params.id, {
        timestamp: new Date(),
        browser: browser.name || 'Unknown',
        device: device.type || 'desktop',
        os: os.name || 'Unknown',
        referrer: req.headers.referer || null,
        country: req.headers['cf-ipcountry'] as string || null,
        city: null
      });

      res.sendStatus(200);
    } catch (error) {
      console.error('Error tracking link click:', error);
      res.status(500).json({ error: "Failed to track link click" });
    }
  });

  // Leaderboard API - Get users ranked by profile views
  app.get("/api/leaderboard", async (req, res) => {
    try {
      console.log('Fetching leaderboard data...');
      
      // Get all users with their view counts
      const usersWithViewCounts = await storage.getUsersWithViewCounts();
      
      console.log(`Leaderboard users found: ${usersWithViewCounts.length}`);
      
      // If no users found, check if there are any users in the database
      if (usersWithViewCounts.length === 0) {
        console.log('No users found for leaderboard. Checking if any users exist in the database...');
        const allUsers = await storage.getAllUsers();
        console.log(`Total users in database: ${allUsers.length}`);
        
        if (allUsers.length > 0) {
          console.log('Users exist but leaderboard is empty. This might be a data issue.');
          // Return empty array with a 200 status
          return res.json([]);
        } else {
          console.log('No users found in the database. Returning empty leaderboard.');
          return res.json([]);
        }
      }
      
      // Add absolute URLs for uploaded files
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const usersWithAbsoluteUrls = usersWithViewCounts.map(user => ({
        ...user,
        logo: user.logo ? `${baseUrl}${user.logo}` : null,
        backgroundImage: user.backgroundImage ? `${baseUrl}${user.backgroundImage}` : null,
        // Ensure theme is included for decorations
        theme: user.theme || {}
      }));
      
      console.log(`Returning ${usersWithAbsoluteUrls.length} users for leaderboard`);
      res.json(usersWithAbsoluteUrls);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      res.status(500).json({ 
        error: "Failed to fetch leaderboard data",
        details: error.message
      });
    }
  });

  // Get enhanced analytics
  app.get("/api/analytics/enhanced", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      const analytics = await storage.getEnhancedAnalytics(req.user.id);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching enhanced analytics:', error);
      
      // Provide fallback data instead of returning an error
      res.json({
        pageViews: [],
        linkStats: []
      });
    }
  });


  // Username change endpoint
  app.post("/api/settings/username", async (req, res) => {
    try {
      console.log('Username change request received:', {
        body: req.body,
        user: req.user?.id,
        headers: req.headers['content-type']
      });

      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { newUsername, password } = req.body;

      if (!newUsername || !password) {
        console.log('Missing required fields:', { newUsername: !!newUsername, password: !!password });
        return res.status(400).json({ error: "New username and password are required" });
      }

      // Validate password
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log('Validating password for user:', req.user.id);
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Check if new username is available
      console.log('Checking if username is available:', newUsername);
      const existingUser = await storage.getUserByUsername(newUsername);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Update username
      console.log('Updating username for user:', req.user.id);
      const updatedUser = await storage.updateUser(req.user.id, { username: newUsername });

      // Update session
      req.login(updatedUser, (err) => {
        if (err) {
          console.error("Session update error:", err);
          return res.status(500).json({ error: "Failed to update session" });
        }
        console.log('Username change successful for user:', req.user.id);
        res.json(updatedUser);
      });
    } catch (error) {
      console.error("Username change error:", error);
      res.status(500).json({ error: "Failed to change username" });
    }
  });

  // Stripe payment and subscription endpoints
  app.post("/api/create-subscription", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Check if Stripe is available
      if (!stripe) {
        return res.status(503).json({
          error: "Payment service unavailable",
          details: "Stripe API key is not configured"
        });
      }

      // Get or create Stripe customer
      let stripeCustomerId = req.user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: req.user.username, // Using username as email for demo
          metadata: {
            userId: req.user.id
          }
        });
        stripeCustomerId = customer.id;
        await storage.updateUser(req.user.id, { stripeCustomerId });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: PREMIUM_PRICE_ID }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: req.user.id
        }
      });

      // Save subscription to database
      await storage.createSubscription({
        userId: req.user.id,
        stripeSubscriptionId: subscription.id,
        nowPaymentsInvoiceId: null,
        paymentMethod: 'stripe',
        paymentCurrency: null,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const payment_intent = invoice.payment_intent as Stripe.PaymentIntent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: payment_intent.client_secret
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    // Check if Stripe is available
    if (!stripe) {
      return res.status(503).json({
        error: "Payment service unavailable",
        details: "Stripe API key is not configured"
      });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      const event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret!);

      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata.userId;

          await storage.updateSubscription(subscription.id, {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: newDate(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });

          // Update user's subscription status
          await storage.updateUser(userId, {
            subscriptionStatus: subscription.status === 'active' ? 'premium' : 'free',
            subscriptionEnd: new Date(subscription.current_period_end * 1000)
          });

          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const userId = subscription.metadata.userId;

            await storage.updateUser(userId, {
              subscriptionStatus: 'premium',
              subscriptionEnd: new Date(subscription.current_period_end * 1000)
            });
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const userId = subscription.metadata.userId;

            await storage.updateUser(userId, {
              subscriptionStatus: 'free'
            });
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error: unknown) {
      console.error('Webhook error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).send(`Webhook Error: ${errorMessage}`);
    }
  });

  app.get("/api/subscription/status", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      const subscription = await storage.getSubscriptionByUserId(req.user.id);

      res.json({
        status: user?.subscriptionStatus || 'free',
        subscription: subscription,
        isPremium: user?.subscriptionStatus === 'premium' || false
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ error: "Failed to fetch subscription status" });
    }
  });

  // NOWPayments cryptocurrency endpoints
  app.get("/api/payment/crypto/currencies", async (req, res) => {
    // Check if NOWPayments API is available
    if (!validateNOWPaymentsConfig()) {
      return res.status(503).json({
        error: "Crypto payment service unavailable",
        details: "NOWPayments API is not configured"
      });
    }

    res.json(SUPPORTED_CURRENCIES);
  });

  app.get("/api/payment/status", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const orderId = req.query.order_id as string;
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    try {
      // Find subscription by order ID (extract from the order_id)
      // Since we use a format like `order-${userId}-${timestamp}`, we can extract userId
      const parts = orderId.split('-');
      if (parts.length < 3 || parts[0] !== 'order') {
        return res.status(400).json({ error: "Invalid order ID format" });
      }

      // Get user ID from order ID
      const userId = parts[1];

      // Check if userId matches the authenticated user
      if (userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this order" });
      }

      // Get subscription status
      const subscription = await storage.getSubscriptionByUserId(userId);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      // Return subscription status
      res.json({
        success: subscription.status === 'active',
        subscription: subscription
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });


  app.post("/api/payment/crypto/create-invoice", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if NOWPayments API is available
    if (!validateNOWPaymentsConfig()) {
      return res.status(503).json({
        error: "Crypto payment service unavailable",
        details: "NOWPayments API is not configured"
      });
    }

    try {const { currency, amount = 5 } = req.body;

      if (!currency) {
        return res.status(400).json({ error: "Currency is required" });
      }

      // Generate a unique order ID
      const orderId = `order-${req.user.id}-${Date.now()}`;

      // Set up return URLs
      const host = req.headers.host || 'slayz.cc';
      
      // Determine protocol - use HTTP for localhost, HTTPS for everything else
      let protocol = req.headers['x-forwarded-proto'] || 'https';
      
      // Force HTTP for localhost
      if (host.includes('localhost')) {
        protocol = 'http';
      }
      
      const baseUrl = `${protocol}://${host}`;

      const successUrl = `${baseUrl}/payment/success?order_id=${orderId}`;
      const cancelUrl = `${baseUrl}/payment/cancel?order_id=${orderId}`;

      // Create invoice with NOWPayments
      const invoice = await createInvoice({
        price: amount,
        currency: currency,
        orderId: orderId,
        orderDescription: `Premium subscription for user ${req.user.username}`,
        successUrl,
        cancelUrl
      });

      // Create a pending subscription in the database
      // For lifetime access, set a very distant expiration date (100 years from now)
      const lifetimeDate = new Date();
      lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);

      try {
        await storage.createSubscription({
          userId: req.user.id,
          stripeSubscriptionId: null,
          nowPaymentsInvoiceId: invoice.id,
          paymentMethod: 'nowpayments',
          paymentCurrency: currency,
          status: 'pending',
          currentPeriodStart: new Date(),
          currentPeriodEnd: lifetimeDate,
          cancelAtPeriodEnd: false
        });
        console.log('Subscription created successfully');
      } catch (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        throw subscriptionError;
      }

      // Return invoice information to the client
      res.json({
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoice_url,
        currency,
        amount
      });
    } catch (error) {
      console.error('Error creating crypto invoice:', error);
      res.status(500).json({ error: "Failed to create payment invoice" });
    }
  });

  // NOWPayments webhook handler for IPN (Instant Payment Notification)
  app.post("/api/webhook/nowpayments", express.json(), async (req, res) => {
    // Check if NOWPayments API is available
    const config = getNOWPaymentsConfig();
    if (!validateNOWPaymentsConfig()) {
      return res.status(503).json({
        error: "Crypto payment service unavailable",
        details: "NOWPayments API is not configured"
      });
    }

    // Extract the headers and body for signature verification
    const headers = Object.fromEntries(
      Object.entries(req.headers)
        .filter(([_, value]) => typeof value === 'string')
        .map(([key, value]) => [key, value as string])
    );

    // Verify IPN signature
    const isValidSignature = verifyIPNSignature({ 
      headers, 
      body: req.body 
    }, config.ipnSecret);

    if (!isValidSignature) {
      console.error('Invalid IPN signature');
      return res.status(401).json({ error: "Invalid signature" });
    }

    try {
      const { payment_id, payment_status, invoice_id, order_id } = req.body;

      // Find the subscription by NOWPayments invoice ID
      const existingSubscription = await storage.getSubscriptionByNowPaymentsInvoiceId(invoice_id);

      if (!existingSubscription) {
        console.error('Subscription not found for invoice:', invoice_id);
        return res.status(404).json({ error: "Subscription not found" });
      }

      // Update subscription based on payment status
      if (payment_status === 'finished' || payment_status === 'confirmed') {
        // Extract userId from order_id (format: order-{userId}-{timestamp})
        const userId = order_id.split('-')[1];

        // Create a very distant date for lifetime access (100 years from now)
        const lifetimeDate = new Date();
        lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);

        // Update subscription status for lifetime access
        await storage.updateSubscription(existingSubscription.id, {
          status: 'active',
          currentPeriodEnd: lifetimeDate,
          cancelAtPeriodEnd: false
        });

        // Update user's subscription status to premium with lifetime access
        await storage.updateUser(userId, {
          subscriptionStatus: 'premium',
          subscriptionEnd: lifetimeDate
        });

        res.json({ status: 'success' });
      } else if (payment_status === 'failed' || payment_status === 'expired') {
        // Handle failed payment
        await storage.updateSubscription(existingSubscription.id, {
          status: 'failed'
        });

        res.json({ status: 'payment_failed' });
      } else {
        // Payment is still pending
        res.json({ status: 'pending' });
      }
    } catch (error) {
      console.error('Error processing NOWPayments webhook:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add Spotify endpoints
  app.get("/api/spotify/track/:id", async (req, res) => {
    try {
      const data = await getSpotifyTrack(req.params.id);
      res.json(data);
    } catch (error) {
      console.error('Error fetching Spotify track:', error);
      res.status(500).json({ error: "Failed to fetch Spotify track data" });
    }
  });

  app.get("/api/spotify/album/:id", async (req, res) => {
    try {
      const data = await getSpotifyAlbum(req.params.id);
      res.json(data);
    } catch (error) {
      console.error('Error fetching Spotify album:', error);
      res.status(500).json({ error: "Failed to fetch Spotify album data" });
    }
  });

  app.get("/api/spotify/artist/:id", async (req, res) => {
    try {
      const data = await getSpotifyArtist(req.params.id);
      res.json(data);
    } catch (error) {
      console.error('Error fetching Spotify artist:', error);
      res.status(500).json({ error: "Failed to fetch Spotify artist data" });
    }
  });

  // Add password change endpoint
  app.post("/api/change-password", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // Get current user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password
      await storage.updateUser(req.user.id, { password: hashedPassword });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  app.post("/api/badges/claim-member", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get the user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user's badges
      const currentTheme = user.theme || {};
      const currentBadges = currentTheme.badges || [];

      if (currentBadges.includes('member')) {
        return res.status(400).json({ error: "Badge already claimed" });
      }

      const updatedBadges = [...currentBadges, 'member'];
      const updatedUser = await storage.updateUser(req.user.id, {
        theme: {
          ...currentTheme,
          badges: updatedBadges
        }
      });
      res.json(updatedUser);
    } catch (error) {
      console.error('Error claiming member badge:', error);
      res.status(500).json({ error: "Failed to claim member badge" });
    }
  });

  // Add this endpoint for account deletion
  app.delete("/api/user", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Delete all user-related data
      await storage.deleteUserSocialLinks(req.user.id);
      await storage.deleteUserProfiles(req.user.id);
      await storage.deleteUser(req.user.id);

      // Clear the session
      req.logout((err) => {
        if (err) {
          console.error("Error during logout:", err);
          return res.status(500).json({ error: "Failed to logout after account deletion" });
        }
        res.status(200).json({ message: "Account successfully deleted" });
      });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Premium feature middleware
  const premiumMiddleware = async (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    if (req.user.subscriptionStatus !== 'premium') {
      return res.status(403).json({
        error: "Premium required",
        message: "This feature requires a premium subscription",
        upgrade: true
      });
    }
    next();
  };

  // Apply premium middleware to protected routes
  app.use('/api/chatbot', premiumMiddleware);
  app.use('/api/profile/decorations', premiumMiddleware);
  app.use('/api/profile/effects', premiumMiddleware);
  app.use('/api/profile/cursor', premiumMiddleware);

  // Add validation for theme updates
  app.patch("/api/profile", upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'cursor', maxCount: 1 }
  ]), premiumMiddleware, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates: Record<string, any> = {};
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      // Handle file uploads if present
      if (files && Object.keys(files).length > 0) {
        if (files.logo && files.logo[0]) {
          updates.logo = `/uploads/${files.logo[0].filename}`;
        }

        if (files.backgroundImage && files.backgroundImage[0]) {
          updates.backgroundImage = `/uploads/${files.backgroundImage[0].filename}`;
        }

        if (files.cursor && files.cursor[0]) {
          const cursorUrl = `/uploads/${files.cursor[0].filename}`;
          // Get current theme
          const user = await storage.getUser(req.user.id);
          const currentTheme = user?.theme || {};

          // Update theme with new cursor settings
          updates.theme = {
            ...currentTheme,
            cursor: {
              enabled: true,
              type: 'custom',
              value: cursorUrl,
              size: currentTheme.cursor?.size || 32
            }
          };
        }
      }

      // Handle JSON updates
      const contentType = req.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // Merge JSON updates with any file updates
        Object.assign(updates, req.body);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No updates provided',
          details: 'Request must include either file uploads or profile data to update'
        });
      }

      // Update user in database
      const user = await storage.updateUser(req.user.id, updates);

      // Add absolute URLs in the response
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const userWithAbsoluteUrls = {
        ...user,
        logo: user.logo ? `${baseUrl}${user.logo}` : null,
        backgroundImage: user.backgroundImage ? `${baseUrl}${user.backgroundImage}` : null,
        theme: user.theme || {}
      };

      res.json(userWithAbsoluteUrls);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error?.message || 'Failed to update profile'
      });
    }
  });

  // Social links validation middleware
  app.use('/api/links', async (req, res, next) => {
    if (req.method === 'POST') {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const links = await storage.getUserSocialLinks(req.user.id);
      if (links.length >= 5 && req.user.subscriptionStatus !== 'premium') {
        return res.status(403).json({
          error: "Premium required",
          feature: "socials.unlimited",
          message: "Free users are limited to 5 social links. Upgrade to Premium for unlimited links.",
          upgrade: true
        });
      }
    }
    next();
  });

  // Profile customization routes with premium checks
  app.patch("/api/profile/decorations", premiumMiddleware, async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const user = await storage.updateUser(req.user.id, {
      theme: {
        ...req.user.theme,
        decorations: req.body
      }
    });
    res.json(user);
  });

  // Update the forgot-password endpoint to show a specific error message when email isn't found
  app.post('/api/forgot-password', async (req, res) => {
    try {
      console.log("Forgot password request received:", req.body);
      
      const { email, turnstileToken } = req.body;

      if (!email || !turnstileToken) {
        console.log("Missing required fields:", { email: !!email, turnstileToken: !!turnstileToken });
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // For SimpleCaptcha, we can just verify that a token was provided
      // Since the validation was already done on the client side
      console.log("Using SimpleCaptcha token:", turnstileToken);
      
      // Check if user exists
      console.log("Checking if user exists with email:", email);
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        console.log("User found:", !!user);

        // If no user is found with this email, return a generic success message
        // This prevents user enumeration attacks by not revealing if an email exists
        if (!user) {
          console.log("No user found with email:", email);
          return res.status(200).json({ 
            message: 'If an account with this email exists, a password reset link has been sent' 
          });
        }

        // Check if there's an existing token for this email
        const existingToken = await db.query.passwordResetTokens.findFirst({
          where: eq(passwordResetTokens.email, email),
        });

        // If a token exists, check when it was created
        if (existingToken) {
          const now = new Date();
          const tokenCreationTime = new Date(existingToken.createdAt || existingToken.expiresAt);
          // Set creation time to 1 hour before expiration if createdAt is not available
          if (!existingToken.createdAt) {
            tokenCreationTime.setHours(tokenCreationTime.getHours() - 1);
          }
          
          // Calculate hours since last request
          const hoursSinceLastRequest = (now.getTime() - tokenCreationTime.getTime()) / (1000 * 60 * 60);
          
          console.log(`Hours since last password reset request: ${hoursSinceLastRequest.toFixed(2)}`);
          
          // If it's been less than 4 hours, return an error with time remaining
          if (hoursSinceLastRequest < 4) {
            const timeLeftHours = Math.floor(4 - hoursSinceLastRequest);
            const timeLeftMinutes = Math.floor((4 - hoursSinceLastRequest - timeLeftHours) * 60);
            
            console.log(`Rate limit exceeded for ${email}. Time left: ${timeLeftHours}h ${timeLeftMinutes}m`);
            
            return res.status(429).json({
              message: `Rate limit exceeded. Please try again in ${timeLeftHours} hour${timeLeftHours !== 1 ? 's' : ''} and ${timeLeftMinutes} minute${timeLeftMinutes !== 1 ? 's' : ''}.`,
              timeLeft: {
                hours: timeLeftHours,
                minutes: timeLeftMinutes
              }
            });
          } else {
            console.log(`Rate limit check passed. Last request was ${hoursSinceLastRequest.toFixed(2)} hours ago`);
          }
        } else {
          console.log("No existing reset token found, first request for this email");
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Set expiration time (1 hour from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        console.log("Deleting any existing tokens for email:", email);
        // Delete any existing tokens for this user
        try {
          await db.delete(passwordResetTokens)
            .where(eq(passwordResetTokens.email, email));
          console.log("Existing tokens deleted");
        } catch (deleteError) {
          console.error("Error deleting existing tokens:", deleteError);
        }

        console.log("Inserting new token with expiration:", expiresAt);
        // Insert new token with current timestamp
        const now = new Date();
        try {
          await db.insert(passwordResetTokens).values({
            token: resetToken,
            email: email,
            expiresAt: expiresAt,
            createdAt: now // Store creation time for rate limiting
          });
          console.log("Token inserted successfully");
        } catch (insertError) {
          console.error("Error inserting token:", insertError);
          return res.status(500).json({ message: 'Error creating password reset token' });
        }
        
        // Get hostname from request or use default
        const host = req.headers.host || 'slayz.cc';
        
        // Determine protocol - use HTTP for localhost, HTTPS for everything else
        let protocol = req.headers['x-forwarded-proto'] || 'https';
        
        // Force HTTP for localhost
        if (host.includes('localhost')) {
          protocol = 'http';
        }
        
        // Build reset URL
        const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        console.log("Reset URL generated:", resetUrl);
        
        // Use a more reliable sender address - use your own domain or resend's test domain
        const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        console.log("Using sender email:", fromEmail);
        
        // Check if Resend API key is available
        if (!process.env.RESEND_API_KEY) {
          console.error("Resend API key is missing in environment variables");
          console.log("For testing purposes, here's the reset link that would be sent:", resetUrl);
          return res.status(500).json({ 
            message: 'Email service is not configured. Please add a RESEND_API_KEY to your .env file.',
            // Only send the token for development purposes
            debug: process.env.NODE_ENV === 'development' ? { resetUrl } : undefined
          });
        }
        
        // Log the intended recipient
        console.log("Preparing to send password reset email to:", email);

        // Send email with reset link
        try {
          console.log("Attempting to send email to:", email);
          console.log("Using Resend API key:", process.env.RESEND_API_KEY ? "Key is set" : "Key is NOT set");
          
          // Force development mode to always show debug info
          const isDevelopment = true; // Always show debug info until we fix the email sending
          
          // Check if Resend is initialized
          if (!resend) {
            console.error("Resend API is not initialized");
            
            // In development mode, still provide the reset link
            if (isDevelopment || process.env.NODE_ENV === 'development') {
              return res.status(200).json({ 
                message: 'Email service is not configured. Use this reset link for testing:',
                debug: { resetUrl },
                error: "Resend API is not initialized. Check your RESEND_API_KEY in .env"
              });
            }
            
            return res.status(500).json({ 
              message: 'Email service is not configured. Please contact the administrator.'
            });
          }
          
          // Send the email to the actual user email - no overrides
          const emailResult = await resend.emails.send({
            from: fromEmail,
            to: email, // Always use the user's actual email address - never override
            subject: 'Reset your Slayz.cc password',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Reset your Slayz.cc password</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(35, 35, 35, 0.95) 100%); border-radius: 16px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); border: 1px solid rgba(142, 68, 173, 0.3);">
                      
                      <!-- Header with Logo -->
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%); border-radius: 50%; width: 80px; height: 80px; padding: 5px; margin: 0 auto 20px auto; box-shadow: 0 4px 10px rgba(142, 68, 173, 0.3);">
                          <img src="https://i.ibb.co/RkqWRMGF/slayz-logo.jpg" alt="Slayz.cc Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
                        <div style="width: 50px; height: 4px; background: linear-gradient(to right, #8e44ad, #9b59b6); margin: 15px auto 0 auto; border-radius: 2px;"></div>
                      </div>
                      
                      <!-- Content -->
                      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Hello,</p>
                      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">We received a request to reset your password for your Slayz.cc account. Click the button below to set a new password:</p>
                      
                      <!-- Reset Button -->
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #8e44ad, #9b59b6); color: white; padding: 16px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; transition: all 0.3s; box-shadow: 0 5px 15px rgba(142, 68, 173, 0.4);">
                          Reset Password
                        </a>
                      </div>
                      
                      <!-- Security Notice -->
                      <div style="background: rgba(142, 68, 173, 0.1); border-left: 4px solid #8e44ad; padding: 15px; border-radius: 6px; margin: 30px 0;">
                        <p style="color: #cccccc; font-size: 14px; line-height: 1.5; margin: 0 0 10px 0;">
                          <strong style="color: #ffffff;">Important Security Notice:</strong>
                        </p>
                        <p style="color: #cccccc; font-size: 14px; line-height: 1.5; margin: 0;">
                          • This link will expire in 1 hour<br>
                          • If you didn't request this password reset, you can safely ignore this email<br>
                          • For security, this link can only be used once
                        </p>
                      </div>
                      
                      <!-- Footer -->
                      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
                        <p style="color: #999999; font-size: 13px; margin-bottom: 10px;">© ${new Date().getFullYear()} Slayz.cc. All rights reserved.</p>
                        <div>
                          <a href="https://slayz.cc/privacy" style="color: #9b59b6; text-decoration: none; font-size: 13px; margin: 0 10px;">Privacy Policy</a>
                          <a href="https://slayz.cc/terms" style="color: #9b59b6; text-decoration: none; font-size: 13px; margin: 0 10px;">Terms of Service</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
          
          console.log("Email sending response:", JSON.stringify(emailResult, null, 2));
          
          // Check if there was an error in the Resend response
          if (emailResult.error) {
            console.error("Resend API error:", emailResult.error);
            console.error("Error details:", JSON.stringify(emailResult, null, 2));
            
            // In development mode or if we're forcing debug info, return the reset URL
            if (isDevelopment || process.env.NODE_ENV === 'development') {
              return res.status(200).json({ 
                message: 'For development: Use this reset link to continue',
                debug: { resetUrl },
                emailError: emailResult.error
              });
            }
            
            // For production, don't expose details about the error
            return res.status(200).json({ 
              message: 'If an account with this email exists, a password reset link has been sent' 
            });
          }
          
          // Return success response
          console.log("Email sent successfully to:", email);
          
          // In development mode or if we're forcing debug info, include the reset URL
          if (isDevelopment || process.env.NODE_ENV === 'development') {
            return res.status(200).json({ 
              message: 'Password reset link has been sent. For development, you can also use the debug link below.',
              debug: { resetUrl }
            });
          }
          
          return res.status(200).json({ 
            message: 'If an account with this email exists, a password reset link has been sent' 
          });
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          console.error("Detailed error:", JSON.stringify(emailError, null, 2));
          
          // In development mode or if we're forcing debug info, return the reset URL
          if (isDevelopment || process.env.NODE_ENV === 'development') {
            return res.status(200).json({ 
              message: 'For development: Use this reset link to continue',
              debug: { resetUrl },
              error: emailError instanceof Error ? emailError.message : 'Unknown error'
            });
          }
          
          // In production, don't reveal if email exists
          return res.status(200).json({ 
            message: 'If an account with this email exists, a password reset link has been sent' 
          });
        }
      } catch (dbError) {
        console.error("Database error checking user:", dbError);
        // Generic response to prevent information leakage
        return res.status(200).json({ 
          message: 'If an account with this email exists, a password reset link has been sent' 
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      // Generic response to prevent information leakage
      return res.status(200).json({ 
        message: 'If an account with this email exists, a password reset link has been sent' 
      });
    }
  });

  // Add the reset-password endpoint for handling password reset submissions
  app.post('/api/reset-password', async (req, res) => {
    try {
      const { token, email, password } = req.body;

      if (!token || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Verify the reset token in the database
      const tokenRecord = await db.query.passwordResetTokens.findFirst({
        where: and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.email, email),
          gt(passwordResetTokens.expiresAt, new Date())
        ),
      });

      if (!tokenRecord) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Find the user with this email
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      // Import the hashPassword function from auth.ts to ensure we're using the same hashing method
      // Hash the new password using the hashPassword function from auth.ts
      const hashedPassword = await hashPassword(password);
      
      console.log('Updating password for user:', user.id);

      // Update the user's password
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));

      // Delete the used token
      await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, tokenRecord.id));

      console.log('Password reset successful for user:', user.id);
      return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({ message: 'An unexpected error occurred' });
    }
  });

  // Add a verify-token endpoint for validating reset tokens
  app.get('/api/verify-token', async (req, res) => {
    try {
      const { token, email } = req.query;
      
      console.log('Token verification request received:', { token, email });
      
      if (!token || !email) {
        console.log('Missing token or email in verification request');
        return res.status(400).json({ message: 'Missing token or email' });
      }
      
      // Log database schema info
      console.log('Database schemas available:', Object.keys(db.query));
      console.log('Attempting to find token record in database');
      
      // Verify the token in the database
      try {
        const tokenRecord = await db.query.passwordResetTokens.findFirst({
          where: and(
            eq(passwordResetTokens.token, token as string),
            eq(passwordResetTokens.email, email as string),
            gt(passwordResetTokens.expiresAt, new Date())
          ),
        });
        
        console.log('Token query result:', tokenRecord ? 'Token found' : 'Token not found');
        
        if (!tokenRecord) {
          return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        console.log('Token verification successful');
        return res.status(200).json({ message: 'Token is valid' });
      } catch (dbError) {
        console.error('Database error during token verification:', dbError);
        throw new Error('Database error: ' + (dbError instanceof Error ? dbError.message : String(dbError)));
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(500).json({ message: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Steam Authentication Routes
  app.post('/api/auth/steam/connect', async (req, res) => {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Get the Steam ID from the request body
      const { steamId } = req.body;
      
      if (!steamId) {
        return res.status(400).json({ error: 'Steam ID is required' });
      }
      
      console.log(`[Steam] Connect request received for Steam ID: ${steamId}`);
      
      // Fetch user data from Steam API
      const apiKey = process.env.STEAM_API_KEY;
      if (!apiKey) {
        console.error('[Steam] API key is missing');
        return res.status(500).json({ error: 'Steam API key is missing' });
      }

      let actualSteamId = steamId;
      
      // Check if this is a custom URL (id/username format)
      if (steamId.startsWith('id/')) {
        const username = steamId.substring(3);
        console.log(`[Steam] Detected custom URL format. Extracting username: ${username}`);
        
        try {
          // Use the Steam API to resolve the vanity URL to a Steam ID with retry
          const resolveVanityUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${username}`;
          
          console.log(`[Steam] Resolving vanity URL for username: ${username}`);
          
          const resolveResponse = await retryApiCall(
            () => axios.get(resolveVanityUrl, { timeout: 10000 }),
            3,  // Max 3 retries
            2000, // Start with 2 second delay
            'Vanity URL resolution'
          );
          
          console.log(`[Steam] Vanity URL API response:`, JSON.stringify(resolveResponse.data));
          
          if (resolveResponse.data.response.success === 1) {
            actualSteamId = resolveResponse.data.response.steamid;
            console.log(`[Steam] Successfully resolved vanity URL to Steam ID: ${actualSteamId}`);
          } else {
            console.error(`[Steam] Failed to resolve vanity URL. Response:`, JSON.stringify(resolveResponse.data));
            
            // Check for specific error messages
            if (resolveResponse.data.response.message) {
              return res.status(404).json({ 
                error: `Could not resolve Steam username: ${resolveResponse.data.response.message}. Try using your numeric Steam ID instead.` 
              });
            }
            
            return res.status(404).json({ 
              error: 'Could not resolve Steam username. This could mean the username does not exist or your profile is private. Try using your numeric Steam ID instead.' 
            });
          }
        } catch (apiError: any) {
          console.error('[Steam] Error resolving Steam vanity URL:', apiError);
          
          // Check if this is a rate limit error after all retries
          if (apiError.response?.status === 429) {
            return res.status(429).json({ 
              error: 'Steam API rate limit reached. Please try again in a few minutes. Steam restricts how many requests we can make to their API in a short period.' 
            });
          }
          
          return res.status(500).json({ 
            error: 'Failed to connect to Steam API. Please try again later or use your numeric Steam ID instead.' 
          });
        }
      } else if (/^[0-9]+$/.test(actualSteamId)) {
        console.log(`[Steam] Using numeric Steam ID: ${actualSteamId}`);
        
        // Check if the ID is the correct length for a Steam ID (17 digits)
        if (actualSteamId.length !== 17) {
          console.warn(`[Steam] Numeric Steam ID has unusual length: ${actualSteamId.length} digits (expected 17)`);
        }
      } else {
        console.log(`[Steam] Using direct Steam ID: ${actualSteamId}`);
      }
      
      // Add a small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch user profile from Steam API with retry
      try {
        console.log(`[Steam] Fetching Steam profile for ID: ${actualSteamId}`);
        
        const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${actualSteamId}`;
        const steamUserResponse = await retryApiCall(
          () => axios.get(steamApiUrl, { timeout: 10000 }),
          3,  // Max 3 retries
          2000, // Start with 2 second delay
          'Player profile fetch'
        );
        
        console.log(`[Steam] GetPlayerSummaries API response:`, 
          steamUserResponse.data.response.players.length > 0 
            ? `Found ${steamUserResponse.data.response.players.length} players` 
            : 'No players found'
        );
        
        const userData = steamUserResponse.data.response.players[0];
        if (!userData) {
          console.error(`[Steam] No user data found for Steam ID: ${actualSteamId}`);
          
          // Provide more helpful error message based on whether this was a vanity URL or direct ID
          if (steamId.startsWith('id/')) {
            return res.status(404).json({ 
              error: `Steam user not found with username "${steamId.substring(3)}". Make sure your profile is public and the username is correct, or try using your numeric Steam ID instead.` 
            });
          } else {
            return res.status(404).json({ 
              error: 'Steam user not found with the provided ID. Make sure your profile is public and the ID is correct.' 
            });
          }
        }
        
        console.log(`[Steam] Found user: ${userData.personaname} (${userData.profileurl})`);
        
        // Add a small delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch games count from Steam API with retry (but don't fail if this doesn't work)
        let gamesCount = 0;
        let totalPlaytime = 0;
        let recentPlaytime = 0;
        let recentlyPlayedGames = [];
        
        try {
          console.log(`[Steam] Fetching games data for Steam ID: ${actualSteamId}`);
          
          const gamesApiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${actualSteamId}&include_appinfo=true&include_played_free_games=true`;
          const steamGamesResponse = await retryApiCall(
            () => axios.get(gamesApiUrl, { timeout: 10000 }),
            2,  // Only 2 retries for games (less critical)
            2000, // Start with 2 second delay
            'Games data fetch'
          );
          
          if (steamGamesResponse.data.response && steamGamesResponse.data.response.game_count !== undefined) {
            gamesCount = steamGamesResponse.data.response.game_count;
            console.log(`[Steam] Found ${gamesCount} games for user`);
            
            // Calculate total playtime across all games
            if (steamGamesResponse.data.response.games && Array.isArray(steamGamesResponse.data.response.games)) {
              totalPlaytime = steamGamesResponse.data.response.games.reduce((total, game) => {
                return total + (game.playtime_forever || 0);
              }, 0);
              console.log(`[Steam] Total playtime across all games: ${totalPlaytime} minutes`);
            }
          } else {
            console.log('[Steam] Games count not available, possibly private game library');
          }
          
          // Add a small delay between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Fetch recently played games
          console.log(`[Steam] Fetching recently played games for Steam ID: ${actualSteamId}`);
          
          const recentGamesApiUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${apiKey}&steamid=${actualSteamId}&count=5`;
          const recentGamesResponse = await retryApiCall(
            () => axios.get(recentGamesApiUrl, { timeout: 10000 }),
            2,  // Only 2 retries for recent games (less critical)
            2000, // Start with 2 second delay
            'Recent games fetch'
          );
          
          if (recentGamesResponse.data.response && recentGamesResponse.data.response.games) {
            recentlyPlayedGames = recentGamesResponse.data.response.games;
            
            // Calculate recent playtime (last 2 weeks)
            recentPlaytime = recentlyPlayedGames.reduce((total, game) => {
              return total + (game.playtime_2weeks || 0);
            }, 0);
            
            console.log(`[Steam] Found ${recentlyPlayedGames.length} recently played games`);
            console.log(`[Steam] Recent playtime (2 weeks): ${recentPlaytime} minutes`);
          } else {
            console.log('[Steam] No recently played games found or private game library');
          }
        } catch (gamesError: any) {
          console.error('[Steam] Error fetching Steam games data:', gamesError.message);
          // Continue even if games data fails - it's not critical
          console.log('[Steam] Continuing without complete games data due to error');
        }
        
        console.log(`[Steam] Updating user record with Steam data for user ID: ${req.user.id}`);
        
        // Update user record with Steam data
        await storage.updateUser(req.user.id, {
          steamId: actualSteamId,
          steamUsername: userData.personaname,
          steamAvatar: userData.avatarfull,
          steamProfileUrl: userData.profileurl,
          steamGamesCount: gamesCount,
          steamPersonastate: userData.personastate,
          steamLastLogoff: userData.lastlogoff,
          steamTotalPlaytime: totalPlaytime,
          steamRecentPlaytime: recentPlaytime,
          steamRecentlyPlayedGames: recentlyPlayedGames,
          _steamTimestamp: Date.now()
        });
        
        console.log(`[Steam] User record updated successfully`);
        
        // Return success with the updated user data
        return res.status(200).json({ 
          success: true, 
          message: 'Steam account connected successfully',
          steamUser: {
            steamId: actualSteamId,
            username: userData.personaname,
            avatar: userData.avatarfull,
            profileUrl: userData.profileurl,
            gamesCount: gamesCount
          }
        });
      } catch (profileError: any) {
        console.error('[Steam] Error fetching Steam profile:', profileError.message);
        
        // Check if this is a rate limit error after all retries
        if (profileError.response?.status === 429) {
          return res.status(429).json({ 
            error: 'Steam API rate limit reached. Please try again in a few minutes. Steam restricts how many requests we can make to their API in a short period.' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Failed to fetch Steam profile. Please make sure your profile is public and try again later.' 
        });
      }
    } catch (error: any) {
      console.error('[Steam] Unexpected error connecting Steam account:', error);
      return res.status(500).json({ 
        error: 'Failed to connect Steam account. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post('/api/auth/steam/disconnect', async (req, res) => {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Update user record to remove Steam data
      await storage.updateUser(req.user.id, {
        steam_id: null,
        steam_username: null,
        steam_avatar: null,
        steam_profile_url: null,
        steam_games_count: null
      });
      
      return res.status(200).json({ success: true, message: 'Steam account disconnected' });
    } catch (error) {
      console.error('Error disconnecting Steam account:', error);
      return res.status(500).json({ error: 'Failed to disconnect Steam account' });
    }
  });

  return httpServer;
}