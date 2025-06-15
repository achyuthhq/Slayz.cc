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