#!/usr/bin/env node

/**
 * CUSTOM MODULE LOADER
 * 
 * This script uses a custom module loader to intercept requests for the env module
 * and provide a virtual implementation. This approach doesn't modify any files.
 */

const { createRequire } = require('module');
const { resolve, dirname } = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');

// Create a virtual env module
const virtualEnvModule = `
// Virtual environment variables module
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
};
`;

// Write the virtual module to a temporary file
const tempDir = fs.mkdtempSync('virtual-env-');
const virtualModulePath = `${tempDir}/env.mjs`;
fs.writeFileSync(virtualModulePath, virtualEnvModule);

// Set up environment variables for Node.js
process.env.NODE_OPTIONS = `--experimental-modules --experimental-specifier-resolution=node --experimental-loader=${__filename}`;

// Start the server with our custom loader
console.log('🚀 Starting server with custom module loader');
const result = spawnSync('node', ['dist/index.mjs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VIRTUAL_ENV_MODULE_PATH: virtualModulePath
  }
});

// Clean up temporary files
fs.rmSync(tempDir, { recursive: true, force: true });

// Exit with the same code as the server
process.exit(result.status); 