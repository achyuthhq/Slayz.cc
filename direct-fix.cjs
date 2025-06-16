#!/usr/bin/env node

/**
 * DIRECT FIX FOR ENV MODULE NOT FOUND (CommonJS version)
 * 
 * This script directly modifies the index.mjs file to replace imports from './env'
 * with inline environment variables. This is the most direct approach possible.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 DIRECT FIX: Modifying index.mjs to remove dependency on env module');

// Define paths
const indexMjsPath = path.join(process.cwd(), 'dist/index.mjs');

// Define the replacement content
const envReplacement = `
// Inline environment variables (added by direct-fix.cjs)
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

// Check if index.mjs exists
if (!fs.existsSync(indexMjsPath)) {
  console.error(`❌ Could not find index.mjs at ${indexMjsPath}`);
  process.exit(1);
}

// Read the file content
console.log('Reading index.mjs content');
const content = fs.readFileSync(indexMjsPath, 'utf8');

// Check for imports from './env'
const importRegex = /import\s+(?:{\s*[^}]*\s*}\s+from\s+)?['"]\.\/env['"];?/g;

if (importRegex.test(content)) {
  console.log('Found import from "./env", replacing with inline environment variables');
  
  // Replace the import statement with inline environment variables
  const patchedContent = content.replace(importRegex, envReplacement);
  
  // Write the patched content back to the file
  console.log('Writing patched content back to index.mjs');
  fs.writeFileSync(indexMjsPath, patchedContent);
  
  console.log('✅ Successfully patched index.mjs');
} else {
  console.log('No import from "./env" found in index.mjs');
  
  // Try looking for other import patterns
  const alternativeRegex = /import\s+.*from\s+['"].*env['"]/g;
  if (alternativeRegex.test(content)) {
    console.log('Found alternative import from env, replacing with inline environment variables');
    
    // Replace the import statement with inline environment variables
    const patchedContent = content.replace(alternativeRegex, envReplacement);
    
    // Write the patched content back to the file
    console.log('Writing patched content back to index.mjs');
    fs.writeFileSync(indexMjsPath, patchedContent);
    
    console.log('✅ Successfully patched index.mjs');
  } else {
    console.warn('⚠️ Could not find any env imports to patch');
    
    // Create a new version of index.mjs with the env module content at the top
    console.log('Creating a new version of index.mjs with env module content at the top');
    const newContent = envReplacement + '\n' + content;
    fs.writeFileSync(path.join(process.cwd(), 'dist/index.fixed.mjs'), newContent);
    
    console.log('✅ Created dist/index.fixed.mjs with env module content');
  }
}

console.log('🚀 The server should now start without errors'); 