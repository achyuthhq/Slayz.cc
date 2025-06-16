// server-wrapper.js
// A simple wrapper script that creates the env module at the exact path and then starts the server

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting server wrapper...');

// The exact path that Node.js is looking for
const exactPath = '/opt/render/project/src/dist/env';
const exactPathMjs = '/opt/render/project/src/dist/env.mjs';

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

try {
  // Create the directory structure if it doesn't exist
  const dirPath = path.dirname(exactPath);
  console.log(`Ensuring directory exists: ${dirPath}`);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
  
  // Write the env file (without extension)
  console.log(`Writing env file to ${exactPath}...`);
  fs.writeFileSync(exactPath, envContent);
  console.log(`Created env file at ${exactPath}`);
  
  // Write the env.mjs file
  console.log(`Writing env.mjs file to ${exactPathMjs}...`);
  fs.writeFileSync(exactPathMjs, envContent);
  console.log(`Created env.mjs file at ${exactPathMjs}`);
  
  // Also create the files in the local dist directory as a fallback
  const localDistDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(localDistDir)) {
    fs.mkdirSync(localDistDir, { recursive: true });
  }
  
  const localEnvPath = path.join(localDistDir, 'env');
  const localEnvMjsPath = path.join(localDistDir, 'env.mjs');
  
  console.log(`Writing env file to ${localEnvPath}...`);
  fs.writeFileSync(localEnvPath, envContent);
  
  console.log(`Writing env.mjs file to ${localEnvMjsPath}...`);
  fs.writeFileSync(localEnvMjsPath, envContent);
  
  console.log('Files created successfully');
  
  // Start the server
  console.log('Starting the server...');
  execSync('node dist/index.mjs', { stdio: 'inherit' });
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} 