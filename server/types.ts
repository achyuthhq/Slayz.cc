import { User, InsertUser, Profile, SocialLink, PageView, DiscordConnection, Subscription } from "@shared/pg-schema";
import type { Store } from "express-session";

// Add session declaration to include admin-related properties
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
    adminLastActivity?: number;
    adminFailedAttempts?: number;
    adminLastAttemptTime?: number;
    adminCsrfToken?: string;
  }
}

export interface IStorage {
  sessionStore: Store;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByCredential(credential: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersWithViewCounts(): Promise<Array<User & { viewCount: number }>>;

  // Discord-related methods
  linkDiscordAccount(userId: string, discordData: {
    discordId: string;
    discordUsername: string;
    discordAvatar: string | null;
    discordAccessToken: string;
    discordRefreshToken: string;
    discordConnections?: DiscordConnection[];
  }): Promise<User>;
  unlinkDiscordAccount(userId: string): Promise<User>;
  updateDiscordData(userId: string, data: {
    discordUsername?: string;
    discordAvatar?: string;
    discordConnections?: DiscordConnection[];
  }): Promise<User>;

  // Profile methods
  getProfile(id: string): Promise<Profile | undefined>;
  getProfilesByUser(userId: string): Promise<Profile[]>;
  createProfile(userId: string, profile: Omit<Profile, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Profile>;
  updateProfile(id: string, data: Partial<Profile>): Promise<Profile>;
  deleteProfile(id: string): Promise<void>;

  // Social link methods
  getUserSocialLinks(userId: string): Promise<SocialLink[]>;
  createSocialLink(userId: string, link: Omit<SocialLink, "id" | "userId">): Promise<SocialLink>;
  updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink>;
  deleteSocialLink(id: string): Promise<void>;

  // Analytics methods
  getPageViews(userId: string): Promise<PageView[]>;
  createPageView(data: Omit<PageView, "id">): Promise<void>;

  // Analytics enhancements
  trackLinkClick(linkId: string, data: {
    browser: string | null;
    os: string | null;
    device: string | null;
    referrer: string | null;
    country: string | null;
    city: string | null;
  }): Promise<void>;
  getEnhancedAnalytics(userId: string): Promise<{
    pageViews: PageView[];
    linkStats: Array<{ linkId: string; title: string; clicks: number }>;
  }>;

  // Subscription methods
  createSubscription(data: Omit<Subscription, "id" | "createdAt" | "updatedAt">): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByNowPaymentsInvoiceId(invoiceId: string): Promise<Subscription | undefined>;
}