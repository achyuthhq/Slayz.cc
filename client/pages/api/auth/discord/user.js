/**
 * Discord User API Endpoint
 * 
 * This endpoint retrieves user data from Discord using an access token.
 * It acts as a server-side proxy to protect the access token from client exposure.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    console.log('[Discord User API] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      console.log('[Discord User API] Missing access token');
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    // Basic validation of token format
    if (token.length < 20) {
      console.error('[Discord User API] Token appears invalid (too short)');
      return res.status(400).json({ 
        error: 'Invalid access token format',
        message: 'The provided token appears to be invalid (too short)'
      });
    }

    console.log('[Discord User API] Retrieving user data with token length:', token.length);

    // Fetch user data from Discord API
    console.log('[Discord User API] Sending request to Discord user endpoint...');
    let userResponse;
    try {
      userResponse = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'DiscordBot (https://yoursite.com, 1.0)'
        },
      });
      
      console.log('[Discord User API] User response status:', userResponse.status);
      console.log('[Discord User API] User response headers:', JSON.stringify(Object.fromEntries([...userResponse.headers.entries()]), null, 2));
    } catch (fetchError) {
      console.error('[Discord User API] Network error when fetching user data:', fetchError);
      return res.status(500).json({
        error: 'Network error when contacting Discord API',
        message: fetchError.message
      });
    }

    // Get the response as text first
    let responseText;
    try {
      responseText = await userResponse.text();
      console.log('[Discord User API] Response content length:', responseText.length);
      
      // Log the first part of the response for debugging
      if (responseText.length > 0) {
        console.log('[Discord User API] Response preview:', responseText.substring(0, Math.min(200, responseText.length)));
      } else {
        console.log('[Discord User API] Empty response received');
      }
      
      // Check for HTML response
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('[Discord User API] Received HTML response instead of JSON');
        return res.status(502).json({
          error: 'Discord API returned HTML instead of JSON',
          preview: responseText.substring(0, 200) + '...',
          suggestion: 'This may indicate a network issue or Discord service problem'
        });
      }
    } catch (textError) {
      console.error('[Discord User API] Error reading response text:', textError);
      return res.status(500).json({
        error: 'Error reading Discord API response',
        message: textError.message
      });
    }

    if (!userResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('[Discord User API] Error parsing JSON error response:', e);
        errorData = { 
          raw_error: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
          parse_error: 'Response was not valid JSON'
        };
      }
      
      console.error('[Discord User API] Discord user data error:', errorData);
      
      // Handle common error cases
      if (userResponse.status === 401) {
        console.error('[Discord User API] Authorization failed, token may be expired or invalid');
        return res.status(401).json({
          error: 'Discord authorization failed',
          message: 'Your Discord access token is invalid or has expired. Please reconnect your account.',
          details: errorData
        });
      }
      
      return res.status(userResponse.status).json({
        error: 'Failed to retrieve Discord user data',
        details: errorData,
        status: userResponse.status,
        statusText: userResponse.statusText
      });
    }

    // Parse the JSON response
    let userData;
    try {
      userData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Discord User API] Error parsing JSON response:', parseError);
      console.error('[Discord User API] Invalid JSON response preview:', responseText.substring(0, 200));
      return res.status(500).json({
        error: 'Invalid JSON response from Discord API',
        message: 'Could not parse Discord API response as JSON',
        preview: responseText.substring(0, 100) + '...'
      });
    }
    
    console.log('[Discord User API] Successfully fetched user data');
    
    // Log user data details
    console.log('[Discord User API] User data details:', {
      id: userData.id,
      username: userData.username,
      global_name: userData.global_name,
      avatar: userData.avatar ? `${userData.avatar.substring(0, 6)}...` : 'null',
      discriminator: userData.discriminator,
      has_email: !!userData.email,
      has_premium_type: userData.premium_type !== undefined,
      has_verified: userData.verified !== undefined,
      fields_received: Object.keys(userData)
    });

    // Return the user data to the client
    return res.status(200).json(userData);
  } catch (error) {
    console.error('[Discord User API] Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
} 