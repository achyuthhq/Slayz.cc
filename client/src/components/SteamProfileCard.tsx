import React from 'react';
import { User, hasSteamConnected, toSteamUser, SteamGameInfo } from '../types/user';
import type { SteamUser } from '../types/user';
import { ExternalLink } from 'lucide-react';

interface SteamProfileCardProps {
  user: User;
  className?: string;
}

// Helper function to format minutes into hours and minutes
const formatPlaytime = (minutes: number | undefined): string => {
  if (!minutes) return '0 hours';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes} minutes`;
  if (remainingMinutes === 0) return `${hours} hours`;
  return `${hours} hours, ${remainingMinutes} minutes`;
};

// Helper function to get status text and color
const getStatusInfo = (personastate: number | undefined) => {
  if (personastate === undefined) return { text: 'Unknown', color: 'bg-gray-400' };
  
  const statuses = [
    { text: 'Offline', color: 'bg-gray-400' },
    { text: 'Online', color: 'bg-green-500' },
    { text: 'Busy', color: 'bg-red-500' },
    { text: 'Away', color: 'bg-yellow-500' },
    { text: 'Snooze', color: 'bg-blue-400' },
    { text: 'Looking to Trade', color: 'bg-purple-500' },
    { text: 'Looking to Play', color: 'bg-indigo-500' }
  ];
  
  return personastate >= 0 && personastate < statuses.length 
    ? statuses[personastate] 
    : { text: 'Unknown', color: 'bg-gray-400' };
};

// Helper function to get Steam game image URL
const getSteamGameImageUrl = (appId: number, hash: string | undefined): string => {
  if (!hash) return 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/0/0000000000000000000000000000000000000000.jpg';
  return `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${appId}/${hash}.jpg`;
};

// Helper function to format last online time
const formatLastOnline = (timestamp: number | undefined): string => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Extract Steam username from profile URL if available
const extractSteamUsername = (profileUrl: string | undefined): string | null => {
  if (!profileUrl) return null;
  
  try {
    const url = new URL(profileUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Standard format: /id/username
    if (pathParts.length >= 2 && pathParts[0] === 'id') {
      return pathParts[1];
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

const SteamProfileCard: React.FC<SteamProfileCardProps> = ({ user, className = '' }) => {
  // Use type assertion to handle the User type
  const isConnected = hasSteamConnected(user as any);
  
  if (!isConnected) {
    return null;
  }
  
  // Use type assertion for toSteamUser
  const steamUser = toSteamUser(user as any) as unknown as SteamUser;
  const statusInfo = getStatusInfo(steamUser.personastate);
  const steamUsername = extractSteamUsername(steamUser.profileurl);
  
  // Get the actual number of recently played games
  const recentGamesCount = steamUser.recentlyPlayedGames?.length || 0;
  
  // Fix for accurate games count display
  // The issue is that sometimes the API returns a different count than the actual number of games
  // We'll use the recentlyPlayedGames array length as the source of truth if it's available
  const actualGamesCount = steamUser.recentlyPlayedGames ? steamUser.recentlyPlayedGames.length : (steamUser.gamesCount || 0);
  
  return (
    <div className={className}>
      <div 
        className="backdrop-blur-xl bg-[#171a21]/70 rounded-lg overflow-hidden shadow-lg border border-[#66c0f4]/30 w-full
          transition-all duration-300 hover:shadow-[0_10px_30px_rgba(102,192,244,0.2)] hover:scale-[1.02] hover:border-[#66c0f4]/50"
        style={{ 
          perspective: "1200px",
          transformStyle: "preserve-3d",
          transformOrigin: "center center"
        }}
      >
        <div className="p-4 w-full h-full transition-transform duration-300 hover:[transform:rotateX(-5deg)_rotateY(5deg)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="h-5 w-5 mr-2 fill-current text-[#66c0f4]">
                <path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.6-76.3-239-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 236.1C10.2 108.4 117.1 8 247.6 8 384.8 8 496 119 496 256zM155.7 384.3l-30.5-12.6a52.79 52.79 0 0 0 27.2 25.8c26.9 11.2 57.8-1.6 69-28.4 5.4-13 5.5-27.3.1-40.3-5.4-13-15.5-23.2-28.5-28.6-12.9-5.4-26.7-5.2-38.9-.6l31.5 13c19.8 8.2 29.2 30.9 20.9 50.7-8.3 19.9-31 29.2-50.8 21zm173.8-129.9c-34.4 0-62.4-28-62.4-62.3s28-62.3 62.4-62.3 62.4 28 62.4 62.3-27.9 62.3-62.4 62.3zm.1-15.6c25.9 0 46.9-21 46.9-46.8 0-25.9-21-46.8-46.9-46.8s-46.9 21-46.9 46.8c.1 25.8 21.1 46.8 46.9 46.8z" />
              </svg>
              Steam Profile
            </h3>
            
            <a 
              href={steamUser.profileurl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#66c0f4] hover:text-[#a4d7f5] text-xs flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={12} />
              View Profile
            </a>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left column - User info */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                {steamUser.avatar && (
                  <img 
                    src={steamUser.avatarfull || steamUser.avatar} 
                    alt={`${steamUser.personaname}'s avatar`}
                    className="w-16 h-16 rounded-md border-2 border-[#66c0f4]/50 shadow-lg shadow-[#66c0f4]/20"
                  />
                )}
                
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center">
                    {steamUser.personaname}
                    {steamUser.personastate !== undefined && (
                      <span 
                        className={`ml-2 inline-block w-2.5 h-2.5 rounded-full ${statusInfo.color}`} 
                        title={statusInfo.text}
                      ></span>
                    )}
                  </h4>
                  
                  <div className="flex items-center text-xs text-gray-400">
                    {steamUsername && (
                      <span className="text-[#66c0f4]">@{steamUsername}</span>
                    )}
                    {steamUser.personastate !== undefined && (
                      <span className="font-medium ml-2">{statusInfo.text}</span>
                    )}
                    {steamUser.lastLogoff && steamUser.personastate === 0 && (
                      <span className="ml-1 text-gray-500">• {formatLastOnline(steamUser.lastLogoff)}</span>
                    )}
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    {/* Games count - Fixed to use actual games count */}
                    <div className="flex items-center text-xs text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="h-3 w-3 mr-1 fill-current text-[#66c0f4]">
                        <path d="M192 64C86 64 0 150 0 256S86 448 192 448H448c106 0 192-86 192-192s-86-192-192-192H192zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24v32h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H216v32c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h32V200z"/>
                      </svg>
                      <span className="font-medium">{actualGamesCount} Games</span>
                    </div>
                    
                    {/* Total playtime */}
                    {steamUser.totalPlaytime !== undefined && steamUser.totalPlaytime > 0 && (
                      <div className="flex items-center text-xs text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-3 w-3 mr-1 fill-current text-[#66c0f4]">
                          <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                        </svg>
                        <span><span className="font-medium text-[#66c0f4]">{formatPlaytime(steamUser.totalPlaytime)}</span></span>
                      </div>
                    )}
                    
                    {/* Recent playtime */}
                    {steamUser.recentPlaytime !== undefined && steamUser.recentPlaytime > 0 && (
                      <div className="flex items-center text-xs text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-3 w-3 mr-1 fill-current text-[#1ed761]">
                          <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                        </svg>
                        <span><span className="font-medium text-[#1ed761]">{formatPlaytime(steamUser.recentPlaytime)}</span> (2w)</span>
                      </div>
                    )}
                    
                    {/* Member since - if available */}
                    {(steamUser as any).timecreated && (
                      <div className="flex items-center text-xs text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-3 w-3 mr-1 fill-current text-[#66c0f4]">
                          <path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v320c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"/>
                        </svg>
                        <span>Since {new Date((steamUser as any).timecreated * 1000).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Recently played games */}
            <div className="flex-1">
              {steamUser.recentlyPlayedGames && steamUser.recentlyPlayedGames.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-300 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-3 w-3 mr-1 fill-current text-[#1ed761]">
                      <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                    </svg>
                    Recently Played ({recentGamesCount})
                  </h5>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {steamUser.recentlyPlayedGames.slice(0, 3).map((game) => (
                      <div key={game.appid} className="flex items-center bg-[#1b2838]/80 p-2 rounded-md hover:bg-[#2a475e]/80 transition-colors">
                        <img 
                          src={getSteamGameImageUrl(game.appid, game.img_icon_url)} 
                          alt={`${game.name} icon`}
                          className="w-8 h-8 mr-2 rounded"
                        />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-medium text-white truncate">{game.name}</div>
                          <div className="text-[10px] text-gray-400">
                            {game.playtime_2weeks !== undefined && (
                              <span className="text-[#1ed761]">
                                {formatPlaytime(game.playtime_2weeks)}
                              </span>
                            )}
                            {game.playtime_2weeks !== undefined && game.playtime_forever > 0 && (
                              <span className="mx-1">•</span>
                            )}
                            {game.playtime_forever > 0 && (
                              <span>{formatPlaytime(game.playtime_forever)} total</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteamProfileCard; 