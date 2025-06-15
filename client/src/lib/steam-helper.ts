/**
 * Steam Helper Functions
 * 
 * This file contains helper functions for working with Steam data and authentication.
 */

import type { User, SteamUser } from '@/types/user';
import { hasSteamConnected } from '@/types/user';

/**
 * Steam user data interface
 */
export interface SteamData {
  steamId?: string | null;
  steamUsername?: string | null;
  steamAvatar?: string | null;
  steamProfileUrl?: string | null;
  steamGamesCount?: number | null;
  _timestamp?: number | null;
}

/**
 * Convert a User object to a SteamData object
 */
export function toSteamUser(user: User | null | undefined): SteamData {
  if (!user) {
    return {
      steamId: null,
      steamUsername: null,
      steamAvatar: null,
      steamProfileUrl: null,
      steamGamesCount: null,
      _timestamp: null,
    };
  }

  return {
    steamId: user.steamId || null,
    steamUsername: user.steamUsername || null,
    steamAvatar: user.steamAvatar || null,
    steamProfileUrl: user.steamProfileUrl || null,
    steamGamesCount: user.steamGamesCount || null,
    _timestamp: user._steamTimestamp || Date.now(),
  };
}

/**
 * Get the Steam avatar URL from a Steam user object
 */
export function getSteamAvatarUrl(steamUser: SteamUser | null | undefined): string {
  if (!steamUser || !steamUser.avatarfull) {
    // Return a default avatar if no Steam avatar is available
    return 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg';
  }
  
  return steamUser.avatarfull;
}

/**
 * Get the Steam profile URL from a Steam ID
 */
export function getSteamProfileUrl(steamId: string | null | undefined): string {
  if (!steamId) return '';
  return `https://steamcommunity.com/profiles/${steamId}`;
}

/**
 * Format the Steam username for display
 */
export function formatSteamUsername(username: string | null | undefined): string {
  if (!username) return 'Steam User';
  return username;
}

/**
 * Refresh the Steam timestamp in localStorage to track when data was last fetched
 */
export function refreshSteamTimestamp(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('steam_timestamp', Date.now().toString());
  }
}

/**
 * Clear Steam data from localStorage
 */
export function clearSteamData(): void {
  localStorage.removeItem('steamUser');
  localStorage.removeItem('steamTimestamp');
}

/**
 * Log stored Steam data for debugging
 */
export function logStoredSteamData(): void {
  if (typeof localStorage !== 'undefined') {
    console.log('[Steam] Timestamp:', localStorage.getItem('steam_timestamp'));
  }
}

/**
 * Verify Steam data consistency
 */
export function verifySteamDataConsistency(): boolean {
  if (typeof localStorage === 'undefined') return false;
  
  const timestamp = localStorage.getItem('steam_timestamp');
  
  if (!timestamp) {
    console.warn('[Steam] No timestamp found in localStorage');
    return false;
  }
  
  return true;
}

/**
 * Stores Steam data in localStorage
 * @param steamUser The Steam user data to store
 */
export function storeSteamData(steamUser: SteamUser): void {
  localStorage.setItem('steamUser', JSON.stringify(steamUser));
  localStorage.setItem('steamTimestamp', Date.now().toString());
}

/**
 * Gets Steam data from localStorage
 * @returns The stored Steam user data or null if not found
 */
export function getStoredSteamData(): { steamUser: SteamUser | null, timestamp: number | null } {
  const steamUserJson = localStorage.getItem('steamUser');
  const timestamp = localStorage.getItem('steamTimestamp');
  
  let steamUser: SteamUser | null = null;
  let timestampNum: number | null = null;
  
  try {
    if (steamUserJson) {
      steamUser = JSON.parse(steamUserJson);
    }
    
    if (timestamp) {
      timestampNum = parseInt(timestamp, 10);
    }
  } catch (error) {
    console.error('Error parsing stored Steam data:', error);
    clearSteamData();
  }
  
  return { steamUser, timestamp: timestampNum };
}

/**
 * Checks if the stored Steam data is still valid (not older than maxAge)
 * @param maxAge Maximum age of the data in milliseconds (default: 1 hour)
 * @returns True if the data is valid, false otherwise
 */
export function isSteamDataValid(maxAge: number = 60 * 60 * 1000): boolean {
  const { timestamp } = getStoredSteamData();
  
  if (!timestamp) {
    return false;
  }
  
  const now = Date.now();
  return now - timestamp <= maxAge;
}

/**
 * Creates a delay promise for use in retry mechanisms
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts Steam ID from a Steam profile URL
 * @param url The Steam profile URL
 * @returns The Steam ID or null if not found
 */
export function extractSteamId(url: string): string | null {
  try {
    if (!url) return null;
    
    // Clean the URL first - remove trailing slashes and query parameters
    let cleanUrl = url.trim().replace(/\/+$/, '').split('?')[0];
    
    // Remove http:// or https:// if present
    cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
    
    console.log('[Steam] Extracting ID from URL:', cleanUrl);
    
    // Format: steamcommunity.com/id/username/
    if (cleanUrl.includes('/id/')) {
      // Extract the username from the URL
      const username = cleanUrl.split('/id/')[1].split('/')[0];
      
      if (!username) {
        console.error('[Steam] Failed to extract username from URL:', cleanUrl);
        return null;
      }
      
      console.log('[Steam] Extracted username from URL:', username);
      
      // In a real implementation, we would need to make an API call to convert username to steamID64
      // Since we're handling this on the backend, we'll just return the username
      // The backend will use the Steam API to convert it to a steamID64
      return `id/${username}`;
    }
    
    // Format: steamcommunity.com/profiles/76561198012345678/
    if (cleanUrl.includes('/profiles/')) {
      const steamId = cleanUrl.split('/profiles/')[1].split('/')[0];
      
      if (!steamId || !/^[0-9]+$/.test(steamId)) {
        console.error('[Steam] Invalid Steam ID format in URL:', cleanUrl);
        return null;
      }
      
      console.log('[Steam] Extracted numeric Steam ID from URL:', steamId);
      return steamId;
    }
    
    // If it's just the Steam ID (17-digit number)
    if (/^[0-9]{17}$/.test(cleanUrl)) {
      console.log('[Steam] Using direct Steam ID:', cleanUrl);
      return cleanUrl;
    }
    
    // Check if the user entered just the username without the full URL
    if (/^[a-zA-Z0-9_-]+$/.test(cleanUrl) && !cleanUrl.includes('/')) {
      console.log('[Steam] Detected username without URL, adding id/ prefix:', cleanUrl);
      return `id/${cleanUrl}`;
    }
    
    // Check if user entered a full URL without the /id/ or /profiles/ part
    if (cleanUrl.startsWith('steamcommunity.com/')) {
      const potentialUsername = cleanUrl.replace('steamcommunity.com/', '');
      if (/^[a-zA-Z0-9_-]+$/.test(potentialUsername)) {
        console.log('[Steam] Detected potential username from URL, adding id/ prefix:', potentialUsername);
        return `id/${potentialUsername}`;
      }
    }
    
    // Additional check for just the domain name with a potential username
    const parts = cleanUrl.split('/');
    if (parts.length === 2 && parts[0].includes('steamcommunity.com') && parts[1] && /^[a-zA-Z0-9_-]+$/.test(parts[1])) {
      console.log('[Steam] Detected username after domain, adding id/ prefix:', parts[1]);
      return `id/${parts[1]}`;
    }
    
    console.error('[Steam] Could not extract Steam ID from URL:', cleanUrl);
    return null;
  } catch (error) {
    console.error('[Steam] Error extracting Steam ID from URL:', error);
    return null;
  }
} 