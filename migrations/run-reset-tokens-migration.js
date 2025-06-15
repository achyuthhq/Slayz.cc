// Simple migration runner for password_reset_tokens table
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

async function runMigration() {
  console.log('Running migration to create password_reset_tokens table...');
  
  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable not found!');
    process.exit(1);
  }

  // Connect to the database with SSL enabled
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Required for some PostgreSQL providers like Render
    }
  });

  try {
    // SQL to create the password_reset_tokens table and indices
    const sql = `
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
    `;
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Password reset tokens table created successfully!');
    
    // Check if the table was created
    const { rows } = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens'
      );
    `);
    
    if (rows[0].exists) {
      console.log('Verified: password_reset_tokens table exists');
    } else {
      console.error('Table creation failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the migration
runMigration().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 