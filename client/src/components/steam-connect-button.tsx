import React from 'react';
import { Button } from '@/components/ui/button';
import { FaSteam } from 'react-icons/fa';
import { LogOut } from 'lucide-react';

interface SteamConnectButtonProps {
  isConnected?: boolean;
  onDisconnect?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  buttonText?: string;
  disconnectText?: string;
}

/**
 * A dedicated button component for Steam OpenID connection
 * 
 * This component handles both the connect and disconnect states.
 */
export function SteamConnectButton({
  isConnected = false,
  onDisconnect,
  className = '',
  variant = 'default',
  size = 'default',
  showIcon = true,
  buttonText = 'Connect Steam',
  disconnectText = 'Disconnect Steam',
}: SteamConnectButtonProps) {
  // The Steam connect URL is handled by the backend
  const connectUrl = '/api/auth/steam';
  
  // Handle disconnect button click
  const handleDisconnect = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDisconnect) {
      console.log('[Steam Connect] Disconnecting Steam account');
      onDisconnect();
    }
  };
  
  // Use a stylized button with gradient that matches GitHub but with Steam colors
  if (!isConnected) {
    return (
      <a 
        href={connectUrl} 
        id="steam-connect-button"
        className="inline-flex w-fit items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-[#171a21] to-[#66c0f4] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(102,192,244,0.3)]"
      >
        <FaSteam className="h-5 w-5" />
        {buttonText}
      </a>
    );
  }
  
  // Disconnect button with red gradient to match the connect button style
  return (
    <a
      href="#"
      onClick={handleDisconnect}
      className="inline-flex w-fit items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-[#c23c2a] to-[#e86c60] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(194,60,42,0.3)]"
    >
      <FaSteam className="h-5 w-5" />
      {disconnectText}
    </a>
  );
} 