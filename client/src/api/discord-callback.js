/**
 * Discord OAuth Callback Handler
 * 
 * This Express-compatible handler processes Discord OAuth callbacks.
 * It should be imported in your Express backend server.
 */

// Express handler
export const handleDiscordCallback = async (req, res) => {
  console.log('Discord OAuth callback received:', req.query);

  // Check if Discord returned an error
  if (req.query.error) {
    console.error('Discord OAuth error:', req.query.error, req.query.error_description);
    // Redirect to settings page with error message
    return res.redirect(`/dashboard/settings?error=${encodeURIComponent('Failed to connect Discord account: ' + (req.query.error_description || req.query.error))}`);
  }

  // If we have a code, authentication was successful
  if (req.query.code) {
    console.log('Discord OAuth code received successfully:', req.query.code);
    
    // TODO: Exchange code for token
    try {
      // Example of token exchange (uncomment and modify as needed)
      /*
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: req.query.code,
          redirect_uri: process.env.DISCORD_REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      // Fetch user profile
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      
      const userData = await userResponse.json();
      
      // Store in your database
      // await updateUserDiscordProfile(req.session.userId, userData);
      */
    } catch (error) {
      console.error('Error exchanging Discord code for token:', error);
      return res.redirect('/dashboard/settings?error=Failed to exchange Discord authorization code');
    }
    
    // Redirect to settings page with success message
    return res.redirect('/dashboard/settings?success=Discord account connected successfully');
  }

  // If we reach here, something unexpected happened
  console.error('Discord OAuth callback received without code or error');
  return res.redirect('/dashboard/settings?error=Unknown error connecting Discord account');
};

// Frontend callback handler that can be used in a React component
export const handleDiscordCallbackInBrowser = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');
  
  if (error) {
    console.error('Discord OAuth error:', error, errorDescription);
    // Handle error and redirect
    window.location.href = `/dashboard/settings?error=${encodeURIComponent('Failed to connect Discord account: ' + (errorDescription || error))}`;
    return;
  }
  
  if (code) {
    console.log('Discord OAuth code received, sending to backend...');
    
    // Send code to your backend endpoint that handles token exchange
    // Example:
    /*
    fetch('/api/auth/discord/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
      .then(response => response.json())
      .then(data => {
        window.location.href = '/dashboard/settings?success=Discord account connected successfully';
      })
      .catch(error => {
        console.error('Error sending code to backend:', error);
        window.location.href = '/dashboard/settings?error=Failed to process Discord authorization';
      });
    */
    
    // For now, just redirect
    window.location.href = '/dashboard/settings?success=Discord account connected successfully';
    return;
  }
  
  window.location.href = '/dashboard/settings?error=Unknown error connecting Discord account';
};

export default handleDiscordCallbackInBrowser; 