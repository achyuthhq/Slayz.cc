#!/usr/bin/env node

/**
 * DIRECT INDEX.MJS PATCHING
 * 
 * This script directly modifies the index.mjs file to replace imports from './env'
 * with inline environment variables. This approach doesn't rely on creating any
 * additional files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 DIRECT FIX: Patching index.mjs to remove dependency on env module');

// Define paths
const INDEX_MJS_PATH = path.join(process.cwd(), 'dist/index.mjs');
const INDEX_MJS_BACKUP_PATH = path.join(process.cwd(), 'dist/index.mjs.backup');
const INDEX_MJS_PATCHED_PATH = path.join(process.cwd(), 'dist/index.mjs.patched');

// Define the replacement content
const ENV_REPLACEMENT = `
// Inline environment variables (patched by patch-index-direct.js)
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

// Function to patch the index.mjs file
function patchIndexMjs() {
  try {
    // Check if index.mjs exists
    if (!fs.existsSync(INDEX_MJS_PATH)) {
      console.error(`❌ Could not find index.mjs at ${INDEX_MJS_PATH}`);
      return false;
    }

    // Create a backup
    console.log(`Creating backup of index.mjs at ${INDEX_MJS_BACKUP_PATH}`);
    fs.copyFileSync(INDEX_MJS_PATH, INDEX_MJS_BACKUP_PATH);

    // Read the file content
    console.log('Reading index.mjs content');
    const content = fs.readFileSync(INDEX_MJS_PATH, 'utf8');

    // Check for imports from './env'
    const importRegex = /import\s+(?:{\s*[^}]*\s*}\s+from\s+)?['"]\.\/env['"];?/g;
    
    if (importRegex.test(content)) {
      console.log('Found import from "./env", replacing with inline environment variables');
      
      // Replace the import statement with inline environment variables
      const patchedContent = content.replace(importRegex, ENV_REPLACEMENT);
      
      // Write the patched content to a new file
      console.log(`Writing patched content to ${INDEX_MJS_PATCHED_PATH}`);
      fs.writeFileSync(INDEX_MJS_PATCHED_PATH, patchedContent);
      
      // Replace the original file with the patched file
      console.log('Replacing original index.mjs with patched version');
      fs.copyFileSync(INDEX_MJS_PATCHED_PATH, INDEX_MJS_PATH);
      
      console.log('✅ Successfully patched index.mjs');
      return true;
    } else {
      console.log('No import from "./env" found in index.mjs');
      
      // Try looking for other import patterns
      const alternativeRegex = /import\s+.*from\s+['"].*env['"]/g;
      if (alternativeRegex.test(content)) {
        console.log('Found alternative import from env, replacing with inline environment variables');
        
        // Replace the import statement with inline environment variables
        const patchedContent = content.replace(alternativeRegex, ENV_REPLACEMENT);
        
        // Write the patched content to a new file
        console.log(`Writing patched content to ${INDEX_MJS_PATCHED_PATH}`);
        fs.writeFileSync(INDEX_MJS_PATCHED_PATH, patchedContent);
        
        // Replace the original file with the patched file
        console.log('Replacing original index.mjs with patched version');
        fs.copyFileSync(INDEX_MJS_PATCHED_PATH, INDEX_MJS_PATH);
        
        console.log('✅ Successfully patched index.mjs');
        return true;
      }
      
      console.warn('⚠️ Could not find any env imports to patch');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error patching index.mjs: ${error.message}`);
    return false;
  }
}

// Try to patch the index.mjs file
if (patchIndexMjs()) {
  console.log('🚀 index.mjs patched successfully, the server should now start without errors');
} else {
  console.error('❌ Failed to patch index.mjs');
  process.exit(1);
} 