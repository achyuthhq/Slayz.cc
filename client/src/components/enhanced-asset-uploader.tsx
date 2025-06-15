import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Music, Image as ImageIcon, MousePointer, X, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { uploadToServer } from "@/lib/firebase";
import { AudioPlayer } from "@/components/audio-player";
import { Theme } from "@shared/schema";
import { MediaUploader } from "@/components/media-uploader";

type AssetType = "logo" | "background" | "audio" | "cursor";

interface EnhancedAssetUploaderProps {
  className?: string;
}

export function EnhancedAssetUploader({ className = "" }: EnhancedAssetUploaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<Record<AssetType, boolean>>({
    logo: false,
    background: false,
    audio: false,
    cursor: false
  });

  if (!user) return null;

  // Handle audio file upload
  const handleAudioFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, audio: true }));

    try {
      console.log("Starting audio upload process");
      // Upload to server
      const songUrl = await uploadToServer(
        file,
        `songs/${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      );

      if (!songUrl) {
        throw new Error("Failed to upload audio file");
      }

      console.log("Audio uploaded to Firebase, updating profile");
      // Update profile with the audio URL
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileSong: file.name,
          profileSongUrl: songUrl,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update audio");
      }

      console.log("Profile updated successfully");
      // Clear the file input
      if (audioRef.current) {
        audioRef.current.value = '';
      }
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      toast({
        title: "Upload successful",
        description: "Your audio has been updated.",
      });
    } catch (error) {
      console.error("Audio upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(prev => ({ ...prev, audio: false }));
    }
  };

  // Handle media upload from MediaUploader component
  const handleMediaUpload = (type: "logo" | "background", url: string) => {
    // Refresh user data
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    
    toast({
      title: "Upload successful",
      description: `Your ${type} has been updated.`,
    });
  };

  // Handle cursor upload
  const handleCursorUpload = (url: string) => {
    // Refresh user data
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    
    toast({
      title: "Upload successful",
      description: "Your cursor has been updated.",
    });
  };

  const removeAsset = async (type: AssetType) => {
    setIsUploading(prev => ({ ...prev, [type]: true }));

    try {
      let payload: any = {};

      if (type === "audio") {
        payload = {
          profileSong: null,
          profileSongUrl: null
        };
      } else if (type === "logo") {
        payload = { logo: null };
      } else if (type === "background") {
        payload = { backgroundImage: null };
      } else if (type === "cursor") {
        const currentTheme = (user.theme as Theme) || {};
        payload = {
          theme: {
            ...currentTheme,
            cursor: {
              enabled: false,
              type: "custom",
              value: "",
            }
          }
        };
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to remove ${type}`);
      }

      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      toast({
        title: "Asset removed",
        description: `Your ${type} has been removed successfully.`,
      });
    } catch (error) {
      console.error(`${type} remove error:`, error);
      toast({
        title: "Failed to remove asset",
        description: error instanceof Error ? error.message : "Failed to remove asset",
        variant: "destructive",
      });
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Get cursor preview style
  const currentTheme = (user.theme as Theme) || {};
  const cursorPreviewStyle = currentTheme.cursor?.enabled && currentTheme.cursor.value
    ? { cursor: `url(${currentTheme.cursor.value}) 0 0, auto` }
    : {};

  // Helper to get file extension from URL
  const getExtensionFromUrl = (url: string | null): string => {
    if (!url) return '';
    const parts = url.split('.');
    if (parts.length <= 1) return '';
    return parts[parts.length - 1].toUpperCase();
  };

  // Helper to check if URL is a video
  const isVideo = (url: string | null): boolean => {
    if (!url) return false;
    const ext = getExtensionFromUrl(url).toLowerCase();
    return ['mp4', 'webm', 'ogg'].includes(ext);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Audio Upload */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Audio</h3>
          <Card className="bg-black/50 border-white/10 overflow-hidden p-0">
            <div className="relative aspect-video bg-black/30 w-full flex items-center justify-center">
              {user.profileSongUrl ? (
                <>
                  <div className="w-full h-full p-3 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg w-full">
                      <audio 
                        src={user.profileSongUrl} 
                        controls 
                        className="w-full h-8" 
                        controlsList="nodownload"
                      />
                    </div>
                    <p className="text-xs text-center mt-2 text-white/60 truncate w-full">
                      {user.profileSong || "Audio Track"}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <div className="text-xs bg-black/60 px-2 py-0.5 rounded">
                      .MP3
                    </div>
                    <button 
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      onClick={() => removeAsset("audio")}
                      disabled={isUploading.audio}
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Music className="w-10 h-10 text-white/40 mx-auto mb-2" />
                  <p className="text-xs text-white/60">No audio selected</p>
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <Input
                type="file"
                accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac,audio/m4a,.mp3,.ogg,.wav,.flac,.aac,.m4a"
                onChange={handleAudioFileUpload}
                className="hidden"
                ref={audioRef}
                disabled={isUploading.audio}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent border-white/10 text-xs"
                onClick={() => audioRef.current?.click()}
                disabled={isUploading.audio}
              >
                {isUploading.audio ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Music className="w-3 h-3 mr-1" />
                )}
                {user.profileSongUrl ? "Change Audio" : "Upload"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Background Upload */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Background</h3>
          <Card className="bg-black/50 border-white/10 overflow-hidden p-0">
            <div className="relative aspect-video bg-black/30 w-full">
              {user.backgroundImage ? (
                <>
                  {isVideo(user.backgroundImage) ? (
                    <video 
                      src={user.backgroundImage} 
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img 
                      src={user.backgroundImage} 
                      alt="Background" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <div className="text-xs bg-black/60 px-2 py-0.5 rounded">
                      .{getExtensionFromUrl(user.backgroundImage)}
                    </div>
                    <button 
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      onClick={() => removeAsset("background")}
                      disabled={isUploading.background}
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-white/40" />
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <MediaUploader 
                type="background"
                onUpload={(url) => handleMediaUpload("background", url)}
              />
            </div>
          </Card>
        </div>

        {/* Profile Avatar Upload */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Profile Avatar</h3>
          <Card className="bg-black/50 border-white/10 overflow-hidden p-0">
            <div className="relative aspect-video bg-black/30 w-full">
              {user.logo ? (
                <>
                  <div className="w-full h-full p-0 flex flex-col items-center justify-center">
                    <img 
                      src={user.logo} 
                      alt="Profile Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <div className="text-xs bg-black/60 px-2 py-0.5 rounded">
                      .{getExtensionFromUrl(user.logo)}
                    </div>
                    <button 
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      onClick={() => removeAsset("logo")}
                      disabled={isUploading.logo}
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-white/40" />
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <MediaUploader 
                type="logo"
                onUpload={(url) => handleMediaUpload("logo", url)}
              />
            </div>
          </Card>
        </div>

        {/* Custom Cursor Upload */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Custom Cursor</h3>
          <Card className="bg-black/50 border-white/10 overflow-hidden p-0">
            <div 
              className="relative aspect-video bg-black/30 w-full flex items-center justify-center"
              style={cursorPreviewStyle}
            >
              {currentTheme.cursor?.enabled && currentTheme.cursor.value ? (
                <>
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="mb-3 relative bg-gradient-to-r from-white/5 to-white/10 p-4 rounded-lg">
                      {/* Static cursor preview with animation */}
                      <div className="absolute left-3 top-3">
                        <img 
                          src={currentTheme.cursor.value} 
                          alt="Cursor Preview" 
                          className="w-6 h-6 opacity-70 animate-pulse"
                          style={{
                            filter: "drop-shadow(0 0 3px rgba(255,255,255,0.3))"
                          }}
                        />
                      </div>
                      <div className="ml-10 text-xs text-white/80">
                        Your custom cursor is active
                      </div>
                    </div>
                    <p className="text-xs text-white/70">Move cursor anywhere in this box to preview</p>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <div className="text-xs bg-black/60 px-2 py-0.5 rounded">
                      .{getExtensionFromUrl(currentTheme.cursor.value) || "CUR"}
                    </div>
                    <button 
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      onClick={() => removeAsset("cursor")}
                      disabled={isUploading.cursor}
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <MousePointer className="w-10 h-10 text-white/40 mx-auto mb-2" />
                    <p className="text-xs text-white/60">No custom cursor selected</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <Input
                type="file"
                accept="image/x-win-bitmap,image/vnd.microsoft.icon,application/x-win-bitmap,application/octet-stream,image/png,image/gif,image/svg+xml,.cur,.ani,.ico,.png,.gif,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  setIsUploading(prev => ({ ...prev, cursor: true }));
                  
                  const formData = new FormData();
                  formData.append("cursor", file);
                  
                  fetch("/api/profile", {
                    method: "PATCH",
                    body: formData,
                    credentials: "include",
                  })
                    .then(response => {
                      if (!response.ok) throw new Error("Failed to upload cursor");
                      return response.json();
                    })
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                      toast({
                        title: "Upload successful",
                        description: "Your cursor has been updated."
                      });
                      e.target.value = "";
                    })
                    .catch(error => {
                      toast({
                        title: "Upload failed",
                        description: error.message,
                        variant: "destructive"
                      });
                    })
                    .finally(() => {
                      setIsUploading(prev => ({ ...prev, cursor: false }));
                    });
                }}
                className="hidden"
                id="cursor-upload"
                disabled={isUploading.cursor}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent border-white/10 text-xs"
                onClick={() => document.getElementById("cursor-upload")?.click()}
                disabled={isUploading.cursor}
              >
                {isUploading.cursor ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <MousePointer className="w-3 h-3 mr-1" />
                )}
                {currentTheme.cursor?.enabled ? "Change" : "Upload Cursor"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 