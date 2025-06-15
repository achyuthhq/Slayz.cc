import { useState, useEffect, useRef } from 'react';
import { DiscordStatus } from '../types/discord';

interface UseDiscordStatusOptions {
  discordId: string | undefined | null;
  enabled?: boolean;
  refreshInterval?: number; // in milliseconds
  fallbackStatus?: DiscordStatus; // Fallback status if API fails
}

interface UseDiscordStatusResult {
  status: DiscordStatus | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  lastUpdated: Date | null;
  isFallback: boolean; // Indicates if we're using fallback status
}

// Local cache to reduce unnecessary API calls
const statusCache = new Map<string, { status: DiscordStatus, timestamp: number }>();

/**
 * React hook to fetch and manage Discord status
 * @param options Configuration options
 * @returns Discord status data and utilities
 */
export function useDiscordStatus({
  discordId,
  enabled = true,
  refreshInterval = 60000, // 1 minute by default
  fallbackStatus = 'offline' // Default to offline for accuracy
}: UseDiscordStatusOptions): UseDiscordStatusResult {
  const [status, setStatus] = useState<DiscordStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  // Function to fetch the Discord status
  const fetchStatus = async () => {
    // Skip if no Discord ID or not enabled
    if (!discordId || !enabled) return;

    // Check cache first (valid for 30 seconds)
    const cached = statusCache.get(discordId);
    const now = Date.now();
    if (cached && (now - cached.timestamp < 30000)) {
      console.log(`[Discord Status] Using cached status for ID ${discordId}: ${cached.status}`);
      setStatus(cached.status);
      setLastUpdated(new Date(cached.timestamp));
      setIsFallback(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[Discord Status] Fetching status for ID ${discordId}...`);
      const response = await fetch(`/api/discord/status?discordId=${discordId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[Discord Status] Received status: ${data.status}`);
      
      // Only update state if the component is still mounted
      if (isMounted.current) {
        const currentTime = new Date();
        setStatus(data.status);
        setLastUpdated(currentTime);
        setIsFallback(false);
        
        // Update cache
        statusCache.set(discordId, {
          status: data.status,
          timestamp: currentTime.getTime()
        });
      }
    } catch (err) {
      console.error('[Discord Status] Error fetching status:', err);
      
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // Use fallback status if provided and we don't already have a status
        if (fallbackStatus) {
          console.log(`[Discord Status] Using fallback status: ${fallbackStatus}`);
          setStatus(fallbackStatus);
          setIsFallback(true);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Fetch status on mount and when dependencies change
  useEffect(() => {
    if (enabled && discordId) {
      fetchStatus();
    } else if (!enabled && fallbackStatus) {
      // Use fallback status when disabled
      setStatus(fallbackStatus);
      setIsFallback(true);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [discordId, enabled, fallbackStatus]);

  // Set up interval for refreshing
  useEffect(() => {
    if (!enabled || !discordId || refreshInterval <= 0) return;

    const intervalId = setInterval(fetchStatus, refreshInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [discordId, enabled, refreshInterval]);

  return {
    status,
    isLoading,
    error,
    refresh: fetchStatus,
    lastUpdated,
    isFallback
  };
} 