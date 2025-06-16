#!/bin/bash

# Super simple script to start the server on Render.com
# This script ensures the env module is available in the dist directory

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

# Make the copy-env-module.js script executable
echo "Making copy-env-module.js executable..."
chmod +x copy-env-module.js

# Run the copy-env-module.js script to copy env.ts to dist/env
echo "Running copy-env-module.js to ensure env module is available..."
node copy-env-module.js

echo "Starting the server..."
node dist/index.mjs 