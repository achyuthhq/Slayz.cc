import { z } from "zod";
import axios from "axios";
import querystring from "querystring";

const discordConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  callbackUrl: z.string().url(),
  scopes: z.array(z.string()),
});

export type DiscordConfig = z.infer<typeof discordConfigSchema>;

export const getDiscordConfig = (): DiscordConfig => {
  const config = {
    clientId: process.env.DISCORD_CLIENT_ID || "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    callbackUrl: "https://slayz.cc/oauth2/authorize/callback",
    scopes: ["identify", "email", "connections"],
  };

  return discordConfigSchema.parse(config);
};

// Enhanced Discord user interface with more detailed information
export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  email?: string;
  verified?: boolean;
  locale?: string;
  mfa_enabled?: boolean;
  premium_type?: number;
  public_flags?: number;
  banner?: string | null;
  accent_color?: number | null;
  global_name?: string | null;
  avatar_decoration?: string | null;
  display_name?: string | null;
  connections?: Array<{
    type: string;
    id: string;
    name: string;
    visibility: boolean;
  }>;
}

// Discord presence information
export interface DiscordPresence {
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  activities?: Array<{
    name: string;
    type: number;
    url?: string;
    created_at: number;
    timestamps?: {
      start?: number;
      end?: number;
    };
    application_id?: string;
    details?: string;
    state?: string;
    emoji?: {
      name: string;
      id?: string;
      animated?: boolean;
    };
    party?: {
      id?: string;
      size?: [number, number];
    };
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    secrets?: {
      join?: string;
      spectate?: string;
      match?: string;
    };
    instance?: boolean;
    flags?: number;
    buttons?: string[];
  }>;
  client_status?: {
    desktop?: string;
    mobile?: string;
    web?: string;
  };
  last_modified?: number;
}

export const validateDiscordConfig = (): boolean => {
  try {
    getDiscordConfig();
    return true;
  } catch (error) {
    console.error("Invalid Discord configuration:", error);
    return false;
  }
};

export async function exchangeCodeForToken(code: string) {
  try {
    console.log(`Exchanging code for token with callback URL: ${getDiscordConfig().callbackUrl}`);
    
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      querystring.stringify({
        client_id: getDiscordConfig().clientId,
        client_secret: getDiscordConfig().clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: getDiscordConfig().callbackUrl,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Token exchange successful");
    return tokenResponse.data;
  } catch (error) {
    console.error("Error exchanging code for token:", 
      error instanceof Error 
        ? error.message 
        : (error as any)?.response?.data || 'Unknown error');
    throw error;
  }
};

export function getAuthUrl() {
  const config = getDiscordConfig();
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    config.callbackUrl
  )}&response_type=code&scope=${encodeURIComponent(config.scopes.join(' '))}`;
  
  console.log(`Generated Discord auth URL: ${authUrl}`);
  return authUrl;
}

// Fetch detailed user data from Discord API
export async function fetchDiscordUserData(accessToken: string): Promise<DiscordUser> {
  try {
    const response = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching Discord user data:", 
      error instanceof Error 
        ? error.message 
        : (error as any)?.response?.data || 'Unknown error');
    throw error;
  }
}

// Fetch user connections
export async function fetchDiscordConnections(accessToken: string) {
  try {
    const response = await axios.get('https://discord.com/api/users/@me/connections', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching Discord connections:", 
      error instanceof Error 
        ? error.message 
        : (error as any)?.response?.data || 'Unknown error');
    throw error;
  }
}

// Fetch user presence data (requires the presence.read scope)
export async function fetchDiscordPresence(accessToken: string, userId: string): Promise<DiscordPresence | null> {
  try {
    // This endpoint might require bot permissions or special access
    // It's not directly available through the OAuth2 API for regular applications
    const response = await axios.get(`https://discord.com/api/users/@me/presence`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching Discord presence:", 
      error instanceof Error 
        ? error.message 
        : (error as any)?.response?.data || 'Unknown error');
    // Return null instead of throwing, as presence data might not be available
    return null;
  }
}
