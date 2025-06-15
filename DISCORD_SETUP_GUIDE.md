# Discord Integration Setup Guide

## Introduction

This guide provides step-by-step instructions for properly setting up Discord OAuth integration for your application. Follow these steps to ensure your Discord integration works correctly and displays real user data.

## Prerequisites

1. A Discord account
2. Access to the [Discord Developer Portal](https://discord.com/developers/applications)

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click the "New Application" button
3. Give your application a name and click "Create"

## Step 2: Configure OAuth2 Settings

1. In your application dashboard, navigate to the "OAuth2" tab in the left sidebar
2. Add the following redirect URLs:
   - For development: `http://localhost:3000/callback/discord`
   - For production: `https://yourdomain.com/callback/discord`
3. Save changes

## Step 3: Get Your Credentials

1. In the "General Information" tab, note your "Application ID" (Client ID)
2. In the "OAuth2" tab, click "Reset Secret" to generate a new client secret
3. Save both the Client ID and Client Secret securely

## Step 4: Set Up Environment Variables

Create or update your `.env` file with the following variables:

```
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/callback/discord
```

For production, use your production redirect URI.

## Step 5: Update Your OAuth URL

Ensure your OAuth URL includes the correct scope:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=identify
```

The `identify` scope is sufficient to access basic user profile information. Note that Discord has limited the scopes available to normal applications, and real-time status information cannot be accessed through the regular OAuth flow.

## Step 6: Test Your Integration

1. Start your application
2. Navigate to the settings page
3. Click "Connect Discord"
4. Authorize your application on Discord's authorization page
5. You should be redirected back to your application with your Discord data showing

## Troubleshooting

### "Failed to authenticate with Discord" error

This typically occurs due to one of these issues:

1. **Invalid Redirect URI**: Ensure the redirect URI in your Discord application settings exactly matches the one in your code.
2. **Missing Client Secret**: Verify your client secret is correctly set in your environment variables.
3. **API Endpoint Issues**: Confirm your server-side endpoints for token exchange and user data retrieval are working correctly.

### Missing User Data

If the application connects but doesn't show your username or avatar:

1. Verify the scopes in your OAuth URL (`identify` is required for basic user info)
2. Check your API calls to Discord to ensure they're properly formatted
3. Look for errors in your browser console for more details

### Status Not Showing

If your online status isn't showing correctly:

1. Discord does not provide real-time status information through the standard OAuth flow
2. The application currently uses a static status or simulates status for display purposes
3. For real-time status updates, you would need to implement Discord's Gateway API, which requires a bot application with additional permissions

## Additional Resources

- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
- [Discord API Documentation](https://discord.com/developers/docs/intro)

---

If you continue to experience issues, please refer to the Discord Developer documentation or contact support. 