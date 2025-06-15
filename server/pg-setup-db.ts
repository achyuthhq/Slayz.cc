import { db } from "./pg-db";
import { sql } from "drizzle-orm";
import * as schema from "../shared/pg-schema";
import { sessionTableSQL } from "./pg-session";

let isInitialized = false;

// Function to initialize the database
export async function initializeDatabase() {
  if (isInitialized) {
    console.log("Database already initialized, skipping...");
    return;
  }

  try {
    console.log("Starting PostgreSQL database initialization on Render...");

    // Create session table if it doesn't exist
    try {
      await db.execute(sql.raw(sessionTableSQL));
      console.log("Session table created or verified successfully");
    } catch (error) {
      console.error("Error creating session table:", error);
      // Continue execution - we'll try to create other tables
    }

    // Verify database connection by querying for tables
    console.log("Verifying database connection...");
    let tables;
    try {
      tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log(
        "Existing tables:",
        tables.map((t: any) => t.table_name).join(", ")
      );
    } catch (error) {
      console.error("Error querying tables:", error);
      throw new Error("Failed to query database tables");
    }

    // Check if users table exists, if not create all tables
    let userTable;
    try {
      userTable = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `);
    } catch (error) {
      console.error("Error checking for users table:", error);
      throw new Error("Failed to check if users table exists");
    }

    if (!userTable[0]?.exists) {
      console.log("Users table not found, creating schema...");
      
      // Create tables using Drizzle push
      // Note: In production, you should use migrations instead
      // This is just for development setup
      
      try {
        // Create users table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" TEXT PRIMARY KEY,
            "username" TEXT NOT NULL UNIQUE,
            "email" TEXT NOT NULL UNIQUE,
            "password" TEXT NOT NULL,
            "display_name" TEXT,
            "bio" TEXT,
            "discord_id" TEXT UNIQUE,
            "discord_username" TEXT,
            "discord_avatar" TEXT,
            "discord_access_token" TEXT,
            "discord_refresh_token" TEXT,
            "discord_connections" JSONB,
            "github_id" TEXT UNIQUE,
            "github_username" TEXT,
            "github_display_name" TEXT,
            "github_avatar" TEXT,
            "github_access_token" TEXT,
            "github_public_repos" INTEGER,
            "github_followers" INTEGER,
            "last_online" TIMESTAMP,
            "theme" JSONB NOT NULL DEFAULT '{}',
            "layout" TEXT DEFAULT 'classic',
            "font" TEXT DEFAULT 'sans',
            "profile_song" TEXT,
            "profile_song_url" TEXT,
            "logo" TEXT,
            "quote" TEXT,
            "background_image" TEXT,
            "stripe_customer_id" TEXT UNIQUE,
            "subscription_status" TEXT DEFAULT 'free',
            "subscription_end" TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        console.log("Users table created successfully");
        
        // Create social_links table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "social_links" (
            "id" TEXT PRIMARY KEY,
            "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "title" TEXT NOT NULL,
            "url" TEXT NOT NULL,
            "icon" TEXT,
            "order" INTEGER NOT NULL,
            "click_count" INTEGER NOT NULL DEFAULT 0
          )
        `);
        console.log("Social links table created successfully");
        
        // Create page_views table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "page_views" (
            "id" TEXT PRIMARY KEY,
            "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
            "referrer" TEXT,
            "country" TEXT,
            "city" TEXT,
            "browser" TEXT,
            "os" TEXT,
            "device" TEXT
          )
        `);
        console.log("Page views table created successfully");
        
        // Create profiles table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "profiles" (
            "id" TEXT PRIMARY KEY,
            "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "name" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "is_active" BOOLEAN DEFAULT TRUE,
            "theme" JSONB,
            "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        console.log("Profiles table created successfully");
        
        // Create subscriptions table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "subscriptions" (
            "id" TEXT PRIMARY KEY,
            "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "stripe_subscription_id" TEXT UNIQUE,
            "nowpayments_invoice_id" TEXT UNIQUE,
            "payment_method" TEXT DEFAULT 'stripe',
            "payment_currency" TEXT,
            "status" TEXT NOT NULL,
            "current_period_start" TIMESTAMP NOT NULL,
            "current_period_end" TIMESTAMP NOT NULL,
            "cancel_at_period_end" BOOLEAN DEFAULT FALSE,
            "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        console.log("Subscriptions table created successfully");
        
        // Create indexes for better performance
        await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_social_links_user_id" ON "social_links" ("user_id")`);
        await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_page_views_user_id" ON "page_views" ("user_id")`);
        await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "profiles" ("user_id")`);
        await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_subscriptions_user_id" ON "subscriptions" ("user_id")`);
        
        console.log("Database schema created successfully");
      } catch (error) {
        console.error("Error creating database schema:", error);
        throw new Error("Failed to create database schema");
      }
    } else {
      console.log("Users table already exists, skipping schema creation");
    }

    isInitialized = true;
    console.log("PostgreSQL database initialization completed successfully");
  } catch (error: unknown) {
    console.error("Error initializing database:", error);
    console.error(
      "Error stack trace:",
      error instanceof Error ? error.stack : "No stack trace available",
    );
    throw error;
  }
} 