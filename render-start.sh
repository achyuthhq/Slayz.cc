#!/bin/bash

# Enhanced script to start the server on Render.com
# This script ensures all necessary modules are available in the dist directory

echo "Starting Render deployment process..."

# Install required packages
echo "Installing required packages..."
npm install --no-save dotenv postgres@3.4.7 pg connect-pg-simple bcrypt resend better-sqlite3 lightningcss ws events stream

# Create a simple .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from environment variables..."
  echo "DATABASE_URL=$DATABASE_URL" > .env
  echo "SESSION_SECRET=$SESSION_SECRET" >> .env
fi

# Make the scripts executable
echo "Making scripts executable..."
chmod +x copy-modules.js
chmod +x copy-shared.js
chmod +x fix-imports.js

# Run the scripts to copy all necessary files to dist/
echo "Running copy-modules.js to ensure all server modules are available..."
node copy-modules.js

echo "Running copy-shared.js to ensure shared directory is available..."
node copy-shared.js

echo "Running fix-imports.js to fix import paths in index.mjs..."
node fix-imports.js

echo "Starting the server..."
node dist/index.mjs 