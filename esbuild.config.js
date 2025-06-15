import * as esbuild from 'esbuild';

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
};

try {
  // Run the build
  await esbuild.build(buildOptions);
  console.log('Server build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 