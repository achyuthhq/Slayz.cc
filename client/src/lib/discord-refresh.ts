/**
 * Discord Data Refresh Utility
 * 
 * This file provides utilities to force a refresh of Discord data
 * when there might be issues with displaying the correct user information.
 */

import { queryClient } from "./queryClient";
import { logStoredDiscordData } from "./debug-discord";

/**
 * Forces a refresh of the Discord user data from localStorage into the query cache
 */
export const refreshDiscordData = () => {
  try {
    // Get the stored Discord data
    const storedData = localStorage.getItem('discordData');
    if (!storedData) {
      console.warn('No Discord data found in localStorage to refresh');
      return false;
    }
    
    // Parse the Discord data
    const discordData = JSON.parse(storedData);
    console.log('Refreshing Discord data from localStorage:', discordData);
    
    // Get the current user data from the query cache
    const currentUser = queryClient.getQueryData(['/api/user']);
    if (!currentUser) {
      console.warn('No user data found in query cache to update');
      return false;
    }
    
    // Update the user data with the Discord information
    const updatedUser = {
      ...currentUser,
      ...discordData,
      hasDiscordConnected: true
    };
    
    // Set the updated user data back in the query cache
    queryClient.setQueryData(['/api/user'], updatedUser);
    console.log('Successfully refreshed Discord data in query cache');
    
    // Return success
    return true;
  } catch (error) {
    console.error('Error refreshing Discord data:', error);
    return false;
  }
};

/**
 * Checks if the Discord data in localStorage matches what's in the query cache
 * and refreshes if needed
 */
export const verifyDiscordDataConsistency = () => {
  try {
    // Get the stored Discord data
    const storedData = localStorage.getItem('discordData');
    if (!storedData) return false;
    
    // Parse the Discord data
    const discordData = JSON.parse(storedData);
    
    // Get the current user data from the query cache
    const currentUser = queryClient.getQueryData(['/api/user']);
    if (!currentUser) return false;
    
    // Check if the Discord data matches
    const hasDiscordId = !!currentUser.discordId;
    const idsMatch = currentUser.discordId === discordData.discordId;
    const usernamesMatch = currentUser.discordUsername === discordData.discordUsername;
    
    // If data doesn't match, refresh it
    if (!hasDiscordId || !idsMatch || !usernamesMatch) {
      console.warn('Discord data inconsistency detected - refreshing from localStorage');
      return refreshDiscordData();
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying Discord data consistency:', error);
    return false;
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).discordRefresh = {
    refreshDiscordData,
    verifyDiscordDataConsistency,
    logDiscordData: logStoredDiscordData
  };
}

export default {
  refreshDiscordData,
  verifyDiscordDataConsistency
}; 