// create-env-file.js
// This script ensures that both env.mjs and env (without extension) files exist
// to handle ESM imports correctly

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting env file creation process...');

// Define the content for the env file
const envContent = `
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
`;

// Create the dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the env.mjs file
const envMjsPath = path.join(distDir, 'env.mjs');
console.log(`Writing env.mjs file to ${envMjsPath}...`);
fs.writeFileSync(envMjsPath, envContent);
console.log('Created env.mjs file');

// Write the env file (without extension)
const envPath = path.join(distDir, 'env');
console.log(`Writing env file to ${envPath}...`);
fs.writeFileSync(envPath, envContent);
console.log('Created env file (without extension)');

// Also create the env file in the current directory for local development
const rootEnvMjsPath = path.join(__dirname, 'env.mjs');
console.log(`Writing env.mjs file to ${rootEnvMjsPath}...`);
fs.writeFileSync(rootEnvMjsPath, envContent);
console.log('Created root env.mjs file');

console.log('Env file creation process completed successfully'); 