import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Theme } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface AudioPlayerProps {
  url?: string;
  autoPlay?: boolean;
  showEnterFeature?: boolean;
  enterPageSettings?: Theme["enterPage"];
}

export function AudioPlayer({ 
  url, 
  autoPlay = false, 
  showEnterFeature = false,
  enterPageSettings
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showEnterButton, setShowEnterButton] = useState(showEnterFeature);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    setShowEnterButton(showEnterFeature);
  }, [showEnterFeature]);

  useEffect(() => {
    if (autoPlay && !showEnterButton && audioRef.current && url) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [autoPlay, showEnterButton, url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleEnter = () => {
    const enterPageElement = document.getElementById("enter-page");
    if (enterPageElement) {
      const exitClass = enterPageSettings?.animation === 'fade' ? 'opacity-0' : 
                      enterPageSettings?.animation === 'scale' ? 'scale-110 opacity-0' : 
                      enterPageSettings?.animation === 'slide' ? 'translate-y-[-20px] opacity-0' : 
                      'opacity-0';

      enterPageElement.classList.add('translate-y-[-20px]', 'opacity-0');
      enterPageElement.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      enterPageElement.style.transform = 'translateZ(0)';

      setTimeout(() => {
        setShowEnterButton(false);
        if (autoPlay && audioRef.current && url) {
          audioRef.current.play().catch(() => {
            setIsPlaying(false);
          });
        }
      }, 600);
    } else {
      setShowEnterButton(false);
      if (autoPlay && audioRef.current && url) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  };

  // Show enter page regardless of audio URL if feature is enabled
  if (showEnterFeature && showEnterButton) {
    const isEnabled = enterPageSettings?.enabled !== false;

    if (isEnabled) {
      const getAnimationClass = () => {
        switch (enterPageSettings?.animation) {
          case 'fade':
            return 'animate-fade-in';
          case 'scale':
            return 'animate-scale-in';
          case 'slide':
            return 'animate-slide-up';
          default:
            return '';
        }
      };

      return (
        <div 
          id="enter-page"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer" 
          onClick={handleEnter}
        >
          <div 
            className={`transition-all duration-300 hover:opacity-80 ${getAnimationClass()}`}
            style={{
              fontSize: enterPageSettings?.fontSize || "2rem",
              fontWeight: enterPageSettings?.fontWeight || "bold",
              color: enterPageSettings?.textColor || "#ffffff",
            }}
          >
            {enterPageSettings?.text || "Enter Page"}
          </div>
          {enterPageSettings?.customCSS && (
            <style dangerouslySetInnerHTML={{ __html: enterPageSettings.customCSS }} />
          )}
        </div>
      );
    }

    return (
      <div 
        id="enter-page"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={handleEnter}
      >
        <Button 
          variant="ghost"
          size="lg" 
          className="px-8 py-6 text-2xl font-semibold text-white hover:text-white/90 transition-all duration-300 hover:scale-105"
        >
          Enter Page
        </Button>
      </div>
    );
  }

  // Only render audio player if URL is provided
  if (!url) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <audio
        ref={audioRef}
        src={url}
        loop
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      <div 
        className="relative"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => setExpanded(!expanded)}
      >
        <Card className="flex items-center justify-center w-10 h-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          {isPlaying ? (
            <Pause className="h-4 w-4 text-white" onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
          ) : (
            <Play className="h-4 w-4 text-white" onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
          )}
        </Card>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="absolute left-10 top-0 overflow-hidden"
            >
              <Card className="flex items-center gap-2 ml-2 h-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full pl-3 pr-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-white/10 p-0"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-3 w-3 text-white" />
                  ) : (
                    <Volume2 className="h-3 w-3 text-white" />
                  )}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[volume]}
                    min={0}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                    onValueChange={(value) => setVolume(value[0])}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}