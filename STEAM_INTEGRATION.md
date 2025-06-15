# Steam Integration for Slayz.cc

This document provides comprehensive instructions for setting up and using the Steam integration in Slayz.cc.

## Overview

The Steam integration allows users to connect their Steam accounts to their Slayz.cc profiles. Once connected, users can display their Steam profile information, including their username, avatar, and games count, on their profile pages.

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env` file:

```
STEAM_API_KEY=9A8FF0D2A192AA65F5141C1D41AFB775
```

For development, you might want to use:
```
STEAM_REDIRECT_URI=http://localhost:3000/api/auth/steam/callback
```

For production:
```
STEAM_REDIRECT_URI=https://slayz.cc/api/auth/steam/callback
```

### 2. Database Updates

The user table needs to be updated to include the following fields:

```sql
ALTER TABLE users
ADD COLUMN steam_id VARCHAR(255),
ADD COLUMN steam_username VARCHAR(255),
ADD COLUMN steam_avatar VARCHAR(255),
ADD COLUMN steam_profile_url VARCHAR(255),
ADD COLUMN steam_games_count INTEGER;
```

### 3. API Endpoints

The Steam integration uses the following API endpoints:

- **GET /api/auth/steam**: Initiates the Steam OpenID authentication flow
- **GET /api/auth/steam/callback**: Handles the callback from Steam after authentication
- **POST /api/auth/steam/disconnect**: Disconnects the user's Steam account

### 4. Frontend Components

The Steam integration uses the following frontend components:

- **SteamIntegrationCard**: Displays the Steam profile information or a connect button
- **SteamConnectButton**: Button for connecting/disconnecting Steam accounts

## Usage Instructions

### Connecting a Steam Account

1. Navigate to the Settings page
2. Find the "Steam Integration" card
3. Click the "Connect Steam" button
4. Log in to your Steam account (if not already logged in)
5. Authorize the application to access your Steam profile
6. You will be redirected back to the Settings page with a success message

### Disconnecting a Steam Account

1. Navigate to the Settings page
2. Find the "Steam Integration" card
3. Click the "Disconnect Steam" button
4. Your Steam account will be disconnected and the data will be removed from your profile

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Make sure you are logged in to both Slayz.cc and Steam
2. **API Key Invalid**: Verify that the STEAM_API_KEY is correctly set in your environment variables
3. **Callback URL Error**: Ensure that the callback URL is correctly set in your environment variables

### Error Messages

- **steam_auth_failed**: The user is not authenticated with Slayz.cc
- **invalid_openid_response**: The response from Steam is invalid
- **steam_verification_failed**: Failed to verify the OpenID response with Steam
- **invalid_steam_id**: Failed to extract a valid Steam ID from the response
- **steam_api_key_missing**: The STEAM_API_KEY is not set in the environment variables
- **steam_user_not_found**: The Steam user was not found
- **steam_connection_failed**: General error connecting to Steam

## Security Considerations

1. **API Key Security**: Keep your Steam API key secure and never expose it on the frontend
2. **OpenID Validation**: Always validate the OpenID response from Steam
3. **State Parameter**: Use a state parameter to prevent CSRF attacks
4. **Rate Limiting**: Implement rate limiting for Steam API calls

## Resources

- [Steam Web API Documentation](https://developer.valvesoftware.com/wiki/Steam_Web_API)
- [OpenID 2.0 Specification](https://openid.net/specs/openid-authentication-2_0.html)
- [Steam API Key Registration](https://steamcommunity.com/dev/apikey)

## Support

For any issues or questions regarding the Steam integration, please contact the development team.

---

© 2023 Slayz.cc - All rights reserved. 