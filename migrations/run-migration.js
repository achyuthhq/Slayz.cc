// Simple migration runner for password_reset_tokens table
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';
import fs from 'fs';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run the SQL migration using psql
const runMigration = () => {
  console.log('Running migration to create password_reset_tokens table...');
  
  // Get DATABASE_URL from environment
  config({ path: resolve(__dirname, '../.env') });
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable not found!');
    process.exit(1);
  }

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
  
  // Create a temporary SQL file
  const tempFile = resolve(__dirname, 'temp-migration.sql');
  fs.writeFileSync(tempFile, sql);
  
  // Execute the SQL file using psql
  const command = `psql "${databaseUrl}" -f ${tempFile}`;
  
  exec(command, (error, stdout, stderr) => {
    // Remove temp file
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      console.error('Error removing temp file:', e);
    }
    
    if (error) {
      console.error(`Migration failed: ${error.message}`);
      console.error(stderr);
      process.exit(1);
    }
    
    console.log('Migration output:');
    console.log(stdout);
    console.log('Migration completed successfully!');
  });
};

runMigration(); 