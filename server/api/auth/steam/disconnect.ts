import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { storage } from '../../../../server/pg-storage';

/**
 * Steam Account Disconnection
 * 
 * This endpoint handles disconnecting a user's Steam account.
 * It removes all Steam-related data from the user's profile.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if the user is authenticated
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Update user record to remove Steam data
    await storage.updateUser(session.user.id, {
      steamId: null,
      steamUsername: null,
      steamAvatar: null,
      steamProfileUrl: null,
      steamGamesCount: null
    });
    
    return res.status(200).json({ success: true, message: 'Steam account disconnected' });
  } catch (error) {
    console.error('Error disconnecting Steam account:', error);
    return res.status(500).json({ error: 'Failed to disconnect Steam account' });
  }
} 