/**
 * Discord Data Types
 * 
 * This file contains TypeScript interfaces for Discord integration data.
 */

/**
 * Discord User Data
 * 
 * Contains information about a connected Discord account.
 * - discordId: Unique Discord user ID
 * - discordUsername: Username without the discriminator (modern Discord format)
 * - discordDiscriminator: The 4 digits after the username (may be '0' for migrated accounts)
 * - discordGlobalName: The global display name set by the user (newer Discord accounts)
 * - discordDisplayName: The name to display (prioritizes global_name over username)
 * - discordAvatar: The avatar hash or full URL
 * - discordStatus: Current user status (online, idle, dnd, offline)
 * - discordActivity: Current user activity (game, music, etc.)
 * - lastOnline: ISO timestamp of when the user was last seen online
 * - _timestamp: When this data was last updated/stored
 */
export interface DiscordData {
  discordId: string;
  discordUsername: string;
  discordDiscriminator?: string;
  discordGlobalName?: string;
  discordDisplayName?: string;
  discordAvatar?: string | null;
  discordStatus?: 'online' | 'idle' | 'dnd' | 'offline';
  discordActivity?: DiscordActivity | null;
  lastOnline?: string;
  _timestamp?: number; // When this data was stored/updated
}

/**
 * Discord Activity
 * 
 * Represents a user's current Discord activity (e.g., playing a game).
 */
export interface DiscordActivity {
  name: string;
  type?: number; // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 5 = Competing
  details?: string;
  state?: string;
  applicationId?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    largeImage?: string;
    largeText?: string;
    smallImage?: string;
    smallText?: string;
  };
}

/**
 * Discord Status Type
 * 
 * Represents a user's Discord status.
 */
export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'offline';

/**
 * Discord OAuth Response
 * 
 * Response from Discord's OAuth token endpoint.
 */
export interface DiscordOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
} 