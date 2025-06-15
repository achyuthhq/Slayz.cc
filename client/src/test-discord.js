/**
 * Test Discord Integration
 * 
 * This script helps verify that the Discord integration is working correctly.
 * To use it:
 * 1. Open your browser console on the settings page
 * 2. Copy and paste this entire script
 * 3. Press Enter to run it
 */

// Import the query client from the React app
import { queryClient } from './lib/queryClient';

// Function to simulate connecting a Discord account
function simulateDiscordConnect() {
  // Get the current user data from cache
  const currentUser = queryClient.getQueryData(['/api/user']);
  
  // Create a base user if none exists
  const baseUser = currentUser || {
    id: 'demo_user_id',
    username: 'demo_user',
    email: 'demo@example.com',
  };
  
  // Generate a Discord ID
  const discordId = 'discord_' + Math.random().toString(36).substring(2, 10);
  
  // Create updated user with Discord data
  const updatedUser = {
    ...baseUser,
    // Required fields for hasDiscordConnected
    discordId: discordId,
    discordUsername: 'discord_user',
    discordDiscriminator: '0000',
    
    // Additional fields for display
    discordGlobalName: 'Discord User',
    discordDisplayName: 'Discord User',
    discordAvatar: null,
    discordStatus: 'online',
    discordActivity: {
      name: 'Visual Studio Code',
      type: 0,
      details: 'Editing JavaScript',
      state: 'Working on Discord integration'
    },
    lastOnline: new Date().toISOString()
  };
  
  console.log('Setting user data with Discord fields:', updatedUser);
  
  // Update the cache
  queryClient.setQueryData(['/api/user'], updatedUser);
  
  // Invalidate queries to refresh the UI
  queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  
  console.log('Discord connection simulated successfully');
  
  // Return the updated user for reference
  return updatedUser;
}

// Function to simulate disconnecting a Discord account
function simulateDiscordDisconnect() {
  // Get the current user data from cache
  const currentUser = queryClient.getQueryData(['/api/user']);
  
  if (!currentUser) {
    console.error('No user data found in cache');
    return null;
  }
  
  // Create updated user without Discord data
  const updatedUser = {
    ...currentUser,
    // Remove all Discord fields
    discordId: undefined,
    discordUsername: undefined,
    discordDiscriminator: undefined,
    discordDisplayName: undefined,
    discordGlobalName: undefined,
    discordAvatar: undefined,
    discordStatus: undefined,
    discordActivity: undefined,
    lastOnline: undefined
  };
  
  console.log('Setting user data without Discord fields:', updatedUser);
  
  // Update the cache
  queryClient.setQueryData(['/api/user'], updatedUser);
  
  // Invalidate queries to refresh the UI
  queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  
  console.log('Discord disconnection simulated successfully');
  
  // Return the updated user for reference
  return updatedUser;
}

// Export the functions so they can be called from the console
window.simulateDiscordConnect = simulateDiscordConnect;
window.simulateDiscordDisconnect = simulateDiscordDisconnect;

console.log('Discord test utilities loaded. You can now use:');
console.log('- window.simulateDiscordConnect() to simulate connecting Discord');
console.log('- window.simulateDiscordDisconnect() to simulate disconnecting Discord'); 