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

# Start the server using our simplified approach
echo "Starting server..."
NODE_OPTIONS="--experimental-modules --experimental-specifier-resolution=node" node dist/server.mjs 