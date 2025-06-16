#!/usr/bin/env node

/**
 * This script fixes the ERR_MODULE_NOT_FOUND error by creating a modified version
 * of index.mjs that doesn't import from ./env
 */

const fs = require('fs');
const path = require('path');

// Path to the original index.mjs file
const indexPath = path.join(process.cwd(), 'dist', 'index.mjs');
// Path for the fixed version
const fixedPath = path.join(process.cwd(), 'dist', 'index.fixed.mjs');

console.log('Starting module cache fix...');
console.log(`Looking for index.mjs at: ${indexPath}`);

// Check if the original file exists
if (!fs.existsSync(indexPath)) {
  console.error(`Error: Could not find ${indexPath}`);
  process.exit(1);
}

try {
  // Read the original file
  const originalContent = fs.readFileSync(indexPath, 'utf8');
  console.log('Successfully read index.mjs');
  
  // Create a backup if it doesn't exist
  const backupPath = `${indexPath}.backup`;
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, originalContent);
    console.log(`Created backup at ${backupPath}`);
  }
  
  // Find any imports from ./env and remove them
  const fixedContent = originalContent.replace(/import\s+.*\s+from\s+['"]\.\/env['"];?\s*/g, '');
  
  // Write the fixed content to the new file
  fs.writeFileSync(fixedPath, fixedContent);
  console.log(`Successfully created fixed version at ${fixedPath}`);
  
  console.log('Module cache fix completed successfully!');
} catch (error) {
  console.error('Error fixing module cache:', error);
  process.exit(1);
} 