-- Add discord_email column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_email text; 