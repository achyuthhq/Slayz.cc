-- Add Steam integration fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS steam_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS steam_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS steam_avatar VARCHAR(255),
ADD COLUMN IF NOT EXISTS steam_profile_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS steam_games_count INTEGER; 