import { IStorage } from "./types";
import { User as SelectUser, InsertUser, SocialLink, PageView, LinkClickData, DiscordConnection, Profile, Subscription } from "@shared/schema";
import { users, socialLinks, pageViews, profiles, subscriptions } from "@shared/schema";
import { db } from "./db";
import { eq, like, sql } from "drizzle-orm";
import session from "express-session";
import Database from "better-sqlite3";
import BetterSqlite3SessionStore from "better-sqlite3-session-store";
import crypto from 'node:crypto';

const SQLiteStore = BetterSqlite3SessionStore(session);
const sessionDb = new Database('sessions.db', { verbose: console.log });

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      this.sessionStore = new SQLiteStore({
        client: sessionDb,
        expired: {
          clear: true,
          intervalMs: 900000 //ms = 15min
        }
      });
      console.log('Session store initialized');
    } catch (error) {
      console.error('Error initializing session store:', error);
      throw error;
    }
  }

  // GitHub-related methods
  async updateGitHubData(userId: string, data: {
    githubId?: string;
    githubUsername?: string;
    githubDisplayName?: string;
    githubAvatar?: string;
    githubAccessToken?: string;
    githubPublicRepos?: number;
    githubFollowers?: number;
  }): Promise<SelectUser> {
    try {
      const [user] = await db.update(users)
        .set({
          ...data,
          lastOnline: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error in updateGitHubData:', error);
      throw error;
    }
  }

  async unlinkGitHubAccount(userId: string): Promise<SelectUser> {
    try {
      const [user] = await db.update(users)
        .set({
          githubId: null,
          githubUsername: null,
          githubDisplayName: null,
          githubAvatar: null,
          githubAccessToken: null,
          githubPublicRepos: null,
          githubFollowers: null
        })
        .where(eq(users.id, userId))
        .returning();

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error in unlinkGitHubAccount:', error);
      throw error;
    }
  }

  // Discord-related methods
  async linkDiscordAccount(userId: string, discordData: {
    discordId: string;
    discordUsername: string;
    discordAvatar: string | null;
    discordAccessToken: string;
    discordRefreshToken: string;
    discordConnections?: DiscordConnection[];
  }): Promise<SelectUser> {
    try {
      const [user] = await db.update(users)
        .set({
          ...discordData,
          lastOnline: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error in linkDiscordAccount:', error);
      throw error;
    }
  }

  async unlinkDiscordAccount(userId: string): Promise<SelectUser> {
    try {
      const [user] = await db.update(users)
        .set({
          discordId: null,
          discordUsername: null,
          discordAvatar: null,
          discordAccessToken: null,
          discordRefreshToken: null,
          discordConnections: null
        })
        .where(eq(users.id, userId))
        .returning();

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error in unlinkDiscordAccount:', error);
      throw error;
    }
  }

  async getUserByDiscordId(discordId: string): Promise<SelectUser | undefined> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.discordId, discordId));
      return user;
    } catch (error) {
      console.error('Error in getUserByDiscordId:', error);
      throw error;
    }
  }

  async getUserByGithubId(githubId: string): Promise<SelectUser | undefined> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.githubId, githubId));
      return user;
    } catch (error) {
      console.error('Error in getUserByGithubId:', error);
      throw error;
    }
  }

  async updateDiscordData(userId: string, data: {
    discordUsername?: string;
    discordAvatar?: string;
    discordConnections?: DiscordConnection[];
  }): Promise<SelectUser> {
    try {
      const [user] = await db.update(users)
        .set({
          ...data,
          lastOnline: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error in updateDiscordData:', error);
      throw error;
    }
  }

  // Profile methods
  async getProfile(id: string): Promise<Profile | undefined> {
    try {
      const [profile] = await db.select()
        .from(profiles)
        .where(eq(profiles.id, id));
      return profile;
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  }

  async getProfilesByUser(userId: string): Promise<Profile[]> {
    try {
      return await db.select()
        .from(profiles)
        .where(eq(profiles.userId, userId));
    } catch (error) {
      console.error('Error in getProfilesByUser:', error);
      throw error;
    }
  }

  async createProfile(userId: string, profile: Omit<Profile, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Profile> {
    try {
      const [newProfile] = await db.insert(profiles)
        .values({
          ...profile,
          id: crypto.randomUUID(),
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newProfile;
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    try {
      const [profile] = await db.update(profiles)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(profiles.id, id))
        .returning();

      if (!profile) {
        throw new Error('Profile not found');
      }

      return profile;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  async deleteProfile(id: string): Promise<void> {
    try {
      await db.delete(profiles).where(eq(profiles.id, id));
    } catch (error) {
      console.error('Error in deleteProfile:', error);
      throw error;
    }
  }

  // Subscription methods
  async createSubscription(data: Omit<Subscription, "id" | "createdAt" | "updatedAt">): Promise<Subscription> {
    try {
      const [subscription] = await db.insert(subscriptions)
        .values({
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return subscription;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    try {
      const [subscription] = await db.update(subscriptions)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, id))
        .returning();

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      return subscription;
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      throw error;
    }
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    try {
      // Make sure we have a complete, valid ID before querying
      if (!userId || userId.length < 36) {
        console.error(`Invalid user ID for subscription lookup: ${userId}`);
        return undefined;
      }

      // Ensure we're using the full, complete UUID for the query
      const cleanId = userId.split('/')[0]; // Remove any trailing comments that might appear in logs

      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, cleanId));

      return subscription;
    } catch (error) {
      console.error('Error in getSubscriptionByUserId:', error);
      throw error;
    }
  }

  async getSubscriptionByNowPaymentsInvoiceId(invoiceId: string): Promise<Subscription | undefined> {
    try {
      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.nowPaymentsInvoiceId, invoiceId));
      return subscription;
    } catch (error) {
      console.error('Error in getSubscriptionByNowPaymentsInvoiceId:', error);
      throw error;
    }
  }

  async searchUsers(usernameQuery: string): Promise<SelectUser[]> {
    try {
      const searchResults = await db
        .select()
        .from(users)
        .where(like(users.username, `%${usernameQuery}%`))
        .limit(10);
      return searchResults;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<SelectUser | undefined> {
    try {
      // Make sure we have a complete, valid ID before querying
      if (!id || id.length < 36) {
        console.error(`Invalid user ID: ${id}`);
        return undefined;
      }

      // Ensure we're using the full, complete UUID for the query
      const cleanId = id.split('/')[0]; // Remove any trailing comments that might appear in logs
      const [user] = await db.select().from(users).where(eq(users.id, cleanId));

      if (!user) {
        console.log(`No user found with ID: ${cleanId}`);
      }

      return user;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<SelectUser | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<SelectUser | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  async getUserByCredential(credential: string): Promise<SelectUser | undefined> {
    try {
      // Check if the provided credential is an email (contains @) or a username
      if (credential.includes('@')) {
        // If it's an email, find user by email
        return this.getUserByEmail(credential);
      } else {
        // Otherwise find user by username
        return this.getUserByUsername(credential);
      }
    } catch (error) {
      console.error('Error in getUserByCredential:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<SelectUser> {
    try {
      const [user] = await db.insert(users)
        .values({
          ...insertUser,
          id: crypto.randomUUID(),
          theme: JSON.stringify({
            particleEffect: {
              enabled: true,
              quantity: 50,
              speed: 1
            },
            sparkleEffect: {
              enabled: false,
              type: "white"
            },
            viewCountPlacement: "top-right",
            badges: ["member"],
            font: {
              family: "sans",
              size: "base",
              weight: "normal"
            },
            background: {
              type: "color",
              value: "#000000"
            },
            layout: {
              template: "classic",
              spacing: "comfortable",
              alignment: "center"
            },
            decoration: {
              enabled: false,
              name: "default",
              animation: {
                type: "none",
                speed: 1,
                scale: 1
              }
            },
            cursor: {
              enabled: false,
              type: "custom",
              value: ""
            },
            chatbot: {
              enabled: false,
              systemPrompt: "You are a helpful assistant that provides information about this profile.",
              position: "bottom-right",
              style: {
                buttonColor: "#0070f3",
                bubbleColor: "#f5f5f5",
                textColor: "#000000",
                font: "system-ui"
              },
              welcomeMessage: "👋 Hi! Feel free to ask me anything about this profile!",
              placeholderText: "Type your message here..."
            },
            enterPage: {
              enabled: true,
              text: "Enter Page",
              fontSize: "2rem",
              fontWeight: "bold",
              textColor: "#ffffff",
              animation: "fade",
              customCSS: ""
            }
          })
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<SelectUser>): Promise<SelectUser> {
    try {
      // Make sure we have a complete, valid ID before querying
      if (!id || id.length < 36) {
        console.error(`Invalid user ID for update: ${id}`);
        throw new Error('Invalid user ID for update');
      }

      // Ensure we're using the full, complete UUID for the query
      const cleanId = id.split('/')[0]; // Remove any trailing comments that might appear in logs

      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        throw new Error('No valid data provided for update');
      }

      const [user] = await db.update(users)
        .set(cleanData)
        .where(eq(users.id, cleanId))
        .returning();

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  async getUserSocialLinks(userId: string): Promise<SocialLink[]> {
    try {
      return await db.select().from(socialLinks).where(eq(socialLinks.userId, userId));
    } catch (error) {
      console.error('Error in getUserSocialLinks:', error);
      throw error;
    }
  }

  async createSocialLink(
    userId: string,
    link: Omit<SocialLink, "id" | "userId">
  ): Promise<SocialLink> {
    try {
      const [socialLink] = await db.insert(socialLinks)
        .values({
          ...link,
          id: crypto.randomUUID(),
          userId
        })
        .returning();
      return socialLink;
    } catch (error) {
      console.error('Error in createSocialLink:', error);
      throw error;
    }
  }

  async updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink> {
    try {
      const [link] = await db.update(socialLinks)
        .set(data)
        .where(eq(socialLinks.id, id))
        .returning();
      if (!link) throw new Error("Link not found");
      return link;
    } catch (error) {
      console.error('Error in updateSocialLink:', error);
      throw error;
    }
  }

  async deleteSocialLink(id: string): Promise<void> {
    try {
      await db.delete(socialLinks).where(eq(socialLinks.id, id));
    } catch (error) {
      console.error('Error in deleteSocialLink:', error);
      throw error;
    }
  }

  async getPageViews(userId: string): Promise<PageView[]> {
    try {
      return await db.select().from(pageViews).where(eq(pageViews.userId, userId));
    } catch (error) {
      console.error('Error in getPageViews:', error);
      throw error;
    }
  }

  async createPageView(data: Omit<PageView, "id">): Promise<void> {
    try {
      await db.insert(pageViews)
        .values({
          id: crypto.randomUUID(),
          ...data
        });
    } catch (error) {
      console.error('Error in createPageView:', error);
      throw error;
    }
  }

  async trackLinkClick(linkId: string, data: LinkClickData) {
    try {
      // Increment the click count in socialLinks
      await db
        .update(socialLinks)
        .set({ clickCount: sql`${socialLinks.clickCount} + 1` })
        .where(eq(socialLinks.id, linkId));
    } catch (error) {
      console.error('Error in trackLinkClick:', error);
      throw error;
    }
  }

  async getEnhancedAnalytics(userId: string): Promise<{
    pageViews: PageView[];
    linkStats: Array<{ linkId: string; title: string; clicks: number }>;
  }> {
    try {
      const [pageViewResults, linkResults] = await Promise.all([
        // Get page views
        db.select().from(pageViews).where(eq(pageViews.userId, userId)),

        // Get link click statistics
        db.select({
          linkId: socialLinks.id,
          title: socialLinks.title,
          clicks: socialLinks.clickCount
        })
          .from(socialLinks)
          .where(eq(socialLinks.userId, userId))
      ]);

      return {
        pageViews: pageViewResults,
        linkStats: linkResults
      };
    } catch (error) {
      console.error('Error in getEnhancedAnalytics:', error);
      throw error;
    }
  }

  async deleteUserSocialLinks(userId: string): Promise<void> {
    try {
      await db.delete(socialLinks)
        .where(eq(socialLinks.userId, userId));
    } catch (error) {
      console.error('Error in deleteUserSocialLinks:', error);
      throw error;
    }
  }

  async deleteUserProfiles(userId: string): Promise<void> {
    try {
      await db.delete(profiles)
        .where(eq(profiles.userId, userId));
    } catch (error) {
      console.error('Error in deleteUserProfiles:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user's page views
      await db.delete(pageViews)
        .where(eq(pageViews.userId, userId));

      // Delete user's social links
      await this.deleteUserSocialLinks(userId);

      // Delete user's profiles
      await this.deleteUserProfiles(userId);

      // Delete user's subscription
      await db.delete(subscriptions)
        .where(eq(subscriptions.userId, userId));

      // Finally, delete the user
      await db.delete(users)
        .where(eq(users.id, userId));

    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<SelectUser[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  async getUsersWithViewCounts(): Promise<Array<SelectUser & { viewCount: number }>> {
    try {
      // Get all users
      const allUsers = await db.select().from(users);

      // For each user, count their page views
      const usersWithViewCounts = await Promise.all(
        allUsers.map(async (user) => {
          const views = await db.select().from(pageViews).where(eq(pageViews.userId, user.id));
          return {
            ...user,
            viewCount: views.length
          };
        })
      );

      return usersWithViewCounts;
    } catch (error) {
      console.error('Error in getUsersWithViewCounts:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();