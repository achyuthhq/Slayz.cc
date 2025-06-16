#!/bin/bash

# This script is specifically for Render.com deployment

# Exit on error
set -e

# Log what we're doing
echo "Starting Render deployment process..."

# Ensure all external modules are installed correctly
echo "Ensuring external modules are installed..."
npm install --no-save postgres@3.4.7 pg connect-pg-simple bcrypt resend better-sqlite3 lightningcss dotenv ws events stream

# Create a simple .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from environment variables..."
  echo "DATABASE_URL=$DATABASE_URL" > .env
  echo "SESSION_SECRET=$SESSION_SECRET" >> .env
fi

# Create a NODE_PATH environment variable to help find modules
export NODE_PATH="./node_modules:./dist/node_modules"
echo "NODE_PATH set to: $NODE_PATH"

# DIRECT FIX: Create env file at the exact path and modify index.mjs
echo "Applying direct fix..."

# 1. Create the directory structure
mkdir -p /opt/render/project/src/dist

# 2. Create the env file directly
cat > /opt/render/project/src/dist/env << 'EOF'
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

# 3. Copy to env.mjs as well
cp /opt/render/project/src/dist/env /opt/render/project/src/dist/env.mjs
echo "Created env files at exact path"

# 4. Also create in local dist directory
mkdir -p dist
cp /opt/render/project/src/dist/env dist/env
cp /opt/render/project/src/dist/env.mjs dist/env.mjs
echo "Created env files in local dist directory"

# 5. Modify the index.mjs file directly
if [ -f dist/index.mjs ]; then
  echo "Modifying index.mjs file..."
  
  # Create a backup
  cp dist/index.mjs dist/index.mjs.bak
  
  # Replace import statements with inline environment variables
  sed -i 's/import.*from.*["'\'']\.\\/env["'\'']/\/\/ Inline environment variables (added by render-start.sh)\
import dotenv from "dotenv";\
dotenv.config();\
\
export const DATABASE_URL = process.env.DATABASE_URL || "postgres:\/\/localhost:5432\/mydb";\
export const SESSION_SECRET = process.env.SESSION_SECRET || "default_session_secret";\
export const PORT = process.env.PORT || 3000;\
export const NODE_ENV = process.env.NODE_ENV || "development";\
\
export const env = {\
  NODE_ENV: process.env.NODE_ENV || "development",\
  PORT: parseInt(process.env.PORT || "3000", 10),\
  DATABASE_URL: process.env.DATABASE_URL || "postgres:\/\/localhost:5432\/mydb",\
  SESSION_SECRET: process.env.SESSION_SECRET || "default_session_secret",\
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",\
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",\
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",\
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "",\
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",\
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",\
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",\
  EMAIL_FROM: process.env.EMAIL_FROM || "onboarding@resend.dev",\
  UPLOAD_DIR: process.env.UPLOAD_DIR || ".\/uploads"\
};/g' dist/index.mjs
  
  echo "Modified index.mjs file"
else
  echo "Warning: Could not find dist/index.mjs"
fi

# 6. Set file permissions to ensure they're readable
chmod 644 /opt/render/project/src/dist/env
chmod 644 /opt/render/project/src/dist/env.mjs
chmod 644 dist/env
chmod 644 dist/env.mjs
echo "Set file permissions"

# 7. Create a modified version of index.mjs as a fallback
echo "Creating fallback index.fixed.mjs..."
if [ -f dist/index.mjs ]; then
  # Read the content of index.mjs
  content=$(cat dist/index.mjs)
  
  # Create a new file with the modified content
  cat > dist/index.fixed.mjs << 'EOF'
// Modified index.mjs with inline environment variables
// Created by render-start.sh

// Inline environment variables
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

EOF
  
  # Append the rest of the content, skipping any import from './env'
  echo "$content" | grep -v "import.*from.*['\"]\\./env['\"]" >> dist/index.fixed.mjs
  
  echo "Created fallback index.fixed.mjs"
else
  echo "Warning: Could not create fallback index.fixed.mjs"
fi

# 8. Create a direct env.js file for CommonJS imports
echo "Creating env.js for CommonJS imports..."
cat > dist/env.js << 'EOF'
// CommonJS version of the env module
// Created by render-start.sh

// Load dotenv
require('dotenv').config();

// Export environment variables with defaults
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/mydb';
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret';
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Export the env object with all variables
const env = {
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

// Export everything
module.exports = {
  DATABASE_URL,
  SESSION_SECRET,
  PORT,
  NODE_ENV,
  env,
  default: {
    DATABASE_URL,
    SESSION_SECRET,
    PORT,
    NODE_ENV,
    env
  }
};
EOF
echo "Created env.js for CommonJS imports"

# Try to start the server with the original index.mjs
echo "Starting the server..."
node dist/index.mjs || {
  # If that fails, try the modified index.fixed.mjs
  echo "Original start failed, trying with modified index.fixed.mjs..."
  node dist/index.fixed.mjs || {
    # If that fails too, try the final-fix.js script
    echo "Modified start failed, trying final-fix.js..."
    node final-fix.js || {
      # If that fails too, try the module-cache-fix.js script
      echo "Final fix failed, trying module-cache-fix.js..."
      node module-cache-fix.js || {
        # If all else fails, try a direct approach with Node.js flags
        echo "All approaches failed, trying direct approach with Node.js flags..."
        NODE_OPTIONS="--experimental-modules --experimental-specifier-resolution=node --no-warnings" node dist/index.mjs
      }
    }
  }
} 