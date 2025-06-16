#!/bin/bash

# This script creates the env file at the exact path that Node.js is looking for
# It's designed to be the most direct solution possible with no dependencies

echo "🔧 Creating env module at exact path"

# Define the env content
ENV_CONTENT='// Environment variables configuration
import dotenv from "dotenv";
dotenv.config();

// Export environment variables with defaults
export const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost:5432/mydb";
export const SESSION_SECRET = process.env.SESSION_SECRET || "default_session_secret";
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";

// Export the env object with all variables
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "postgres://localhost:5432/mydb",
  SESSION_SECRET: process.env.SESSION_SECRET || "default_session_secret",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "onboarding@resend.dev",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads"
};

// Export as default object as well
export default {
  DATABASE_URL,
  SESSION_SECRET,
  PORT,
  NODE_ENV,
  env
};'

# Function to create env files in a directory
create_env_files() {
  local dir=$1
  
  # Create directory
  mkdir -p "$dir" 2>/dev/null || { echo "⚠️ Could not create directory $dir"; return 1; }
  
  # Create env file (without extension)
  echo "$ENV_CONTENT" > "$dir/env" 2>/dev/null || { echo "⚠️ Could not create $dir/env"; return 1; }
  
  # Create env.mjs file
  echo "$ENV_CONTENT" > "$dir/env.mjs" 2>/dev/null || { echo "⚠️ Could not create $dir/env.mjs"; return 1; }
  
  # Set file permissions
  chmod 644 "$dir/env" 2>/dev/null || true
  chmod 644 "$dir/env.mjs" 2>/dev/null || true
  
  echo "✅ Created env files in $dir"
  return 0
}

# Try to create files at the exact path for Render.com
if [ -d "/opt" ] || [ "$RENDER" = "true" ]; then
  echo "Creating env files for Render.com deployment..."
  create_env_files "/opt/render/project/src/dist" || echo "⚠️ Failed to create files at Render.com path"
fi

# Always create in local dist directory
echo "Creating env files in local dist directory..."
create_env_files "$(pwd)/dist" || echo "⚠️ Failed to create files in local dist directory"

# Try alternative paths that might be used
echo "Creating env files in alternative paths..."
create_env_files "/app/dist" 2>/dev/null || true
create_env_files "/src/dist" 2>/dev/null || true

echo "✅ Env module creation complete"
echo "🚀 The server should now be able to import from './env'" 