// final-fix.js
// This is a direct fix that modifies the index.mjs file in-place
// It's used as a final fallback option if all other methods fail

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the original index.mjs file
const indexPath = path.join(__dirname, 'dist', 'index.mjs');

console.log('Starting final fix...');
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
  
  // Check if there's an import from ./env
  const importRegex = /import\s+.*\s+from\s+['"]\.\/env['"];?\s*/g;
  if (!importRegex.test(originalContent)) {
    console.log('No import from "./env" found, no changes needed.');
    process.exit(0);
  }
  
  // Find any imports from ./env and remove them
  const fixedContent = originalContent.replace(importRegex, '');
  
  // Write the fixed content back to the original file
  fs.writeFileSync(indexPath, fixedContent);
  console.log(`Successfully modified ${indexPath} to remove imports from ./env`);
  
  console.log('Final fix completed successfully!');
} catch (error) {
  console.error('Error fixing file:', error);
  process.exit(1);
} 