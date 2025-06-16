#!/usr/bin/env node

/**
 * DIRECT ENV MODULE FIX
 * 
 * This script creates the exact file that Node.js is looking for at the exact path.
 * It's designed to be the most direct solution possible with no dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the exact paths where Node.js is looking for the module
const EXACT_PATH = '/opt/render/project/src/dist/env';
const EXACT_PATH_MJS = '/opt/render/project/src/dist/env.mjs';

// Define the content for the env file (ESM format)
const ENV_CONTENT = `// Environment variables configuration
import dotenv from 'dotenv';
dotenv.config();

// Export environment variables with defaults
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/mydb';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret';
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Export the env object with all variables
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://localhost:5432/mydb',
  SESSION_SECRET: process.env.SESSION_SECRET || 'default_session_secret',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads'
};

// Export as default object as well
export default {
  DATABASE_URL,
  SESSION_SECRET,
  PORT,
  NODE_ENV,
  env
};`;

console.log('🔧 Creating env module at exact path');

// Create the directory structure
const dirPath = path.dirname(EXACT_PATH);
if (!fs.existsSync(dirPath)) {
  console.log(`Creating directory: ${dirPath}`);
  try {
    execSync(`mkdir -p ${dirPath}`);
  } catch (error) {
    console.error(`Failed to create directory: ${error.message}`);
    process.exit(1);
  }
}

// Write the env file (without extension)
try {
  console.log(`Writing env file to ${EXACT_PATH}`);
  fs.writeFileSync(EXACT_PATH, ENV_CONTENT);
  console.log(`Created env file at ${EXACT_PATH}`);
} catch (error) {
  console.error(`Failed to write env file: ${error.message}`);
  
  // Try with execSync as a fallback
  try {
    console.log('Trying with execSync as a fallback');
    execSync(`cat > ${EXACT_PATH} << 'EOF'
${ENV_CONTENT}
EOF`);
    console.log(`Created env file at ${EXACT_PATH} using execSync`);
  } catch (error) {
    console.error(`Failed to write env file with execSync: ${error.message}`);
    process.exit(1);
  }
}

// Write the env.mjs file
try {
  console.log(`Writing env.mjs file to ${EXACT_PATH_MJS}`);
  fs.writeFileSync(EXACT_PATH_MJS, ENV_CONTENT);
  console.log(`Created env.mjs file at ${EXACT_PATH_MJS}`);
} catch (error) {
  console.error(`Failed to write env.mjs file: ${error.message}`);
  
  // Try with execSync as a fallback
  try {
    console.log('Trying with execSync as a fallback');
    execSync(`cat > ${EXACT_PATH_MJS} << 'EOF'
${ENV_CONTENT}
EOF`);
    console.log(`Created env.mjs file at ${EXACT_PATH_MJS} using execSync`);
  } catch (error) {
    console.error(`Failed to write env.mjs file with execSync: ${error.message}`);
    process.exit(1);
  }
}

// Set file permissions
try {
  execSync(`chmod 644 ${EXACT_PATH}`);
  execSync(`chmod 644 ${EXACT_PATH_MJS}`);
  console.log('Set file permissions to 644');
} catch (error) {
  console.warn(`Warning: Could not set file permissions: ${error.message}`);
}

console.log('✅ Successfully created env module files');
console.log('🚀 The server should now be able to import from "./env"'); 