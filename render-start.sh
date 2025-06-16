#!/bin/bash

# Super simple script to start the server on Render.com
# This script directly modifies the index.mjs file to remove the problematic import

echo "Starting Render deployment process..."

# Install required packages
echo "Installing required packages..."
npm install --no-save dotenv

# Create a simple .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from environment variables..."
  echo "DATABASE_URL=$DATABASE_URL" > .env
  echo "SESSION_SECRET=$SESSION_SECRET" >> .env
fi

# The path to the index.mjs file
INDEX_PATH="dist/index.mjs"

# Check if the index.mjs file exists
if [ ! -f "$INDEX_PATH" ]; then
  echo "Error: Could not find $INDEX_PATH"
  exit 1
fi

# Create a backup of the original file if it doesn't exist
if [ ! -f "${INDEX_PATH}.original" ]; then
  echo "Creating backup of original index.mjs..."
  cp "$INDEX_PATH" "${INDEX_PATH}.original"
fi

echo "Directly modifying index.mjs to remove imports from ./env..."

# Use sed to remove any import statements from ./env
# This is the most direct approach and will definitely work
sed -i.bak '/import.*from.*\.\/env/d' "$INDEX_PATH"

echo "Starting the server..."
node "$INDEX_PATH" 