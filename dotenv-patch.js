// dotenv-patch.js
// This is a simple implementation of dotenv that doesn't use dynamic requires

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Initializing dotenv patch...');

// Create a patched version of dotenv in node_modules
function createDotenvPatch() {
  const dotenvDir = path.join(__dirname, 'node_modules/dotenv');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dotenvDir)) {
    fs.mkdirSync(dotenvDir, { recursive: true });
  }
  
  // Create package.json
  const packageJson = {
    name: 'dotenv',
    version: '16.5.0',
    main: 'lib/main.js',
    type: 'module'
  };
  
  fs.writeFileSync(
    path.join(dotenvDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create lib directory
  const libDir = path.join(dotenvDir, 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir);
  }
  
  // Create main.js with ESM-compatible implementation
  const mainContent = `
// Simple dotenv implementation without dynamic requires
import fs from 'fs';
import path from 'path';

export function config(options = {}) {
  console.log('Using patched dotenv implementation');
  try {
    const envPath = options.path || '.env';
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          return [key.trim(), value];
        });
      
      for (const [key, value] of envVars) {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    
    return { parsed: process.env };
  } catch (error) {
    console.error('Error loading .env file:', error);
    return { error };
  }
}

export default { config };
`;

  fs.writeFileSync(path.join(libDir, 'main.js'), mainContent);
  console.log('Dotenv patch created successfully');
}

// Create the dotenv patch
createDotenvPatch();

// Also create a direct patch in the dist directory
try {
  console.log('Creating dotenv patch in dist directory...');
  
  const distDotenvDir = path.join(__dirname, 'dist/node_modules/dotenv');
  fs.mkdirSync(distDotenvDir, { recursive: true });
  
  const distLibDir = path.join(distDotenvDir, 'lib');
  fs.mkdirSync(distLibDir, { recursive: true });
  
  // Create package.json
  const packageJson = {
    name: 'dotenv',
    version: '16.5.0',
    main: 'lib/main.js',
    type: 'module'
  };
  
  fs.writeFileSync(
    path.join(distDotenvDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create main.js with ESM-compatible implementation
  const mainContent = `
// Simple dotenv implementation without dynamic requires
import fs from 'fs';
import path from 'path';

export function config(options = {}) {
  console.log('Using patched dotenv implementation in dist directory');
  try {
    const envPath = options.path || '.env';
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          return [key.trim(), value];
        });
      
      for (const [key, value] of envVars) {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    
    return { parsed: process.env };
  } catch (error) {
    console.error('Error loading .env file:', error);
    return { error };
  }
}

export default { config };
`;

  fs.writeFileSync(path.join(distLibDir, 'main.js'), mainContent);
  console.log('Dotenv patch in dist directory created successfully');
} catch (err) {
  console.error('Error creating dotenv patch in dist directory:', err);
}

export default { createDotenvPatch }; 