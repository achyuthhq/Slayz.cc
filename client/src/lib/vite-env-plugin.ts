/**
 * Vite Environment Plugin
 * 
 * This plugin injects environment variables into the browser runtime
 * to make them accessible in the client-side code without relying on process.env
 */

import type { Plugin } from 'vite';

export default function envPlugin(): Plugin {
  const virtualModuleId = 'virtual:env-vars';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-env-inject',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // Get all VITE_ prefixed env variables
        const envVars = Object.fromEntries(
          Object.entries(process.env)
            .filter(([key]) => key.startsWith('VITE_'))
            .map(([key, value]) => [key, value])
        );
        
        // Add Discord specific vars with fallbacks
        const discordVars = {
          DISCORD_CLIENT_ID: process.env.VITE_DISCORD_CLIENT_ID || '1350091089398464574',
          DISCORD_REDIRECT_URI: process.env.VITE_DISCORD_REDIRECT_URI || 'https://slayz.cc/oauth2/authorize/callback',
          IS_DEVELOPMENT: process.env.NODE_ENV === 'development'
        };
        
        // Return a module that creates a global __ENV__ object
        return `
          // Injected environment variables
          const envVars = ${JSON.stringify({ ...envVars, ...discordVars })};
          
          // Create global __ENV__ object
          if (typeof window !== 'undefined') {
            window.__ENV__ = envVars;
          }
          
          // Export variables
          export default envVars;
        `;
      }
    },
    
    transformIndexHtml() {
      // Get environment variables for injecting into HTML
      const discordVars = {
        DISCORD_CLIENT_ID: process.env.VITE_DISCORD_CLIENT_ID || '1350091089398464574',
        DISCORD_REDIRECT_URI: process.env.VITE_DISCORD_REDIRECT_URI || 'https://slayz.cc/oauth2/authorize/callback'
      };
      
      // Create script to inject into HTML
      return [
        {
          tag: 'script',
          attrs: { type: 'text/javascript' },
          children: `window.__ENV__ = ${JSON.stringify(discordVars)};`,
          injectTo: 'head-prepend'
        }
      ];
    }
  };
} 