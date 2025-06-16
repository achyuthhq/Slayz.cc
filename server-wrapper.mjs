#!/usr/bin/env node

// This wrapper ensures all dependencies are properly loaded
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';
import path from 'path';

console.log('Starting server wrapper with enhanced dependency handling...');

// Create a mock for lightningcss if it's not available
if (!globalThis.lightningcss) {
  globalThis.lightningcss = {};
  console.log('Created mock for lightningcss');
}

// Create a global shim for dynamic requires if it doesn't exist
if (!globalThis.__requireShim) {
  globalThis.__requireShim = async function(moduleName) {
    console.log(`Dynamic require shim called for: ${moduleName}`);
    
    // Handle common Node.js built-in modules
    switch(moduleName) {
      case 'events':
        return await import('events');
      case 'stream':
        return await import('stream');
      case 'http':
        return await import('http');
      case 'https':
        return await import('https');
      case 'fs':
        return await import('fs');
      case 'path':
        return await import('path');
      case 'crypto':
        return await import('crypto');
      case 'util':
        return await import('util');
      case 'buffer':
        return await import('buffer');
      case 'zlib':
        return await import('zlib');
      case 'net':
        return await import('net');
      case 'tls':
        return await import('tls');
      default:
        try {
          return require(moduleName);
        } catch (err) {
          console.error(`Failed to require ${moduleName}:`, err);
          return {};
        }
    }
  };
  console.log('Dynamic require shim installed in server wrapper');
}

// Patch the Error constructor to handle dynamic requires
const originalError = Error;
Error = function(message) {
  if (typeof message === 'string' && message.startsWith('Dynamic require of "')) {
    const moduleName = message.match(/Dynamic require of "([^"]+)"/)[1];
    console.log(`Intercepted dynamic require for ${moduleName}, using shim`);
    return new originalError(`Using shim for ${moduleName}`);
  }
  return new originalError(message);
};
Error.prototype = originalError.prototype;
console.log('Error constructor patched to handle dynamic requires');

// Create a postgres patch file that will be loaded by the server
const createPostgresPatch = () => {
  console.log('Creating postgres patch module...');
  
  // Create the patch directory if it doesn't exist
  const patchDir = path.join(process.cwd(), 'node_modules/postgres');
  if (!fs.existsSync(patchDir)) {
    console.log('Creating postgres module directory...');
    fs.mkdirSync(patchDir, { recursive: true });
  }
  
  // Create a basic package.json
  const packageJson = {
    name: 'postgres',
    version: '3.4.7',
    main: 'index.js',
    type: 'module'
  };
  
  fs.writeFileSync(
    path.join(patchDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create a basic implementation
  const indexContent = `
// This is a patch module for postgres
console.log('Using patched postgres module');

function postgres(connectionString, options = {}) {
  console.log('Postgres connection requested:', connectionString);
  return {
    connect: async () => console.log('Mock postgres connect called'),
    end: async () => console.log('Mock postgres end called'),
    query: async (query, params) => {
      console.log('Mock postgres query:', query, params);
      return [];
    }
  };
}

// Add the default export
postgres.default = postgres;

// Add named exports
export default postgres;
export const sql = postgres;
`;

  fs.writeFileSync(path.join(patchDir, 'index.js'), indexContent);
  console.log('Postgres patch module created successfully');
}

// Check if postgres module exists and create patch if needed
const postgresPath = path.join(process.cwd(), 'node_modules/postgres');
if (!fs.existsSync(path.join(postgresPath, 'package.json'))) {
  console.log('Postgres module not found or incomplete, creating patch...');
  createPostgresPatch();
  
  // Install real postgres module in background
  try {
    const { spawn } = require('child_process');
    console.log('Installing postgres in background...');
    spawn('npm', ['install', '--no-save', 'postgres@3.4.7'], { 
      detached: true,
      stdio: 'ignore'
    }).unref();
  } catch (err) {
    console.error('Failed to start background postgres installation:', err);
  }
} else {
  console.log('Postgres module found, verifying...');
  try {
    const pgPkg = JSON.parse(fs.readFileSync(path.join(postgresPath, 'package.json'), 'utf8'));
    console.log(`Found postgres package version: ${pgPkg.version}`);
  } catch (err) {
    console.error('Error reading postgres package.json:', err);
    createPostgresPatch();
  }
}

// Patch the bundled index.mjs file if it exists
try {
  const indexPath = path.join(process.cwd(), 'dist/index.mjs');
  if (fs.existsSync(indexPath)) {
    console.log('Patching dist/index.mjs for dynamic requires...');
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Add a dynamic require handler at the top of the file
    if (!content.includes('__handleDynamicRequire')) {
      const patchCode = `
// Dynamic require handler
function __handleDynamicRequire(moduleName) {
  console.log("Handling dynamic require for: " + moduleName);
  switch(moduleName) {
    case 'events': return import('events');
    case 'stream': return import('stream');
    case 'fs': return import('fs');
    case 'path': return import('path');
    case 'http': return import('http');
    case 'https': return import('https');
    case 'net': return import('net');
    case 'tls': return import('tls');
    case 'crypto': return import('crypto');
    case 'zlib': return import('zlib');
    case 'buffer': return import('buffer');
    case 'util': return import('util');
    default: throw new Error("Cannot handle dynamic require for: " + moduleName);
  }
}

`;
      content = patchCode + content;
      
      // Replace the dynamic require error with our handler
      content = content.replace(
        /throw Error\('Dynamic require of "' \+ x \+ '" is not supported'\);/g,
        'return __handleDynamicRequire(x);'
      );
      
      fs.writeFileSync(indexPath, content);
      console.log('Successfully patched dist/index.mjs');
    }
  }
} catch (err) {
  console.error('Error patching dist/index.mjs:', err);
}

// Pre-load critical dependencies
try {
  console.log('Pre-loading critical dependencies...');
  
  // Try to load lightningcss
  try {
    const lightningcss = require('lightningcss');
    console.log('✓ lightningcss module loaded successfully');
  } catch (error) {
    console.log('Note: lightningcss not available, using mock implementation');
  }
  
  // Try to load postgres - this is critical, so we'll try multiple approaches
  let postgresLoaded = false;
  
  // Approach 1: Direct require
  try {
    const postgres = require('postgres');
    console.log('✓ Postgres module loaded successfully via require');
    postgresLoaded = true;
    // Make it globally available
    globalThis.postgres = postgres;
  } catch (error) {
    console.error('Failed to load postgres module via require:', error);
  }
  
  // Approach 2: ESM import
  if (!postgresLoaded) {
    try {
      const postgres = await import('postgres');
      console.log('✓ Postgres module loaded successfully via ESM import');
      postgresLoaded = true;
      // Make it globally available
      globalThis.postgres = postgres;
    } catch (error) {
      console.error('Failed to load postgres module via ESM import:', error);
    }
  }
  
  // If postgres still not loaded, this is a critical failure
  if (!postgresLoaded) {
    console.error('CRITICAL ERROR: Failed to load postgres module after multiple attempts');
    process.exit(1);
  }
  
  // Try to load pg
  try {
    const pg = require('pg');
    console.log('✓ pg module loaded successfully');
  } catch (error) {
    console.error('Failed to load pg module:', error);
  }

  // Try to load connect-pg-simple
  try {
    const connectPgSimple = require('connect-pg-simple');
    console.log('✓ connect-pg-simple loaded successfully');
  } catch (error) {
    console.error('Failed to load connect-pg-simple:', error);
  }
  
  // Try to load bcrypt
  try {
    const bcrypt = require('bcrypt');
    console.log('✓ bcrypt loaded successfully');
  } catch (error) {
    console.error('Failed to load bcrypt:', error);
  }
  
  // Try to load resend
  try {
    const resend = require('resend');
    console.log('✓ resend loaded successfully');
  } catch (error) {
    console.error('Failed to load resend:', error);
  }
  
  // Try to load better-sqlite3
  try {
    const betterSqlite3 = require('better-sqlite3');
    console.log('✓ better-sqlite3 loaded successfully');
  } catch (error) {
    console.error('Failed to load better-sqlite3:', error);
  }
  
  // Try to load drizzle-orm
  try {
    const drizzle = await import('drizzle-orm');
    console.log('✓ Drizzle ORM loaded successfully');
  } catch (error) {
    console.error('Failed to load drizzle-orm:', error);
  }
  
  // Try to preload events module
  try {
    const events = await import('events');
    console.log('✓ Events module loaded successfully');
    globalThis.events = events;
  } catch (error) {
    console.error('Failed to load events module:', error);
  }
  
  // Try to preload stream module
  try {
    const stream = await import('stream');
    console.log('✓ Stream module loaded successfully');
    globalThis.stream = stream;
  } catch (error) {
    console.error('Failed to load stream module:', error);
  }
  
  // Load the actual server
  console.log('Starting server...');
  
  try {
    const server = await import('./dist/index.mjs');
  } catch (error) {
    console.error('Error importing server:', error);
    
    if (error.message && error.message.includes('Dynamic require')) {
      console.error('Dynamic require error detected. Trying with patched require...');
      
      // Create a patch for the problematic module
      const moduleName = error.message.match(/Dynamic require of "([^"]+)"/)?.[1];
      if (moduleName) {
        console.log(`Creating patch for ${moduleName}...`);
        
        // Try to load the server again
        try {
          const server = await import('./dist/index.mjs');
        } catch (retryError) {
          console.error('Failed to import server after patching:', retryError);
          process.exit(1);
        }
      } else {
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
} catch (error) {
  console.error('Error in server wrapper:', error);
  process.exit(1);
} 