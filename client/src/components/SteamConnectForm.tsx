import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { extractSteamId } from '../lib/steam-helper';
import { FaSteam } from 'react-icons/fa';
import { X } from 'lucide-react';

interface SteamConnectFormProps {
  onSuccess?: (steamData: any) => void;
  onError?: (error: any) => void;
  onDisconnect?: () => void;
}

const SteamConnectForm: React.FC<SteamConnectFormProps> = ({ onSuccess, onError, onDisconnect }) => {
  const [steamUrl, setSteamUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showSteamIdHelp, setShowSteamIdHelp] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isRetryDisabled, setIsRetryDisabled] = useState(false);

  // Handle cooldown timer for rate limiting
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setIsRetryDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDebugInfo(null);
    
    if (!steamUrl.trim()) {
      setError('Please enter your Steam profile URL');
      return;
    }
    
    // Extract Steam ID from URL
    const steamId = extractSteamId(steamUrl);
    
    if (!steamId) {
      setError('Invalid Steam URL format. Please use your profile URL (steamcommunity.com/id/username or steamcommunity.com/profiles/numbers)');
      return;
    }

    // Show what we extracted for debugging purposes
    setDebugInfo(`Extracted Steam ID: ${steamId}`);
    
    try {
      setIsLoading(true);
      
      // Send request to connect Steam account
      const response = await axios.post('/api/auth/steam/connect', { steamId });
      
      if (response.data.success) {
        setSuccess('Steam account connected successfully!');
        setSteamUrl('');
        
        if (onSuccess) {
          onSuccess(response.data.steamUser);
        }
        
        // Use callback instead of page reload to update the UI
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response.data.steamUser);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error connecting Steam account:', error);
      
      // Extract error message from response if available
      const errorMessage = error.response?.data?.error || 
                          'Failed to connect Steam account. Please make sure your Steam profile is public.';
      
      // Special handling for rate limit errors
      if (error.response?.status === 429) {
        // Set a 60-second cooldown for rate limit errors
        setCooldownTime(60);
        setIsRetryDisabled(true);
        
        setError(
          'Steam API rate limit reached. Please wait before trying again. ' +
          'Steam restricts how many requests can be made to their API in a short period. ' +
          'The retry button will be enabled in 60 seconds.'
        );
      } else if (errorMessage.includes('Steam user not found') || errorMessage.includes('Could not resolve Steam username')) {
        setError(errorMessage);
        // Show the Steam ID help section
        setShowSteamIdHelp(true);
      } else {
        setError(errorMessage);
      }
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      // Send request to disconnect Steam account
      const response = await axios.post('/api/auth/steam/disconnect');
      
      if (response.data.success) {
        setSuccess('Steam account disconnected successfully!');
        
        // Use callback instead of page reload
        if (onDisconnect) {
          setTimeout(() => {
            onDisconnect();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error disconnecting Steam account:', error);
      setError('Failed to disconnect Steam account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="steamUrl" className="block text-sm font-medium text-gray-200">
            Steam Profile URL
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="steamUrl"
              name="steamUrl"
              value={steamUrl}
              onChange={(e) => setSteamUrl(e.target.value)}
              placeholder="https://steamcommunity.com/id/username"
              className="flex-1 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-white focus:border-[#66c0f4] focus:ring-[#66c0f4] sm:text-sm"
              disabled={isLoading || isRetryDisabled}
            />
          </div>
          <div className="mt-1 text-xs text-gray-400">
            <p>We support both URL formats:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>steamcommunity.com/id/YOUR_USERNAME</li>
              <li>steamcommunity.com/profiles/76561198012345678</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className={`inline-flex w-fit items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 ${
              isRetryDisabled 
                ? 'bg-gradient-to-r from-[#171a21] to-[#66c0f4] opacity-60 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#171a21] to-[#66c0f4] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(102,192,244,0.3)]'
            }`}
            disabled={isLoading || isRetryDisabled}
          >
            <FaSteam className="h-5 w-5" />
            {isLoading ? 'Connecting...' : isRetryDisabled ? `Retry in ${cooldownTime}s` : 'Connect Steam'}
          </button>
        </div>
      </form>
      
      {debugInfo && (
        <div className="rounded-md bg-gray-800 p-4 border border-gray-700">
          <div className="text-xs text-gray-300 font-mono">
            {debugInfo}
          </div>
        </div>
      )}
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {error.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
                ))}
                {error.includes('rate limit') && (
                  <div className="mt-2 p-2 bg-red-100 rounded">
                    <p className="font-semibold">Why this happens:</p>
                    <p>Steam limits how many API requests can be made in a short time period.
                    The system will automatically allow you to retry after a brief cooldown period.</p>
                    
                    <div className="mt-2 flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.max(0, (60 - cooldownTime) / 60 * 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {cooldownTime > 0 ? `${cooldownTime}s` : 'Ready'}
                      </span>
                    </div>
                  </div>
                )}
                {(error.includes('Steam user not found') || error.includes('Could not resolve Steam username')) && (
                  <div className="mt-2 p-2 bg-red-100 rounded">
                    <p className="font-semibold">Common solutions:</p>
                    <ol className="list-decimal ml-5 mt-1">
                      <li>Make sure your Steam profile privacy settings are set to "Public"</li>
                      <li>Try using the numeric Steam ID format instead of the custom URL</li>
                      <li>Check if you can access your profile in an incognito browser window</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <p className="mt-2 text-sm text-amber-400">
          <strong>Important:</strong> Make sure your Steam profile is set to public in your privacy settings.
        </p>
        
        {(showSteamIdHelp || error?.includes('numeric Steam ID')) && (
          <div className="mt-4 p-3 bg-gray-800 rounded border border-blue-700">
            <h5 className="text-sm font-medium text-white">How to find your numeric Steam ID:</h5>
            <ol className="mt-2 list-decimal pl-5 text-sm text-gray-400">
              <li>Go to <a href="https://steamid.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">steamid.io</a></li>
              <li>Enter your Steam profile URL or custom URL</li>
              <li>Look for the "steamID64" value (a 17-digit number)</li>
              <li>Copy this number and use it in the format: <span className="text-blue-300">steamcommunity.com/profiles/YOUR_STEAMID64</span></li>
            </ol>
            <p className="mt-2 text-xs text-gray-500">
              The numeric Steam ID is more reliable for connecting your account, especially if you have a custom URL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SteamConnectForm; 