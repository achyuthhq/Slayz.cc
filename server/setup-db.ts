import { db } from "./db";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

let isInitialized = false;

// Function to initialize the database
export async function initializeDatabase() {
  if (isInitialized) {
    console.log("Database already initialized, skipping...");
    return;
  }

  try {
    console.log("Starting database initialization...");

    // Push schema changes directly using Drizzle
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT,
        bio TEXT,
        discord_id TEXT UNIQUE,
        discord_username TEXT,
        discord_avatar TEXT,
        discord_access_token TEXT,
        discord_refresh_token TEXT,
        discord_connections TEXT,
        github_id TEXT UNIQUE,
        github_username TEXT,
        github_display_name TEXT,
        github_avatar TEXT,
        github_access_token TEXT,
        github_public_repos INTEGER,
        github_followers INTEGER,
        last_online INTEGER,
        theme TEXT NOT NULL DEFAULT '{}',
        layout TEXT DEFAULT 'classic',
        font TEXT DEFAULT 'sans',
        profile_song TEXT,
        profile_song_url TEXT,
        logo TEXT,
        quote TEXT,
        background_image TEXT,
        stripe_customer_id TEXT UNIQUE,
        subscription_status TEXT DEFAULT 'free',
        subscription_end INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS social_links (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT,
        "order" INTEGER NOT NULL,
        click_count INTEGER DEFAULT 0 NOT NULL
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
        referrer TEXT,
        country TEXT,
        city TEXT,
        browser TEXT,
        os TEXT,
        device TEXT
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        theme TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        stripe_subscription_id TEXT UNIQUE,
        nowpayments_invoice_id TEXT UNIQUE,
        payment_method TEXT DEFAULT 'stripe',
        payment_currency TEXT,
        status TEXT NOT NULL,
        current_period_start INTEGER NOT NULL,
        current_period_end INTEGER NOT NULL,
        cancel_at_period_end INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        theme TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    // Verify tables were created by checking schema
    console.log("Verifying table creation...");
    const tables = await db.all(
      sql`SELECT name FROM sqlite_master WHERE type = 'table'`,
    );
    console.log(
      "Created tables:",
      tables
        .map((t: unknown) => {
          const table = t as { name: string };
          return table.name;
        })
        .join(", "),
    );

    // Verify users table columns
    console.log("Verifying users table columns...");
    const usersTableInfo = await db.all(sql`PRAGMA table_info('users')`);
    console.log(
      "Users table columns:",
      usersTableInfo
        .map((col: unknown) => {
          const column = col as { name: string };
          return column.name;
        })
        .join(", "),
    );

    // Verify all columns exist
    const requiredColumns = [
      "id",
      "username",
      "email",
      "password",
      "github_id",
      "github_username",
      "github_display_name",
      "github_avatar",
      "github_access_token",
      "github_public_repos",
      "github_followers",
    ];

    const missingColumns = requiredColumns.filter(
      (col) =>
        !usersTableInfo.find((info: unknown) => {
          const column = info as { name: string };
          return column.name === col;
        }),
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Missing required columns in users table: ${missingColumns.join(", ")}`,
      );
    }

    isInitialized = true;
    console.log("Database initialization completed successfully");
  } catch (error: unknown) {
    console.error("Error initializing database:", error);
    console.error(
      "Error stack trace:",
      error instanceof Error ? error.stack : "No stack trace available",
    );
    throw error;
  }
}
