/**
 * User Data API
 * 
 * This endpoint returns the current user's data, including any connected accounts
 * like Discord.
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real application, you would get the user ID from the session/JWT
    // and fetch the user data from your database
    const userId = req.session?.user?.id || 'demo_user_id';
    
    console.log('Fetching user data for:', userId);
    
    // For demonstration purposes, we'll return mock data
    // In a real app, you'd query your database
    const mockUserData = global.mockUserDatabase?.[userId] || {
      id: userId,
      username: 'demo_user',
      email: 'demo@example.com',
      avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
      createdAt: new Date('2023-01-01').toISOString(),
    };
    
    console.log('Mock user data:', mockUserData);
    
    // Return the user data
    return res.status(200).json(mockUserData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user data', 
      message: error.message 
    });
  }
} 