#!/usr/bin/env node

/**
 * This script copies all necessary server modules to the dist directory
 * to fix the ERR_MODULE_NOT_FOUND error on Render.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination directories
const sourceDir = path.join(__dirname, 'server');
const destDir = path.join(__dirname, 'dist');

// List of modules to copy (add more if needed)
const modulesToCopy = [
  'routes.ts',
  'auth.ts',
  'vite.ts',
  'pg-setup-db.ts',
  'socket.ts',
  'storage.ts',
  'pg-storage.ts',
  'schema.ts',
  'pg-session.ts',
  'types.ts'
];

console.log('Starting module copy process...');
console.log(`Source directory: ${sourceDir}`);
console.log(`Destination directory: ${destDir}`);

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  console.log(`Creating destination directory: ${destDir}`);
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy each module
for (const module of modulesToCopy) {
  const sourcePath = path.join(sourceDir, module);
  const destPath = path.join(destDir, module.replace('.ts', ''));
  const destPathMjs = path.join(destDir, module.replace('.ts', '.mjs'));
  
  console.log(`Processing ${module}...`);
  
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Warning: Source file ${sourcePath} does not exist, skipping.`);
    continue;
  }
  
  try {
    // Read the source file
    let content = fs.readFileSync(sourcePath, 'utf8');
    console.log(`Successfully read ${module}`);
    
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
    
    // Write the content to the destination files
    fs.writeFileSync(destPath, content);
    fs.writeFileSync(destPathMjs, content);
    console.log(`Successfully wrote to ${destPath} and ${destPathMjs}`);
  } catch (error) {
    console.error(`Error processing ${module}:`, error);
  }
}

// Also copy the lib directory if it exists
const sourceLibDir = path.join(sourceDir, 'lib');
const destLibDir = path.join(destDir, 'lib');

if (fs.existsSync(sourceLibDir)) {
  console.log('Copying lib directory...');
  
  // Create destination lib directory if it doesn't exist
  if (!fs.existsSync(destLibDir)) {
    fs.mkdirSync(destLibDir, { recursive: true });
  }
  
  // Copy all files in the lib directory
  const libFiles = fs.readdirSync(sourceLibDir);
  for (const file of libFiles) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const sourceFilePath = path.join(sourceLibDir, file);
      const destFilePath = path.join(destLibDir, file.replace('.ts', ''));
      const destFilePathMjs = path.join(destLibDir, file.replace('.ts', '.mjs').replace('.js', '.mjs'));
      
      try {
        // Read the source file
        let content = fs.readFileSync(sourceFilePath, 'utf8');
        
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
        
        // Write the content to the destination files
        fs.writeFileSync(destFilePath, content);
        fs.writeFileSync(destFilePathMjs, content);
        console.log(`Successfully wrote lib/${file} to ${destFilePath} and ${destFilePathMjs}`);
      } catch (error) {
        console.error(`Error processing lib/${file}:`, error);
      }
    }
  }
}

// Also copy the services directory if it exists
const sourceServicesDir = path.join(sourceDir, 'services');
const destServicesDir = path.join(destDir, 'services');

if (fs.existsSync(sourceServicesDir)) {
  console.log('Copying services directory...');
  
  // Create destination services directory if it doesn't exist
  if (!fs.existsSync(destServicesDir)) {
    fs.mkdirSync(destServicesDir, { recursive: true });
  }
  
  // Copy all files in the services directory
  const servicesFiles = fs.readdirSync(sourceServicesDir);
  for (const file of servicesFiles) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const sourceFilePath = path.join(sourceServicesDir, file);
      const destFilePath = path.join(destServicesDir, file.replace('.ts', ''));
      const destFilePathMjs = path.join(destServicesDir, file.replace('.ts', '.mjs').replace('.js', '.mjs'));
      
      try {
        // Read the source file
        let content = fs.readFileSync(sourceFilePath, 'utf8');
        
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
        
        // Write the content to the destination files
        fs.writeFileSync(destFilePath, content);
        fs.writeFileSync(destFilePathMjs, content);
        console.log(`Successfully wrote services/${file} to ${destFilePath} and ${destFilePathMjs}`);
      } catch (error) {
        console.error(`Error processing services/${file}:`, error);
      }
    }
  }
}

console.log('Module copy process completed successfully!'); 