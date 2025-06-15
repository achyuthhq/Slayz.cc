/**
 * Discord Disconnect API
 * 
 * This endpoint handles disconnecting a user's Discord account from their profile.
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user ID from the session or JWT
    // This depends on your authentication system
    const userId = req.session?.user?.id;
    
    // If no authenticated user, return unauthorized
    if (!userId) {
      console.error('No authenticated user found when disconnecting Discord');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Disconnecting Discord for user:', userId);
    
    // Update the user in your database to remove Discord data
    // Example with a mock database call:
    /*
    await db.user.update({
      where: { id: userId },
      data: {
        discordId: null,
        discordUsername: null,
        discordDiscriminator: null,
        discordGlobalName: null,
        discordAvatar: null,
        discordPremiumType: null,
        discordEmail: null,
        discordVerified: null,
        discordStatus: null,
        discordActivity: null,
      }
    });
    */
    
    // For now, we'll just update the mock database
    global.mockUserDatabase = global.mockUserDatabase || {};
    if (global.mockUserDatabase[userId]) {
      delete global.mockUserDatabase[userId].discordId;
      delete global.mockUserDatabase[userId].discordUsername;
      delete global.mockUserDatabase[userId].discordDiscriminator;
      delete global.mockUserDatabase[userId].discordGlobalName;
      delete global.mockUserDatabase[userId].discordAvatar;
      delete global.mockUserDatabase[userId].discordPremiumType;
      delete global.mockUserDatabase[userId].discordEmail;
      delete global.mockUserDatabase[userId].discordVerified;
      delete global.mockUserDatabase[userId].discordStatus;
      delete global.mockUserDatabase[userId].discordActivity;
    }

    // Response
    return res.status(200).json({ 
      success: true, 
      message: 'Discord account disconnected successfully' 
    });
  } catch (error) {
    console.error('Error disconnecting Discord account:', error);
    return res.status(500).json({ 
      error: 'Failed to disconnect Discord account', 
      message: error.message 
    });
  }
} 