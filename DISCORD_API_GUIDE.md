# Discord API Integration Guide

## Understanding Discord User Data

When connecting with Discord, you need to understand how Discord's API returns user data and how to map it to your application.

### Key Discord User Fields

The `/users/@me` endpoint returns these important fields:

- `id`: The user's unique Discord ID (snowflake)
- `username`: The user's username without the discriminator
- `global_name`: The user's display name (what they've set as their profile name)
- `avatar`: A hash value used to construct the avatar URL (not a full URL)
- `discriminator`: A 4-digit number, though newer accounts use "0"

### Constructing Avatar URLs

Discord doesn't provide complete avatar URLs. You need to construct them:

```javascript
// For standard avatars:
`https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`

// For animated avatars (start with "a_"):
`https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.gif`
```

## Implementation Checklist

For correctly displaying real Discord user data:

1. **Exchange Code for Token**:
   - Your server endpoint should securely exchange the authorization code for an access token
   - Keep your client secret secure on the server

2. **Fetch User Data**:
   - Use the token to request data from `https://discord.com/api/users/@me`
   - Handle the response correctly, logging all fields for debugging

3. **Map Discord Fields to Your App**:
   - `discordId` = `id` from Discord
   - `discordUsername` = `username` from Discord  
   - `discordGlobalName` = `global_name` from Discord
   - `discordAvatar` = `avatar` hash from Discord (not the full URL)

4. **Display Data Correctly**:
   - Prefer `global_name` for display name, fall back to `username`
   - For modern Discord, use `@username` format without discriminator
   - Only use discriminator for legacy accounts (non-zero discriminator)
   - Construct avatar URLs correctly as shown above

## Common Issues & Solutions

1. **Placeholder Data Showing**:
   - Check browser console for errors in API requests
   - Verify data is correctly stored in localStorage
   - Ensure your UI components use the correct field mapping

2. **Missing Avatar**:
   - Verify avatar hash is correctly stored
   - Check your avatar URL construction logic
   - Discord may return null for users without custom avatars

3. **Wrong Username Format**:
   - New Discord accounts use the `@username` format without discriminators
   - Only add `#discriminator` for legacy accounts with non-zero discriminators

## Debugging Tips

1. Add detailed logging for the Discord data at each step:
   - After receiving the token
   - After fetching user data
   - When storing data in localStorage
   - When rendering the UI component

2. Create a debugging panel to display stored Discord data

3. Check network requests to ensure your API calls are successful

## Testing

Test with both:
- New Discord accounts (using the new username system)
- Legacy accounts (with discriminators)
- Accounts with and without custom avatars

This ensures your integration handles all possible user account types correctly. 