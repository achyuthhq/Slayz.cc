import React, { useEffect, useState, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, SocialLink, Theme, PageView } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Eye, Clock, User as UserIcon, BookOpen, Users, Copy, ExternalLink } from "lucide-react";
import { DocumentTitle } from "@/components/document-title";
import { BadgeDisplay, badges } from "@/components/badge-display";
import {
  FaGithub,
  FaGitlab,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaBitcoin,
  FaTelegram,
  FaTwitter,
  FaDiscord,
  FaFacebook,
  FaSpotify,
  FaTwitch,
  FaReddit,
  FaMedium,
  FaGlobe,
  FaPlaystation,
  FaXbox,
  FaSteam,
  FaItunes,
  FaApple,
  FaAmazon,
  FaSoundcloud,
  FaBandcamp,
  FaPatreon,
  FaKickstarter,
  FaPaypal,
  FaEtsy,
  FaPinterest,
  FaSlack,
  FaSnapchat,
  FaLine,
  FaVimeo,
  FaDailymotion,
  FaSkype,
} from "react-icons/fa";
import { SiTether, SiSubstack, SiLitecoin, SiKofi, SiEthereum, SiDogecoin } from "react-icons/si";
import { AiFillInstagram } from "react-icons/ai";
import { ParticlesComponent } from "@/components/particles";
import "@fontsource/roboto";
import "@fontsource/lato";
import "@fontsource/poppins";
import "@fontsource/montserrat";
import "@fontsource/unbounded";
import "@fontsource/dm-sans";
import { ChatBot } from "@/components/chat-bot";
import { DecorationPreview } from "@/components/decoration-preview";
import { TypingAnimation } from "@/components/typing-animation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import SpotifyPlayer from "@/components/spotify-player";
import { getQueryFn } from "@/lib/queryClient";
import { SparkleName } from "@/components/sparkle-name";
import { AudioPlayer } from "@/components/audio-player";
import { ShinyButton } from "@/components/ui/shiny-button";
import { AnimatedDiscordCard } from "@/components/discord-integration-card";
import { toast } from "@/hooks/use-toast";
import { toDiscordUser, hasDiscordConnected, toGitHubUser, hasGitHubConnected, toSteamUser, hasSteamConnected, safeString } from "@/types/user";
import { MotionWrapper, MotionImage } from "@/components/ui/motion-wrapper";
import SteamProfileCard from "@/components/SteamProfileCard";

const ICON_MAP: Record<
  string,
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }
> = {
  github: { icon: FaGithub, color: "#ffffff" },
  gitlab: { icon: FaGitlab, color: "#FC6D26" },
  linkedin: { icon: FaLinkedin, color: "#0077B5" },
  instagram: { icon: AiFillInstagram, color: "#E4405F" },
  youtube: { icon: FaYoutube, color: "#FF0000" },
  tiktok: { icon: FaTiktok, color: "#000000" },
  bitcoin: { icon: FaBitcoin, color: "#F7931A" },
  ethereum: { icon: SiEthereum, color: "#3C3C3D" },
  dogecoin: { icon: SiDogecoin, color: "#C2A633" },
  litecoin: { icon: SiLitecoin, color: "#345D9D" },
  usdt: { icon: SiTether, color: "#26A17B" },
  telegram: { icon: FaTelegram, color: "#0088cc" },
  twitter: { icon: FaTwitter, color: "#1DA1F2" },
  discord: { icon: FaDiscord, color: "#5865F2" },
  facebook: { icon: FaFacebook, color: "#1877F2" },
  spotify: { icon: FaSpotify, color: "#1DB954" },
  twitch: { icon: FaTwitch, color: "#9146FF" },
  reddit: { icon: FaReddit, color: "#FF4500" },
  medium: { icon: FaMedium, color: "#000000" },
  substack: { icon: SiSubstack, color: "#FF6719" },
  playstation: { icon: FaPlaystation, color: "#003791" },
  xbox: { icon: FaXbox, color: "#107C10" },
  skype: { icon: FaSkype, color: "#00AFF0" },
  steam: { icon: FaSteam, color: "#000000" },
  itunes: { icon: FaItunes, color: "#FB2BC4" },
  apple: { icon: FaApple, color: "#A2AAAD" },
  amazon: { icon: FaAmazon, color: "#FF9900" },
  soundcloud: { icon: FaSoundcloud, color: "#FF3300" },
  bandcamp: { icon: FaBandcamp, color: "#629aa9" },
  patreon: { icon: FaPatreon, color: "#FF424D" },
  kofi: { icon: SiKofi, color: "#FF5E5B" },
  kickstarter: { icon: FaKickstarter, color: "#05CE78" },
  paypal: { icon: FaPaypal, color: "#00457C" },
  etsy: { icon: FaEtsy, color: "#F45800" },
  pinterest: { icon: FaPinterest, color: "#E60023" },
  slack: { icon: FaSlack, color: "#4A154B" },
  snapchat: { icon: FaSnapchat, color: "#FFFC00" },
  line: { icon: FaLine, color: "#00B900" },
  vimeo: { icon: FaVimeo, color: "#1AB7EA" },
  dailymotion: { icon: FaDailymotion, color: "#0066DC" },
  website: { icon: FaGlobe, color: "#FFFFFF" },
};

// Update the SocialIcon component with better favicon handling
const SocialIcon: React.FC<{
  link: SocialLink;
  user: User & { theme: Theme };
  onClick: () => void;
}> = ({ link, user, onClick }) => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFavicon = async () => {
      if (!link.url) return;
      try {
        const domain = new URL(link.url).origin;
        const possibleFaviconUrls = [
          `${domain}/favicon.ico`,
          `${domain}/favicon.png`,
          `${domain}/apple-touch-icon.png`,
          `${domain}/apple-touch-icon-precomposed.png`,
        ];

        for (const faviconUrl of possibleFaviconUrls) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(faviconUrl, {
              mode: 'no-cors',
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok || response.type === 'opaque') {
              setFaviconUrl(faviconUrl);
              return;
            }
          } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') {
              console.log('Favicon fetch timed out');
            }
            continue;
          }
        }

        setError(true);
      } catch (e) {
        setError(true);
      }
    };

    fetchFavicon();
  }, [link.url]);

  const iconConfig = ICON_MAP[link.icon || "website"];
  const isCustomUrl = !iconConfig || link.icon === "website";

  if (isCustomUrl && faviconUrl && !error) {
    return (
      <img
        src={faviconUrl}
        alt={link.title || "Website"}
        className="w-10 h-10 transition-all duration-200 hover:scale-110"
        style={{
          filter: `drop-shadow(0 0 5px #FFFFFFD0) drop-shadow(0 0 10px #FFFFFF90)`,
        }}
        onClick={onClick}
      />
    );
  }

  const IconComponent = iconConfig?.icon || FaGlobe;
  const color = iconConfig?.color || "#FFFFFF";
  const isMonoMode = user.theme?.socialIcons?.colorMode === "mono";
  const monoColor = user.theme?.socialIcons?.monoColor || "#ffffff";
  const displayColor = isMonoMode ? monoColor : color;
  
  // Get glow enabled status from theme (default to true if not specified)
  const glowEnabled = user.theme?.socialIcons?.glowEnabled !== false;
  
  // Create a more intense glow effect with smaller radius
  const glowFilter = glowEnabled 
    ? `drop-shadow(0 0 5px ${displayColor}D0) drop-shadow(0 0 10px ${displayColor}90)` 
    : "none";

  return (
    <IconComponent
      className="w-10 h-10 transition-all duration-200 hover:scale-110"
      style={{
        color: displayColor,
        filter: glowFilter,
      }}
      onClick={onClick}
    />
  );
};

const formatLastOnline = (timestamp: number | Date | null | undefined) => {
  if (!timestamp) return "Never";
  
  try {
    if (timestamp instanceof Date) {
      return format(timestamp, "MMM d, yyyy 'at' h:mm a");
    }
    
    if (typeof timestamp === 'number') {
      // Handle Unix timestamp (seconds since epoch)
      if (timestamp < 10000000000) {
        return format(new Date(timestamp * 1000), "MMM d, yyyy 'at' h:mm a");
      }
      // Handle JavaScript timestamp (milliseconds since epoch)
      return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
    }
    
    // If it's a string or any other type, try to parse it
    const date = new Date(timestamp as any);
    if (isNaN(date.getTime())) {
      return "Unknown";
    }
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Unknown";
  }
};

// Helper function to safely parse JSON and handle Discord activity
const getDiscordActivityName = (activity: any): string => {
  if (!activity) return '';
  
  if (typeof activity === 'string') {
    try {
      const parsed = JSON.parse(activity);
      return parsed?.name || '';
    } catch (e) {
      return '';
    }
  }
  
  return activity?.name || '';
};

const getDiscordActivityDetails = (activity: any): string => {
  if (!activity) return '';
  
  if (typeof activity === 'string') {
    try {
      const parsed = JSON.parse(activity);
      return parsed?.details || '';
    } catch (e) {
      return '';
    }
  }
  
  return activity?.details || '';
};

// Helper function to check if a URL is a video file
const isVideoURL = (url: string | null): boolean => {
  if (!url) return false;
  const extensions = ['mp4', 'webm', 'ogg'];
  const urlLower = url.toLowerCase();
  return extensions.some(ext => urlLower.endsWith(`.${ext}`));
};

const generateStyles = (user: User & { theme: Theme }) => {
  const styles = {
    container: {
      minHeight: "90vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      position: "relative" as const,
      cursor: user.theme?.cursor?.enabled
        ? `url(${user.theme.cursor.value}) 0 0, auto`
        : "default",
    },
    background: {} as React.CSSProperties,
    content: {
      textAlign: user.theme?.layout?.alignment || "center",
      padding:
        user.theme?.layout?.spacing === "compact"
          ? "1rem"
          : user.theme?.layout?.spacing === "spacious"
            ? "3rem"
            : "2rem",
    },
    text: {
      fontFamily: user.theme?.font?.family
        ? `var(--font-${user.theme.font.family})`
        : "var(--font-sans)",
      fontSize: user.theme?.font?.size
        ? `var(--font-size-${user.theme.font.size})`
        : "inherit",
      fontWeight: user.theme?.font?.weight || "normal",
    },
  };

  if (user.theme?.background) {
    if (user.theme.background.type === "color") {
      styles.background = {
        backgroundColor: user.theme.background.value,
      };
    } else if (user.theme.background.type === "gradient") {
      const start = user.theme.background.gradientStart || "#000000";
      const end = user.theme.background.gradientEnd || "#ffffff";
      styles.background = {
        background: `linear-gradient(to right, ${start}, ${end})`,
      };
    }
  }

  return styles;
};

const handleCopyAddress = (address: string) => {
  navigator.clipboard.writeText(address);
  toast({
    title: "Address copied",
    description: "Crypto address copied to clipboard",
  });
};

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "online":
      return "bg-green-500";
    case "idle":
      return "bg-yellow-500";
    case "dnd":
      return "bg-red-500";
    case "invisible":
    case "offline":
    default:
      return "bg-gray-500";
  }
}

export default function ProfilePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { username } = useParams();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState({
    logo: false,
    background: false,
  });

  const { data: userData, isError: isUserDataError } = useQuery<{
    user: User & { theme: Theme };
    links: SocialLink[];
    viewCount: number;
  }>({
    queryKey: [`/api/profile/${username}`],
  });

  const { data: analyticsData } = useQuery({
    queryKey: [`/api/analytics/${username}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: false,
    enabled: !!username,
  });

  useEffect(() => {
    if (isUserDataError) {
      toast({
        title: "Error loading profile",
        description: "Could not load profile data",
        variant: "destructive",
      });
    }
  }, [isUserDataError, toast]);

  const { user, links = [], viewCount = 0 } = userData?.user
    ? userData
    : { user: null, links: [], viewCount: 0 };
  const displayName = user?.displayName || user?.username || "";
  const styles = user
    ? generateStyles(user)
    : { container: {}, background: {}, content: {}, text: {} };
  const chatbotEnabled = user?.theme?.chatbot?.enabled ?? false;
  const chatbotSettings = user?.theme?.chatbot;
  const particleEffect = user?.theme?.particleEffect || {
    enabled: false,
    mode: "particles" as const,
    quantity: 50,
    speed: 1,
    size: 3,
    direction: "none" as const,
  };

  useEffect(() => {
    if (!user) return;
    let titleText = `${displayName}`;
    let currentIndex = 0;
    let isDeleting = false;

    const intervalId = setInterval(() => {
      if (!isDeleting) {
        document.title = titleText.substring(0, currentIndex + 1);
        currentIndex++;
        if (currentIndex === titleText.length) {
          setTimeout(() => {
            isDeleting = true;
          }, 2000);
        }
      } else {
        document.title = titleText.substring(0, currentIndex);
        currentIndex--;
        if (currentIndex === 0) {
          isDeleting = false;
          setTimeout(() => {}, 500);
        }
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [displayName]);

  const userBadges = user?.theme?.badges || [];
  const earnedBadges = badges.filter((badge) => userBadges.includes(badge.id));

  const cardRef = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(0, {
    stiffness: 100,
    damping: 15,
    mass: 0.1,
    restSpeed: 0.001,
  });

  const rotateY = useSpring(0, {
    stiffness: 100,
    damping: 15,
    mass: 0.1,
    restSpeed: 0.001,
  });

  const scale = useSpring(1, {
    stiffness: 100,
    damping: 15,
    mass: 0.1,
    restSpeed: 0.001,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
  
    const { left, top, width, height } = card.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
  
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
  
    requestAnimationFrame(() => {
      const rotateXValue = (deltaY / height) * 15;
      const rotateYValue = (-deltaX / width) * 15;
  
      rotateX.set(rotateXValue);
      rotateY.set(rotateYValue);
      scale.set(1.02);
    });
  };
  

  const handleMouseLeave = () => {
    requestAnimationFrame(() => {
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1);
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h1 className="text-xl font-mono">Profile not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <DocumentTitle title={displayName ? displayName.toString() : ""} />
      {user?.profileSongUrl ? (
  <AudioPlayer
    url={String(user.profileSongUrl)}
    autoPlay={true}
    showEnterFeature={true}
    enterPageSettings={user?.theme?.enterPage}
  />
) : null}
      {particleEffect?.enabled && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <ParticlesComponent
            className="w-full h-full"
            quantity={particleEffect.quantity || 50}
            speed={particleEffect.speed || 1}
            size={particleEffect.size || 3}
            color={particleEffect.color || "#ffffff"}
          />
        </div>
      )}
{user?.backgroundImage ? (
  <div
    className="fixed inset-0 z-0 overflow-hidden"
    style={styles.background}
  >
    <div className="absolute inset-0 w-full h-full">
    {isVideoURL(user.backgroundImage as string) ? (
  <video
    src={user.backgroundImage as string}
    className="w-full h-full object-cover fixed"
    style={{ opacity: 1 }}
    autoPlay
    loop
    muted
    playsInline
  >
    Your browser does not support the video tag.
  </video>
      ) : (
        <img
        src={user.backgroundImage as string}
          alt={`${user.displayName || "User"}'s background`}
          className="w-full h-full object-cover fixed"
          style={{
            opacity: imageLoaded.background ? 0.5 : 0,
            transition: "opacity 0.5s ease",
          }}
          onLoad={() =>
            setImageLoaded((prev) => ({ ...prev, background: true }))
          }
        />
      )}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    </div>
  </div>
) : null}


      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <motion.div<HTMLDivElement>
  ref={cardRef}
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
  style={{
    rotateX,
    rotateY,
    scale,
    transformPerspective: "1200px",
    ...styles.content,
    boxSizing: "border-box",
    justifyContent: "space-between",
    willChange: "transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: "translateZ(0)",
    WebkitTransform: "translateZ(0)",
    transformStyle: "preserve-3d",
    WebkitTransformStyle: "preserve-3d",
  }}
  className="rounded-xl bg-black/25 border border-white/10 py-12 px-6 backdrop-blur-xl relative w-full max-w-[600px] mx-auto min-h-[520px] sm:min-h-[450px] transition-colors duration-300 ease-in-out hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:border-white/30"
>
          <div
            className={`absolute flex items-center gap-2 text-white/80 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm ${
              user?.theme?.viewCountPlacement === "top-right"
                ? "top-4 right-4"
                : user?.theme?.viewCountPlacement === "top-left"
                  ? "top-4 left-4"
                  : user?.theme?.viewCountPlacement === "bottom-right"
                    ? "bottom-4 right-4"
                    : "bottom-4 left-4"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              {userData?.viewCount || 0}
            </span>
          </div>

          <div className="flex justify-center mb-2 mt-10 sm:mt-0 relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 relative">
              {user?.logo ? (
                <img
                  src={String(user.logo)}
                  alt={String(displayName)}
                  className="w-full h-full object-cover"
                  style={{
                    opacity: imageLoaded.logo ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                  onLoad={() =>
                    setImageLoaded((prev) => ({ ...prev, logo: true }))
                  }
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <span className="text-3xl" style={styles.text}>
                    {typeof displayName === 'string' && displayName.length > 0 
                      ? displayName[0].toUpperCase() 
                      : '?'}
                  </span>
                </div>
              )}
            </div>

            {user.theme?.decoration?.enabled && (
              <div className="absolute w-[145px] h-[145px] -top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <DecorationPreview
                  decoration={user.theme.decoration}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {user.theme?.badgePosition === "above-username" &&
            earnedBadges.length > 0 && (
              <div className="flex justify-center mb-4">
                <div
                  className="flex flex-wrap items-center justify-center gap-2"
                  style={{
                    backgroundColor: "rgba(50, 50, 50, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "25px",
                    padding: "6px 10px",
                    maxWidth: "fit-content",
                    minWidth: "50px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {earnedBadges.map((badge) => (
                    <BadgeDisplay
                      key={badge.id}
                      badge={badge}
                      showDescription
                      size="sm"
                      earnedBadges={userBadges}
                      customColor={
                        user.theme?.badgeStyle?.colorMode === "mono"
                          ? user.theme.badgeStyle.monoColor
                          : user.theme?.badgeStyle?.colorMode === "custom"
                            ? user.theme.badgeStyle.customColor
                            : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            )}

          <div className="flex items-center justify-center gap-3">
            <div className="relative inline-block">
              <SparkleName
                displayName={(displayName || "") as string}
                effect={user.theme?.sparkleEffect ? user.theme.sparkleEffect : undefined}
                className="text-5.9xl font-bold glow-name gradient-text"
              />
            </div>

            {user.theme?.badgePosition === "beside-username" &&
              earnedBadges.length > 0 && (
                <div
                  className="flex flex-wrap items-center justify-start gap-2"
                  style={{
                    backgroundColor: "rgba(50, 50, 50, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "25px",
                    padding: "6px 10px",
                    maxWidth: "fit-content",
                    minWidth: "50px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {earnedBadges.map((badge) => (
                    <BadgeDisplay
                      key={badge.id}
                      badge={badge}
                      showDescription
                      size="sm"
                      earnedBadges={userBadges}
                      customColor={
                        user.theme?.badgeStyle?.colorMode === "mono"
                          ? user.theme.badgeStyle.monoColor
                          : user.theme?.badgeStyle?.colorMode === "custom"
                            ? user.theme.badgeStyle.customColor
                            : undefined
                      }
                    />
                  ))}
                </div>
              )}
          </div>

          {user.theme?.badgePosition === "below-username" &&
            earnedBadges.length > 0 && (
              <div className="flex justify-center mt-4">
                <div
                  className="flex flex-wrap items-center justify-center gap-2"
                  style={{
                    backgroundColor: "rgba(50, 50, 50, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "25px",
                    padding: "6px 10px",
                    maxWidth: "fit-content",
                    minWidth: "50px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {earnedBadges.map((badge) => (
                    <BadgeDisplay
                      key={badge.id}
                      badge={badge}
                      showDescription
                      size="sm"
                      earnedBadges={userBadges}
                      customColor={
                        user.theme?.badgeStyle?.colorMode === "mono"
                          ? user.theme.badgeStyle.monoColor
                          : user.theme?.badgeStyle?.colorMode === "custom"
                            ? user.theme.badgeStyle.customColor
                            : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          {typeof user.bio === 'string' && (
            <div
              className="text-gray-300 text-center text-lg mb-8 px-8"
              style={styles.text}
            >
              {user.theme?.typingAnimation?.enabled ? (
                <TypingAnimation
                  duration={user.theme.typingAnimation.speed || 150}
                  delay={user.theme.typingAnimation.startDelay || 300}
                >
                  {user.bio}
                </TypingAnimation>
              ) : (
                <p>{user.bio}</p>
              )}
            </div>
          )}

          <div
            className={`relative flex flex-wrap justify-center px-4 ${
              typeof user.bio === 'string' ? "mt-4" : "mt-8"
            }`}
          >
            {links.map((link) => {
              // More comprehensive check for crypto links
              const cryptoTypes = ['bitcoin', 'ethereum', 'dogecoin', 'litecoin', 'usdt'];
              const isCryptoLink = cryptoTypes.includes(link.icon || '');

              return (
                <div key={link.id} className="relative group">
                  <button
                    className="p-2 hover:scale-110 transition-transform duration-200"
                    aria-label={`Visit ${link.title || link.icon || "website"}`}
                    onClick={() =>
                      isCryptoLink
                        ? handleCopyAddress(link.url)
                        : window.open(link.url, "_blank")
                    }
                  >
                    <SocialIcon
                      link={link}
                      user={user}
                      onClick={() => {}}
                    />
                  </button>
                  {isCryptoLink && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      Click to copy
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Discord, GitHub, and Steam Integration Section */}
          <div className="mt-4 flex flex-col items-center w-full overflow-hidden">
            {user && hasDiscordConnected(user) && !hasGitHubConnected(user) && !hasSteamConnected(user) && (
              // When only Discord is connected (no GitHub or Steam), center it properly
              <div className="w-[90%] max-w-[480px] mx-auto overflow-hidden">
                <AnimatedDiscordCard
                  user={{
                    discordId: safeString(user.discordId),
                    discordUsername: safeString(user.discordUsername),
                    discordDisplayName: safeString(user.discordDisplayName),
                    discordGlobalName: safeString(user.discordGlobalName),
                    discordAvatar: safeString(user.discordAvatar),
                    discordStatus: safeString(user.discordStatus) as 'online' | 'idle' | 'dnd' | 'offline' | undefined,
                    discordActivity: user.discordActivity && typeof user.discordActivity === 'object' && 'name' in user.discordActivity ? 
                      { name: String(user.discordActivity.name) } : null,
                    lastOnline: user.lastOnline instanceof Date ? user.lastOnline.toISOString() : 
                              typeof user.lastOnline === 'string' || typeof user.lastOnline === 'number' ? 
                              new Date(user.lastOnline).toISOString() : undefined
                  }}
                  isConnected={true}
                  isSettingsPage={false}
                />
              </div>
            )}

            {user && hasDiscordConnected(user) && (hasGitHubConnected(user) || hasSteamConnected(user)) && (
              <div className="flex flex-col md:flex-row justify-center gap-4 w-[90%] max-w-[480px] mx-auto overflow-hidden">
                <div className="w-full md:w-[330px] overflow-hidden">
                  <AnimatedDiscordCard
                    user={{
                      discordId: safeString(user.discordId),
                      discordUsername: safeString(user.discordUsername),
                      discordDisplayName: safeString(user.discordDisplayName),
                      discordGlobalName: safeString(user.discordGlobalName),
                      discordAvatar: safeString(user.discordAvatar),
                      discordStatus: safeString(user.discordStatus) as 'online' | 'idle' | 'dnd' | 'offline' | undefined,
                      discordActivity: user.discordActivity && typeof user.discordActivity === 'object' && 'name' in user.discordActivity ? 
                        { name: String(user.discordActivity.name) } : null,
                      lastOnline: user.lastOnline instanceof Date ? user.lastOnline.toISOString() : 
                                typeof user.lastOnline === 'string' || typeof user.lastOnline === 'number' ? 
                                new Date(user.lastOnline).toISOString() : undefined
                    }}
                    isConnected={true}
                    isSettingsPage={false}
                  />
                </div>

                {user && hasGitHubConnected(user) && (
                  <div className="w-full md:w-[150px] overflow-hidden">
                    <MotionWrapper
                      className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 flex flex-col sm:flex-row md:flex-col items-center gap-2 overflow-hidden h-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.15 }}
                      wrapperClassName="w-full overflow-hidden"
                    >
                      {(() => {
                        const githubUser = toGitHubUser(user);
                        return (
                          <>
                            {githubUser.avatar_url && (
                              <MotionImage
                                src={githubUser.avatar_url}
                                alt="GitHub Avatar"
                                className="w-10 h-10 rounded-full"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                                wrapperClassName="flex-shrink-0"
                              />
                            )}
                            <div className="flex flex-col items-center sm:items-start md:items-center text-center sm:text-left md:text-center">
                              <h3 className="text-sm font-semibold">
                                {githubUser.login}
                              </h3>
                              <a
                                href={`https://github.com/${githubUser.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-1"
                              >
                                <ExternalLink size={10} />
                                GitHub Profile
                              </a>
                            </div>
                          </>
                        );
                      })()}
                    </MotionWrapper>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Steam Profile Cards - Outside of the main container */}
        {user && hasSteamConnected(user) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="mt-4 mb-4">
              <SteamProfileCard user={user as any} className="max-w-4xl mx-auto" />
            </div>
          </motion.div>
        )}
        
        {user?.theme?.spotifyLink && (
          <div className="mt-4 mb-8">
            <div className="rounded-xl">
              <SpotifyPlayer 
                spotifyUrl={user.theme.spotifyLink} 
                displayText="Favourite Song"
              />
            </div>
          </div>
        )}

        {chatbotEnabled && chatbotSettings && (
          <motion.div
            style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 9999 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ChatBot
              enabled={chatbotSettings.enabled || false}
              systemPrompt={chatbotSettings.systemPrompt || ""}
              position={chatbotSettings.position || "bottom-right"}
              buttonColor={chatbotSettings.style?.buttonColor || "#0070f3"}
              bubbleColor={chatbotSettings.style?.bubbleColor || "#f5f5f5"}
              textColor={chatbotSettings.style?.textColor || "#000000"}
              font={chatbotSettings.style?.font || "system-ui"}
              welcomeMessage={chatbotSettings.welcomeMessage || ""}
              placeholderText={chatbotSettings.placeholderText || ""}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}