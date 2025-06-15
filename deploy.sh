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

# Build the project
echo "Building the project..."
npm run build

echo "Deployment process complete!" 