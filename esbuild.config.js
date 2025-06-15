import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// List of all Node.js modules that should be treated as external
const externalModules = [
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
  plugins: [handleLightningCSSPlugin],
};

try {
  // Run the build
  await esbuild.build(buildOptions);
  console.log('Server build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 