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

# Patch the index.mjs file directly
echo "Patching index.mjs file..."
node patch-index.js

# Try to start the server directly first
echo "Starting server directly..."
node dist/index.mjs || {
  # If that fails, try the CommonJS version of the server wrapper
  echo "Direct start failed, trying CommonJS wrapper..."
  node server-wrapper-cjs.js || {
    # If that fails, try the ESM version
    echo "CommonJS wrapper failed, trying ESM wrapper..."
    node server-wrapper.js || {
      # If all fail, try a direct approach
      echo "All approaches failed, trying direct approach..."
      
      # Create the env module directly
      echo "Creating env module directly..."
      mkdir -p /opt/render/project/src/dist
      
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
      
      # Copy it to env.mjs as well
      cp /opt/render/project/src/dist/env /opt/render/project/src/dist/env.mjs
      
      # Start the server directly
      echo "Starting server directly (final attempt)..."
      node dist/index.mjs
    }
  }
} 