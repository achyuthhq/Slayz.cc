/**
 * Discord Integration Initialization
 * 
 * This file handles initialization of Discord-related functionality
 * including environment validation, setting up global debugging tools,
 * and ensuring the application has everything it needs for the integration.
 */

import { logEnvironmentValidation } from './env-validator';
import { getDiscordAvatarUrl, formatDiscordUsername, getDiscordDisplayName } from './discord-refresh-helper';
import { getDiscordData, saveDiscordData, clearDiscordData } from './discord-storage';
import { refreshDiscordData, verifyDiscordDataConsistency } from './discord-refresh';
import { logStoredDiscordData } from './debug-discord';
import { runDiscordDiagnostics } from './discord-status-checker';
import { getDefaultDiscordOAuthUrl, type DiscordScope } from './discord-oauth-helper';

// Log message to indicate initialization - wrap in try/catch to prevent crashes
try {
  console.log('[Discord Init] Initializing Discord integration...');
} catch (e) {
  // Silent catch to prevent crashes
}

// Run environment variable validation - but safely
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  try {
    // Delay to ensure it doesn't block initial rendering
    setTimeout(() => {
      try {
        logEnvironmentValidation();
      } catch (error) {
        console.warn('[Discord Init] Error validating environment:', error);
      }
    }, 2000);
  } catch (e) {
    // Silent catch to prevent crashes
  }
}

// For troubleshooting, expose Discord utilities on the window object in development mode
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  try {
    // Create namespace for Discord utilities
    (window as any).Discord = {
      // Data operations
      getData: () => {
        try {
          return getDiscordData();
        } catch (e) {
          console.warn('[Discord] Error getting data:', e);
          return null;
        }
      },
      saveData: (data: any) => {
        try {
          return saveDiscordData(data);
        } catch (e) {
          console.warn('[Discord] Error saving data:', e);
          return null;
        }
      },
      clearData: () => {
        try {
          return clearDiscordData();
        } catch (e) {
          console.warn('[Discord] Error clearing data:', e);
        }
      },
      refreshData: () => {
        try {
          return refreshDiscordData();
        } catch (e) {
          console.warn('[Discord] Error refreshing data:', e);
          return null;
        }
      },
      verifyDataConsistency: () => {
        try {
          return verifyDiscordDataConsistency();
        } catch (e) {
          console.warn('[Discord] Error verifying data consistency:', e);
          return null;
        }
      },
      
      // Helper functions
      getAvatarUrl: (userId: string, avatarHash: string) => {
        try {
          return getDiscordAvatarUrl(userId, avatarHash);
        } catch (e) {
          console.warn('[Discord] Error getting avatar URL:', e);
          return null;
        }
      },
      formatUsername: (user: any) => {
        try {
          return formatDiscordUsername(user);
        } catch (e) {
          console.warn('[Discord] Error formatting username:', e);
          return null;
        }
      },
      getDisplayName: (user: any) => {
        try {
          return getDiscordDisplayName(user);
        } catch (e) {
          console.warn('[Discord] Error getting display name:', e);
          return null;
        }
      },
      getOAuthUrl: (extraScopes: DiscordScope[] = []) => {
        try {
          return getDefaultDiscordOAuthUrl(extraScopes);
        } catch (e) {
          console.warn('[Discord] Error getting OAuth URL:', e);
          return null;
        }
      },
      
      // Diagnostics
      logStoredData: () => {
        try {
          return logStoredDiscordData();
        } catch (e) {
          console.warn('[Discord] Error logging stored data:', e);
        }
      },
      runDiagnostics: () => {
        try {
          return runDiscordDiagnostics();
        } catch (e) {
          console.warn('[Discord] Error running diagnostics:', e);
          return null;
        }
      },
      
      // Quick access to current data
      get currentData() {
        try {
          return getDiscordData();
        } catch (e) {
          console.warn('[Discord] Error getting current data:', e);
          return null;
        }
      }
    };
    
    console.log('[Discord Init] Debug utilities available at window.Discord');
  } catch (e) {
    console.warn('[Discord Init] Error setting up debug utilities:', e);
  }
}

// Create a version tag to track which version of the Discord integration is running
export const DISCORD_INTEGRATION_VERSION = '1.1.0';

// Export the version for reference
export default {
  version: DISCORD_INTEGRATION_VERSION,
  init: () => {
    try {
      console.log(`[Discord Init] Discord integration v${DISCORD_INTEGRATION_VERSION} initialized`);
      return true;
    } catch (e) {
      // Silent catch to prevent crashes
      return false;
    }
  }
}; 