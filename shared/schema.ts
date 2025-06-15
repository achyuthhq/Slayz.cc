import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Replace SQLite imports with PostgreSQL imports
import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Clean imports for PostgreSQL
import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Discord-related types
export interface DiscordConnection {
  type: string;
  id: string;
  name: string;
  visibility: boolean;
}

// Define a SubTheme type that excludes the schedule property
export type SubTheme = Omit<Theme, 'schedule'>;

export interface Theme {
  particleEffect?: {
    enabled: boolean;
    quantity: number;
    speed: number;
    size?: number;
    color?: string;
  };
  sparkleEffect?: {
    enabled: boolean;
    type: "green" | "black" | "pink" | "red" | "white" | "yellow";
  };
  cursor?: {
    enabled: boolean;
    type: "custom" | "url";
    value: string; // File path for custom or URL for external cursor
    size?: number;
  };
  decoration?: {
    enabled: boolean;
    name: string;
    animation: {
      type: "bounce" | "glow" | "fade" | "none";
      speed: number;
      scale: number;
    };
  };
  socialIcons?: {
    colorMode: "multi" | "mono";
    monoColor?: string; // Used when colorMode is mono
    glowEnabled?: boolean; // Toggle for glow effect on social icons
  };
  badgeStyle?: {
    colorMode: "default" | "mono" | "custom";
    monoColor?: string;
    customColor?: string;
    glowEnabled?: boolean; // Toggle for glow effect on badges
  };
  usernameStyle?: {
    glowEnabled?: boolean; // Toggle for glow effect on username
    glowColor?: string; // Optional custom color for username glow
    glowIntensity?: "low" | "medium" | "high"; // Optional intensity for username glow
  };
  viewCountPlacement: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  badgePosition?: "above-username" | "below-username" | "beside-username" | "hidden";
  typingAnimation?: {
    enabled: boolean;
    speed?: number; // milliseconds per character
    startDelay?: number; // milliseconds before animation starts
  };
  spotifyLink?: string;
  badges: string[];
  font: {
    family: "sans" | "serif" | "mono" | "unbounded" | "dm-sans" | "system-ui" | "inter" | "roboto" | "lato" | "poppins" | "montserrat";
    size: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
    weight: "normal" | "medium" | "semibold" | "bold";
  };
  customCSS?: string;
  background: {
    type: "color" | "gradient" | "image" | "video" | "animation";
    value: string;
    gradientStart?: string;
    gradientEnd?: string;
    animation?: {
      name: "fade" | "slide" | "zoom" | "bounce" | "none";
      duration: number;
      direction?: "in" | "out" | "up" | "down";
    };
  };
  layout: {
    template: "classic" | "minimal" | "creative" | "professional" | "social";
    spacing: "compact" | "comfortable" | "spacious";
    alignment: "left" | "center" | "right";
  };
  chatbot: {
    enabled: boolean;
    systemPrompt: string;
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    style: {
      buttonColor: string;
      bubbleColor: string;
      textColor: string;
      font: string;
    };
    welcomeMessage: string;
    placeholderText: string;
  };
  enterPage?: {
    enabled: boolean;
    text: string;
    fontSize: string;
    fontWeight: "normal" | "medium" | "semibold" | "bold";
    textColor: string;
    animation: "none" | "fade" | "scale" | "slide";
    customCSS?: string;
  };
  schedule?: {
    enabled: boolean;
    slots: Array<{
      id: string;
      startTime: string;
      endTime: string;
      days: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
      theme: Partial<SubTheme>;
    }>;
  };
}

export const themeSchema: z.ZodType<Theme> = z.object({
  particleEffect: z.object({
    enabled: z.boolean(),
    quantity: z.number(),
    speed: z.number(),
    size: z.number().optional(),
    color: z.string().optional()
  }).optional(),
  sparkleEffect: z.object({
    enabled: z.boolean(),
    type: z.enum(["green", "black", "pink", "red", "white", "yellow"])
  }).optional(),
  cursor: z.object({
    enabled: z.boolean(),
    type: z.enum(["custom", "url"]),
    value: z.string(),
    size: z.number().optional()
  }).optional(),
  decoration: z.object({
    enabled: z.boolean(),
    name: z.string(),
    animation: z.object({
      type: z.enum(["bounce", "glow", "fade", "none"]),
      speed: z.number(),
      scale: z.number()
    })
  }).optional(),
  socialIcons: z.object({
    colorMode: z.enum(["multi", "mono"]),
    monoColor: z.string().optional(),
    glowEnabled: z.boolean().optional()
  }).optional(),
  badgeStyle: z.object({
    colorMode: z.enum(["default", "mono", "custom"]),
    monoColor: z.string().optional(),
    customColor: z.string().optional(),
    glowEnabled: z.boolean().optional()
  }).optional(),
  usernameStyle: z.object({
    glowEnabled: z.boolean().optional(),
    glowColor: z.string().optional(),
    glowIntensity: z.enum(["low", "medium", "high"]).optional()
  }).optional(),
  viewCountPlacement: z.enum(["top-right", "top-left", "bottom-right", "bottom-left"]),
  badgePosition: z.enum(["above-username", "below-username", "beside-username", "hidden"]).optional(),
  typingAnimation: z.object({
    enabled: z.boolean(),
    speed: z.number().optional(),
    startDelay: z.number().optional()
  }).optional(),
  spotifyLink: z.string().optional(),
  badges: z.array(z.string()),
  font: z.object({
    family: z.enum(["sans", "serif", "mono", "unbounded", "dm-sans", "system-ui", "inter", "roboto", "lato", "poppins", "montserrat"]),
    size: z.enum(["sm", "base", "lg", "xl", "2xl", "3xl"]),
    weight: z.enum(["normal", "medium", "semibold", "bold"])
  }),
  customCSS: z.string().optional(),
  background: z.object({
    type: z.enum(["color", "gradient", "image", "video", "animation"]),
    value: z.string(),
    gradientStart: z.string().optional(),
    gradientEnd: z.string().optional(),
    animation: z.object({
      name: z.enum(["fade", "slide", "zoom", "bounce", "none"]),
      duration: z.number(),
      direction: z.enum(["in", "out", "up", "down"]).optional()
    }).optional()
  }),
  layout: z.object({
    template: z.enum(["classic", "minimal", "creative", "professional", "social"]),
    spacing: z.enum(["compact", "comfortable", "spacious"]),
    alignment: z.enum(["left", "center", "right"])
  }),
  chatbot: z.object({
    enabled: z.boolean(),
    systemPrompt: z.string(),
    position: z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]),
    style: z.object({
      buttonColor: z.string(),
      bubbleColor: z.string(),
      textColor: z.string(),
      font: z.string()
    }),
    welcomeMessage: z.string(),
    placeholderText: z.string()
  }),
  enterPage: z.object({
    enabled: z.boolean(),
    text: z.string(),
    fontSize: z.string(),
    fontWeight: z.enum(["normal", "medium", "semibold", "bold"]),
    textColor: z.string(),
    animation: z.enum(["none", "fade", "scale", "slide"]),
    customCSS: z.string().optional()
  }).optional(),
  schedule: z.object({
    enabled: z.boolean(),
    slots: z.array(z.object({
      id: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      days: z.array(z.union([
        z.literal(0), z.literal(1), z.literal(2),
        z.literal(3), z.literal(4), z.literal(5), z.literal(6)
      ])),
      theme: z.object({}).passthrough().refine(
        (data) => {
          // Just ensure it's an object and not null
          return data !== null && typeof data === 'object';
        },
        { message: "Theme must be a valid object" }
      )
    }))
  }).optional()
});

export const insertThemeSchema = themeSchema;

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username"),
  discordAvatar: text("discord_avatar"),
  discordAccessToken: text("discord_access_token"),
  discordRefreshToken: text("discord_refresh_token"),
  discordConnections: text("discord_connections"),
  githubId: text("github_id").unique(),
  githubUsername: text("github_username"),
  githubDisplayName: text("github_display_name"),
  githubAvatar: text("github_avatar"),
  githubAccessToken: text("github_access_token"),
  githubPublicRepos: integer("github_public_repos"),
  githubFollowers: integer("github_followers"),
  lastOnline: timestamp("last_online"),
  theme: text("theme").notNull().default("{}"),
  layout: text("layout").default("classic"),
  font: text("font").default("sans"),
  profileSong: text("profile_song"),
  profileSongUrl: text("profile_song_url"),
  logo: text("logo"),
  quote: text("quote"),
  backgroundImage: text("background_image"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  subscriptionStatus: text("subscription_status").default("free"),
  subscriptionEnd: timestamp("subscription_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Profiles table for multiple profiles per user
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  theme: text("theme", { mode: "json" }).$type<Theme>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Social links table
export const socialLinks = sqliteTable("social_links", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  order: integer("order").notNull(),
  clickCount: integer("click_count").default(0).notNull()
});

// Page views table
export const pageViews = sqliteTable("page_views", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  browser: text("browser"),
  os: text("os"),
  device: text("device")
});

// Subscriptions table for premium features
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  nowPaymentsInvoiceId: text("nowpayments_invoice_id").unique(),
  paymentMethod: text("payment_method").default("stripe"), // "stripe" or "nowpayments"
  paymentCurrency: text("payment_currency"), // For crypto payment currency
  status: text("status").notNull(),
  currentPeriodStart: integer("current_period_start", { mode: "timestamp" }).notNull(),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }).notNull(),
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Schema validations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
  bio: true,
  discordId: true,
  discordUsername: true,
  discordAvatar: true,
  discordAccessToken: true,
  discordRefreshToken: true,
  discordConnections: true,
  profileSong: true,
  profileSongUrl: true,
  logo: true,
  quote: true,
  backgroundImage: true,
  githubId: true,
  githubUsername: true,
  githubDisplayName: true,
  githubAvatar: true,
  githubAccessToken: true,
  githubPublicRepos: true,
  githubFollowers: true
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
  userId: true
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SocialLink = typeof socialLinks.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

export type LinkClickData = {
  timestamp: Date;
  browser: string | null;
  os: string | null;
  device: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
};

export type AnalyticsSummary = {
  totalViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  topCountries: Array<{ country: string; views: number }>;
  topDevices: Array<{ device: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
  viewsByTime: Array<{ timestamp: string; count: number }>;
};