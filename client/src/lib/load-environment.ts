/**
 * Load Environment
 * 
 * This module should be imported at the top of your main entry file
 * to ensure environment variables are loaded before any other code runs.
 */

// Define window.__ENV__ if it doesn't exist
if (typeof window !== 'undefined' && !window.__ENV__) {
  window.__ENV__ = {
    DISCORD_CLIENT_ID: '1350091089398464574',
    DISCORD_REDIRECT_URI: 'https://slayz.cc/oauth2/authorize/callback',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development' || import.meta.env?.DEV === true
  };
  
  console.log('[Environment] Set up default environment variables');
}

// Define process if it doesn't exist
if (typeof window !== 'undefined' && typeof process === 'undefined') {
  // @ts-ignore - Shim process.env for compatibility
  window.process = {
    env: {
      NODE_ENV: window.__ENV__?.IS_DEVELOPMENT ? 'development' : 'production',
      DISCORD_CLIENT_ID: window.__ENV__?.DISCORD_CLIENT_ID,
      DISCORD_REDIRECT_URI: window.__ENV__?.DISCORD_REDIRECT_URI
    }
  };
  
  console.log('[Environment] Created process.env shim for compatibility');
}

// Declare global type for TypeScript
declare global {
  interface Window {
    __ENV__?: {
      [key: string]: any;
      DISCORD_CLIENT_ID?: string;
      DISCORD_REDIRECT_URI?: string;
      IS_DEVELOPMENT?: boolean;
    };
    process?: {
      env: {
        NODE_ENV: string;
        [key: string]: any;
      }
    };
  }
}

export default {}; 