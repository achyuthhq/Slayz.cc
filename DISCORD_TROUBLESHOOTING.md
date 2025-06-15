# Discord Integration Troubleshooting Guide

If you're still experiencing issues with the Discord integration after the recent fixes, this guide will help you troubleshoot and resolve common problems.

## Common Issues and Solutions

### 1. "Failed to authenticate with Discord" Error

This error typically occurs when there's a problem with the OAuth flow or parsing the Discord API response.

#### Solutions:

1. **Check Browser Console**: Open the browser console (F12) to see detailed error messages.

2. **Verify API Responses**: Look for error messages containing:
   - "Invalid JSON response" - This indicates a parsing issue
   - "Network error" - This points to connectivity problems
   - "Failed to fetch user data" - This suggests Discord API issues

3. **Clear All Discord Data**:
   ```javascript
   // Run this in the browser console
   localStorage.removeItem('discordData');
   window.location.reload();
   ```

4. **Check Server Logs**: If you have access to the server logs, look for error messages from:
   - `/api/auth/discord/token` endpoint
   - `/api/auth/discord/user` endpoint

### 2. Discord Data Not Displaying Correctly

If you're connected but not seeing your Discord data (avatar, username, etc.):

#### Solutions:

1. **Use the Debug Panel**: In development mode, the Discord Debug Panel should be visible on the Settings page. Use it to:
   - Check if Discord data is stored in localStorage
   - Verify the data format in the debug tabs
   - Ensure the query cache is in sync with localStorage

2. **Force Data Refresh**:
   ```javascript
   // Run this in the browser console
   if (window.debugDiscord) {
     const newData = window.debugDiscord.getCleanData();
     console.log('Refreshed Discord data:', newData);
   }
   ```

3. **Check Avatar URLs**: If only avatars are missing:
   - Check the avatar hash in the debug panel
   - Verify the full avatar URL is correctly constructed
   - Test opening the avatar URL directly in a new browser tab

### 3. Persistent Connection Issues

If you consistently can't connect your Discord account:

#### Solutions:

1. **Simplify OAuth Scopes**: Ensure you're only using the `identify` and `email` scopes. Remove any other scopes.

2. **Update Discord Developer Application**:
   - Check that your redirect URI is correct in the Discord Developer Portal
   - Verify your client ID and client secret are correctly set in your .env file
   - Make sure your application is not in "testing" mode that restricts OAuth

3. **Try Direct API Testing**:
   ```bash
   # Get a token (replace with your values)
   curl -X POST \
     -d "client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&grant_type=authorization_code&code=THE_CODE&redirect_uri=YOUR_REDIRECT_URI" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     https://discord.com/api/oauth2/token
   
   # Get user data (replace TOKEN with the access token)
   curl -H "Authorization: Bearer TOKEN" https://discord.com/api/users/@me
   ```

### 4. Error 400: invalid_scope

If you're seeing an "invalid_scope" error:

#### Solutions:

1. **Use Only Basic Scopes**: Make sure your OAuth URL only includes `identify` and `email` scopes.

2. **Check URL Encoding**: Ensure the scopes in your URL are properly encoded:
   ```
   identify%20email
   ```

3. **Remove activities.read**: If your URL still includes `activities.read`, remove it completely.

## Advanced Debugging

### 1. Enable Verbose Network Logging

In Chrome DevTools:
1. Go to Network tab
2. Check "Preserve log"
3. Filter by "discord"
4. Attempt to connect your Discord account
5. Examine the responses from Discord API endpoints

### 2. Manually Test Discord's API

If you have a Discord access token, you can test the API directly:

```javascript
// Run in browser console if you have a token
async function testDiscordAPI(token) {
  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
      return json;
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return text;
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### 3. Check for CORS Issues

If you're seeing CORS errors in the console:

1. Verify all API requests are going through your backend server
2. Check that your server is properly forwarding requests to Discord
3. Look for any middleware that might be affecting your API endpoints

## If All Else Fails

If you've tried everything above and still have issues:

1. **Implement a Fallback Mode**: 
   ```javascript
   // In your Discord card component
   const useFallbackMode = true; // Set to true to use fallback
   
   if (useFallbackMode && !user.discordUsername) {
     // Use placeholder data
     user.discordUsername = 'YourDiscordName';
     user.discordDisplayName = 'Your Display Name';
     user.discordStatus = 'online';
   }
   ```

2. **Simplify the Integration**: If you can't get all features working, implement a simpler version:
   - Just display the username without the avatar
   - Use a static connect button without real-time status
   - Disable the integration temporarily until you can resolve the issues

3. **Contact Discord Developer Support**: If you believe there's an issue with Discord's API, reach out to their developer support with detailed error logs and reproduction steps.

Remember: The debug panel is your best friend for troubleshooting! Use it to verify the data flow at each step of the integration process.

# Discord Authentication Troubleshooting Guide

## Specific Error: "Failed to authenticate with Discord: Failed to fetch Discord user data: Received invalid JSON from token endpoint"

If you're seeing this specific error, follow these steps to resolve it:

### 1. Check Environment Variables

First, ensure your environment variables are set correctly:

```bash
# In your project root, create or update your .env file
cp .env.example .env
```

Edit the `.env` file and make sure these variables are properly set:

```
DISCORD_CLIENT_ID=your_actual_client_id
DISCORD_CLIENT_SECRET=your_actual_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/callback/discord

# Client-side variables (must match server variables)
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_actual_client_id
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/callback/discord
```

**Important**: 
- The Client ID and Client Secret must be taken from your Discord Developer Portal
- The Redirect URI must exactly match what you've configured in the Discord Developer Portal
- Restart your development server after changing environment variables

### 2. Verify Discord Application Settings

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Under "OAuth2" → "General":
   - Verify the Redirect URI matches exactly what's in your .env file
   - Make sure your application has the "bot" application type
4. Under "OAuth2" → "URL Generator":
   - Select "identify" and "email" scopes (no others needed)
   - The redirect URL should match your DISCORD_REDIRECT_URI

### 3. Check Network Requests

1. Open your browser's developer tools (F12)
2. Go to the Network tab
3. Try to connect Discord again
4. Look for these requests:
   - A request to `/api/auth/discord/token` - check its status and response
   - A request to `/api/auth/discord/user` - check its status and response

### 4. Common Causes for This Error

1. **Invalid Client Secret**:
   - The client secret may be incorrect or expired
   - Solution: Generate a new client secret in the Discord Developer Portal

2. **Mismatched Redirect URI**:
   - The URI must match EXACTLY (including http vs https, trailing slashes, etc.)
   - Solution: Make both URIs identical in Discord Developer Portal and .env file

3. **Network or Proxy Issues**:
   - If you're behind a corporate firewall or VPN, it might interfere with requests
   - Solution: Try connecting from a different network

4. **Discord API Changes or Outage**:
   - Discord's API might be experiencing issues
   - Solution: Check [Discord Status](https://discordstatus.com/) or try again later

### 5. Debug Mode Tools

In development mode, you can use these tools to help diagnose the issue:

1. Open browser console and run:
   ```javascript
   // Check Discord environment variables
   window.Discord.runDiagnostics()
   ```

2. On the settings page, look for the Discord Debug panel to:
   - Check API status
   - Verify stored data
   - Access troubleshooting tips

### 6. Advanced Solutions

If the above steps don't work:

1. **Clear localStorage data**:
   ```javascript
   localStorage.removeItem('discord_user_data')
   ```

2. **Test with the direct Discord OAuth URL**:
   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=identify%20email
   ```

3. **Check server logs for detailed error messages**:
   - Look for logs starting with `[Discord Token API]` for more details
   - Pay attention to status codes and error responses

4. **Verify no request blocking**:
   - Some browser extensions or security software might block API calls
   - Try in an incognito window or with extensions disabled

### 7. Last Resort: New Discord Application

If all else fails:
1. Create a new Discord application in the Developer Portal
2. Configure it with the correct settings
3. Update your environment variables with the new credentials
4. Restart your development server

### Need More Help?

- Check the full `DISCORD_SETUP_TESTING_GUIDE.md` for comprehensive testing steps
- Examine the `DISCORD_API_GUIDE.md` for detailed API information
- Run `window.Discord.runDiagnostics()` in your browser console for real-time diagnostics 