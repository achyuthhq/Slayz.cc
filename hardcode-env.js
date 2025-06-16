// hardcode-env.js
// This script hardcodes the env module directly into the Node.js module cache

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting hardcode env process...');

// Create a server wrapper that hardcodes the env module
const wrapperContent = `
// Server wrapper with hardcoded env module
// Created by hardcode-env.js

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set up global variables
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the env module content
const envModule = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://localhost:5432/mydb',
  SESSION_SECRET: process.env.SESSION_SECRET || 'default_session_secret',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  env: {
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
  }
};

// Hardcode the env module into the module cache
const envModuleId = new URL('./env', import.meta.url).href;
const envMjsModuleId = new URL('./env.mjs', import.meta.url).href;

// Create a proxy for the module
const moduleProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'default') {
      return envModule;
    }
    return envModule[prop];
  }
});

// Monkey patch the import function
const originalImport = globalThis.import;
globalThis.import = async function(specifier, ...args) {
  if (specifier === './env' || specifier === './env.mjs') {
    console.log('Intercepted import for', specifier);
    return moduleProxy;
  }
  return originalImport.call(this, specifier, ...args);
};

// Create the actual env.mjs file
const envContent = \`
// Environment variables configuration
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
\`;

// Write the env.mjs file
fs.writeFileSync(path.join(__dirname, 'env.mjs'), envContent);
fs.writeFileSync(path.join(__dirname, 'env'), envContent);
console.log('Created env files');

// Now load the actual server
try {
  console.log('Loading server...');
  const server = await import('./index.mjs');
  console.log('Server loaded successfully');
} catch (err) {
  console.error('Error loading server:', err);
  process.exit(1);
}
`;

// Create the dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the hardcoded wrapper
const wrapperPath = path.join(distDir, 'hardcoded-wrapper.mjs');
console.log(`Writing hardcoded wrapper to ${wrapperPath}...`);
fs.writeFileSync(wrapperPath, wrapperContent);
console.log('Created hardcoded wrapper');

console.log('Hardcode env process completed'); 