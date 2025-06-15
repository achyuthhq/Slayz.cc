import { IStorage } from "./types";
import { User as SelectUser, InsertUser, SocialLink, PageView, LinkClickData, DiscordConnection, Profile, Subscription } from "@shared/pg-schema";
import { users, socialLinks, pageViews, profiles, subscriptions } from "@shared/pg-schema";
import { db } from "./pg-db";
import { eq, like, sql, desc } from "drizzle-orm";
import session from "express-session";
import { sessionStore } from "./pg-session";
import crypto from 'node:crypto';

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      this.sessionStore = sessionStore;
      console.log('PostgreSQL session store initialized');
    } catch (error) {
      console.error('Error initializing PostgreSQL session store:', error);
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
      await db.delete(profiles)
        .where(eq(profiles.id, id));
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
      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));
      return subscription;
    } catch (error) {
      console.error('Error in getSubscriptionByUserId:', error);
      throw error;
    }
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    try {
      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
      return subscription;
    } catch (error) {
      console.error('Error in getSubscriptionByStripeId:', error);
      throw error;
    }
  }

  async getSubscriptionByNowPaymentsInvoiceId(invoiceId: string): Promise<Subscription | undefined> {
    try {
      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.nowpaymentsInvoiceId, invoiceId));
      return subscription;
    } catch (error) {
      console.error('Error in getSubscriptionByNowPaymentsInvoiceId:', error);
      throw error;
    }
  }

  // User methods
  async searchUsers(usernameQuery: string): Promise<SelectUser[]> {
    try {
      return await db.select()
        .from(users)
        .where(like(users.username, `%${usernameQuery}%`))
        .limit(10);
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<SelectUser | undefined> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<SelectUser | undefined> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<SelectUser | undefined> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  async getUserByCredential(credential: string): Promise<SelectUser | undefined> {
    try {
      // Check if credential is an email or username
      const [user] = await db.select()
        .from(users)
        .where(
          sql`${users.email} = ${credential} OR ${users.username} = ${credential}`
        );
      return user;
    } catch (error) {
      console.error('Error in getUserByCredential:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<SelectUser> {
    try {
      const id = crypto.randomUUID();

      // Create default theme with required properties
      const defaultTheme = {
        primary: '#000000',
        background: '#ffffff',
        text: '#000000',
        accent: '#3B82F6',
        badges: [] as string[],
        badgePosition: "beside-username" as const,
        viewCountPlacement: 'top-right' as const,
        font: {
          family: 'sans' as const,
          size: 'base' as const,
          weight: 'normal' as const
        }
      };

      // Handle user theme safely
      let mergedTheme: any = { ...defaultTheme };
      
      // Only merge if theme is a non-array object
      if (insertUser.theme && 
          typeof insertUser.theme === 'object' && 
          !Array.isArray(insertUser.theme)) {
        mergedTheme = { 
          ...defaultTheme,
          ...insertUser.theme 
        };
        
        // Ensure badges is always an array
        if (!Array.isArray(mergedTheme.badges)) {
          mergedTheme.badges = defaultTheme.badges;
        }
        
        // Ensure badgePosition is set
        if (!mergedTheme.badgePosition) {
          mergedTheme.badgePosition = defaultTheme.badgePosition;
        }
      }

      const [user] = await db.insert(users).values({
        id,
        username: insertUser.username,
        email: insertUser.email,
        password: insertUser.password,
        displayName: insertUser.displayName || null,
        bio: insertUser.bio || null,
        discordId: null,
        discordUsername: null,
        discordAvatar: null,
        githubId: null,
        githubUsername: null,
        githubAvatar: null,
        logo: null,
        theme: mergedTheme,
        lastOnline: new Date(),
        createdAt: new Date(),
      }).returning();

      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<SelectUser>): Promise<SelectUser> {
    try {
      // If updating theme, merge with existing theme
      let updatedData: Partial<SelectUser> = { ...data };
      
      if (data.theme) {
        const existingUser = await this.getUser(id);
        if (existingUser) {
          // Handle theme as an object with proper typing
          const existingTheme: any = existingUser.theme || {};
          
          // Only merge if the new theme is a non-array object
          if (typeof data.theme === 'object' && !Array.isArray(data.theme)) {
            // Type assertion to handle theme as any to avoid property access errors
            const newTheme: any = data.theme;
            const mergedTheme: any = {
              ...existingTheme,
              ...newTheme
            };
            
            // Ensure badges is always an array
            if (!Array.isArray(mergedTheme.badges)) {
              mergedTheme.badges = Array.isArray(existingTheme.badges) ? 
                existingTheme.badges : [];
            }
            
            // Ensure badgePosition is set
            if (!mergedTheme.badgePosition) {
              mergedTheme.badgePosition = existingTheme.badgePosition || "beside-username";
            }
            
            updatedData.theme = mergedTheme;
          }
        }
      }
      
      const [user] = await db.update(users)
        .set({
          ...updatedData,
          lastOnline: new Date()
        })
        .where(eq(users.id, id))
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

  // Social link methods
  async getUserSocialLinks(userId: string): Promise<SocialLink[]> {
    try {
      return await db.select()
        .from(socialLinks)
        .where(eq(socialLinks.userId, userId))
        .orderBy(socialLinks.order);
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
      const [socialLink] = await db.update(socialLinks)
        .set(data)
        .where(eq(socialLinks.id, id))
        .returning();

      if (!socialLink) {
        throw new Error('Social link not found');
      }

      return socialLink;
    } catch (error) {
      console.error('Error in updateSocialLink:', error);
      throw error;
    }
  }

  async deleteSocialLink(id: string): Promise<void> {
    try {
      await db.delete(socialLinks)
        .where(eq(socialLinks.id, id));
    } catch (error) {
      console.error('Error in deleteSocialLink:', error);
      throw error;
    }
  }

  // Page view methods
  async getPageViews(userId: string): Promise<PageView[]> {
    try {
      return await db.select()
        .from(pageViews)
        .where(eq(pageViews.userId, userId))
        .orderBy(sql`${pageViews.timestamp} DESC`);
    } catch (error) {
      console.error('Error in getPageViews:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async createPageView(data: Omit<PageView, "id">): Promise<void> {
    try {
      await db.insert(pageViews)
        .values({
          ...data,
          id: crypto.randomUUID(),
          timestamp: new Date()
        });
    } catch (error) {
      console.error('Error in createPageView:', error);
      // Don't throw here - this allows profiles to load even if analytics fails
      // Log the error but don't propagate it to avoid breaking the profile view
    }
  }

  async trackLinkClick(linkId: string, data: LinkClickData) {
    try {
      await db.update(socialLinks)
        .set({
          clickCount: sql`${socialLinks.clickCount} + 1`
        })
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
      let views: PageView[] = [];
      let links: SocialLink[] = [];
      
      // Try to get page views, but don't throw if it fails
      try {
        views = await this.getPageViews(userId);
      } catch (viewsError) {
        console.error('Error fetching page views in getEnhancedAnalytics:', viewsError);
        // Continue with empty views array
      }
      
      // Try to get social links, but don't throw if it fails
      try {
        links = await this.getUserSocialLinks(userId);
      } catch (linksError) {
        console.error('Error fetching social links in getEnhancedAnalytics:', linksError);
        // Continue with empty links array
      }
      
      const linkStats = links.map(link => ({
        linkId: link.id,
        title: link.title,
        clicks: link.clickCount
      }));
      
      return {
        pageViews: views,
        linkStats
      };
    } catch (error) {
      console.error('Error in getEnhancedAnalytics:', error);
      // Return empty data instead of throwing
      return {
        pageViews: [],
        linkStats: []
      };
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
      // Use a transaction to ensure all related data is deleted
      await db.transaction(async (tx) => {
        // Delete related data first (due to foreign key constraints)
        await tx.delete(socialLinks).where(eq(socialLinks.userId, userId));
        await tx.delete(pageViews).where(eq(pageViews.userId, userId));
        await tx.delete(profiles).where(eq(profiles.userId, userId));
        await tx.delete(subscriptions).where(eq(subscriptions.userId, userId));
        
        // Finally delete the user
        await tx.delete(users).where(eq(users.id, userId));
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<SelectUser[]> {
    try {
      return await db.select()
        .from(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  async getUserViewCount(userId: string): Promise<number> {
    try {
      const result = await db.select({
        count: sql<number>`COUNT(*)::int`
      })
      .from(pageViews)
      .where(eq(pageViews.userId, userId));
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error in getUserViewCount:', error);
      return 0;
    }
  }

  async getUsersWithViewCounts(): Promise<Array<SelectUser & { viewCount: number }>> {
    try {
      console.log('Executing getUsersWithViewCounts in pg-storage...');
      
      // First get all users
      const allUsers = await this.getAllUsers();
      console.log(`Found ${allUsers.length} users in database`);
      
      // Get view counts for all users in a single query
      const viewCounts = await db.execute(sql`
        SELECT 
          user_id,
          COUNT(id)::int AS view_count
        FROM 
          ${pageViews}
        GROUP BY 
          user_id
      `);
      
      // Create a map of user IDs to view counts
      const viewCountMap = new Map<string, number>();
      for (const row of viewCounts) {
        if (row.user_id) {
          viewCountMap.set(row.user_id as string, Number(row.view_count) || 0);
        }
      }
      
      // Combine users with their view counts
      const usersWithCounts = allUsers.map(user => ({
        ...user,
        viewCount: viewCountMap.get(user.id) || 0
      }));
      
      // Sort by view count (descending)
      const sortedUsers = usersWithCounts.sort((a, b) => b.viewCount - a.viewCount);
      console.log(`Returning ${sortedUsers.length} users with view counts`);
      
      return sortedUsers;
    } catch (error) {
      console.error('Error in getUsersWithViewCounts:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const storage = new DatabaseStorage(); 