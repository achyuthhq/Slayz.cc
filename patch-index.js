// patch-index.js
// This script patches the index.mjs file to replace the import from './env' with inline environment variables

const fs = require('fs');
const path = require('path');

console.log('Starting index.mjs patch process...');

// Path to the transpiled index.mjs file
const indexMjsPath = path.join(process.cwd(), 'dist/index.mjs');

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
  console.log('Found import from "./env", replacing with inline environment variables');
  
  // Create inline environment variables
  const inlineEnvVars = `
// Inline environment variables (added by patch-index.js)
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
  
  // Write the modified content back to the file
  console.log(`Writing modified content back to ${indexMjsPath}...`);
  fs.writeFileSync(indexMjsPath, content);
  console.log('Successfully updated index.mjs with inline environment variables');
  
  // Check all other .mjs files in the dist directory
  const distDir = path.join(process.cwd(), 'dist');
  const files = fs.readdirSync(distDir);

  for (const file of files) {
    if (file.endsWith('.mjs') && file !== 'index.mjs' && file !== 'env.mjs') {
      const filePath = path.join(distDir, file);
      console.log(`Checking ${filePath}...`);
      
      // Read the content of the file
      let fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Check if the file imports from './env'
      if (importRegex.test(fileContent)) {
        console.log(`Found import from "./env" in ${file}, replacing with inline environment variables`);
        
        // Replace the import statement with inline environment variables
        fileContent = fileContent.replace(/import\s+(?:{\s*[^}]*\s*}\s+from\s+)?['"]\.\/env['"];?/g, inlineEnvVars);
        
        // Write the modified content back to the file
        console.log(`Writing modified content back to ${filePath}...`);
        fs.writeFileSync(filePath, fileContent);
        console.log(`Successfully updated ${file} with inline environment variables`);
      }
    }
  }
} else {
  console.log('No import from "./env" found in index.mjs');
}

console.log('Index.mjs patch process completed'); 