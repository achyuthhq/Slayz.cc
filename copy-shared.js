#!/usr/bin/env node

/**
 * This script copies the shared directory to the dist directory
 * to fix the ERR_MODULE_NOT_FOUND error on Render.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination directories
const sourceDir = path.join(__dirname, 'shared');
const destDir = path.join(__dirname, 'dist', 'shared');

console.log('Starting shared directory copy process...');
console.log(`Source directory: ${sourceDir}`);
console.log(`Destination directory: ${destDir}`);

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  console.log(`Creating destination directory: ${destDir}`);
  fs.mkdirSync(destDir, { recursive: true });
}

// Function to copy a directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Get all files in the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // If it's a directory, recursively copy it
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
      // If it's a TypeScript or JavaScript file, process it
      try {
        // Read the source file
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Convert TypeScript to JavaScript (basic conversion)
        content = content
          // Remove TypeScript type annotations
          .replace(/:\s*[A-Za-z<>\[\]|&,\s]+(?=\s*[=;,)])/g, '')
          .replace(/<[A-Za-z<>\[\]|&,\s]+>/g, '')
          .replace(/import\s+type\s+.*?;/g, '')
          .replace(/export\s+type\s+.*?;/g, '')
          .replace(/export\s+interface\s+.*?{[\s\S]*?}/g, '')
          .replace(/interface\s+.*?{[\s\S]*?}/g, '')
          // Fix imports
          .replace(/from\s+['"]\.\/([^'"]+)['"]/g, (match, p1) => {
            // Convert relative imports to .mjs
            return `from './${p1}.mjs'`;
          })
          .replace(/from\s+['"]\.\.\/([^'"]+)['"]/g, (match, p1) => {
            // Convert parent directory imports to .mjs
            return `from '../${p1}.mjs'`;
          });
        
        // Write the content to the destination file
        const baseDestPath = destPath.replace('.ts', '');
        fs.writeFileSync(baseDestPath, content);
        fs.writeFileSync(`${baseDestPath}.mjs`, content);
        console.log(`Successfully wrote ${entry.name} to ${baseDestPath} and ${baseDestPath}.mjs`);
      } catch (error) {
        console.error(`Error processing ${entry.name}:`, error);
      }
    } else {
      // For other files, just copy them
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${entry.name} to ${destPath}`);
      } catch (error) {
        console.error(`Error copying ${entry.name}:`, error);
      }
    }
  }
}

// Copy the shared directory
try {
  copyDir(sourceDir, destDir);
  console.log('Shared directory copy process completed successfully!');
} catch (error) {
  console.error('Error copying shared directory:', error);
  process.exit(1);
} 