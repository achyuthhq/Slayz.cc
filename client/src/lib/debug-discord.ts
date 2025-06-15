/**
 * Discord Debugging Utilities
 * 
 * A collection of helper functions for debugging Discord integration.
 * These functions provide insights into the Discord data and help diagnose issues.
 */

import { getDiscordData } from './discord-storage';
import { getCleanDiscordData, formatDiscordUsername, getDiscordAvatarUrl } from './discord-refresh-helper';
import type { DiscordData } from '@/types/discord';

/**
 * Log stored Discord data to the console for debugging
 * @returns The Discord data if found, null otherwise
 */
export const logStoredDiscordData = (): DiscordData | null => {
  try {
    const data = getDiscordData();
    
    if (!data) {
      console.log('%c🔍 Discord Debug: No data found in localStorage', 'color: #ff5555; font-weight: bold');
      return null;
    }
    
    // Format date from timestamp
    const timestamp = data._timestamp 
      ? new Date(data._timestamp).toLocaleString() 
      : 'No timestamp';
    
    // Format the username
    const username = formatDiscordUsername(data.discordUsername, data.discordDiscriminator);
    
    // Check if we have an avatar and get its URL
    const avatarUrl = data.discordAvatar && data.discordId 
      ? getDiscordAvatarUrl(data.discordId, data.discordAvatar) 
      : 'No avatar';
    
    console.group('%c🔍 Discord Debug: Stored Data', 'color: #7289DA; font-weight: bold');
    console.log('User ID:', data.discordId);
    console.log('Username:', username);
    console.log('Display Name:', data.discordDisplayName || 'Not set');
    console.log('Global Name:', data.discordGlobalName || 'Not set');
    console.log('Avatar Hash:', data.discordAvatar || 'None');
    console.log('Avatar URL:', avatarUrl);
    console.log('Status:', data.discordStatus || 'Not set');
    console.log('Last Updated:', timestamp);
    console.groupEnd();
    
    return data;
  } catch (error) {
    console.error('Error logging Discord data:', error);
    return null;
  }
};

/**
 * Initialize Discord debugging on page load (development only)
 */
export const initDiscordDebug = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  try {
    // Add global debug method for console access
    if (typeof window !== 'undefined') {
      (window as any).debugDiscord = {
        getStoredData: getDiscordData,
        getCleanData: getCleanDiscordData,
        logData: logStoredDiscordData,
      };
      
      console.log(
        '%c🔧 Discord Debug Tools initialized! Use window.debugDiscord in console to access tools.',
        'color: #7289DA; font-weight: bold; background-color: #2C2F33; padding: 4px; border-radius: 4px;'
      );
    }
  } catch (error) {
    console.error('Error initializing Discord debug:', error);
  }
};

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  // Wait for window to be defined
  if (typeof window !== 'undefined') {
    // Initialize on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDiscordDebug);
    } else {
      initDiscordDebug();
    }
  }
}

export default {
  logStoredDiscordData,
  initDiscordDebug,
}; 