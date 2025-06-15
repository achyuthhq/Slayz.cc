// Import the PostgreSQL client
import pg from 'pg';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  const result = config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Environment variables loaded from .env');
  }
} else {
  console.warn('.env file not found at', envPath);
}

const { Client } = pg;

// Get database connection details from environment variables
// Use the same connection details as in server/env.ts
const RENDER_PG_HOST = process.env.PG_HOST || 'dpg-d1024gogjchc73a9eo6g-a.oregon-postgres.render.com';
const RENDER_PG_PORT = process.env.PG_PORT || '5432';
const RENDER_PG_DATABASE = process.env.PG_DATABASE || 'users_prm7';
const RENDER_PG_USER = process.env.PG_USER || 'users_prm7_user';
const RENDER_PG_PASSWORD = process.env.PG_PASSWORD || 'krKMHgU02iuLN8jv1Y7O81gJlrCPSow3';
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${RENDER_PG_USER}:${RENDER_PG_PASSWORD}@${RENDER_PG_HOST}/${RENDER_PG_DATABASE}`;

console.log('Using database connection:', DATABASE_URL.replace(/:[^:]*@/, ':****@'));

// Create a new PostgreSQL client
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

// Run the migration
async function main() {
  console.log("Running migration to add password_reset_tokens table...");
  
  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to database");
    
    // Create the password_reset_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" SERIAL PRIMARY KEY,
        "token" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "expires_at" TIMESTAMP NOT NULL
      );
      
      -- Create an index on token and email for faster lookups
      CREATE INDEX IF NOT EXISTS "password_reset_tokens_token_email_idx" ON "password_reset_tokens" ("token", "email");
      
      -- Create an index on expiresAt for faster cleanup of expired tokens
      CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" ("expires_at");
    `);
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
    console.log("Database connection closed");
  }
  
  process.exit(0);
}

// Run the migration
main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
}); 