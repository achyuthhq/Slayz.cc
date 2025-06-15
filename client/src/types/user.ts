/**
 * Type definitions for user objects in the Slayz.cc application
 */

import { User as SharedUser } from "@shared/schema";

// Base User type that matches the structure used in the API
export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  logo?: string;
  backgroundImage?: string;
  profileSongUrl?: string;
  createdAt?: string | Date;
  lastLogin?: string | Date;
  
  // Discord integration fields
  discordId?: string;
  discordUsername?: string;
  discordDisplayName?: string;
  discordGlobalName?: string;
  discordAvatar?: string;
  discordStatus?: string;
  discordActivity?: any | null;
  lastOnline?: string | number | Date;
  
  // GitHub integration fields
  githubId?: string;
  githubUsername?: string;
  githubDisplayName?: string;
  githubAvatar?: string;
  githubPublicRepos?: number;
  githubFollowers?: number;
  
  // Steam integration fields
  steamId?: string;
  steamUsername?: string;
  steamAvatar?: string;
  steamProfileUrl?: string;
  steamGamesCount?: number;
  steamPersonastate?: number;
  steamTotalPlaytime?: number;
  steamRecentPlaytime?: number;
  steamRecentlyPlayedGames?: SteamGameInfo[];
  steamLastLogoff?: number;
  _steamTimestamp?: number;
  
  // Database fields (snake_case)
  steam_id?: string;
  steam_username?: string;
  steam_avatar?: string;
  steam_profile_url?: string;
  steam_games_count?: number;
  
  // Premium status
  isPremium?: boolean;
  premiumTier?: "free" | "basic" | "pro" | "enterprise";
  
  // Theme data
  theme?: any; // This would ideally be replaced with a more specific Theme type
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status?: string;
  activities?: {
    name: string;
    type: number;
    details?: string;
    state?: string;
  }[];
  premium_type?: number;
}

export interface GitHubUser {
  id: string;
  login: string;
  avatar_url: string;
  bio: string | null;
  name: string | null;
  public_repos: number;
  followers: number;
}

export interface SteamUser {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  gamesCount?: number;
  personastate?: number; // 0 - Offline, 1 - Online, 2 - Busy, 3 - Away, 4 - Snooze, 5 - Looking to Trade, 6 - Looking to Play
  totalPlaytime?: number; // Total playtime across all games in minutes
  recentPlaytime?: number; // Playtime in the last 2 weeks in minutes
  recentlyPlayedGames?: SteamGameInfo[]; // Recently played games
  lastLogoff?: number; // Last time the user was online (Unix timestamp)
}

export interface SteamGameInfo {
  appid: number;
  name: string;
  playtime_2weeks?: number; // Playtime in the last 2 weeks in minutes
  playtime_forever: number; // Total playtime in minutes
  img_icon_url?: string;
  img_logo_url?: string;
}

/**
 * Converts a user object to a Discord user
 * @param user The user object
 * @returns A properly typed Discord user object
 */
export function toDiscordUser(user: SharedUser): DiscordUser {
  return {
    id: safeString(user.discordId),
    username: safeString(user.discordUsername),
    discriminator: safeString(user.discordDiscriminator),
    avatar: user.discordAvatar ? safeString(user.discordAvatar) : null,
    status: safeString(user.discordStatus),
    premium_type: typeof user.discordPremiumType === 'number' ? user.discordPremiumType : 0,
    activities: user.discordActivities && Array.isArray(user.discordActivities) 
      ? user.discordActivities.map(activity => ({
          name: safeString(activity.name),
          type: typeof activity.type === 'number' ? activity.type : 0,
          details: activity.details ? safeString(activity.details) : undefined,
          state: activity.state ? safeString(activity.state) : undefined,
        }))
      : []
  };
}

/**
 * Converts a user object to a GitHub user
 * @param user The user object
 * @returns A properly typed GitHub user object
 */
export function toGitHubUser(user: SharedUser): GitHubUser {
  return {
    id: safeString(user.githubId),
    login: safeString(user.githubUsername),
    name: user.githubDisplayName ? safeString(user.githubDisplayName) : null,
    avatar_url: safeString(user.githubAvatar),
    bio: user.githubBio ? safeString(user.githubBio) : null,
    public_repos: typeof user.githubPublicRepos === 'number' ? user.githubPublicRepos : 0,
    followers: typeof user.githubFollowers === 'number' ? user.githubFollowers : 0
  };
}

/**
 * Converts a user object to a Steam user
 * @param user The user object
 * @returns A properly typed Steam user object
 */
export function toSteamUser(user: SharedUser): SteamUser {
  return {
    steamid: safeString(user.steamId || user.steam_id),
    personaname: safeString(user.steamUsername || user.steam_username),
    profileurl: safeString(user.steamProfileUrl || user.steam_profile_url),
    avatar: safeString(user.steamAvatar || user.steam_avatar),
    avatarmedium: safeString(user.steamAvatar || user.steam_avatar),
    avatarfull: safeString(user.steamAvatar || user.steam_avatar),
    gamesCount: typeof user.steamGamesCount === 'number' 
      ? user.steamGamesCount 
      : (typeof user.steam_games_count === 'number' ? user.steam_games_count : 0),
    personastate: typeof user.steamPersonastate === 'number' ? user.steamPersonastate : undefined,
    totalPlaytime: typeof user.steamTotalPlaytime === 'number' ? user.steamTotalPlaytime : undefined,
    recentPlaytime: typeof user.steamRecentPlaytime === 'number' ? user.steamRecentPlaytime : undefined,
    recentlyPlayedGames: user.steamRecentlyPlayedGames && Array.isArray(user.steamRecentlyPlayedGames) 
      ? user.steamRecentlyPlayedGames.map(game => ({
          appid: typeof game.appid === 'number' ? game.appid : 0,
          name: safeString(game.name),
          playtime_2weeks: typeof game.playtime_2weeks === 'number' ? game.playtime_2weeks : undefined,
          playtime_forever: typeof game.playtime_forever === 'number' ? game.playtime_forever : 0,
          img_icon_url: safeString(game.img_icon_url),
          img_logo_url: safeString(game.img_logo_url),
        }))
      : undefined,
    lastLogoff: typeof user.steamLastLogoff === 'number' ? user.steamLastLogoff : undefined
  };
}

/**
 * Checks if a user has connected Discord
 * @param user The user object
 * @returns True if the user has connected Discord
 */
export function hasDiscordConnected(user: SharedUser): boolean {
  return Boolean(user.discordId && user.discordUsername);
}

/**
 * Checks if a user has connected GitHub
 * @param user The user object
 * @returns True if the user has connected GitHub
 */
export function hasGitHubConnected(user: SharedUser): boolean {
  return Boolean(user.githubId && user.githubUsername);
}

/**
 * Checks if a user has connected Steam
 * @param user The user object
 * @returns True if the user has connected Steam
 */
export function hasSteamConnected(user: SharedUser): boolean {
  return Boolean((user.steamId || user.steam_id) && (user.steamUsername || user.steam_username));
}

/**
 * Safely converts a value to a string
 * @param value The value to convert
 * @param fallback Optional fallback string if value is null/undefined
 * @returns A string representation of the value or fallback
 */
export function safeString(value: unknown, fallback: string = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  try {
    return String(value);
  } catch {
    return fallback;
  }
} 