# Discord Authentication Setup Guide

This guide will help you set up Discord authentication for your application. Follow these steps to ensure that the Discord OAuth flow works correctly.

## Prerequisites

- A Discord account
- Access to the Discord Developer Portal (https://discord.com/developers/applications)

## Step 1: Create a Discord Application

1. Go to the Discord Developer Portal and log in with your Discord account.
2. Click on the "New Application" button.
3. Enter a name for your application and click "Create".

## Step 2: Configure OAuth2 Settings

1. In your application dashboard, navigate to the "OAuth2" section in the sidebar.
2. Add a redirect URL: `http://localhost:3000/callback/discord`
   - This is where Discord will redirect users after they authorize your app.
3. Save your changes.

## Step 3: Configure Environment Variables

1. Update your `.env` file with the following values:

```
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/callback/discord
```

2. Get your client ID and client secret from the Discord Developer Portal:
   - Client ID: Found in the "General Information" section
   - Client Secret: Found in the "OAuth2" section (click "Reset Secret" if needed)

## Step 4: Configure OAuth Scopes

When generating your OAuth URL, make sure to include the following scopes:
- `identify` - Required to get the user's basic information
- `email` - Required to get the user's email address

The complete OAuth URL should look like this:
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback%2Fdiscord&response_type=code&scope=identify+email
```

## Notes on User Activity Display

Despite not being able to use the `activities.read` scope (which is not currently supported by Discord's OAuth API), the application will still display mock activity data for demonstration purposes. In a production environment with a real-time connection to Discord (like a bot using Discord's Gateway API), you would be able to fetch actual user activity data.

## Troubleshooting

### Invalid Redirect URI Error
If you see an error about an invalid redirect URI, make sure that:
1. The redirect URI in your code exactly matches what you've registered in the Discord Developer Portal
2. You've properly URL-encoded the redirect URI in your OAuth URL

### HTML Response Instead of JSON
If your server returns HTML instead of JSON, make sure that:
1. Your API routes are correctly set up in your application
2. Your server is properly parsing JSON requests
3. You're not accidentally calling a client-side route from the server

### Missing Activity Data
If you're not seeing activity data:
1. Make sure you've included the `activities.read` scope in your OAuth URL
2. Note that Discord's Rich Presence data is only available through the Gateway API, not the REST API

## Need Further Help?

If you encounter any issues, check the following resources:
- [Discord Developer Documentation](https://discord.com/developers/docs)
- [Discord OAuth2 Guide](https://discord.com/developers/docs/topics/oauth2)
- [Discord API Support Server](https://discord.gg/discord-developers) 