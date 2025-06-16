import { db as sqliteDb } from "./db";
import { db as pgDb } from "./pg-db";
import { sql } from "drizzle-orm";
import { checkDatabaseConnection } from "./pg-db";
import fs from "node:fs";
import path from "node:path";

/**
 * Script to migrate data from SQLite to PostgreSQL
 * 
 * This script:
 * 1. Extracts all data from SQLite database
 * 2. Transforms data if needed to match PostgreSQL format
 * 3. Loads data into PostgreSQL database
 * 4. Verifies data integrity after migration
 */

// Helper function to convert SQLite timestamps to PostgreSQL timestamps
function convertTimestamp(timestamp: number | null | undefined): Date | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000); // Convert Unix timestamp to JavaScript Date
}

// Main migration function
async function migrateData() {
  console.log("Starting data migration from SQLite to PostgreSQL...");
  
  // Check PostgreSQL connection
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.error("Cannot connect to PostgreSQL database. Aborting migration.");
    process.exit(1);
  }
  
  try {
    // 1. Migrate users table
    console.log("Migrating users...");
    const users = await sqliteDb.execute(sql`SELECT * FROM users`);
    
    let migratedUsers = 0;
    for (const user of users) {
      try {
        // Transform data
        const transformedUser = {
          ...user,
          lastOnline: convertTimestamp(user.last_online),
          subscriptionEnd: convertTimestamp(user.subscription_end),
          createdAt: convertTimestamp(user.created_at),
          // Parse JSON fields
          theme: typeof user.theme === 'string' ? JSON.parse(user.theme) : user.theme,
          discordConnections: typeof user.discord_connections === 'string' ? 
            JSON.parse(user.discord_connections) : user.discord_connections
        };
        
        // Insert into PostgreSQL
        await pgDb.execute(sql`
          INSERT INTO users (
            id, username, email, password, display_name, bio, discord_id, discord_username,
            discord_avatar, discord_access_token, discord_refresh_token, discord_connections,
            github_id, github_username, github_display_name, github_avatar, github_access_token,
            github_public_repos, github_followers, last_online, theme, layout, font,
            profile_song, profile_song_url, logo, quote, background_image,
            stripe_customer_id, subscription_status, subscription_end, created_at
          ) VALUES (
            ${transformedUser.id}, ${transformedUser.username}, ${transformedUser.email}, 
            ${transformedUser.password}, ${transformedUser.display_name}, ${transformedUser.bio},
            ${transformedUser.discord_id}, ${transformedUser.discord_username}, 
            ${transformedUser.discord_avatar}, ${transformedUser.discord_access_token},
            ${transformedUser.discord_refresh_token}, ${JSON.stringify(transformedUser.discordConnections)},
            ${transformedUser.github_id}, ${transformedUser.github_username}, 
            ${transformedUser.github_display_name}, ${transformedUser.github_avatar},
            ${transformedUser.github_access_token}, ${transformedUser.github_public_repos},
            ${transformedUser.github_followers}, ${transformedUser.lastOnline},
            ${JSON.stringify(transformedUser.theme)}, ${transformedUser.layout}, 
            ${transformedUser.font}, ${transformedUser.profile_song}, 
            ${transformedUser.profile_song_url}, ${transformedUser.logo},
            ${transformedUser.quote}, ${transformedUser.background_image},
            ${transformedUser.stripe_customer_id}, ${transformedUser.subscription_status},
            ${transformedUser.subscriptionEnd}, ${transformedUser.createdAt}
          )
          ON CONFLICT (id) DO NOTHING
        `);
        migratedUsers++;
      } catch (error) {
        console.error(`Error migrating user ${user.id}:`, error);
      }
    }
    console.log(`Migrated ${migratedUsers} of ${users.length} users`);
    
    // 2. Migrate social_links table
    console.log("Migrating social links...");
    const socialLinks = await sqliteDb.execute(sql`SELECT * FROM social_links`);
    
    let migratedLinks = 0;
    for (const link of socialLinks) {
      try {
        await pgDb.execute(sql`
          INSERT INTO social_links (id, user_id, title, url, icon, "order", click_count)
          VALUES (
            ${link.id}, ${link.user_id}, ${link.title}, ${link.url}, 
            ${link.icon}, ${link.order}, ${link.click_count}
          )
          ON CONFLICT (id) DO NOTHING
        `);
        migratedLinks++;
      } catch (error) {
        console.error(`Error migrating social link ${link.id}:`, error);
      }
    }
    console.log(`Migrated ${migratedLinks} of ${socialLinks.length} social links`);
    
    // 3. Migrate page_views table
    console.log("Migrating page views...");
    const pageViews = await sqliteDb.execute(sql`SELECT * FROM page_views`);
    
    let migratedViews = 0;
    for (const view of pageViews) {
      try {
        const timestamp = convertTimestamp(view.timestamp);
        
        await pgDb.execute(sql`
          INSERT INTO page_views (
            id, user_id, timestamp, referrer, country, city, browser, os, device
          ) VALUES (
            ${view.id}, ${view.user_id}, ${timestamp}, ${view.referrer}, 
            ${view.country}, ${view.city}, ${view.browser}, ${view.os}, ${view.device}
          )
          ON CONFLICT (id) DO NOTHING
        `);
        migratedViews++;
      } catch (error) {
        console.error(`Error migrating page view ${view.id}:`, error);
      }
    }
    console.log(`Migrated ${migratedViews} of ${pageViews.length} page views`);
    
    // 4. Migrate profiles table
    console.log("Migrating profiles...");
    const profiles = await sqliteDb.execute(sql`SELECT * FROM profiles`);
    
    let migratedProfiles = 0;
    for (const profile of profiles) {
      try {
        const createdAt = convertTimestamp(profile.created_at);
        const updatedAt = convertTimestamp(profile.updated_at);
        const theme = typeof profile.theme === 'string' ? JSON.parse(profile.theme) : profile.theme;
        
        await pgDb.execute(sql`
          INSERT INTO profiles (
            id, user_id, name, slug, is_active, theme, created_at, updated_at
          ) VALUES (
            ${profile.id}, ${profile.user_id}, ${profile.name}, ${profile.slug},
            ${profile.is_active ? true : false}, ${JSON.stringify(theme)},
            ${createdAt}, ${updatedAt}
          )
          ON CONFLICT (id) DO NOTHING
        `);
        migratedProfiles++;
      } catch (error) {
        console.error(`Error migrating profile ${profile.id}:`, error);
      }
    }
    console.log(`Migrated ${migratedProfiles} of ${profiles.length} profiles`);
    
    // 5. Migrate subscriptions table
    console.log("Migrating subscriptions...");
    const subscriptions = await sqliteDb.execute(sql`SELECT * FROM subscriptions`);
    
    let migratedSubscriptions = 0;
    for (const subscription of subscriptions) {
      try {
        const currentPeriodStart = convertTimestamp(subscription.current_period_start);
        const currentPeriodEnd = convertTimestamp(subscription.current_period_end);
        const createdAt = convertTimestamp(subscription.created_at);
        const updatedAt = convertTimestamp(subscription.updated_at);
        
        await pgDb.execute(sql`
          INSERT INTO subscriptions (
            id, user_id, stripe_subscription_id, nowpayments_invoice_id,
            payment_method, payment_currency, status, current_period_start,
            current_period_end, cancel_at_period_end, created_at, updated_at
          ) VALUES (
            ${subscription.id}, ${subscription.user_id}, ${subscription.stripe_subscription_id},
            ${subscription.nowpayments_invoice_id}, ${subscription.payment_method},
            ${subscription.payment_currency}, ${subscription.status},
            ${currentPeriodStart}, ${currentPeriodEnd},
            ${subscription.cancel_at_period_end ? true : false},
            ${createdAt}, ${updatedAt}
          )
          ON CONFLICT (id) DO NOTHING
        `);
        migratedSubscriptions++;
      } catch (error) {
        console.error(`Error migrating subscription ${subscription.id}:`, error);
      }
    }
    console.log(`Migrated ${migratedSubscriptions} of ${subscriptions.length} subscriptions`);
    
    // Verify data integrity
    console.log("Verifying data integrity...");
    
    const pgUserCount = await pgDb.execute(sql`SELECT COUNT(*) FROM users`);
    const pgLinkCount = await pgDb.execute(sql`SELECT COUNT(*) FROM social_links`);
    const pgViewCount = await pgDb.execute(sql`SELECT COUNT(*) FROM page_views`);
    const pgProfileCount = await pgDb.execute(sql`SELECT COUNT(*) FROM profiles`);
    const pgSubscriptionCount = await pgDb.execute(sql`SELECT COUNT(*) FROM subscriptions`);
    
    console.log("Data verification results:");
    console.log(`Users: SQLite=${users.length}, PostgreSQL=${pgUserCount[0].count}`);
    console.log(`Social Links: SQLite=${socialLinks.length}, PostgreSQL=${pgLinkCount[0].count}`);
    console.log(`Page Views: SQLite=${pageViews.length}, PostgreSQL=${pgViewCount[0].count}`);
    console.log(`Profiles: SQLite=${profiles.length}, PostgreSQL=${pgProfileCount[0].count}`);
    console.log(`Subscriptions: SQLite=${subscriptions.length}, PostgreSQL=${pgSubscriptionCount[0].count}`);
    
    console.log("Data migration completed successfully!");
    
    // Create backup of SQLite database
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `bio-link-${timestamp}.db`);
    
    fs.copyFileSync('bio-link.db', backupPath);
    console.log(`SQLite database backed up to ${backupPath}`);
    
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { migrateData }; 