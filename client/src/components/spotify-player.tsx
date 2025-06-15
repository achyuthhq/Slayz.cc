import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpotify, FaPlay, FaPause } from "react-icons/fa";
import { Slider } from "@/components/ui/slider";

interface SpotifyPlayerProps {
  spotifyUrl: string;
  displayText?: string;
}

export function SpotifyPlayer({ spotifyUrl, displayText = "Favourite Song" }: SpotifyPlayerProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className="bg-black/40 border border-[#1DB954]/30 rounded-lg p-4 backdrop-blur-md shadow-lg
          transition-all duration-300 hover:shadow-[0_10px_30px_rgba(29,185,84,0.2)] hover:scale-[1.02] hover:border-[#1DB954]/50"
        style={{ 
          perspective: "1200px",
          transformStyle: "preserve-3d",
          transformOrigin: "center center"
        }}
      >
        <div className="transition-transform duration-300 hover:[transform:rotateX(-5deg)_rotateY(5deg)]">
          <div className="flex items-center gap-2 mb-4">
            <FaSpotify className="h-5 w-5 text-[#1DB954]" />
            <h2 className="text-lg font-semibold text-white">{displayText}</h2>
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <iframe
              src={`https://open.spotify.com/embed/${spotifyUrl.split('.com/')[1]}`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg bg-transparent spotify-player"
              style={{
                '--spotify-theme-color': 'transparent',
                '--spotify-text-color': 'white',
                '--spotify-border-color': 'rgba(29, 185, 84, 0.2)',
              } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpotifyPlayer;