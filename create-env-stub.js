// create-env-stub.js
// This script creates a direct stub for the env module at the exact path that the server is trying to import from

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting env stub creation process...');

// Define the content for the env stub
const envStubContent = `
// This is a stub that redirects to the actual env.mjs file
// Created by create-env-stub.js to fix import issues

// Re-export everything from env.mjs
export * from './env.mjs';

// Also re-export the default export
import defaultExport from './env.mjs';
export default defaultExport;
`;

// Create the dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the env stub file (without extension)
const envStubPath = path.join(distDir, 'env');
console.log(`Writing env stub file to ${envStubPath}...`);
fs.writeFileSync(envStubPath, envStubContent);
console.log('Created env stub file (without extension)');

// Also create a direct env.js file for CommonJS imports
const envJsPath = path.join(distDir, 'env.js');
console.log(`Writing env.js file to ${envJsPath}...`);
fs.writeFileSync(envJsPath, `
// CommonJS version of the env module
// Created by create-env-stub.js to fix import issues

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
};
`);
console.log('Created env.js file for CommonJS imports');

console.log('Env stub creation process completed successfully'); 