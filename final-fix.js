// final-fix.js
// This is a final fallback script that directly modifies the index.mjs file at runtime
// to remove the dependency on the env module and then executes it

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Starting final fix process...');

// Define the paths
const indexMjsPath = path.join(process.cwd(), 'dist/index.mjs');
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

// Create a new index.mjs file with the env module inlined
try {
  console.log('Creating env files...');
  
  // Create the directory structure if it doesn't exist
  const dirPath = path.dirname(exactPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Write the env files
  fs.writeFileSync(exactPath, envContent);
  fs.writeFileSync(exactPathMjs, envContent);
  
  // Also create in local dist directory
  const localDistDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(localDistDir)) {
    fs.mkdirSync(localDistDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(localDistDir, 'env'), envContent);
  fs.writeFileSync(path.join(localDistDir, 'env.mjs'), envContent);
  
  console.log('Created env files');
  
  // Read the index.mjs file
  if (fs.existsSync(indexMjsPath)) {
    console.log(`Reading ${indexMjsPath}...`);
    let content = fs.readFileSync(indexMjsPath, 'utf8');
    
    // Check if the file imports from './env'
    const importRegex = /import\s+(?:{\s*[^}]*\s*}\s+from\s+)?['"]\.\/env['"]/g;
    if (importRegex.test(content)) {
      console.log('Found import from "./env", replacing with inline environment variables');
      
      // Create inline environment variables
      const inlineEnvVars = `
// Inline environment variables (added by final-fix.js)
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
`;

      // Replace the import statement with inline environment variables
      content = content.replace(/import\s+(?:{\s*[^}]*\s*}\s+from\s+)?['"]\.\/env['"];?/g, inlineEnvVars);
      
      // Create a new file with the modified content
      const newIndexMjsPath = path.join(process.cwd(), 'dist/index.fixed.mjs');
      console.log(`Writing modified content to ${newIndexMjsPath}...`);
      fs.writeFileSync(newIndexMjsPath, content);
      console.log('Successfully created modified index.fixed.mjs');
      
      // Start the server with the modified file
      console.log('Starting the server with modified file...');
      execSync('node dist/index.fixed.mjs', { stdio: 'inherit' });
    } else {
      console.log('No import from "./env" found in index.mjs');
      console.log('Starting the server with original file...');
      execSync('node dist/index.mjs', { stdio: 'inherit' });
    }
  } else {
    console.error(`Error: ${indexMjsPath} does not exist!`);
    process.exit(1);
  }
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} 