import React, { useEffect } from "react";
import { FaSteam } from "react-icons/fa";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SteamUser } from "@/types/user";
import { 
  formatSteamUsername, 
  getSteamAvatarUrl, 
  getSteamProfileUrl,
  refreshSteamTimestamp 
} from "@/lib/steam-helper";

// Format games count with proper pluralization
const formatGamesCount = (count: number | undefined | null): string => {
  if (count === undefined || count === null) return "No games";
  if (count === 0) return "No games";
  if (count === 1) return "1 game";
  return `${count} games`;
};

// Interface definitions
interface SteamIntegrationCardProps {
  steamUser: SteamUser;
  isConnected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  connectUrl?: string;
  isSettingsPage?: boolean;
}

/**
 * Steam Integration Card Component
 * 
 * This component displays a card for Steam integration, allowing users to connect
 * their Steam account or view their connected Steam profile.
 */
export const SteamIntegrationCard: React.FC<SteamIntegrationCardProps> = ({
  steamUser,
  isConnected,
  onConnect,
  onDisconnect,
  connectUrl = "/api/auth/steam",
  isSettingsPage = false,
}) => {
  // Refresh the timestamp when the component mounts
  useEffect(() => {
    if (isConnected && steamUser?.steamid) {
      refreshSteamTimestamp();
    }
  }, [isConnected, steamUser?.steamid]);

  // Use helper functions to get display name
  const displayName = formatSteamUsername(steamUser.personaname);
  
  // Log the data being rendered for debugging
  console.log('Rendering Steam card with user data:', {
    displayName,
    hasAvatar: !!steamUser.avatar,
    steamId: steamUser.steamid,
    profileUrl: steamUser.profileurl,
    gamesCount: steamUser.gamesCount
  });
  
  // Get the user avatar URL or fallback to a generated avatar
  const getAvatarUrl = (): string => {
    if (steamUser.avatarfull) {
      return steamUser.avatarfull;
    }
    
    // Generate a placeholder avatar with initials if no Steam avatar
    const initial = displayName.charAt(0).toUpperCase() || 'S';
    return `https://ui-avatars.com/api/?name=${initial}&background=171a21&color=fff&size=512`;
  };
  
  return (
    <div className="w-full mx-auto md:max-w-[90%]">
      {isConnected ? (
        <div 
          className="relative rounded-xl overflow-hidden backdrop-blur-[60px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] shadow-[0px_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0px_25px_65px_rgba(0,0,0,0.5)] p-3 sm:p-4"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(23,26,33,0.08)] to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-[rgba(23,26,33,0.3)] bg-[#111] overflow-hidden shadow-[0px_0px_15px_rgba(23,26,33,0.2)] transition-all duration-300 group-hover:shadow-[0px_0px_25px_rgba(23,26,33,0.3)]">
                <img 
                  src={getAvatarUrl()} 
                  alt={`${displayName}'s Steam Avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to UI Avatars if Steam avatar fails to load
                    const initial = displayName.charAt(0).toUpperCase();
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${initial}&background=171a21&color=fff&size=256`;
                  }}
                />
              </div>
            </div>
            
            {/* User Details Section */}
            <div className="flex flex-col items-center sm:items-start flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">
                  {displayName}
                </h2>
                <FaSteam className="h-4 w-4 text-[#66c0f4]" />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {steamUser.gamesCount !== undefined && (
                  <Badge variant="outline" className="bg-[rgba(102,192,244,0.1)] text-[#66c0f4] border-[#66c0f4]/30">
                    {formatGamesCount(steamUser.gamesCount)}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-3 mt-1">
                <a 
                  href={steamUser.profileurl || getSteamProfileUrl(steamUser.steamid)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#66c0f4] hover:text-[#8ed4ff] text-sm flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>View Profile</span>
                </a>
              </div>
              
              {isSettingsPage && (
                <Button
                  variant="outline"
                  className="mt-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] rounded-lg text-white transition-all duration-150 flex items-center gap-2 group"
                  onClick={onDisconnect}
                >
                  <X className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                  <span>Disconnect Steam</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="rounded-xl overflow-hidden backdrop-blur-[60px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] shadow-[0px_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0px_25px_65px_rgba(0,0,0,0.5)] p-3 text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <FaSteam className="h-12 w-12 text-[#66c0f4] mb-3" />
            <h3 className="text-white font-semibold text-lg mb-2">
              Connect your Steam account
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-4">
              Show off your Steam profile and game collection to visitors of your profile.
            </p>
            <a 
              href={connectUrl} 
              className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-[#171a21] to-[#66c0f4] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(102,192,244,0.3)]"
            >
              <FaSteam className="h-5 w-5" />
              Connect Steam
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile page version with motion animations
export const AnimatedSteamCard: React.FC<SteamIntegrationCardProps> = (props) => {
  return (
    <div className="w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <SteamIntegrationCard {...props} />
      </motion.div>
    </div>
  );
}; 