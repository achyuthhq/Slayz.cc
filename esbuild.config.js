import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// List of all Node.js modules that should be treated as external
const externalModules = [
  // Critical database modules - these MUST be external
  'postgres',
  'pg',
  'connect-pg-simple',
  'bcrypt',
  'resend',
  'better-sqlite3',
  '@babel/preset-typescript',
  'drizzle-orm',
  'express',
  'express-session',
  'lightningcss',
  'dotenv', // Add dotenv to external modules
  'node:http', // Node.js built-in modules
  'node:fs',
  'node:path',
  'node:crypto',
  'node:stream',
  'node:util',
  'node:events',
  'node:buffer',
  'node:os',
  'node:url',
  'node:child_process',
  'node:zlib',
  'node:https',
  'node:http2',
  'node:net',
  'node:tls',
  'node:dns',
  'node:querystring',
  'node:readline',
  'node:assert',
];

// Create a plugin to handle lightningcss import
const handleLightningCSSPlugin = {
  name: 'handle-lightningcss',
  setup(build) {
    // When lightningcss is imported, return an empty module
    build.onResolve({ filter: /^lightningcss$/ }, args => {
      return { path: args.path, namespace: 'lightningcss-stub' };
    });
    
    build.onLoad({ filter: /.*/, namespace: 'lightningcss-stub' }, () => {
      return {
        contents: 'export default {}',
        loader: 'js',
      };
    });
  },
};

// Create a plugin to ensure postgres is properly handled
const handlePostgresPlugin = {
  name: 'handle-postgres',
  setup(build) {
    // Log when postgres is imported to help with debugging
    build.onResolve({ filter: /^postgres$/ }, args => {
      console.log(`[esbuild] Marking 'postgres' as external from ${args.importer}`);
      return { path: args.path, external: true };
    });
  },
};

// Create a plugin to handle dotenv and prevent dynamic requires
const handleDotenvPlugin = {
  name: 'handle-dotenv',
  setup(build) {
    // When dotenv is imported, return a simple implementation
    build.onResolve({ filter: /^dotenv$/ }, args => {
      return { path: args.path, namespace: 'dotenv-stub' };
    });
    
    build.onLoad({ filter: /.*/, namespace: 'dotenv-stub' }, () => {
      return {
        contents: `
          // Simple dotenv implementation without dynamic requires
          export function config(options = {}) {
            console.log('Using simplified dotenv implementation');
            try {
              const fs = await import('fs');
              const path = await import('path');
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
        `,
        loader: 'js',
      };
    });
  },
};

// Build configuration
const buildOptions = {
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  outExtension: { '.js': '.mjs' },
  external: externalModules,
  minify: false,
  sourcemap: true,
  target: ['node18'],
  logLevel: 'info',
  plugins: [handleLightningCSSPlugin, handlePostgresPlugin, handleDotenvPlugin],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
};

try {
  // Run the build
  await esbuild.build(buildOptions);
  console.log('Server build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 