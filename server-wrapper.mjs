#!/usr/bin/env node

// This wrapper ensures all dependencies are properly loaded
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';
import path from 'path';

// Create a mock for lightningcss if it's not available
if (!globalThis.lightningcss) {
  globalThis.lightningcss = {};
  console.log('Created mock for lightningcss');
}

// Check if postgres module exists
const postgresPath = path.join(process.cwd(), 'node_modules/postgres');
if (!fs.existsSync(postgresPath)) {
  console.error('CRITICAL ERROR: postgres module directory not found!');
  console.log('Attempting emergency installation of postgres...');
  try {
    const { execSync } = require('child_process');
    execSync('npm install --no-save postgres@3.4.7', { stdio: 'inherit' });
    console.log('Emergency postgres installation completed');
  } catch (err) {
    console.error('Failed emergency postgres installation:', err);
    process.exit(1);
  }
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
  
  // Load the actual server
  console.log('Starting server...');
  const server = await import('./dist/index.mjs');
} catch (error) {
  console.error('Error in server wrapper:', error);
  process.exit(1);
} 