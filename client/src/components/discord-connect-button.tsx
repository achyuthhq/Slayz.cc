import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getDefaultDiscordOAuthUrl, type DiscordScope } from '@/lib/discord-oauth-helper';
import { FaDiscord } from 'react-icons/fa';
import { LogOut } from 'lucide-react';

interface DiscordConnectButtonProps {
  isConnected?: boolean;
  onDisconnect?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  extraScopes?: DiscordScope[];
  showIcon?: boolean;
  buttonText?: string;
  disconnectText?: string;
}

/**
 * A dedicated button component for Discord OAuth connection
 * 
 * This component handles both the connect and disconnect states and
 * ensures the correct OAuth URL is generated with proper scopes.
 */
export function DiscordConnectButton({
  isConnected = false,
  onDisconnect,
  className = '',
  variant = 'default',
  size = 'default',
  extraScopes = [],
  showIcon = true,
  buttonText = 'Connect Discord',
  disconnectText = 'Disconnect Discord',
}: DiscordConnectButtonProps) {
  const [oauthUrl, setOauthUrl] = useState<string>('/api/auth/discord'); // Default fallback URL
  
  // Generate the OAuth URL on the client side to ensure environment variables are available
  useEffect(() => {
    // Only generate the URL if component is mounted on client and not connected
    if (typeof window !== 'undefined' && !isConnected) {
      try {
        const url = getDefaultDiscordOAuthUrl(extraScopes);
        setOauthUrl(url);
        console.log('[Discord Connect] Generated OAuth URL with scopes:', extraScopes.join(', ') || 'identify (default)');
      } catch (error) {
        console.error('[Discord Connect] Error generating OAuth URL, using fallback:', error);
        // Keep the fallback URL
      }
    }
  }, [extraScopes, isConnected]);
  
  // Handle disconnect button click
  const handleDisconnect = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDisconnect) {
      console.log('[Discord Connect] Disconnecting Discord account');
      onDisconnect();
    }
  };
  
  // Use a stylized button with gradient that matches GitHub but with Discord colors
  if (!isConnected) {
    return (
      <a 
        href={oauthUrl} 
        id="discord-connect-button"
        className="inline-flex w-fit items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(88,101,242,0.3)]"
      >
        <FaDiscord className="h-5 w-5" />
        {buttonText}
      </a>
    );
  }
  
  // Disconnect button with red gradient to match the connect button style
  return (
    <a
      href="#"
      onClick={handleDisconnect}
      className="inline-flex w-fit items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-[#ED4245] to-[#f87171] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(237,66,69,0.3)]"
    >
      <FaDiscord className="h-5 w-5" />
      {disconnectText}
    </a>
  );
}

/**
 * Example usage:
 * 
 * <DiscordConnectButton 
 *   isConnected={!!discordUser} 
 *   onDisconnect={handleDisconnectDiscord}
 *   extraScopes={['email']}
 * />
 */ 