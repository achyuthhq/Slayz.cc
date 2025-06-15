-- Add discord_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_verified boolean; 