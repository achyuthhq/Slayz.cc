// simple-build.js
// A simplified build script that avoids bundling problematic dependencies

import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting simplified build process...');

// Check if server/env.ts exists and create it if it doesn't
const envTsPath = path.join(__dirname, 'server/env.ts');
if (!fs.existsSync(envTsPath)) {
  console.log('Creating server/env.ts file...');
  const envTsContent = `
// Environment variables configuration
import dotenv from 'dotenv';
dotenv.config();

// Export environment variables with defaults
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/mydb';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret';
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Export as default object as well
export default {
  DATABASE_URL,
  SESSION_SECRET,
  PORT,
  NODE_ENV
};
`;
  fs.writeFileSync(envTsPath, envTsContent);
  console.log('Created server/env.ts file');
}

// Build configuration - much simpler, just transpiles TypeScript to JavaScript
const buildOptions = {
  entryPoints: ['server/index.ts', 'server/env.ts'],
  bundle: false, // Don't bundle, just transpile
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  outExtension: { '.js': '.mjs' },
  sourcemap: true,
  target: ['node18'],
  logLevel: 'info',
};

try {
  // Run the build
  await esbuild.build(buildOptions);
  console.log('Server transpilation completed successfully');
  
  // Create a simple wrapper to handle imports
  const wrapperContent = `
// This is a simple wrapper that loads the server with proper imports
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up global shims
globalThis.require = require;
globalThis.__filename = __filename;
globalThis.__dirname = __dirname;

// Create env.mjs if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'env.mjs'))) {
  console.log('Creating env.mjs file...');
  const envContent = \`
// Environment variables configuration
import dotenv from 'dotenv';
dotenv.config();

// Export environment variables with defaults
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/mydb';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret';
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Export as default object as well
export default {
  DATABASE_URL,
  SESSION_SECRET,
  PORT,
  NODE_ENV
};
\`;
  fs.writeFileSync(path.join(__dirname, 'env.mjs'), envContent);
  console.log('Created env.mjs file');
}

// Create a symbolic link from 'env' to 'env.mjs' to fix module resolution
try {
  console.log('Creating symbolic link from env to env.mjs...');
  fs.symlinkSync('env.mjs', path.join(__dirname, 'env'), 'file');
  console.log('Created symbolic link for env module');
} catch (err) {
  // If the symlink already exists or fails, try removing it first and then create it
  try {
    if (fs.existsSync(path.join(__dirname, 'env'))) {
      fs.unlinkSync(path.join(__dirname, 'env'));
    }
    fs.symlinkSync('env.mjs', path.join(__dirname, 'env'), 'file');
    console.log('Created symbolic link for env module (after cleanup)');
  } catch (innerErr) {
    console.error('Failed to create symbolic link:', innerErr);
    // Create a hard copy as fallback
    fs.copyFileSync(path.join(__dirname, 'env.mjs'), path.join(__dirname, 'env'));
    console.log('Created hard copy of env.mjs as env (fallback)');
  }
}

// Load environment variables
try {
  const dotenv = await import('dotenv');
  await dotenv.config();
  console.log('Environment variables loaded from .env');
} catch (err) {
  console.error('Error loading dotenv:', err);
}

// Load the server
try {
  const server = await import('./index.mjs');
  console.log('Server loaded successfully');
} catch (err) {
  console.error('Error loading server:', err);
  process.exit(1);
}
`;

  // Write the wrapper to disk
  fs.writeFileSync(path.join(__dirname, 'dist/server.mjs'), wrapperContent);
  console.log('Created server wrapper');
  
  // Create a simple package.json in the dist directory
  const packageJson = {
    name: "slayz-server",
    version: "1.0.0",
    type: "module",
    main: "server.mjs"
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'dist/package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  console.log('Created dist/package.json');
  
  console.log('Build process completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 