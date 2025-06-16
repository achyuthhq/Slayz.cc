// simple-build.js
// A simplified build script that avoids bundling problematic dependencies

import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting simplified build process...');

// Build configuration - much simpler, just transpiles TypeScript to JavaScript
const buildOptions = {
  entryPoints: ['server/index.ts'],
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up global shims
globalThis.require = require;
globalThis.__filename = __filename;
globalThis.__dirname = __dirname;

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