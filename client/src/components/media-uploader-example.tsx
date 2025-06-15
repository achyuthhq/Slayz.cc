import { useState } from "react";
import { MediaUploader } from "@/components/media-uploader";
import { Card } from "@/components/ui/card";

export function MediaUploaderExample() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  // Helper to check if URL is a video
  const isVideo = (url: string | null): boolean => {
    if (!url) return false;
    const ext = url.split('.').pop()?.toLowerCase();
    return ['mp4', 'webm', 'ogg'].includes(ext || '');
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Logo Upload Example</h2>
        <div className="flex gap-6">
          <div className="w-1/3">
            <MediaUploader 
              type="logo" 
              onUpload={(url) => setLogoUrl(url)} 
            />
          </div>
          <Card className="flex-1 p-4 bg-black/50 border-white/10">
            <h3 className="text-lg mb-4">Preview</h3>
            {logoUrl ? (
              <div className="flex items-center justify-center p-4 bg-black/30 rounded-lg">
                <img 
                  src={logoUrl} 
                  alt="Logo Preview" 
                  className="max-h-40 object-contain" 
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 bg-black/30 rounded-lg text-white/50">
                No logo uploaded yet
              </div>
            )}
            {logoUrl && (
              <div className="mt-4 text-sm text-white/70">
                <p>URL: {logoUrl}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Background Upload Example</h2>
        <div className="flex gap-6">
          <div className="w-1/3">
            <MediaUploader 
              type="background" 
              onUpload={(url) => setBackgroundUrl(url)} 
            />
          </div>
          <Card className="flex-1 p-4 bg-black/50 border-white/10">
            <h3 className="text-lg mb-4">Preview</h3>
            {backgroundUrl ? (
              <div className="flex items-center justify-center p-4 bg-black/30 rounded-lg">
                {isVideo(backgroundUrl) ? (
                  <video 
                    src={backgroundUrl} 
                    className="max-h-60 w-full object-contain" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    controls
                  />
                ) : (
                  <img 
                    src={backgroundUrl} 
                    alt="Background Preview" 
                    className="max-h-60 w-full object-contain" 
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 bg-black/30 rounded-lg text-white/50">
                No background uploaded yet
              </div>
            )}
            {backgroundUrl && (
              <div className="mt-4 text-sm text-white/70">
                <p>URL: {backgroundUrl}</p>
                <p>Type: {isVideo(backgroundUrl) ? "Video" : "Image"}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 