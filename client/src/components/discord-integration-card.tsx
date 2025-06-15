import React, { useEffect } from "react";
import { FaDiscord } from "react-icons/fa";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DiscordData, DiscordActivity } from "@/types/discord";
import { 
  formatDiscordUsername, 
  getDiscordDisplayName, 
  getDiscordAvatarUrl, 
  refreshDiscordTimestamp 
} from "@/lib/discord-refresh-helper";
import { useDiscordStatus } from "@/hooks/useDiscordStatus";

// Format last online timestamp
const formatTimeAgo = (timestamp: string | number | Date | null | undefined): string => {
  if (!timestamp) return "Unknown";
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (secondsAgo < 60) {
      return `${secondsAgo} seconds ago`;
    } else if (secondsAgo < 3600) {
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < 86400) {
      const hoursAgo = Math.floor(secondsAgo / 3600);
      return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < 2592000) {
      const daysAgo = Math.floor(secondsAgo / 86400);
      return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < 31536000) {
      const monthsAgo = Math.floor(secondsAgo / 2592000);
      return `${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago`;
    } else {
      const yearsAgo = Math.floor(secondsAgo / 31536000);
      return `${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return "Unknown";
  }
};

// Helper functions for Discord activity
const getDiscordActivityName = (activity: DiscordActivity | null | undefined): string => {
  if (!activity) return '';
  
  if (typeof activity === 'string') {
    try {
      const parsed = JSON.parse(activity);
      return parsed?.name || '';
    } catch (e) {
      console.error('Error parsing activity string:', e);
      return typeof activity === 'string' ? activity : '';
    }
  }
  
  return activity?.name || '';
};

// Format activity by type
const formatActivity = (activity: DiscordActivity | null | undefined): string => {
  console.log('Formatting activity:', activity);
  
  // Handle null or undefined
  if (!activity) {
    console.log('No activity data');
    return 'Currently doing nothing!';
  }
  
  let activityData: any = activity;
  
  // Handle string serialized activities
  if (typeof activity === 'string') {
    try {
      activityData = JSON.parse(activity);
      console.log('Parsed activity from string:', activityData);
    } catch (e) {
      console.error('Error parsing activity string:', e);
      // If the string couldn't be parsed but has content, return it directly
      const activityStr = activity as string;
      if (activityStr.trim()) {
        return activityStr.trim();
      }
      return 'Currently doing nothing!';
    }
  }
  
  // Handle activities array (common Discord API format)
  if (Array.isArray(activityData)) {
    console.log('Activity is an array with length:', activityData.length);
    if (activityData.length === 0) return 'Currently doing nothing!';
    activityData = activityData[0]; // Use the first activity
  }
  
  // Handle empty object
  if (!activityData || (typeof activityData === 'object' && Object.keys(activityData).length === 0)) {
    console.log('Activity is empty object');
    return 'Currently doing nothing!';
  }
  
  const name = activityData.name || '';
  const type = activityData.type ?? 0; // Use nullish coalescing to handle 0 properly
  const details = activityData.details || '';
  const state = activityData.state || '';
  
  console.log('Activity parsed values:', { name, type, details, state });
  
  if (!name && !details && !state) {
    return 'Currently doing nothing!';
  }
  
  switch (type) {
    case 0: return `Playing ${name}${details ? `: ${details}` : ''}${state ? ` (${state})` : ''}`;
    case 1: return `Streaming ${name}`;
    case 2: return `Listening to ${name}${details ? `: ${details}` : ''}${state ? ` (${state})` : ''}`;
    case 3: return `Watching ${name}`;
    case 4: return `${name}`;
    case 5: return `Competing in ${name}`;
    default: return name ? `${name}` : 'Currently doing nothing!';
  }
};

// Interface definitions
interface DiscordIntegrationCardProps {
  user: DiscordData;
  isConnected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  connectUrl?: string;
  isSettingsPage?: boolean;
}

/**
 * Discord Integration Card Component
 * 
 * This component displays a card for Discord integration, allowing users to connect
 * their Discord account or view their connected Discord profile.
 */
export const DiscordIntegrationCard: React.FC<DiscordIntegrationCardProps> = ({
  user,
  isConnected,
  onConnect,
  onDisconnect,
  connectUrl = "https://discord.com/oauth2/authorize?client_id=1380086427139833906&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback%2Fdiscord&response_type=code&scope=identify%20email",
  isSettingsPage = false,
}) => {
  // Refresh the timestamp when the component mounts
  useEffect(() => {
    if (isConnected && user?.discordId) {
      refreshDiscordTimestamp();
    }
  }, [isConnected, user?.discordId]);

  // Use our custom hook to fetch real-time Discord status
  const { 
    status: liveStatus, 
    isLoading: isStatusLoading,
    lastUpdated: statusLastUpdated
  } = useDiscordStatus({
    discordId: user?.discordId,
    enabled: isConnected && !!user?.discordId,
    refreshInterval: 30000 // Check every 30 seconds
  });

  // Use the live status if available, otherwise fall back to the stored status
  const currentStatus = liveStatus || user.discordStatus;
  
  // Use helper functions to get display name and username
  const displayName = getDiscordDisplayName(user);
  const username = formatDiscordUsername(user.discordUsername || 'user', user.discordDiscriminator);
  
  // Log the data being rendered for debugging
  console.log('Rendering Discord card with user data:', {
    displayName,
    username,
    hasAvatar: !!user.discordAvatar,
    discordId: user.discordId,
    storedStatus: user.discordStatus,
    liveStatus,
    statusLastUpdated: statusLastUpdated ? statusLastUpdated.toLocaleString() : 'none',
    activity: user.discordActivity,
    timestamp: user._timestamp ? new Date(user._timestamp).toLocaleString() : 'none'
  });
  
  // Determine the presence status color - force lowercase comparison and handle null/undefined
  const getStatusColor = (status: string | null | undefined): string => {
    console.log('Raw status value:', status, typeof status);
    
    // Default to online if no status is provided (better user experience than gray)
    if (!status) return "bg-green-500";
    
    // Normalize status string for comparison
    let normalizedStatus = '';
    try {
      normalizedStatus = status.toString().toLowerCase().trim();
    } catch (e) {
      console.error('Error normalizing status:', e);
      return "bg-green-500"; // Default to online on error
    }
    
    console.log('Normalized status:', normalizedStatus);
    
    // Enhanced status detection with fallbacks
    if (normalizedStatus === 'online' || normalizedStatus.includes('online')) {
      return "bg-green-500";
    } else if (normalizedStatus === 'idle' || normalizedStatus.includes('idle') || normalizedStatus.includes('away')) {
      return "bg-yellow-500";
    } else if (normalizedStatus === 'dnd' || normalizedStatus === 'do_not_disturb' || normalizedStatus.includes('dnd') || normalizedStatus.includes('do not disturb')) {
      return "bg-red-600";
    } else if (normalizedStatus === 'offline' || normalizedStatus.includes('offline') || normalizedStatus.includes('invisible')) {
      return "bg-gray-500";
    }
    
    // Default to online for any unrecognized value - better UX than showing as offline
    return "bg-green-500";
  };
  
  // Get the user avatar URL or fallback to a generated avatar
  const getAvatarUrl = (): string => {
    if (user.discordAvatar && user.discordId) {
      // Construct proper Discord CDN URL for avatars
      const avatarHash = user.discordAvatar;
      const userId = user.discordId;
      const format = avatarHash.startsWith('a_') ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}?size=512`;
    }
    
    // Generate a placeholder avatar with initials if no Discord avatar
    const initial = displayName.charAt(0).toUpperCase() || 'U';
    return `https://ui-avatars.com/api/?name=${initial}&background=7289DA&color=fff&size=512`;
  };
  
  // Pre-compute the activity string for consistency
  const activityString = formatActivity(user.discordActivity);
  console.log('Formatted activity string:', activityString);
  
  // Status indicator
  const renderStatusIndicator = () => {
    return (
      <div 
        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#111] ${getStatusColor(currentStatus)} ${(currentStatus?.toString().toLowerCase().trim() === 'online') ? 'animate-pulse' : ''}`}
        title={`Discord Status: ${currentStatus || 'Unknown'} ${statusLastUpdated ? `(Updated: ${statusLastUpdated.toLocaleTimeString()})` : ''}`}
      />
    );
  };
  
  return (
    <div className="w-full mx-auto md:max-w-[90%]">
      {isConnected ? (
        <div 
          className="relative rounded-xl overflow-hidden backdrop-blur-[60px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] shadow-[0px_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0px_25px_65px_rgba(0,0,0,0.5)] p-3 sm:p-4"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(114,137,218,0.08)] to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-[rgba(114,137,218,0.3)] bg-[#111] overflow-hidden shadow-[0px_0px_15px_rgba(114,137,218,0.2)] transition-all duration-300 group-hover:shadow-[0px_0px_25px_rgba(114,137,218,0.3)]">
                <img 
                  src={getAvatarUrl()} 
                  alt={`${displayName}'s Discord Avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to UI Avatars if Discord avatar fails to load
                    const initial = displayName.charAt(0).toUpperCase();
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${initial}&background=7289DA&color=fff&size=256`;
                  }}
                />
              </div>
              
              {/* Status indicator */}
              {renderStatusIndicator()}
            </div>
            
            {/* User Details Section */}
            <div className="flex-1 flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold text-lg">
                  {displayName}
                </h3>
                
                {/* Nitro Badge - Only show if user has Nitro (animated avatar) */}
                {user.discordAvatar?.startsWith('a_') && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-[#A259FF] text-lg transform transition-transform hover:scale-110 cursor-default">
                          <span role="img" aria-label="Nitro">💎</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Discord Nitro</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <p className="text-[#C084FC] text-sm font-medium mb-1">
                @{username && username.startsWith('@') ? username.substring(1) : username}
              </p>
              
              {/* Activity Status - Show dot only for actual activities */}
              <div className="text-gray-300 text-sm mb-1 max-w-full">
                {activityString === 'Currently doing nothing!' ? (
                  <span className="truncate italic">{activityString}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(currentStatus)}`}></div>
                    <span className="truncate italic">{activityString}</span>
                  </div>
                )}
              </div>
              
              {/* Status last updated indicator */}
              {statusLastUpdated && (
                <p className="text-gray-500 text-xs mt-1">
                  Status updated: {statusLastUpdated.toLocaleTimeString()}
                </p>
              )}
              
              {isSettingsPage && (
                <Button
                  variant="outline"
                  className="mt-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] rounded-lg text-white transition-all duration-150 flex items-center gap-2 group"
                  onClick={onDisconnect}
                >
                  <X className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                  <span>Disconnect Discord</span>
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
            <FaDiscord className="h-12 w-12 text-[#7289DA] mb-3" />
            <h3 className="text-white font-semibold text-lg mb-2">
              Connect your Discord account
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-4">
              Show off your Discord profile to visitors of your profile.
            </p>
            <a 
              href={connectUrl} 
              className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(88,101,242,0.3)]"
            >
              <FaDiscord className="h-5 w-5" />
              Connect Discord
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile page version with motion animations
export const AnimatedDiscordCard: React.FC<DiscordIntegrationCardProps> = (props) => {
  return (
    <div className="w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <DiscordIntegrationCard {...props} />
      </motion.div>
    </div>
  );
};

export default DiscordIntegrationCard; 