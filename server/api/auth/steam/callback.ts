import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { storage } from '../../../../server/pg-storage';

/**
 * Steam OpenID Authentication Callback
 * 
 * This endpoint handles the callback from Steam OpenID authentication.
 * It validates the response, extracts the Steam ID, and fetches user data from the Steam API.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if the user is authenticated
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.redirect('/settings?error=steam_auth_failed');
    }

    // Check if the OpenID response is valid
    if (!req.query['openid.ns'] || req.query['openid.ns'] !== 'http://specs.openid.net/auth/2.0') {
      return res.redirect('/settings?error=invalid_openid_response');
    }

    // Validate the OpenID response by sending a verification request to Steam
    const params = new URLSearchParams();
    
    // Copy all openid parameters from the request
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('openid.')) {
        params.append(key, req.query[key] as string);
      }
    });
    
    // Change mode to check_authentication for verification
    params.set('openid.mode', 'check_authentication');
    
    // Send verification request to Steam
    const verificationResponse = await axios.post(
      'https://steamcommunity.com/openid/login',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    // Check if the verification was successful
    if (!verificationResponse.data.includes('is_valid:true')) {
      return res.redirect('/settings?error=steam_verification_failed');
    }
    
    // Extract the Steam ID from the response
    const claimedIdParam = req.query['openid.claimed_id'] as string;
    const steamId = claimedIdParam.split('/').pop();
    
    if (!steamId) {
      return res.redirect('/settings?error=invalid_steam_id');
    }
    
    // Fetch user data from Steam API
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      return res.redirect('/settings?error=steam_api_key_missing');
    }
    
    const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
    const steamUserResponse = await axios.get(steamApiUrl);
    
    const userData = steamUserResponse.data.response.players[0];
    if (!userData) {
      return res.redirect('/settings?error=steam_user_not_found');
    }
    
    // Fetch games count from Steam API
    const gamesApiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=false&include_played_free_games=true`;
    const steamGamesResponse = await axios.get(gamesApiUrl);
    
    let gamesCount = 0;
    if (steamGamesResponse.data.response && steamGamesResponse.data.response.game_count !== undefined) {
      gamesCount = steamGamesResponse.data.response.game_count;
    }
    
    // Update user record with Steam data
    await storage.updateUser(session.user.id, {
      steamId: steamId,
      steamUsername: userData.personaname,
      steamAvatar: userData.avatarfull,
      steamProfileUrl: userData.profileurl,
      steamGamesCount: gamesCount
    });
    
    // Redirect to settings page with success message
    return res.redirect('/settings?success=Steam account connected successfully');
  } catch (error) {
    console.error('Error handling Steam callback:', error);
    return res.redirect('/settings?error=steam_connection_failed');
  }
} 