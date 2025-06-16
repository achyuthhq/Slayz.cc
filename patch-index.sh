#!/bin/bash

# This script directly modifies the index.mjs file to remove dependency on env module
# It's designed to be the most direct solution possible with no dependencies

echo "🔧 DIRECT FIX: Patching index.mjs to remove dependency on env module"

# Define paths
INDEX_MJS_PATH="dist/index.mjs"
INDEX_MJS_BACKUP_PATH="dist/index.mjs.backup"

# Check if index.mjs exists
if [ ! -f "$INDEX_MJS_PATH" ]; then
  echo "❌ Could not find index.mjs at $INDEX_MJS_PATH"
  exit 1
fi

# Create a backup
echo "Creating backup of index.mjs at $INDEX_MJS_BACKUP_PATH"
cp "$INDEX_MJS_PATH" "$INDEX_MJS_BACKUP_PATH"

# Define the replacement content
ENV_REPLACEMENT='
// Inline environment variables (patched by patch-index.sh)
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
};'

# Check for imports from './env' and replace them
if grep -q "import.*from.*['\"]\\./env['\"]" "$INDEX_MJS_PATH"; then
  echo "Found import from './env', replacing with inline environment variables"
  
  # Use sed to replace the import statement with inline environment variables
  # We need to handle the different sed syntax for macOS and Linux
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS version
    sed -i '' -E "s/import[[:space:]]+.*from[[:space:]]+['\"]\\.\\/env['\"]/$(echo "$ENV_REPLACEMENT" | sed -e 's/[\/&]/\\&/g')/g" "$INDEX_MJS_PATH"
  else
    # Linux version
    sed -i -E "s/import[[:space:]]+.*from[[:space:]]+['\"]\\.\\/env['\"]/$(echo "$ENV_REPLACEMENT" | sed -e 's/[\/&]/\\&/g')/g" "$INDEX_MJS_PATH"
  fi
  
  echo "✅ Successfully patched index.mjs"
else
  echo "No import from './env' found, trying alternative patterns"
  
  # Try looking for other import patterns
  if grep -q "import.*from.*['\"].*env['\"]" "$INDEX_MJS_PATH"; then
    echo "Found alternative import from env, replacing with inline environment variables"
    
    # Use sed to replace the import statement with inline environment variables
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS version
      sed -i '' -E "s/import[[:space:]]+.*from[[:space:]]+['\"].*env['\"]/$(echo "$ENV_REPLACEMENT" | sed -e 's/[\/&]/\\&/g')/g" "$INDEX_MJS_PATH"
    else
      # Linux version
      sed -i -E "s/import[[:space:]]+.*from[[:space:]]+['\"].*env['\"]/$(echo "$ENV_REPLACEMENT" | sed -e 's/[\/&]/\\&/g')/g" "$INDEX_MJS_PATH"
    fi
    
    echo "✅ Successfully patched index.mjs"
  else
    echo "⚠️ Could not find any env imports to patch"
    exit 1
  fi
fi

echo "🚀 index.mjs patched successfully, the server should now start without errors" 