import React, { useEffect, useState } from 'react';
import { formatDiscordUsername, getDiscordAvatarUrl, getDiscordDisplayName } from '@/lib/discord-refresh-helper';

interface DiscordDebugInfoProps {
  discordUser?: any;
  className?: string;
}

/**
 * A debug component for Discord integration that shows relevant data
 * and provides troubleshooting tools
 * 
 * This component is only visible in development environments
 */
export default function DiscordDebugInfo({ discordUser, className = '' }: DiscordDebugInfoProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'status' | 'logs'>('data');
  const [statusResults, setStatusResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storedData, setStoredData] = useState<any>(null);
  const [diagnosticsLoaded, setDiagnosticsLoaded] = useState(false);
  
  // Function to check localStorage data
  const checkLocalStorage = () => {
    try {
      const data = localStorage.getItem('discord_user_data');
      if (data) {
        setStoredData(JSON.parse(data));
      } else {
        setStoredData(null);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
      setStoredData({ error: (error as Error).message });
    }
  };
  
  // Load diagnostics module dynamically to prevent blank pages
  useEffect(() => {
    const loadDiagnostics = async () => {
      try {
        const { logStoredDiscordData } = await import('@/lib/debug-discord');
        const { runDiscordDiagnostics } = await import('@/lib/discord-status-checker');
        
        // Make them available to the component
        (window as any).__discordDiagnostics = {
          logStoredData: logStoredDiscordData,
          runDiagnostics: runDiscordDiagnostics
        };
        
        setDiagnosticsLoaded(true);
      } catch (error) {
        console.warn('Failed to load Discord diagnostics:', error);
      }
    };
    
    loadDiagnostics();
  }, []);
  
  // Load initial data
  useEffect(() => {
    try {
      checkLocalStorage();
      
      // Set up localStorage change listener
      const handleStorageChange = () => {
        checkLocalStorage();
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    } catch (error) {
      console.warn('Error setting up storage listener:', error);
    }
  }, []);
  
  // Check Discord API status
  const checkStatus = async () => {
    if (!diagnosticsLoaded || !(window as any).__discordDiagnostics) {
      console.warn('Discord diagnostics not yet loaded');
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await (window as any).__discordDiagnostics.runDiagnostics();
      setStatusResults(results);
    } catch (error) {
      console.error('Error checking Discord status:', error);
      setStatusResults({ error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear stored Discord data
  const clearStoredData = () => {
    try {
      localStorage.removeItem('discord_user_data');
      checkLocalStorage();
      console.log('Cleared Discord data from localStorage');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };
  
  // Format the avatar URL for display
  const getAvatarUrlForDisplay = () => {
    try {
      if (!discordUser) return 'No user data';
      if (!discordUser.discordId || !discordUser.discordAvatar) return 'No avatar hash';
      
      return getDiscordAvatarUrl(discordUser.discordId, discordUser.discordAvatar);
    } catch (error) {
      return `Error: ${(error as Error).message}`;
    }
  };
  
  // Log stored data to console
  const logData = () => {
    if (!diagnosticsLoaded || !(window as any).__discordDiagnostics) {
      console.warn('Discord diagnostics not yet loaded');
      return;
    }
    
    try {
      (window as any).__discordDiagnostics.logStoredData();
    } catch (error) {
      console.error('Error logging stored data:', error);
    }
  };
  
  // If not in development, don't render anything
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  // Use try-catch to render safely
  try {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm mb-6 ${className}`}>
        <h3 className="text-lg font-bold mb-3 text-primary">Discord Debug Info</h3>
        
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-4 ${activeTab === 'data' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            Data
          </button>
          <button
            onClick={() => {
              setActiveTab('status');
              if (!statusResults && diagnosticsLoaded) checkStatus();
            }}
            className={`py-2 px-4 ${activeTab === 'status' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            API Status
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-4 ${activeTab === 'logs' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            Logs
          </button>
        </div>
        
        {/* Data tab */}
        {activeTab === 'data' && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-2">Current Data (from props)</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Connected:</span> {discordUser ? 'Yes' : 'No'}</p>
                  {discordUser && (
                    <>
                      <p><span className="font-medium">User ID:</span> {discordUser.discordId || 'Not available'}</p>
                      <p><span className="font-medium">Username:</span> {discordUser.discordUsername || 'Not available'}</p>
                      <p><span className="font-medium">Display Name:</span> {getDiscordDisplayName(discordUser) || 'Not available'}</p>
                      <p><span className="font-medium">Global Name:</span> {discordUser.discordGlobalName || 'Not set'}</p>
                      <p><span className="font-medium">Discriminator:</span> {discordUser.discordDiscriminator || '0'}</p>
                      <p><span className="font-medium">Formatted:</span> {formatDiscordUsername(discordUser)}</p>
                      <p><span className="font-medium">Has Avatar:</span> {discordUser.discordAvatar ? 'Yes' : 'No'}</p>
                      <p className="break-all"><span className="font-medium">Avatar URL:</span> {getAvatarUrlForDisplay()}</p>
                      <p><span className="font-medium">Status:</span> {discordUser.discordStatus || 'Not available'}</p>
                      <p><span className="font-medium">Last Update:</span> {discordUser._timestamp ? new Date(discordUser._timestamp).toLocaleString() : 'Unknown'}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Stored Data (localStorage)</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Data Present:</span> {storedData ? 'Yes' : 'No'}</p>
                  {storedData && (
                    <>
                      <p><span className="font-medium">User ID:</span> {storedData.discordId || 'Not available'}</p>
                      <p><span className="font-medium">Username:</span> {storedData.discordUsername || 'Not available'}</p>
                      <p><span className="font-medium">Display Name:</span> {getDiscordDisplayName(storedData) || 'Not available'}</p>
                      <p><span className="font-medium">Avatar Hash:</span> {storedData.discordAvatar || 'None'}</p>
                      <p><span className="font-medium">Timestamp:</span> {storedData._timestamp ? new Date(storedData._timestamp).toLocaleString() : 'None'}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={checkLocalStorage}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                Refresh Data
              </button>
              <button
                onClick={clearStoredData}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
              >
                Clear Data
              </button>
              <button
                onClick={logData}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                disabled={!diagnosticsLoaded}
              >
                Log to Console
              </button>
            </div>
          </div>
        )}
        
        {/* Status tab */}
        {activeTab === 'status' && (
          <div>
            <div className="mb-4">
              <h4 className="font-bold mb-2">Discord API Status</h4>
              {!diagnosticsLoaded ? (
                <p className="text-yellow-500">Loading diagnostics module...</p>
              ) : isLoading ? (
                <p className="text-gray-500">Checking API status...</p>
              ) : statusResults ? (
                <div className="space-y-2">
                  <p><span className="font-medium">Network Connectivity:</span> {statusResults.networkConnectivity ? '✅ Connected' : '❌ Issues'}</p>
                  <p><span className="font-medium">Discord API:</span> {statusResults.apiStatus?.operational ? '✅ Operational' : '❌ Issues'}</p>
                  
                  {statusResults.apiStatus?.issues?.length > 0 && (
                    <div>
                      <p className="font-medium">Issues:</p>
                      <ul className="list-disc pl-5">
                        {statusResults.apiStatus.issues.map((issue: string, i: number) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {statusResults.apiStatus?.endpoints && (
                    <div>
                      <p className="font-medium">Endpoints:</p>
                      <ul className="list-disc pl-5">
                        {Object.entries(statusResults.apiStatus.endpoints).map(([name, data]: [string, any]) => (
                          <li key={name}>
                            {name}: {data.operational ? '✅' : '❌'} (Status: {data.status}, Response time: {data.responseTime || 'N/A'}ms)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {statusResults.recommendations?.length > 0 && (
                    <div>
                      <p className="font-medium">Recommendations:</p>
                      <ul className="list-disc pl-5">
                        {statusResults.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">Checked at: {new Date(statusResults.apiStatus?.checkedAt || Date.now()).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-gray-500">No status information available</p>
              )}
            </div>
            
            <button
              onClick={checkStatus}
              disabled={isLoading || !diagnosticsLoaded}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
            >
              {!diagnosticsLoaded ? 'Loading...' : isLoading ? 'Checking...' : 'Check Discord API Status'}
            </button>
          </div>
        )}
        
        {/* Logs tab */}
        {activeTab === 'logs' && (
          <div>
            <h4 className="font-bold mb-2">Troubleshooting Tips</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Check browser console for detailed logs (F12 &gt; Console)</li>
              <li>Filter console logs with "Discord" to see only Discord-related messages</li>
              <li>Check Network tab to see API requests to Discord endpoints</li>
              <li>
                Test your OAuth URL directly in browser:
                <div className="mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded break-all">
                  {typeof window !== 'undefined' ? `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID || '1350091089398464574'}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 'http://localhost:3000/callback/discord')}&response_type=code&scope=identify` : 'Loading...'}
                </div>
              </li>
              <li>
                Check your environment variables (in .env):
                <div className="mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs">
                  DISCORD_CLIENT_ID=your_client_id<br />
                  DISCORD_CLIENT_SECRET=your_client_secret<br />
                  DISCORD_REDIRECT_URI=http://localhost:3000/callback/discord<br />
                  NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id<br />
                  NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/callback/discord
                </div>
              </li>
            </ul>
            
            <h4 className="font-bold mt-4 mb-2">Common Error Messages</h4>
            <div className="space-y-2">
              <div>
                <p className="font-medium">1. "Failed to authenticate with Discord"</p>
                <ul className="list-disc pl-5">
                  <li>Check if your client secret is correctly set in .env</li>
                  <li>Verify redirect URI matches exactly what's in Discord Developer Portal</li>
                  <li>Check network tab for detailed error response from Discord API</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">2. "Received HTML instead of JSON"</p>
                <ul className="list-disc pl-5">
                  <li>This often indicates network issues or a proxy interfering with requests</li>
                  <li>Try using a different network or disabling proxy/VPN</li>
                  <li>Check if Discord API is experiencing issues</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">3. "Invalid OAuth scope"</p>
                <ul className="list-disc pl-5">
                  <li>Your OAuth URL is requesting scopes Discord doesn't recognize</li>
                  <li>Use only the necessary scopes (identify, email) in your OAuth URL</li>
                  <li>Use the OAuth URL generator utility to create a correct URL</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering Discord debug component:', error);
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm mb-6 ${className}`}>
        <h3 className="text-lg font-bold mb-3 text-primary">Discord Debug Info</h3>
        <p className="text-red-500">Error rendering debug component. Check console for details.</p>
      </div>
    );
  }
} 