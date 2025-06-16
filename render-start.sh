#!/bin/bash

# Simple script to start the server on Render.com
# Now using dotenv directly in the code

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

echo "Starting the server..."
node dist/index.mjs 