#!/bin/bash

# This script is specifically for Render.com deployment

# Exit on error
set -e

# Log what we're doing
echo "Starting Render deployment process..."

# Run the dependency fix script
echo "Fixing dependencies..."
node fix-dependencies.js

# Ensure postgres module is installed correctly
echo "Ensuring postgres module is installed..."
npm install postgres@3.4.7 --no-save

# Start the server using our wrapper
echo "Starting server with wrapper..."
node server-wrapper.mjs 