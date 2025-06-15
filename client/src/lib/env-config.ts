/**
 * Environment Configuration
 * 
 * This file provides a consistent way to access environment variables
 * across different environments (Vite, Next.js, etc.)
 */

type EnvConfig = {
  DISCORD_CLIENT_ID: string;
  DISCORD_REDIRECT_URI: string;
  API_URL: string;
  IS_DEVELOPMENT: boolean;
};

// Default fallback values
const defaultConfig: EnvConfig = {
  DISCORD_CLIENT_ID: '1380086427139833906',
  DISCORD_REDIRECT_URI: 'http://localhost:3000/oauth2/authorize/callback',
  API_URL: 'http://localhost:3000/api',
  IS_DEVELOPMENT: false
};

// Load environment variables from Vite (import.meta.env)
function loadViteEnv(): Partial<EnvConfig> {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return {
      DISCORD_CLIENT_ID: import.meta.env.VITE_DISCORD_CLIENT_ID as string,
      DISCORD_REDIRECT_URI: import.meta.env.VITE_DISCORD_REDIRECT_URI as string,
      API_URL: import.meta.env.VITE_API_URL as string,
      IS_DEVELOPMENT: import.meta.env.DEV === true
    };
  }
  return {};
}

// Load environment variables from window.__ENV__ if available
function loadWindowEnv(): Partial<EnvConfig> {
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const env = (window as any).__ENV__;
    return {
      DISCORD_CLIENT_ID: env.DISCORD_CLIENT_ID,
      DISCORD_REDIRECT_URI: env.DISCORD_REDIRECT_URI,
      API_URL: env.API_URL,
      IS_DEVELOPMENT: env.NODE_ENV === 'development'
    };
  }
  return {};
}

// Determine if we're in a development environment
function isDevelopment(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV === true;
  }
  
  return false;
}

// Create the final config by merging defaults with available environment variables
function createConfig(): EnvConfig {
  try {
    const viteEnv = loadViteEnv();
    const windowEnv = loadWindowEnv();
    
    return {
      ...defaultConfig,
      ...viteEnv,
      ...windowEnv,
      IS_DEVELOPMENT: isDevelopment()
    };
  } catch (error) {
    console.warn('Error loading environment config:', error);
    return defaultConfig;
  }
}

// Export the environment configuration
export const env = createConfig();

// Helper function to safely get environment variables with fallbacks
export function getEnv<K extends keyof EnvConfig>(key: K, fallback?: EnvConfig[K]): EnvConfig[K] {
  const value = env[key];
  if (value === undefined || value === null || value === '') {
    return fallback !== undefined ? fallback : defaultConfig[key];
  }
  return value;
}

// Export default
export default env; 