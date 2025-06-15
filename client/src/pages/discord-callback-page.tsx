import React, { useEffect } from 'react';
import { handleDiscordCallbackInBrowser } from '@/api/discord-callback';

/**
 * Discord OAuth Callback Page
 * 
 * This page handles the callback from Discord OAuth authentication.
 * It processes the authorization code or error and redirects to the settings page.
 */
const DiscordCallbackPage: React.FC = () => {
  useEffect(() => {
    // Process the Discord OAuth callback and redirect
    handleDiscordCallbackInBrowser();
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#111111]">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#A259FF] border-t-transparent animate-spin"></div>
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">Connecting Discord Account...</h1>
        <p className="text-gray-400">Please wait while we process your Discord authentication.</p>
      </div>
    </div>
  );
};

export default DiscordCallbackPage; 