#!/usr/bin/env node

// This wrapper ensures all dependencies are properly loaded
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Pre-load critical dependencies
try {
  console.log('Pre-loading critical dependencies...');
  
  // Try to load postgres
  try {
    const postgres = await import('postgres');
    console.log('✓ Postgres module loaded successfully');
  } catch (error) {
    console.error('Failed to load postgres module:', error);
    
    // Try to load using require as fallback
    try {
      const postgres = require('postgres');
      console.log('✓ Postgres module loaded via require fallback');
    } catch (requireError) {
      console.error('Failed to load postgres via require:', requireError);
      process.exit(1);
    }
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