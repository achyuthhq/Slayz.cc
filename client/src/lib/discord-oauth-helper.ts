/**
 * Discord OAuth URL Generator
 * 
 * This utility helps generate the correct Discord OAuth URLs with proper scopes
 * and ensures consistent parameter formatting.
 */

import { env, getEnv } from './env-config';

// Available Discord OAuth scopes
export type DiscordScope = 'identify' | 'email' | 'connections' | 'guilds' | 'guilds.members.read' | 'activities.read';

/**
 * Generate a Discord OAuth URL with the specified scopes
 * 
 * @param clientId - The Discord application client ID
 * @param redirectUri - The URI Discord will redirect to after authorization
 * @param scopes - Array of OAuth scopes to request
 * @param state - Optional state parameter for security validation
 * @returns The complete OAuth URL
 */
export function generateDiscordOAuthUrl({
  clientId,
  redirectUri,
  scopes = ['identify'],
  state,
}: {
  clientId: string;
  redirectUri: string;
  scopes?: DiscordScope[];
  state?: string;
}): string {
  // Ensure the required scopes are included
  if (!scopes.includes('identify')) {
    console.warn('[Discord OAuth] The "identify" scope is required and has been automatically added');
    scopes = ['identify', ...scopes];
  }

  // Log the scopes being used
  console.log('[Discord OAuth] Generating OAuth URL with scopes:', scopes.join(', '));

  // Construct URL parameters
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
  });

  // Add state parameter if provided
  if (state) {
    params.append('state', state);
  }

  // Return the complete URL
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Get the default Discord OAuth URL using environment variables
 * 
 * @param extraScopes - Additional scopes beyond the default 'identify'
 * @returns The complete OAuth URL
 */
export function getDefaultDiscordOAuthUrl(extraScopes: DiscordScope[] = []): string {
  // Use our environment config system which handles all environments
  const clientId = getEnv('DISCORD_CLIENT_ID');
  const redirectUri = getEnv('DISCORD_REDIRECT_URI');
  
  // Always include these essential scopes for user profile data
  const defaultScopes: DiscordScope[] = ['identify', 'email', 'connections', 'guilds', 'guilds.members.read'];
  
  // Get unique scopes (removing duplicates)
  const uniqueScopes = Array.from(new Set([...defaultScopes, ...extraScopes])) as DiscordScope[];
  
  return generateDiscordOAuthUrl({
    clientId,
    redirectUri,
    scopes: uniqueScopes,
  });
}

/**
 * Validates that a redirect URI matches the pattern expected by Discord
 * 
 * @param uri - The redirect URI to validate
 * @returns Whether the URI appears to be valid
 */
export function isValidRedirectUri(uri: string): boolean {
  // Simple validation - more complex validation could be added
  try {
    const url = new URL(uri);
    return !!url.protocol && !!url.host;
  } catch (e) {
    console.error('[Discord OAuth] Invalid redirect URI:', uri);
    return false;
  }
}

/**
 * Helper function to update the Discord connection button href
 * 
 * @param buttonId - The ID of the button element to update
 * @param extraScopes - Additional scopes to include
 */
export function updateDiscordConnectButton(
  buttonId: string = 'discord-connect-button',
  extraScopes: DiscordScope[] = []
): void {
  if (typeof document !== 'undefined') {
    const button = document.getElementById(buttonId) as HTMLAnchorElement;
    if (button) {
      button.href = getDefaultDiscordOAuthUrl(extraScopes);
      console.log('[Discord OAuth] Updated connect button with URL:', button.href);
    }
  }
} 