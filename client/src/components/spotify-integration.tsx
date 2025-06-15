import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Music, Instagram, Twitter, Globe } from "lucide-react";

interface SpotifyData {
  type: "track" | "album" | "artist";
  id: string;
  title?: string;
  artist?: string;
  imageUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export function SpotifyIntegration() {
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  const { toast } = useToast();

  const validateAndParseSpotifyUrl = (url: string) => {
    const spotifyRegex = /^https:\/\/open\.spotify\.com\/(track|album|artist)\/([a-zA-Z0-9]+)/;
    const match = url.match(spotifyRegex);
    
    if (!match) {
      return null;
    }

    return {
      type: match[1] as "track" | "album" | "artist",
      id: match[2]
    };
  };

  const handleSpotifyUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setSpotifyUrl(url);

    // Only process if the URL is a valid Spotify URL
    const parsedData = validateAndParseSpotifyUrl(url);
    if (!parsedData) {
      setSpotifyData(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/spotify/${parsedData.type}/${parsedData.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch Spotify data");
      }
      const data = await response.json();
      setSpotifyData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Spotify content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium">Spotify Link</label>
        <Input
          value={spotifyUrl}
          onChange={handleSpotifyUrlChange}
          placeholder="Paste Spotify track, album, or artist link"
          className="w-full"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin">
            <Music className="w-8 h-8" />
          </div>
        </div>
      )}

      {spotifyData && (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {spotifyData.imageUrl && (
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden">
                <img
                  src={spotifyData.imageUrl}
                  alt={spotifyData.title || "Spotify Content"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{spotifyData.title}</h3>
                {spotifyData.artist && (
                  <p className="text-white/70">{spotifyData.artist}</p>
                )}
              </div>

              {spotifyData.socialLinks && (
                <div className="flex gap-3">
                  {spotifyData.socialLinks.instagram && (
                    <a
                      href={spotifyData.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {spotifyData.socialLinks.twitter && (
                    <a
                      href={spotifyData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {spotifyData.socialLinks.website && (
                    <a
                      href={spotifyData.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              <div className="w-full">
                <iframe
                  src={`https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}`}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="encrypted-media"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}