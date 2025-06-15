# Slayz.cc - Discord Integration Updates

## Discord OAuth Scope Update (Latest)

We've simplified the Discord OAuth integration to use only the most basic required scopes to ensure authorization works correctly:

- `identify`: Basic user information (required)
- `email`: User's email address

We've removed the following scopes that were causing authorization errors:
- `presence.read`: Doesn't exist in Discord's OAuth API
- `guilds`: May require additional permissions
- `connections`: May require additional permissions
- `activities.read`: May require additional permissions

This update ensures that all OAuth URLs throughout the codebase use only the minimal set of scopes needed for basic Discord integration. While this means we won't display rich data like connections and activities, it guarantees that the authorization process works reliably.

## Complete Discord Integration Implementation

We've completely revamped the Discord integration with a comprehensive implementation:

### 1. Authentication Flow
- **Fixed OAuth2 URL**: Corrected the Discord OAuth2 URL with proper redirect and scopes
- **Token Exchange**: Added server-side code to exchange authorization codes for tokens
- **Profile Fetching**: Implemented Discord profile data fetching with proper typing
- **Callback Handling**: Created a proper callback handler in the React Router app

### 2. API Endpoints
- **/api/auth/process-discord**: New endpoint to process Discord auth codes and exchange for tokens
- **/api/user/discord**: New endpoint to store Discord profile data in the user record
- **/api/auth/discord/disconnect**: New endpoint to allow users to disconnect Discord

### 3. UI Components
- **Reusable DiscordIntegrationCard**: Updated to handle both connected and disconnected states
- **AnimatedDiscordCard**: Enhanced with motion animations for profile pages
- **Type-Safe Implementation**: Fixed TypeScript typing issues throughout the components

### 4. User Experience
- **Seamless Connection Flow**: Connect Discord → Authorize → Redirect → See Profile
- **Success/Error Feedback**: Clear toast notifications for all actions
- **Rich Profile Display**: Avatar, username, status, activity, and more

### 5. Data Storage
- **Proper Type Definitions**: Enhanced type safety with proper interfaces
- **Helper Functions**: Added utility functions for consistent data handling
- **Safe String Conversion**: Implemented proper null handling for all Discord fields

These updates ensure that Discord profiles are properly displayed on both the settings page and user profiles, creating a seamless integration experience.

# Slayz.cc Animation Updates

## BlurText Animation Implementation

We've enhanced the user interface with animated text effects using a custom `BlurText` component. This component creates a smooth reveal animation with a blur effect as text elements come into view.

### Components Created

- **BlurText Component**: A reusable component that applies a blur-reveal animation to text content.
  - Located at `client/src/components/blur-text.tsx`
  - Uses Framer Motion for animations
  - Implements Intersection Observer API to trigger animations when elements come into view
  - Supports customization via props (delay, direction, easing)
  - Preserves original text layout while applying animations
  - Text is larger and bolder on mobile for better visibility
  - Proper spacing between words is maintained for readability

### Components Updated

The following sections have been updated to use the BlurText animation effect:

#### Marketing Components

- **Hero Section**: Updated "Your Digital Identity, Upgraded." title
- **Features Section**: Updated "AI-Powered bio tools made advanced" title
- **Analysis Section**: Updated "Your complete digital presence" title
- **Public Pricing**: Updated "Find the right plan that suits your needs" title
- **Reviews Section**: Updated "See what users say about Slayz" title
- **Social Platforms**: Updated "Seamlessly connect with 50+ social platforms" title
- **CTA Section**: Updated "Ready to boost your social presence?" title

### Key Features of the Implementation

- **Seamless Integration**: Animation applies to text without disrupting the original layout
- **Progressive Reveal**: Text animates word by word for a smooth, engaging effect
- **Customizable Timing**: Each section has slightly different timing for visual variety
- **Performance Optimized**: Animations only trigger when elements come into view
- **Mobile Optimized**: Increased text size and improved spacing on mobile devices
- **Responsive**: Works across all device sizes with enhanced visibility on mobile
- **TypeScript Support**: Fully typed component for better developer experience

### Animation Effect

The animation creates a subtle yet engaging effect where:
1. Text starts blurred and slightly offset
2. As the user scrolls to the section, words animate in sequence
3. Each word transitions from blurred to sharp and moves into its final position
4. The staggered timing creates a flowing, dynamic feel

This enhancement improves the overall user experience by adding visual interest and drawing attention to key messaging throughout the site while maintaining the original design integrity.

# Slayz.cc - Modern Discord and GitHub Integration

## Discord Integration Improvements

The Discord integration component has been enhanced with a modern UI design inspired by Discord's own interface. The improvements include:

### 1. Reusable Components

- Created a reusable `DiscordIntegrationCard` component with TypeScript interfaces
- Added an animated variant (`AnimatedDiscordCard`) for profile pages
- Centralized styling and functionality for consistency across the application

### 2. Modern Discord-Inspired UI

- Implemented Discord's color scheme (dark background #0D0D0D and purple accents #A259FF)
- Added glassmorphism effects with subtle gradients
- Used Discord's standard border radius and styling
- Added animated status indicators (online, idle, dnd, offline)
- Included Discord Nitro badge for authenticity

### 3. Improved Content Organization

- Organized user information in a hierarchical layout
- Added emoji icons for playful touches
- Enhanced status and activity displays with proper colors and icons
- Improved last online timestamp formatting

### 4. Enhanced Visual Details

- Added subtle shadow effects
- Implemented faster transitions (150ms animations)
- Used consistent font styling throughout

### 5. Authentication Flow

- Updated Discord authentication URL to use the server-side OAuth handler:
  ```
  /api/auth/discord
  ```
- This endpoint correctly generates the necessary OAuth parameters and handles tokens securely
- Server logs confirm the actual OAuth URL is properly generated as:
  ```
  https://discord.com/api/oauth2/authorize?client_id=1380086427139833906&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2%2Fauthorize%2Fcallback&response_type=code&scope=identify%20email
  ```
- Properly handled connection and disconnection flows
- Added toast notifications for successful actions
- Implemented proper type handling for user data

### 2. Discord OAuth URL Fix

Fixed the Discord authentication URL format and implemented a proper callback handler for React Router:

```
https://discord.com/oauth2/authorize?client_id=1380086427139833906&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fdiscord&response_type=code&scope=identify+email
```

Key improvements:
- Direct URL to Discord's OAuth endpoint with minimal required scopes
- Simplified to only use identify and email scopes to avoid authorization errors
- Fixed redirect URI to match the callback route registered in Discord Developer Portal

## Recent Fixes

- Fixed Discord OAuth URLs to use only the minimal required scopes (`identify` and `email`) to prevent invalid_scope errors
- Corrected the GitHub component rendering in the profile page to properly handle motion animations
- Improved TypeScript component structure with proper nesting of motion components
- Added better handling of image elements within motion components
- Maintained the correct import path for toast notifications from `@/hooks/use-toast`
- Created a new type definitions file (`client/src/types/user.ts`) with helper functions
- Added GitHub helper functions for consistent type handling

## Type Definitions

A new type definitions file has been added at `client/src/types/user.ts` with:

- `User` interface: A comprehensive TypeScript interface for user data
- `DiscordUser` interface: Specific interface for Discord user data
- `GitHubUser` interface: Specific interface for GitHub user data
- `toDiscordUser()`: Helper function to convert user objects to properly typed Discord user objects
- `toGitHubUser()`: Helper function to convert user objects to properly typed GitHub user objects
- `hasDiscordConnected()`: Helper function to check if a user has Discord connected
- `hasGitHubConnected()`: Helper function to check if a user has GitHub connected
- `safeString()`: Helper function to safely convert values to strings

These helpers ensure consistent handling of user data across the application and provide more robust type checking.

## Known Issues

There are still some TypeScript linter errors in the profile and settings pages related to the user object types. These errors do not affect functionality but should be addressed in future updates by:

1. Creating a proper TypeScript interface for the user object (started with the new type definitions)
2. Ensuring consistent type handling across components
3. Adding proper null checks for optional fields
4. Resolving the motion component TypeScript definitions to handle className and style props correctly

## Future Improvements

- Add real-time status updates using WebSockets
- Implement Discord server information display
- Add more Discord-specific features like mutual servers
- Enhance mobile responsiveness for the Discord card
- Create a unified User type definition to eliminate TypeScript errors
- Add comprehensive Theme type definitions

# Slayz.cc - Password Recovery Feature

## Forgot Password Implementation

We've enhanced the user experience by implementing a comprehensive password recovery system that allows users to securely reset their passwords when forgotten.

### Key Components

1. **Forgot Password Modal**
   - Created a modern, accessible modal component for password reset requests
   - Integrated Turnstile CAPTCHA verification to prevent abuse
   - Provides clear user feedback with toast notifications
   - Matches the site's aesthetic with consistent styling

2. **Reset Password Page**
   - Implemented a dedicated page for password reset (`/reset-password`)
   - Secure token and email verification
   - Password confirmation with validation
   - Responsive design with mobile optimization
   - Animated feedback for successful password resets

3. **Server-Side Implementation**
   - Secure token generation using cryptographically secure methods
   - Database storage for reset tokens with expiration (1 hour validity)
   - Email delivery via Resend API with branded HTML templates
   - Token verification and secure password updates

4. **Security Considerations**
   - Rate limiting to prevent brute force attacks
   - Same response regardless of email existence (prevents user enumeration)
   - Secure token generation and validation
   - Automatic token expiration after 1 hour
   - Single-use tokens that are invalidated after password reset

### User Flow

1. User clicks "Forgot Password?" on the login form
2. Modal appears to enter email address and complete CAPTCHA
3. User receives email with secure reset link
4. Link directs to reset password page with token validation
5. User enters and confirms new password
6. System updates password and invalidates the token
7. User is redirected to login page to sign in with new credentials

This implementation follows security best practices while providing a seamless user experience for account recovery.

# Slayz.cc

Slayz.cc is a modern web application featuring user authentication, profile customization, and third-party integrations with services like Discord and GitHub.

## Recent Improvements

### 1. Enhanced Discord & GitHub Integration Components

We've improved the Discord and GitHub integration components with:

- **Motion Wrappers**: Created reusable motion component wrappers to handle animation and solve TypeScript errors with className props
- **Type Safety**: Added robust type definitions for Discord and GitHub user data, with proper helper functions for conversion
- **Consistent Design**: Implemented a modern, consistent design across settings and profile pages
- **Simplified Auth Flow**: Streamlined the authentication process for both Discord and GitHub connections

### 2. Discord OAuth URL Fix

Fixed the Discord authentication URL format and implemented a proper callback handler for React Router:

```
https://discord.com/oauth2/authorize?client_id=1380086427139833906&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fdiscord&response_type=code&scope=identify+email
```

Key improvements:
- Direct URL to Discord's OAuth endpoint with minimal required scopes
- Simplified to only use identify and email scopes to avoid authorization errors
- Fixed redirect URI to match the callback route registered in Discord Developer Portal

### 3. Discord Callback Implementation

Created a new route handler in the React Router application that:
- Handles the callback from Discord OAuth authentication
- Processes authentication success and failure cases
- Redirects users back to the dashboard settings page with appropriate status messages
- Shows a loading spinner while processing the OAuth response
- Provides foundational code for implementing token exchange in production

### 4. Modern Connect Buttons

Redesigned the connect buttons for third-party integrations:

- **Gradient Backgrounds**: Added beautiful gradient backgrounds for visual appeal
- **Animation Effects**: Implemented hover animations with subtle elevation changes
- **Status Indicators**: Added small status indicator dots to indicate connectivity
- **Improved Typography**: Enhanced text with better spacing and font weights
- **Shadow Effects**: Added subtle shadows with hover intensification
- **Rounded Corners**: Used more rounded corners for a modern look

### 5. Type Definitions

Added comprehensive type definitions in `client/src/types/user.ts`:

- `DiscordUser` interface with proper Discord API fields
- `GitHubUser` interface matching GitHub API response structure
- Helper functions for safely converting user data:
  - `toDiscordUser()` - Converts the application user to Discord user type
  - `toGitHubUser()` - Converts the application user to GitHub user type
  - `hasDiscordConnected()` - Checks if user has Discord connected
  - `hasGitHubConnected()` - Checks if user has GitHub connected
  - `safeString()` - Safely converts values to strings with fallbacks

### 6. Authentication Flow

The authentication flow for third-party services has been updated:

- **Discord**: Direct OAuth2 flow with Discord's authorization endpoint and rich scopes
- **GitHub**: `/api/auth/github` - Handles GitHub OAuth2 flow

The Discord flow now includes these steps:
1. User clicks "Connect Discord" button on the dashboard settings page
2. User is redirected to Discord's OAuth authorization page
3. After authorization, Discord redirects back to our callback route: `/api/auth/callback/discord`
4. The React Router callback handler processes the response and redirects the user back to the dashboard settings page with a success or error message
5. The UI updates to show the connected Discord account information

### 7. Known Issues

Some TypeScript linter errors remain in the profile and settings pages. These are related to:

- Type assignment issues between the API schema and component props
- Handling of potentially undefined values in the user object

These errors don't affect functionality but should be addressed in future updates.

### 8. Future Improvements

Planned improvements include:

- Implementing token exchange with Discord API in the callback handler
- Further refactoring to extract common integration component logic
- Creating a more robust type system for user data from external sources
- Adding more third-party integrations (Twitter, Twitch, etc.)
- Implementing real-time status updates for Discord integration
- Improved error handling and user feedback during connection process

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```
# Discord OAuth
DISCORD_CLIENT_ID=1380086427139833906
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/oauth2/authorize/callback
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Slayz.cc - Social Media Hub

Slayz.cc is a modern social media hub that allows users to create a personalized profile page with links to all their social media accounts and online presence.

## Features

- Customizable profile page with themes and layouts
- Social media integrations (Discord, GitHub, Steam)
- Analytics for page views and link clicks
- Premium subscription options
- Responsive design for all devices

## Steam Integration

Slayz.cc now supports Steam integration! Users can connect their Steam accounts to display their:

- Steam profile information
- Avatar
- Game count
- Profile link

### Setting Up Steam Integration

1. Get a Steam API key from [Steam Web API](https://steamcommunity.com/dev/apikey)
2. Add your Steam API key to the `.env` file:
   ```
   STEAM_API_KEY=YOUR_STEAM_API_KEY
   ```
3. Run the migration to add Steam fields to the database:
   ```
   node server/migrations/run_steam_migration.js
   ```
4. Restart your server to apply the changes

### Using Steam Integration

Users can connect their Steam accounts by:

1. Going to the Settings page
2. Finding the Steam integration section
3. Clicking "Connect Steam"
4. Entering their Steam profile URL (format: https://steamcommunity.com/profiles/STEAM_ID)

Once connected, the user's Steam profile information will be displayed on their profile page.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

## Environment Variables

See `.env.example` for a list of required environment variables.

## License

[MIT](LICENSE)

## Decorations

Profile decorations are loaded from a GitHub repository instead of being stored locally. This significantly reduces the repository size (over 400MB of decoration images) while still providing all decoration options.

The decorations are loaded from:
```
https://raw.githubusercontent.com/achyuth0/decos-rn/refs/heads/main/
```

If you need to add new decorations, add them to the GitHub repository and update the `DECORATION_LIST` in `client/src/components/decoration-selector.tsx`. 