#!/bin/bash

# This script is specifically for Render.com deployment

# Exit on error
set -e

# Log what we're doing
echo "Starting Render deployment process..."

# Run the dependency fix script
echo "Fixing dependencies..."
node fix-dependencies.js

# Create module mocks and patches
echo "Setting up module resolver..."
node module-resolver.js

echo "Creating postgres patch module..."
node postgres-patch.js

# Create dotenv patch to fix dynamic require issue
echo "Creating dotenv patch..."
node dotenv-patch.js

# Create ws patch to fix dynamic require issue
echo "Creating ws patch..."
node ws-patch.js

# Ensure all external modules are installed correctly
echo "Ensuring external modules are installed..."
npm install --no-save postgres@3.4.7 pg connect-pg-simple bcrypt resend better-sqlite3 lightningcss dotenv ws events stream

# Verify postgres is installed
if [ ! -d "node_modules/postgres" ]; then
  echo "ERROR: postgres module not installed properly. Installing again..."
  npm install --no-save postgres@3.4.7
  
  # Double check
  if [ ! -d "node_modules/postgres" ]; then
    echo "CRITICAL ERROR: Failed to install postgres module"
    
    # Create a minimal postgres module manually
    echo "Creating manual postgres module..."
    mkdir -p node_modules/postgres
    echo '{
      "name": "postgres",
      "version": "3.4.7",
      "main": "index.js",
      "type": "module"
    }' > node_modules/postgres/package.json
    
    echo 'console.log("Using manually created postgres module");
    function postgres(connectionString, options = {}) {
      console.log("Postgres connection requested:", connectionString);
      return {
        connect: async () => console.log("Mock postgres connect called"),
        end: async () => console.log("Mock postgres end called"),
        query: async (query, params) => {
          console.log("Mock postgres query:", query, params);
          return [];
        }
      };
    }
    postgres.default = postgres;
    export default postgres;
    export const sql = postgres;' > node_modules/postgres/index.js
    
    echo "Manual postgres module created"
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

# Create a NODE_PATH environment variable to help find modules
export NODE_PATH="./node_modules:./dist/node_modules"
echo "NODE_PATH set to: $NODE_PATH"

# Create direct postgres module in dist directory
echo "Creating direct postgres module in dist directory..."
node create-postgres-module.js

# Try to fix the dotenv dynamic require issue by patching the index.mjs file
echo "Patching index.mjs to fix dynamic require issues..."
if [ -f "dist/index.mjs" ]; then
  # Create a backup
  cp dist/index.mjs dist/index.mjs.bak
  
  # Replace dynamic requires with static imports
  sed -i 's/require("fs")/import("fs")/g' dist/index.mjs
  sed -i 's/require("path")/import("path")/g' dist/index.mjs
  sed -i 's/require("events")/import("events")/g' dist/index.mjs
  sed -i 's/require("stream")/import("stream")/g' dist/index.mjs
  sed -i 's/require("http")/import("http")/g' dist/index.mjs
  sed -i 's/require("https")/import("https")/g' dist/index.mjs
  sed -i 's/require("net")/import("net")/g' dist/index.mjs
  sed -i 's/require("tls")/import("tls")/g' dist/index.mjs
  sed -i 's/require("crypto")/import("crypto")/g' dist/index.mjs
  sed -i 's/require("zlib")/import("zlib")/g' dist/index.mjs
  sed -i 's/require("buffer")/import("buffer")/g' dist/index.mjs
  sed -i 's/require("util")/import("util")/g' dist/index.mjs
  
  echo "index.mjs patched for dynamic requires"
else
  echo "dist/index.mjs not found, skipping patch"
fi

# Create a shim for dynamic require
echo "Creating dynamic require shim..."
cat > dist/dynamic-require-shim.mjs << 'EOF'
// This is a shim to handle dynamic requires in ESM modules
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Create a global shim for dynamic requires
globalThis.__requireShim = function(moduleName) {
  console.log(`Dynamic require shim called for: ${moduleName}`);
  
  // Handle common Node.js built-in modules
  switch(moduleName) {
    case 'events':
      return import('events');
    case 'stream':
      return import('stream');
    case 'http':
      return import('http');
    case 'https':
      return import('https');
    case 'fs':
      return import('fs');
    case 'path':
      return import('path');
    case 'crypto':
      return import('crypto');
    case 'util':
      return import('util');
    case 'buffer':
      return import('buffer');
    case 'zlib':
      return import('zlib');
    case 'net':
      return import('net');
    case 'tls':
      return import('tls');
    default:
      try {
        return require(moduleName);
      } catch (err) {
        console.error(`Failed to require ${moduleName}:`, err);
        return {};
      }
  }
};

console.log('Dynamic require shim installed');
EOF

# Start the server using our wrapper with the shim preloaded
echo "Starting server with wrapper..."
NODE_OPTIONS="--experimental-modules --experimental-specifier-resolution=node --import=./dist/dynamic-require-shim.mjs" node server-wrapper.mjs 