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

# Run the fix-env.sh script to create the env module
echo "Running fix-env.sh to create env module..."
bash ./fix-env.sh

# Start the server
echo "Starting the server..."
node dist/index.mjs 