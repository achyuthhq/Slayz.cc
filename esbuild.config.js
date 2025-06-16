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
  'ws', // Add ws to external modules
  'events', // Add events to external modules
  'stream', // Add stream to external modules
  
  // Modules with top-level await issues
  '@babel/core',
  '@babel/helper-module-transforms',
  '@babel/helper-compilation-targets',
  'browserslist',
  'postcss',
  
  // Node.js built-in modules without node: prefix
  'http',
  'https',
  'fs',
  'path',
  'crypto',
  'stream',
  'util',
  'events',
  'buffer',
  'os',
  'url',
  'child_process',
  'zlib',
  'http2',
  'net',
  'tls',
  'dns',
  'querystring',
  'readline',
  'assert',
  
  // Node.js built-in modules with node: prefix
  'node:http',
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
          import fs from 'fs';
          import path from 'path';
          
          export async function config(options = {}) {
            console.log('Using simplified dotenv implementation');
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
        `,
        loader: 'js',
      };
    });
  },
};

// Create a plugin to handle dynamic requires
const handleDynamicRequiresPlugin = {
  name: 'handle-dynamic-requires',
  setup(build) {
    // Mark all node_modules as external to avoid bundling issues
    build.onResolve({ filter: /^[^./]|^\.[^./]|^\.\.[^/]/ }, args => {
      // Skip our own namespace
      if (args.namespace !== 'file') {
        return null;
      }
      
      // If it's coming from a node_modules package, mark it as external
      if (args.importer && args.importer.includes('node_modules')) {
        return { path: args.path, external: true };
      }
      
      return null;
    });
    
    // Intercept all require calls in the code
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      try {
        const source = await fs.promises.readFile(args.path, 'utf8');
        
        // Replace dynamic requires with static imports or mocks
        const modifiedSource = source
          // Replace require('events') with a direct import
          .replace(/require\(['"]events['"]\)/g, "await import('events')")
          .replace(/require\(['"]stream['"]\)/g, "await import('stream')")
          .replace(/require\(['"]http['"]\)/g, "await import('http')")
          .replace(/require\(['"]https['"]\)/g, "await import('https')")
          .replace(/require\(['"]net['"]\)/g, "await import('net')")
          .replace(/require\(['"]tls['"]\)/g, "await import('tls')")
          .replace(/require\(['"]crypto['"]\)/g, "await import('crypto')")
          .replace(/require\(['"]zlib['"]\)/g, "await import('zlib')")
          .replace(/require\(['"]buffer['"]\)/g, "await import('buffer')")
          .replace(/require\(['"]util['"]\)/g, "await import('util')")
          .replace(/require\(['"]path['"]\)/g, "await import('path')")
          .replace(/require\(['"]fs['"]\)/g, "await import('fs')");
          
        // Only return modified content if we actually made changes
        if (source !== modifiedSource) {
          return {
            contents: modifiedSource,
            loader: 'js',
          };
        }
        
        // Otherwise, let esbuild handle it normally
        return null;
      } catch (error) {
        return null;
      }
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
  plugins: [
    handleLightningCSSPlugin, 
    handlePostgresPlugin, 
    handleDotenvPlugin,
    handleDynamicRequiresPlugin
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  // Add this to avoid bundling node_modules
  preserveSymlinks: true,
  mainFields: ['module', 'main'],
};

try {
  // Run the build
  await esbuild.build(buildOptions);
  console.log('Server build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 