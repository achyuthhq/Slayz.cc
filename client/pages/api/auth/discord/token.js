/**
 * Discord OAuth Token Exchange Endpoint
 * 
 * This endpoint exchanges an authorization code for an access token from Discord.
 * It's a server-side proxy to protect our client secret.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log('[Discord Token API] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      console.log('[Discord Token API] Missing authorization code');
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('[Discord Token API] Processing authorization code:', code.substring(0, 6) + '...');

    // Discord OAuth configuration
    const clientId = process.env.DISCORD_CLIENT_ID || '1350091089398464574';
    const clientSecret = process.env.DISCORD_CLIENT_SECRET || ''; // You must set your real client secret in environment variables!
    const redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://slayz.cc/callback/discord';

    // Warn if using empty client secret
    if (!clientSecret) {
      console.warn('[Discord Token API] ⚠️ WARNING: No client secret provided! Authentication will fail. Set DISCORD_CLIENT_SECRET in your environment variables.');
      return res.status(500).json({ 
        error: 'Discord client secret not configured',
        message: 'The server is not properly configured with a Discord client secret'
      });
    }

    console.log('[Discord Token API] Using configuration:', { 
      clientId, 
      redirectUri,
      clientSecretLength: clientSecret ? clientSecret.length : 0
    });

    // Exchange the code for a token
    console.log('[Discord Token API] Sending request to Discord token endpoint...');
    let tokenResponse;
    try {
      tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'DiscordBot (https://yoursite.com, 1.0)'
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });
      
      console.log('[Discord Token API] Token response status:', tokenResponse.status);
      console.log('[Discord Token API] Token response headers:', JSON.stringify(Object.fromEntries([...tokenResponse.headers.entries()]), null, 2));
    } catch (fetchError) {
      console.error('[Discord Token API] Network error when fetching token:', fetchError);
      return res.status(500).json({
        error: 'Network error when contacting Discord API',
        message: fetchError.message
      });
    }

    // Get the response as text first
    let responseText;
    try {
      responseText = await tokenResponse.text();
      console.log('[Discord Token API] Response content length:', responseText.length);
      
      // Log the first part of the response for debugging
      if (responseText.length > 0) {
        console.log('[Discord Token API] Response preview:', responseText.substring(0, Math.min(200, responseText.length)));
      } else {
        console.log('[Discord Token API] Empty response received');
      }
      
      // Check for HTML response
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('[Discord Token API] Received HTML response instead of JSON');
        return res.status(502).json({
          error: 'Discord API returned HTML instead of JSON',
          preview: responseText.substring(0, 200) + '...',
          suggestion: 'This may indicate a network issue or Discord service problem'
        });
      }
    } catch (textError) {
      console.error('[Discord Token API] Error reading response text:', textError);
      return res.status(500).json({
        error: 'Error reading Discord API response',
        message: textError.message
      });
    }

    if (!tokenResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('[Discord Token API] Error parsing JSON error response:', e);
        errorData = { 
          raw_error: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
          parse_error: 'Response was not valid JSON'
        };
      }
      
      console.error('[Discord Token API] Discord token exchange error:', errorData);
      
      // Special handling for invalid_scope errors
      if (errorData.error === 'invalid_scope') {
        console.error('[Discord Token API] Invalid scope error. Please check your OAuth URL scopes. Using only "identify" is recommended.');
        return res.status(400).json({
          error: 'Invalid OAuth scope',
          message: 'The requested OAuth scopes are invalid. Please use only "identify" scope.',
          details: errorData
        });
      }
      
      return res.status(tokenResponse.status).json({
        error: 'Failed to exchange code for token',
        details: errorData,
        status: tokenResponse.status,
        statusText: tokenResponse.statusText
      });
    }

    // Parse the JSON response
    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Discord Token API] Error parsing JSON response:', parseError);
      console.error('[Discord Token API] Invalid JSON response preview:', responseText.substring(0, 200));
      return res.status(500).json({
        error: 'Invalid JSON response from Discord API',
        message: 'Could not parse Discord API response as JSON',
        preview: responseText.substring(0, 100) + '...'
      });
    }
    
    console.log('[Discord Token API] Successfully exchanged code for token');
    
    // Log token data details (without exposing the actual token)
    console.log('[Discord Token API] Token response details:', {
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      has_access_token: !!tokenData.access_token,
      access_token_length: tokenData.access_token?.length || 0,
      has_refresh_token: !!tokenData.refresh_token
    });

    // Return the token data to the client
    return res.status(200).json(tokenData);
  } catch (error) {
    console.error('[Discord Token API] Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
} 