#!/usr/bin/env node

/**
 * ABSOLUTE FIX FOR ENV MODULE NOT FOUND
 * 
 * This script creates the exact file that Node.js is looking for at the exact path
 * and then starts the server. It's designed to be the most direct solution possible.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 ABSOLUTE FIX: Starting server with guaranteed env module creation');

// Define the exact paths where Node.js is looking for the module
const EXACT_PATH = '/opt/render/project/src/dist/env';
const EXACT_PATH_MJS = '/opt/render/project/src/dist/env.mjs';
const LOCAL_PATH = path.join(process.cwd(), 'dist/env');
const LOCAL_PATH_MJS = path.join(process.cwd(), 'dist/env.mjs');

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

// Define the content for the env file (CommonJS format)
const ENV_CONTENT_CJS = `// CommonJS version of the env module
// Created by absolute-fix.js

// Load dotenv
require('dotenv').config();

// Export environment variables with defaults
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/mydb';
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret';
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Export the env object with all variables
const env = {
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

// Export everything
module.exports = {
  DATABASE_URL,
  SESSION_SECRET,
  PORT,
  NODE_ENV,
  env,
  default: {
    DATABASE_URL,
    SESSION_SECRET,
    PORT,
    NODE_ENV,
    env
  }
};`;

// Create all necessary directories
function createDirectories(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Write files at all possible locations
function writeEnvFiles() {
  try {
    // Create the exact path directories
    createDirectories(EXACT_PATH);
    
    // Write the file without extension (this is what Node.js is looking for)
    console.log(`Writing env file to ${EXACT_PATH}`);
    fs.writeFileSync(EXACT_PATH, ENV_CONTENT);
    
    // Write the .mjs version too
    console.log(`Writing env.mjs file to ${EXACT_PATH_MJS}`);
    fs.writeFileSync(EXACT_PATH_MJS, ENV_CONTENT);
    
    // Also create in local dist directory
    createDirectories(LOCAL_PATH);
    console.log(`Writing env file to ${LOCAL_PATH}`);
    fs.writeFileSync(LOCAL_PATH, ENV_CONTENT);
    
    console.log(`Writing env.mjs file to ${LOCAL_PATH_MJS}`);
    fs.writeFileSync(LOCAL_PATH_MJS, ENV_CONTENT);
    
    // Create CommonJS versions
    console.log(`Writing env.js file to ${path.join(process.cwd(), 'dist/env.js')}`);
    fs.writeFileSync(path.join(process.cwd(), 'dist/env.js'), ENV_CONTENT_CJS);
    
    // Set file permissions
    try {
      fs.chmodSync(EXACT_PATH, 0o644);
      fs.chmodSync(EXACT_PATH_MJS, 0o644);
      fs.chmodSync(LOCAL_PATH, 0o644);
      fs.chmodSync(LOCAL_PATH_MJS, 0o644);
      console.log('Set file permissions to 644');
    } catch (err) {
      console.warn('Warning: Could not set file permissions:', err.message);
    }
    
    console.log('✅ Successfully created all env files');
    return true;
  } catch (error) {
    console.error('❌ Error creating env files:', error);
    return false;
  }
}

// Start the server
function startServer() {
  try {
    console.log('🚀 Starting server...');
    execSync('node dist/index.mjs', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Server start failed:', error.message);
    process.exit(1);
  }
}

// Main execution
console.log('🔍 Creating env module at all possible locations');
if (writeEnvFiles()) {
  startServer();
} else {
  console.error('❌ Failed to create env files');
  process.exit(1);
} 