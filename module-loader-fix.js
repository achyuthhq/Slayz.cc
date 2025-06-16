// module-loader-fix.js
// This script creates a custom module loader wrapper to intercept and handle the './env' import

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting module loader fix process...');

// Create a custom module loader wrapper
const moduleLoaderContent = `
// Custom module loader wrapper to handle the './env' import
// Created by module-loader-fix.js

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { register } from 'node:module';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set up global variables
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define environment variables
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

// Create the env.mjs file
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
console.log('Created env.mjs file');

// Write the env file (without extension)
fs.writeFileSync(path.join(__dirname, 'env'), envContent);
console.log('Created env file (without extension)');

// Create a symbolic link if possible
try {
  if (fs.existsSync(path.join(__dirname, 'env'))) {
    fs.unlinkSync(path.join(__dirname, 'env'));
  }
  fs.symlinkSync('env.mjs', path.join(__dirname, 'env'), 'file');
  console.log('Created symbolic link for env module');
} catch (err) {
  console.error('Failed to create symbolic link:', err);
}

// Create a custom module loader hook
try {
  // Register a custom loader hook
  register('./custom-loader.mjs', import.meta.url);
  console.log('Registered custom module loader');
} catch (err) {
  console.error('Failed to register custom module loader:', err);
}

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

// Create the custom loader
const customLoaderContent = `
// Custom loader to intercept and handle the './env' import
// Created by module-loader-fix.js

export async function resolve(specifier, context, nextResolve) {
  console.log(\`Resolving module: \${specifier}\`);
  
  // Check if this is the './env' import
  if (specifier === './env') {
    console.log('Intercepted "./env" import, redirecting to "./env.mjs"');
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL('./env.mjs', context.parentURL).href
    };
  }
  
  // For all other imports, use the default resolver
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  console.log(\`Loading module from URL: \${url}\`);
  
  // Check if this is the env module
  if (url.endsWith('/env') || url.endsWith('/env.mjs')) {
    console.log('Loading env module content directly');
    
    // Define the content for the env module
    const source = \`
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
    
    return {
      format: 'module',
      shortCircuit: true,
      source
    };
  }
  
  // For all other modules, use the default loader
  return nextLoad(url, context);
}
`;

// Create the dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the module loader wrapper
const moduleLoaderPath = path.join(distDir, 'module-loader.mjs');
console.log(`Writing module loader wrapper to ${moduleLoaderPath}...`);
fs.writeFileSync(moduleLoaderPath, moduleLoaderContent);
console.log('Created module loader wrapper');

// Write the custom loader
const customLoaderPath = path.join(distDir, 'custom-loader.mjs');
console.log(`Writing custom loader to ${customLoaderPath}...`);
fs.writeFileSync(customLoaderPath, customLoaderContent);
console.log('Created custom loader');

console.log('Module loader fix process completed'); 