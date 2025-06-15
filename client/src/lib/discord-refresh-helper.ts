/**
 * Discord Refresh Helpers
 * 
 * Utility functions to ensure Discord data is consistently retrieved and displayed
 * throughout the application. These helpers manage the flow of data between
 * localStorage and the application state.
 */

import { getDiscordData, updateDiscordData } from './discord-storage';
import type { DiscordData } from '@/types/discord';

/**
 * Validates if the Discord data is still fresh
 * Returns true if the data is less than 24 hours old
 */
export const isDiscordDataFresh = (): boolean => {
  const data = getDiscordData();
  if (!data || !data._timestamp) return false;
  
  const now = Date.now();
  const dataAge = now - data._timestamp;
  const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return dataAge < oneDayMs;
};

/**
 * Formats a Discord username according to the modern Discord format
 * If discriminator is '0' or missing, returns @username
 * Otherwise returns username#discriminator
 */
export const formatDiscordUsername = (username: string, discriminator?: string): string => {
  if (!discriminator || discriminator === '0') {
    return `@${username}`;
  }
  return `${username}#${discriminator}`;
};

/**
 * Gets the appropriate display name from Discord data
 * Prioritizes global_name, then username
 */
export const getDiscordDisplayName = (data: Partial<DiscordData>): string => {
  return data.discordGlobalName || data.discordUsername || 'Discord User';
};

/**
 * Constructs the proper Discord avatar URL from user data
 * Handles both full URLs and avatar hashes
 */
export const getDiscordAvatarUrl = (userId: string, avatarHash: string | null | undefined): string => {
  if (!avatarHash) {
    return '';
  }
  
  // Check if it's already a full URL
  if (avatarHash.startsWith('http')) {
    return avatarHash;
  }
  
  // Determine the extension (.gif for animated avatars, .png for regular)
  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
  
  // Return the full CDN URL with size parameter for higher quality
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=1024`;
};

/**
 * Updates the timestamp on Discord data to keep it fresh
 * Returns the updated data
 */
export const refreshDiscordTimestamp = (): DiscordData | null => {
  const data = getDiscordData();
  if (!data) return null;
  
  // Update only the timestamp
  return updateDiscordData({ _timestamp: Date.now() });
};

/**
 * Gets a clean version of Discord data for displaying in UI
 * Ensures all required fields have sensible defaults
 */
export const getCleanDiscordData = (): DiscordData => {
  const data = getDiscordData();
  
  // If no data exists, return a default object
  if (!data) {
    return {
      discordId: '',
      discordUsername: 'User',
      discordDisplayName: 'Discord User',
      discordStatus: 'offline'
    };
  }
  
  // Ensure the timestamp is refreshed
  refreshDiscordTimestamp();
  
  // Return the data with sensible defaults for any missing fields
  return {
    ...data,
    discordId: data.discordId || '',
    discordUsername: data.discordUsername || 'User',
    discordDisplayName: data.discordDisplayName || getDiscordDisplayName(data),
    discordStatus: data.discordStatus || 'offline'
  };
};

// Export the module
export default {
  isDiscordDataFresh,
  formatDiscordUsername,
  getDiscordDisplayName,
  getDiscordAvatarUrl,
  refreshDiscordTimestamp,
  getCleanDiscordData
}; 