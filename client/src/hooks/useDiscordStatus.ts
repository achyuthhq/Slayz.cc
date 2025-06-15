import { useState, useEffect } from 'react';
import { DiscordStatus } from '../types/discord';

interface UseDiscordStatusOptions {
  discordId: string | undefined | null;
  enabled?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseDiscordStatusResult {
  status: DiscordStatus | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

/**
 * React hook to fetch and manage Discord status
 * @param options Configuration options
 * @returns Discord status data and utilities
 */
export function useDiscordStatus({
  discordId,
  enabled = true,
  refreshInterval = 60000 // 1 minute by default
}: UseDiscordStatusOptions): UseDiscordStatusResult {
  const [status, setStatus] = useState<DiscordStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to fetch the Discord status
  const fetchStatus = async () => {
    // Skip if no Discord ID or not enabled
    if (!discordId || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[Discord Status] Fetching status for ID ${discordId}...`);
      const response = await fetch(`/api/discord/status?discordId=${discordId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[Discord Status] Received status: ${data.status}`);
      
      setStatus(data.status);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[Discord Status] Error fetching status:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch status on mount and when dependencies change
  useEffect(() => {
    if (enabled && discordId) {
      fetchStatus();
    }
  }, [discordId, enabled]);

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
    lastUpdated
  };
} 