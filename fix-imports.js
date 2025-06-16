// fix-imports.js
// This script patches the transpiled index.mjs file to fix import paths

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting import path fix process...');

// Path to the transpiled index.mjs file
const indexMjsPath = path.join(__dirname, 'dist/index.mjs');

if (!fs.existsSync(indexMjsPath)) {
  console.error(`Error: ${indexMjsPath} does not exist!`);
  process.exit(1);
}

// Read the content of the file
console.log(`Reading ${indexMjsPath}...`);
let content = fs.readFileSync(indexMjsPath, 'utf8');

// Check if the file imports from './env'
const importRegex = /import\s+(?:{\s*[^}]*\s*}\s+from\s+)?['"]\.\/env['"]/g;
if (importRegex.test(content)) {
  console.log('Found import from "./env", replacing with "./env.mjs"');
  
  // Replace the import statement
  content = content.replace(/(['"])\.\/env(['"])/g, '$1./env.mjs$2');
  
  // Write the modified content back to the file
  console.log(`Writing modified content back to ${indexMjsPath}...`);
  fs.writeFileSync(indexMjsPath, content);
  console.log('Successfully updated import paths in index.mjs');
} else {
  console.log('No import from "./env" found in index.mjs');
}

// Check all other .mjs files in the dist directory
const distDir = path.join(__dirname, 'dist');
const files = fs.readdirSync(distDir);

for (const file of files) {
  if (file.endsWith('.mjs') && file !== 'index.mjs' && file !== 'env.mjs') {
    const filePath = path.join(distDir, file);
    console.log(`Checking ${filePath}...`);
    
    // Read the content of the file
    let fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file imports from './env'
    if (importRegex.test(fileContent)) {
      console.log(`Found import from "./env" in ${file}, replacing with "./env.mjs"`);
      
      // Replace the import statement
      fileContent = fileContent.replace(/(['"])\.\/env(['"])/g, '$1./env.mjs$2');
      
      // Write the modified content back to the file
      console.log(`Writing modified content back to ${filePath}...`);
      fs.writeFileSync(filePath, fileContent);
      console.log(`Successfully updated import paths in ${file}`);
    }
  }
}

console.log('Import path fix process completed'); 