import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';

/**
 * Steam OpenID Authentication Initiation
 * 
 * This endpoint initiates the Steam OpenID authentication flow.
 * It redirects the user to the Steam login page with the necessary OpenID parameters.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if the user is authenticated
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Generate a unique state parameter to prevent CSRF attacks
    const state = uuidv4();
    
    // Store the state in the session
    req.session.steamState = state;
    await req.session.save();
    
    // Determine the return URL based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const host = isProduction ? 'https://slayz.cc' : 'http://localhost:3000';
    const returnUrl = `${host}/api/auth/steam/callback`;
    
    // Construct the Steam OpenID URL
    const realm = host;
    const steamOpenIdUrl = new URL('https://steamcommunity.com/openid/login');
    
    // Set OpenID parameters
    steamOpenIdUrl.searchParams.set('openid.ns', 'http://specs.openid.net/auth/2.0');
    steamOpenIdUrl.searchParams.set('openid.mode', 'checkid_setup');
    steamOpenIdUrl.searchParams.set('openid.return_to', returnUrl);
    steamOpenIdUrl.searchParams.set('openid.realm', realm);
    steamOpenIdUrl.searchParams.set('openid.identity', 'http://specs.openid.net/auth/2.0/identifier_select');
    steamOpenIdUrl.searchParams.set('openid.claimed_id', 'http://specs.openid.net/auth/2.0/identifier_select');
    
    // Add the state parameter to prevent CSRF attacks
    steamOpenIdUrl.searchParams.set('state', state);
    
    // Redirect to Steam OpenID login
    return res.redirect(steamOpenIdUrl.toString());
  } catch (error) {
    console.error('Error initiating Steam authentication:', error);
    return res.status(500).json({ error: 'Failed to initiate Steam authentication' });
  }
} 