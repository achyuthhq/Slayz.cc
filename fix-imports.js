#!/usr/bin/env node

/**
 * This script fixes the imports in the index.mjs file
 * to fix the ERR_MODULE_NOT_FOUND error on Render.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the index.mjs file
const indexPath = path.join(__dirname, 'dist', 'index.mjs');

console.log('Starting import fix process...');
console.log(`Looking for index.mjs at: ${indexPath}`);

// Check if the index.mjs file exists
if (!fs.existsSync(indexPath)) {
  console.error(`Error: Could not find ${indexPath}`);
  process.exit(1);
}

try {
  // Read the index.mjs file
  let content = fs.readFileSync(indexPath, 'utf8');
  console.log('Successfully read index.mjs');
  
  // Create a backup of the original file
  const backupPath = `${indexPath}.original`;
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content);
    console.log(`Created backup at ${backupPath}`);
  }
  
  // Fix the imports
  const fixedContent = content
    // Fix relative imports to use .mjs extension
    .replace(/from\s+['"]\.\/([^'"]+)['"]/g, (match, p1) => {
      // Convert relative imports to .mjs
      return `from './${p1}.mjs'`;
    })
    .replace(/from\s+['"]\.\.\/([^'"]+)['"]/g, (match, p1) => {
      // Convert parent directory imports to .mjs
      return `from '../${p1}.mjs'`;
    });
  
  // Write the fixed content back to the file
  fs.writeFileSync(indexPath, fixedContent);
  console.log(`Successfully wrote fixed content to ${indexPath}`);
  
  console.log('Import fix process completed successfully!');
} catch (error) {
  console.error('Error fixing imports:', error);
  process.exit(1);
} 