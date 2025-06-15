# Discord Integration Testing Guide

This guide provides a structured approach to testing and troubleshooting the Discord integration in your application.

## Prerequisites

1. Discord account with developer access
2. Discord application set up in the [Discord Developer Portal](https://discord.com/developers/applications)
3. Local development environment running your application

## Step 1: Verify Environment Setup

Before testing, ensure your environment is correctly configured:

```bash
# Check that .env file contains Discord credentials
cat .env | grep DISCORD
```

You should see the following variables defined:
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`

## Step 2: Clear Existing Data

Clear any cached Discord data from previous tests:

1. Open your browser's developer tools (F12 or right-click > Inspect)
2. Go to Application > Storage > Local Storage
3. Find your application's domain
4. Delete any Discord-related items (search for "discord")
5. Refresh the page

## Step 3: Test OAuth Flow

1. Navigate to your application's settings page
2. Click "Connect Discord" button
3. Observe the authorization window that appears
4. Verify it shows your application name and the requested permissions
5. Approve the authorization
6. Monitor the network requests in browser dev tools:
   - Look for a request to `/api/auth/discord/token`
   - Look for a subsequent request to `/api/auth/discord/user`

## Step 4: Inspect Server Logs

Check your server logs for the OAuth process:

```bash
# View last 50 lines of server logs
npm run dev | tail -n 50
```

Look for these log entries:
- `[Discord Token API] Processing authorization code`
- `[Discord Token API] Successfully exchanged code for token`
- `[Discord User API] Successfully fetched user data`

## Step 5: Verify Data Storage

After authentication, verify the data is stored correctly:

1. Open browser console
2. Run this command to check localStorage:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('discord_user_data')))
   ```
3. Verify it contains:
   - `id`
   - `username`
   - `global_name` (if available)
   - `avatar`
   - `discriminator`

## Step 6: Check Data Display

Verify the data is displayed correctly in your UI:

1. Check the Discord integration card
2. Verify your username is displayed in the format: @username
3. Verify your display name is shown (from global_name if available)
4. Verify your avatar is displayed (or placeholder if no avatar)
5. Check the connection status

## Common Issues & Solutions

### 1. "Failed to authenticate with Discord" Error

**Possible causes:**
- Invalid client secret
- Mismatched redirect URI
- Network issues

**Solutions:**
- Double-check your `DISCORD_CLIENT_SECRET` in .env
- Ensure redirect URI in Discord Developer Portal exactly matches `DISCORD_REDIRECT_URI` in .env
- Check network tab for specific error responses from Discord API

### 2. No Avatar Displayed

**Possible causes:**
- Incorrect avatar URL construction
- CDN issues
- User has no custom avatar

**Solutions:**
- Check avatar hash in localStorage
- Verify avatar URL format: `https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png`
- For animated avatars, use `.gif` extension if the hash starts with `a_`

### 3. Wrong Username Format

**Possible causes:**
- Using older username+discriminator format instead of new @username format
- Missing username transformation logic

**Solutions:**
- Verify you're using the current Discord username format (changed in 2023)
- For legacy accounts, check if discriminator is not '0' and format accordingly

### 4. HTML Response Instead of JSON

**Possible causes:**
- Network issues
- Discord API changes
- Proxy/firewall interference

**Solutions:**
- Check server logs for HTML response preview
- Verify your network connection
- Try with a different network if possible

## Advanced Debugging

### Enable Debug Component

1. Ensure you're in development mode
2. Navigate to the settings page
3. Look for the Discord Debug Info component
4. Verify all fields are populated with correct data

### Inspect Network Requests

In the browser's Network tab:

1. Filter requests with "discord"
2. Check the token exchange request:
   - Status code should be 200
   - Response should contain `access_token`
3. Check the user data request:
   - Status code should be 200
   - Response should contain user profile data

### Test with Multiple Accounts

To ensure compatibility with all Discord account types:
1. Test with a newer Discord account (has @username)
2. Test with a legacy Discord account (has username#discriminator)
3. Test with an account that has a custom avatar
4. Test with an account without a custom avatar

## Reporting Issues

When reporting Discord integration issues, include:

1. Screenshots of the UI showing the problem
2. Browser console logs
3. Server logs showing the token and user data requests
4. Steps to reproduce the issue
5. Discord account type you're testing with

---

**Note:** This guide is for development and testing purposes only. Always follow Discord's Terms of Service and Developer Policy when implementing OAuth integrations. 