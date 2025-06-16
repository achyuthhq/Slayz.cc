#!/bin/bash

# This script creates a new version of the index.mjs file without any env imports
# It's designed to be the most direct solution possible with no dependencies

echo "🔧 DIRECT FIX: Creating a new version of index.mjs without env imports"

# Define paths
INDEX_MJS_PATH="dist/index.mjs"
INDEX_FIXED_MJS_PATH="dist/index.fixed.mjs"

# Check if index.mjs exists
if [ ! -f "$INDEX_MJS_PATH" ]; then
  echo "❌ Could not find index.mjs at $INDEX_MJS_PATH"
  exit 1
fi

# Define the env module content
ENV_MODULE='// Environment variables configuration
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

# Create a new index.fixed.mjs file with the env module content at the top
echo "$ENV_MODULE" > "$INDEX_FIXED_MJS_PATH"

# Append the original index.mjs content, but skip any import statements from './env'
grep -v "import.*from.*['\"]\\./env['\"]" "$INDEX_MJS_PATH" >> "$INDEX_FIXED_MJS_PATH"

echo "✅ Successfully created $INDEX_FIXED_MJS_PATH"
echo "🚀 The server should now be able to start with: node $INDEX_FIXED_MJS_PATH" 