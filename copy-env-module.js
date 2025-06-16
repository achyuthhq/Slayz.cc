#!/usr/bin/env node

/**
 * This script copies the env.ts file to the dist directory and converts it to ESM format
 * to fix the ERR_MODULE_NOT_FOUND error on Render.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination paths
const sourceFile = path.join(__dirname, 'server', 'env.ts');
const destFile = path.join(__dirname, 'dist', 'env');

console.log('Starting env module copy process...');
console.log(`Source file: ${sourceFile}`);
console.log(`Destination file: ${destFile}`);

try {
  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file ${sourceFile} does not exist`);
    process.exit(1);
  }

  // Read the source file
  let content = fs.readFileSync(sourceFile, 'utf8');
  console.log('Successfully read source file');

  // Convert TypeScript to JavaScript
  content = content
    // Remove TypeScript type annotations
    .replace(/:\s*[A-Za-z<>\[\]|,\s]+(?=\s*[=;,)])/g, '')
    // Replace 'export const' with 'export const'
    .replace(/export\s+const/g, 'export const')
    // Replace 'export default' with 'export default'
    .replace(/export\s+default/g, 'export default');

  // Ensure the dist directory exists
  const distDir = path.dirname(destFile);
  if (!fs.existsSync(distDir)) {
    console.log(`Creating directory: ${distDir}`);
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Write the content to the destination file
  fs.writeFileSync(destFile, content);
  console.log(`Successfully wrote to ${destFile}`);

  // Also create a .mjs version for ESM imports
  fs.writeFileSync(`${destFile}.mjs`, content);
  console.log(`Successfully wrote to ${destFile}.mjs`);

  console.log('Env module copy process completed successfully');
} catch (error) {
  console.error('Error copying env module:', error);
  process.exit(1);
} 