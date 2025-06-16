#!/bin/bash

# This script creates the env module at the exact path Node.js is looking for it
# It's the simplest possible solution with no dependencies

# The exact path where Node.js is looking for the module
TARGET_PATH="/opt/render/project/src/dist/env"

echo "Creating env module at $TARGET_PATH..."

# Create the directory structure
mkdir -p "$(dirname "$TARGET_PATH")" || {
  echo "Warning: Could not create directory $(dirname "$TARGET_PATH")"
  # Continue anyway, the directory might already exist
}

# Create the env module file
cat > "$TARGET_PATH" << 'EOF' || {
  echo "Error: Could not write to $TARGET_PATH"
  exit 1
}
// Environment variables configuration
import dotenv from 'dotenv';
dotenv.config();

// Export environment variables with defaults
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/mydb';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret';
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Export the env object with all variables
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://localhost:5432/mydb',
  SESSION_SECRET: process.env.SESSION_SECRET || 'default_session_secret',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads'
};

// Export as default object as well
export default {
  DATABASE_URL,
  SESSION_SECRET,
  PORT,
  NODE_ENV,
  env
};
EOF

# Set file permissions
chmod 644 "$TARGET_PATH" || {
  echo "Warning: Could not set file permissions for $TARGET_PATH"
  # Continue anyway, permissions might be okay
}

# Verify the file was created
if [ -f "$TARGET_PATH" ]; then
  echo "✅ Successfully created env module at $TARGET_PATH"
  exit 0
else
  echo "❌ Failed to create env module at $TARGET_PATH"
  exit 1
fi 