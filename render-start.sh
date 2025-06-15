#!/bin/bash

# This script is specifically for Render.com deployment

# Exit on error
set -e

# Log what we're doing
echo "Starting Render deployment process..."

# Run the dependency fix script
echo "Fixing dependencies..."
node fix-dependencies.js

# Ensure all external modules are installed correctly
echo "Ensuring external modules are installed..."
npm install --no-save postgres@3.4.7 pg connect-pg-simple bcrypt resend better-sqlite3 lightningcss

# Verify postgres is installed
if [ ! -d "node_modules/postgres" ]; then
  echo "ERROR: postgres module not installed properly. Installing again..."
  npm install --no-save postgres@3.4.7
  
  # Double check
  if [ ! -d "node_modules/postgres" ]; then
    echo "CRITICAL ERROR: Failed to install postgres module"
    exit 1
  else
    echo "postgres module successfully installed on second attempt"
  fi
else
  echo "postgres module verified"
fi

# Create a simple module to ensure babel can find @babel/preset-typescript
echo "Creating babel preset typescript stub..."
mkdir -p node_modules/@babel/preset-typescript
echo '{"name":"@babel/preset-typescript","version":"7.22.5"}' > node_modules/@babel/preset-typescript/package.json

# Create a simple .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from environment variables..."
  echo "DATABASE_URL=$DATABASE_URL" > .env
  echo "SESSION_SECRET=$SESSION_SECRET" >> .env
fi

# Start the server using our wrapper
echo "Starting server with wrapper..."
node server-wrapper.mjs 