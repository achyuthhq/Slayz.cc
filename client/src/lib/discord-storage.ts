/**
 * Discord Storage Module
 * 
 * Handles the persistence of Discord user data in localStorage
 * and provides utilities for retrieving and clearing this data.
 */

import { DiscordData } from "@/types/discord";

const DISCORD_DATA_KEY = 'discordData';

/**
 * Saves Discord user data to localStorage with a timestamp
 */
export const saveDiscordData = (data: DiscordData): void => {
  try {
    // Add a timestamp to track when the data was saved
    const dataWithTimestamp = {
      ...data,
      _timestamp: Date.now() // Add timestamp to track when the data was saved
    };
    
    // Serialize and store the data
    localStorage.setItem(DISCORD_DATA_KEY, JSON.stringify(dataWithTimestamp));
    console.log('Discord data saved to localStorage:', dataWithTimestamp);
  } catch (error) {
    console.error('Error saving Discord data to localStorage:', error);
  }
};

/**
 * Retrieves Discord user data from localStorage
 */
export const getDiscordData = (): DiscordData | null => {
  try {
    const storedData = localStorage.getItem(DISCORD_DATA_KEY);
    if (!storedData) {
      return null;
    }
    
    // Parse and return the data
    return JSON.parse(storedData) as DiscordData;
  } catch (error) {
    console.error('Error retrieving Discord data from localStorage:', error);
    return null;
  }
};

/**
 * Clears Discord user data from localStorage
 */
export const clearDiscordData = (): void => {
  try {
    localStorage.removeItem(DISCORD_DATA_KEY);
    console.log('Discord data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing Discord data from localStorage:', error);
  }
};

/**
 * Updates specific fields in the Discord data without overwriting the entire object
 */
export const updateDiscordData = (updates: Partial<DiscordData>): DiscordData | null => {
  try {
    // Get the current data
    const currentData = getDiscordData();
    if (!currentData) {
      console.warn('No Discord data found to update');
      return null;
    }
    
    // Merge the updates with the current data
    const updatedData = {
      ...currentData,
      ...updates,
      _timestamp: Date.now() // Update the timestamp
    };
    
    // Save the updated data
    saveDiscordData(updatedData);
    console.log('Discord data updated in localStorage:', updatedData);
    
    return updatedData;
  } catch (error) {
    console.error('Error updating Discord data in localStorage:', error);
    return null;
  }
};

// Export the module
export default {
  saveDiscordData,
  getDiscordData,
  clearDiscordData,
  updateDiscordData
}; 