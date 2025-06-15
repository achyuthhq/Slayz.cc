-- Add all missing Discord-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_verified boolean;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_locale text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_mfa_enabled boolean;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_premium_type integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_flags integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_banner text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_accent_color text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_global_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_display_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_status text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_activity jsonb; 