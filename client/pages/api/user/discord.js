/**
 * Discord User Profile API
 * 
 * This endpoint handles storing Discord profile data for the authenticated user.
 * It should be called after OAuth authentication with Discord.
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
      console.error('No authenticated user found when storing Discord data');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the Discord data from the request body
    const { discordData } = req.body;
    
    if (!discordData || !discordData.id) {
      return res.status(400).json({ error: 'Invalid Discord data' });
    }

    console.log('Storing Discord data for user:', userId);
    
    // For demonstration purposes, we'll store this in a mock database
    // In a real application, you would update the user record in your database
    
    // Update the user in your database with the Discord data
    // Example with a mock database call:
    /*
    await db.user.update({
      where: { id: userId },
      data: {
        discordId: discordData.id,
        discordUsername: discordData.username,
        discordDiscriminator: discordData.discriminator,
        discordGlobalName: discordData.global_name,
        discordAvatar: discordData.avatar,
        discordPremiumType: discordData.premium_type,
        discordEmail: discordData.email,
        discordVerified: discordData.verified,
        // You could also store connections as JSON
        // discordConnections: JSON.stringify(discordData.connections),
      }
    });
    */
    
    // For now, we'll just store it in memory and pretend it worked
    // Remove this in a real implementation
    global.mockUserDatabase = global.mockUserDatabase || {};
    global.mockUserDatabase[userId] = {
      ...(global.mockUserDatabase[userId] || {}),
      discordId: discordData.id,
      discordUsername: discordData.username,
      discordDiscriminator: discordData.discriminator,
      discordGlobalName: discordData.global_name,
      discordAvatar: discordData.avatar,
      discordPremiumType: discordData.premium_type,
      discordEmail: discordData.email,
      discordVerified: discordData.verified,
    };

    // Response
    return res.status(200).json({ 
      success: true, 
      message: 'Discord profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating Discord profile:', error);
    return res.status(500).json({ 
      error: 'Failed to update Discord profile', 
      message: error.message 
    });
  }
} 