#!/bin/bash

# Exit on error
set -e

# Log what we're doing
echo "Starting deployment process..."

# Run the dependency fix script
echo "Fixing dependencies..."
node fix-dependencies.js

# Clean node_modules to ensure a fresh install
echo "Cleaning node_modules..."
if [ -d "node_modules" ]; then
  rm -rf node_modules
fi

# Clean build artifacts
echo "Cleaning build artifacts..."
if [ -d "dist" ]; then
  rm -rf dist
fi

# Install dependencies with legacy peer deps flag
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Ensure postgres module is installed correctly
echo "Verifying postgres module..."
if ! npm list postgres | grep -q "postgres@"; then
  echo "Reinstalling postgres module specifically..."
  npm install postgres@3.4.7 --legacy-peer-deps
fi

# Verify critical server dependencies
echo "Verifying critical server dependencies..."
for dep in drizzle-orm express express-session better-sqlite3; do
  if ! npm list $dep | grep -q "$dep@"; then
    echo "Reinstalling $dep specifically..."
    npm install $dep --legacy-peer-deps
  fi
done

# Build the project
echo "Building the project..."
npm run build

# Make server wrapper executable
echo "Making server wrapper executable..."
chmod +x server-wrapper.mjs

# Create a start script that uses the wrapper
echo "Creating start script..."
echo '#!/bin/bash
node server-wrapper.mjs
' > start.sh
chmod +x start.sh

echo "Deployment process complete!"
echo "To start the server, run: ./start.sh" 