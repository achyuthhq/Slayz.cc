#!/bin/bash

# Log what we're doing
echo "Starting deployment process..."

# Run the dependency fix script
echo "Fixing dependencies..."
node fix-dependencies.js

# Install dependencies with legacy peer deps flag
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "Building the project..."
npm run build

echo "Deployment process complete!" 