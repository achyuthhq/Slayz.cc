import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Theme } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { DocumentTitle } from "@/components/document-title";
import {
  Twitter,
  Instagram,
  Github,
  Youtube,
  ExternalLink,
  Plus,
  Trash2,
  Palette,
  Edit2,
  MoreHorizontal,
  Check,
  X,
  GripVertical,
  Pencil,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  SiTiktok,
  SiSpotify,
  SiDiscord,
  SiBitcoin,
  SiLitecoin,
  SiTether,
  SiSnapchat,
  SiTelegram,
  SiPaypal,
  SiLinkedin,
  SiPinterest,
  SiReddit,
  SiTwitch,
  SiMedium,
  SiFacebook,
  SiSoundcloud,
  SiVenmo,
  SiCashapp,
  SiKofi,
  SiPatreon,
  SiGithub,
  SiEthereum,
  SiWhatsapp,
  SiSignal,
  SiSlack,
  // SiSkype,
  SiYoutube,
  SiTumblr,
  SiDribbble,
  SiBehance,
  SiMastodon,
  SiApple,
  SiAmazon,
  SiPlaystation,
  // SiXbox,
  SiNintendoswitch,
  SiNetflix,
  SiThreads,
  SiDogecoin
} from "react-icons/si";
import { FaSkype, FaXbox } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Sparkles, Crown } from 'lucide-react';
import { useLocation } from 'wouter';

const SOCIAL_PLATFORMS = [
  // Popular social platforms
  { id: "twitter", name: "Twitter", icon: Twitter, color: "#1DA1F2" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "#E4405F" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, color: "#1877F2" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "#000000" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, color: "#FF0000" },
  { id: "discord", name: "Discord", icon: SiDiscord, color: "#5865F2" },
  { id: "snapchat", name: "Snapchat", icon: SiSnapchat, color: "#FFFC00" },
  { id: "telegram", name: "Telegram", icon: SiTelegram, color: "#0088cc" },
  { id: "reddit", name: "Reddit", icon: SiReddit, color: "#FF4500" },
  { id: "twitch", name: "Twitch", icon: SiTwitch, color: "#6441A4" },
  { id: "threads", name: "Threads", icon: SiThreads, color: "#000000" },
  { id: "whatsapp", name: "WhatsApp", icon: SiWhatsapp, color: "#25D366" },

  // Professional platforms
  { id: "github", name: "GitHub", icon: SiGithub, color: "#181717" },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, color: "#0A66C2" },
  { id: "medium", name: "Medium", icon: SiMedium, color: "#00AB6C" },
  { id: "behance", name: "Behance", icon: SiBehance, color: "#1769FF" },
  { id: "dribbble", name: "Dribbble", icon: SiDribbble, color: "#EA4C89" },
  { id: "mastodon", name: "Mastodon", icon: SiMastodon, color: "#6364FF" },
  { id: "slack", name: "Slack", icon: SiSlack, color: "#4A154B" },
  { id: "skype", name: "Skype", icon: FaSkype, color: "#00AFF0" },

  // Payment platforms
  { id: "paypal", name: "PayPal", icon: SiPaypal, color: "#00457C" },
  { id: "venmo", name: "Venmo", icon: SiVenmo, color: "#3D95CE" },
  { id: "cashapp", name: "Cash App", icon: SiCashapp, color: "#00D632" },
  { id: "patreon", name: "Patreon", icon: SiPatreon, color: "#FF424D" },
  { id: "kofi", name: "Ko-Fi", icon: SiKofi, color: "#FF5E5B" },

  // Crypto platforms
  { id: "bitcoin", name: "Bitcoin", icon: SiBitcoin, color: "#F7931A", isCrypto: true },
  { id: "ethereum", name: "Ethereum", icon: SiEthereum, color: "#3C3C3D", isCrypto: true },
  { id: "litecoin", name: "Litecoin", icon: SiLitecoin, color: "#345D9D", isCrypto: true },
  { id: "dogecoin", name: "Dogecoin", icon: SiDogecoin, color: "#C2A633", isCrypto: true },
  { id: "usdt", name: "USDT", icon: SiTether, color: "#26A17B", isCrypto: true },

  // Entertainment platforms
  { id: "spotify", name: "Spotify", icon: SiSpotify, color: "#1DB954" },
  { id: "soundcloud", name: "SoundCloud", icon: SiSoundcloud, color: "#FF3300" },
  { id: "pinterest", name: "Pinterest", icon: SiPinterest, color: "#E60023" },
  { id: "tumblr", name: "Tumblr", icon: SiTumblr, color: "#36465D" },
  { id: "netflix", name: "Netflix", icon: SiNetflix, color: "#E50914" },
  { id: "amazon", name: "Amazon", icon: SiAmazon, color: "#FF9900" },
  { id: "apple", name: "Apple", icon: SiApple, color: "#A2AAAD" },
  { id: "playstation", name: "PlayStation", icon: SiPlaystation, color: "#003791" },
  { id: "xbox", name: "Xbox", icon: FaXbox, color: "#107C10" },
  { id: "nintendo", name: "Nintendo", icon: SiNintendoswitch, color: "#E60012" },

  // Others
  { id: "website", name: "Website", icon: ExternalLink, color: "#FFFFFF" },
  { id: "signal", name: "Signal", icon: SiSignal, color: "#3A76F0" },
];

// A function to reorder the result
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const PremiumFeatureDialog = ({ open, onOpenChange, featureName }: { open: boolean; onOpenChange: (open: boolean) => void; featureName: string }) => {
  const [, navigate] = useLocation();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-[#8e44ad]/30 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#8e44ad]" />
            Premium Feature: {featureName}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Upgrade to access exclusive profile features
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p className="text-base text-white/80">
            This feature is exclusively available with a Premium subscription.
            Upgrade now to unlock all premium features and enhance your profile!
          </p>
          <div className="bg-[#8e44ad]/10 p-4 rounded-lg space-y-2 border border-[#8e44ad]/20">
            <p className="text-sm font-medium text-white">Premium includes:</p>
            <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
              <li>Custom profile decorations</li>
              <li>Unlimited social links</li>
              <li>Special effects and animations</li>
              <li>AI-powered chatbot</li>
              <li>Advanced background options</li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-[#8e44ad]/20 hover:bg-[#8e44ad]/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onOpenChange(false);
              navigate('/pricing');
            }}
            className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function SocialsPage() {
  console.log("[SocialsPage] Component rendering started");
  const { toast } = useToast();
  const { user } = useAuth();
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [monoColor, setMonoColor] = useState("#ffffff");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const [userLinks, setUserLinks] = useState<any[]>([]);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isPremium = user?.subscriptionStatus === "premium";
  const [, navigate] = useLocation();

  // Animation states
  const [animating, setAnimating] = useState("");

  // Get the current theme settings
  const defaultTheme: Theme = {
    socialIcons: { colorMode: "multi" },
    viewCountPlacement: "top-right",
    badges: [],
    font: {
      family: "sans",
      size: "base",
      weight: "normal"
    },
    background: {
      type: "color",
      value: "#000000"
    },
    layout: {
      template: "classic",
      spacing: "comfortable",
      alignment: "center"
    },
    chatbot: {
      enabled: false,
      systemPrompt: "You are a helpful assistant.",
      position: "bottom-right",
      style: {
        buttonColor: "#0070f3",
        bubbleColor: "#f5f5f5",
        textColor: "#000000",
        font: "system-ui"
      },
      welcomeMessage: "👋 Hi! Feel free to ask me anything about this profile!",
      placeholderText: "Type your message here..."
    }
  };

  const userTheme: Theme = user?.theme ? (typeof user.theme === 'string' ? JSON.parse(user.theme) : user.theme) : defaultTheme;
  const theme: Theme = userTheme || defaultTheme;
  const initialColorMode = theme.socialIcons?.colorMode || "multi";
  const initialMonoColor = theme.socialIcons?.monoColor || "#ffffff";
  const initialGlowEnabled = theme.socialIcons?.glowEnabled !== undefined ? theme.socialIcons.glowEnabled : true;
  const [colorMode, setColorMode] = useState<"multi" | "mono">(initialColorMode);
  const [glowEnabled, setGlowEnabled] = useState<boolean>(initialGlowEnabled);

  useEffect(() => {
    if (initialMonoColor) {
      setMonoColor(initialMonoColor);
    }
  }, [initialMonoColor]);

  const { data: links = [], isLoading, error: linksError } = useQuery<any[]>({
    queryKey: ["/api/links"]
  });

  // Handle errors with useEffect instead of onError
  useEffect(() => {
    if (linksError) {
      console.error("[SocialsPage] Error fetching links:", linksError);
      toast({
        title: "Error loading social links",
        description: linksError instanceof Error ? linksError.message : "Please try refreshing the page",
        variant: "destructive",
      });
    }
  }, [linksError, toast]);

  console.log("[SocialsPage] Links data:", links, "isLoading:", isLoading);

  // Sort links when data arrives and update local state
  useEffect(() => {
    if (links && links.length > 0) {
      // Sort links by order field if available
      const sortedLinks = [...links].sort((a, b) => (a.order || 0) - (b.order || 0));
      setUserLinks(sortedLinks);
    } else {
      setUserLinks([]);
    }
  }, [links]);

  // Mutation to update theme settings
  const updateThemeMutation = useMutation({
    mutationFn: async (data: { theme: Partial<Theme> }) => {
      const response = await apiRequest("PATCH", "/api/profile", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update theme");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Social icon settings updated",
        description: colorMode === "mono"
          ? "Icons will now display in monochrome"
          : "Icons will now display in their original colors"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: { icon: string; title: string; url: string; order: number }) => {
      // Ensure all required fields are present and valid
      const sanitizedData = {
        icon: data.icon || null,
        title: data.title || "Link",
        url: data.url,
        order: typeof data.order === 'number' ? data.order : 0,
      };
      
      // Log the sanitized data being sent to the server
      console.log("Creating social link with sanitized data:", sanitizedData);
      
      try {
        const res = await apiRequest("POST", "/api/links", sanitizedData);
        
        if (!res.ok) {
          // Try to get more detailed error information
          const errorData = await res.json().catch(() => ({}));
          console.error("Error response from server:", errorData);
          
          // Handle specific error cases
          if (errorData.error?.includes("already have a link for this platform")) {
            throw new Error("You already have a link for this platform. Each social platform can only be added once.");
          } else if (errorData.error?.includes("reached the maximum number of website links")) {
            setPremiumFeatureName("Multiple Website Links");
            setShowPremiumDialog(true);
            throw new Error("Upgrade to Premium to add multiple website links.");
          } else if (errorData.error?.includes("reached the maximum number of social links")) {
            setPremiumFeatureName("Additional Social Links");
            setShowPremiumDialog(true);
            throw new Error("Upgrade to Premium to add more than 5 social links.");
          }
          
          throw new Error(errorData.error || "Failed to create social link");
        }
        
        return res.json();
      } catch (error) {
        console.error("Error in createMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setAddLinkOpen(false);
      setSelectedPlatform(null);
      setNewLinkTitle("");
      setNewLinkUrl("");
      toast({
        title: "Link added successfully",
      });

      // Play add animation
      setAnimating("add");
      setTimeout(() => setAnimating(""), 500);
    },
    onError: (error) => {
      console.error("Error adding social link:", error);
      toast({
        title: "Failed to add link",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PATCH", `/api/links/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setEditDialogOpen(false);
      setEditingLink(null);
      toast({
        title: "Link updated successfully",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (links: any[]) => {
      console.log("Sending reordered links to server:", links);
      
      // Update each link with its new order
      const updatePromises = links.map((link, index) =>
        apiRequest("PATCH", `/api/links/${link.id}`, {
          order: index,  // Ensure order matches the new index
          icon: link.icon,
          title: link.title,
          url: link.url
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to update link order for ${link.title}`);
          }
          return response.json();
        })
      );

      return Promise.all(updatePromises);
    },
    onSuccess: (data) => {
      console.log("Reorder success response:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Links reordered successfully",
        description: "Your profile will now display links in this order"
      });
    },
    onError: (error) => {
      console.error("Reorder error:", error);
      // Revert the UI to the previous state
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Failed to reorder links",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link deleted successfully",
      });

      // Play remove animation
      setAnimating("remove");
      setTimeout(() => setAnimating(""), 500);
    },
  });

  // Update the handleIconSelect function
  const handleIconSelect = (platformId: string) => {
    // First check if the user has reached the limit
    if (!isPremium && userLinks.length >= 5) {
      setPremiumFeatureName("Additional Social Links");
      setShowPremiumDialog(true);
      return;
    }

    // Check if this platform is already in use (except for website)
    if (platformId !== 'website') {
      const existingPlatform = userLinks.find(link => link.icon === platformId);
      if (existingPlatform) {
        toast({
          title: "Platform already in use",
          description: `You already have a ${platformId} link. Each social platform can only be added once.`,
          variant: "destructive",
        });
        return;
      }
    } else if (!isPremium) {
      // For non-premium users, check if they already have a website link
      const websiteLinks = userLinks.filter(link => link.icon === 'website');
      if (websiteLinks.length >= 1) {
        setPremiumFeatureName("Multiple Website Links");
        setShowPremiumDialog(true);
        return;
      }
    }

    setSelectedPlatform(platformId);
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);

    // Auto-fill title for crypto with platform name
    if (platform?.isCrypto) {
      setNewLinkTitle(platform.name);
    } else {
      setNewLinkTitle("");
    }

    // Open the add link dialog
    setAddLinkOpen(true);

    // Focus the title input or the URL input if title is auto-filled
    setTimeout(() => {
      if (platform?.isCrypto) {
        urlInputRef.current?.focus();
      } else {
        titleInputRef.current?.focus();
      }
    }, 100);
  };

  const handleAddLink = () => {
    if (!selectedPlatform || !newLinkUrl) return;

    const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
    
    // Ensure title is never undefined - use platform name for crypto or a default value
    const title = platform?.isCrypto 
      ? platform.name 
      : newLinkTitle || (platform?.name || "Link");

    // Construct the payload with all required fields and proper defaults
    const linkData = {
      icon: selectedPlatform,
      title: title, 
      url: newLinkUrl.trim(),
      order: userLinks.length
    };

    console.log("Submitting link data:", linkData);
    createMutation.mutate(linkData);
  };

  const openEditDialog = (link: any) => {
    setEditingLink(link);
    setEditDialogOpen(true);
  };

  const handleUpdateLink = () => {
    if (!editingLink) return;

    updateMutation.mutate({
      id: editingLink.id,
      data: {
        title: editingLink.title,
        url: editingLink.url,
        icon: editingLink.icon,
        order: editingLink.order
      }
    });
  };
  
  const handleMoveUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    try {
      // Set animation state
      setAnimating("reorder");
      
      // Create a copy of the current links
      const updatedLinks = [...userLinks];
      
      // Swap the item with the one above it
      [updatedLinks[index], updatedLinks[index - 1]] = [updatedLinks[index - 1], updatedLinks[index]];
      
      // Update UI immediately
      setUserLinks(updatedLinks);
      
      // Then submit the changes to the server
      console.log("Moving link up, submitting reordered links to server");
      reorderMutation.mutate(updatedLinks);
      
      // Reset animation state after a short delay
      setTimeout(() => setAnimating(""), 300);
    } catch (error) {
      console.error("Error moving link up:", error);
      toast({
        title: "Error reordering links",
        description: "There was a problem reordering your links. Please try again.",
        variant: "destructive",
      });
      setAnimating("");
    }
  };

  const handleMoveDown = (index: number) => {
    if (index === userLinks.length - 1) return; // Already at the bottom
    
    try {
      // Set animation state
      setAnimating("reorder");
      
      // Create a copy of the current links
      const updatedLinks = [...userLinks];
      
      // Swap the item with the one below it
      [updatedLinks[index], updatedLinks[index + 1]] = [updatedLinks[index + 1], updatedLinks[index]];
      
      // Update UI immediately
      setUserLinks(updatedLinks);
      
      // Then submit the changes to the server
      console.log("Moving link down, submitting reordered links to server");
      reorderMutation.mutate(updatedLinks);
      
      // Reset animation state after a short delay
      setTimeout(() => setAnimating(""), 300);
    } catch (error) {
      console.error("Error moving link down:", error);
      toast({
        title: "Error reordering links",
        description: "There was a problem reordering your links. Please try again.",
        variant: "destructive",
      });
      setAnimating("");
    }
  };

  // Get the platform for the currently selected platform
  const selectedPlatformInfo = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);

  const handleColorModeChange = (mode: 'multi' | 'mono') => {
    if (!isPremium && mode === 'mono') {
      setPremiumFeatureName("Monochrome Icons");
      setShowPremiumDialog(true);
      return;
    }
    setColorMode(mode);
  };

  // Add this useEffect for debugging theme issues
  useEffect(() => {
    console.log("[SocialsPage] User theme:", user?.theme);
    console.log("[SocialsPage] Derived theme:", theme);
    
    // Check for common theme parsing issues
    if (user?.theme && typeof user.theme === 'string') {
      try {
        const parsedTheme = JSON.parse(user.theme);
        console.log("[SocialsPage] Parsed theme:", parsedTheme);
      } catch (e) {
        console.error("[SocialsPage] Theme parsing error:", e);
      }
    }
  }, [user?.theme, theme]);

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentTitle title="Social Links" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col mb-2">
          <h1 className="text-2xl font-mono font-bold tracking-tighter">
            Link your social media profiles.
          </h1>
          <p className="text-white/70 mt-1">Pick a social media icon to add to your profile.</p>
          {!isPremium && (
            <div className="mt-2 p-3 bg-black/20 border border-white/5 rounded text-sm text-white/70">
              Free users can add up to 5 social links and only one website link. Upgrade to Premium for unlimited social links and multiple website links.
              {userLinks.length > 0 && (
                <div className="mt-1">
                  You have used {userLinks.length}/5 available slots.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Icon Color Settings Card */}
        <Card className="p-6 border-white/10 backdrop-filter backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#8e44ad]" />
                  Icon Display Style
                </h3>
                <br />
                <div className="text-sm text-white/60">
                  Choose how your icons will appear
                </div>
              </div>

              <div className="grid gap-6">
                <RadioGroup
                  value={colorMode}
                  onValueChange={handleColorModeChange}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <RadioGroupItem
                      value="multi"
                      id="multi-chrome"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="multi-chrome"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-[#8e44ad]/20 bg-[#8e44ad]/10 p-5
                        hover:bg-[#8e44ad]/20 hover:border-[#8e44ad]/30 transition-all duration-200
                        peer-data-[state=checked]:border-[#8e44ad]/50 [&:has([data-state=checked])]:border-[#8e44ad]/50
                        [&:has([data-state=checked])]:bg-[#8e44ad]/20 [&:has([data-state=checked])]:shadow-md cursor-pointer"
                    >
                      <div className="flex gap-5 justify-center mb-5 bg-[#8e44ad]/5 p-4 rounded-lg w-full">
                        <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                        <Instagram className="w-5 h-5 text-[#E4405F]" />
                        <SiDiscord className="w-5 h-5 text-[#5865F2]" />
                        <SiSpotify className="w-5 h-5 text-[#1DB954]" />
                      </div>
                      <div className="font-medium">Original Colors</div>
                      <div className="text-sm text-white/70 text-center mt-1">Each platform's official brand color</div>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="mono"
                      id="mono-chrome"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="mono-chrome"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-[#8e44ad]/20 bg-[#8e44ad]/10 p-5
                        hover:bg-[#8e44ad]/20 hover:border-[#8e44ad]/30 transition-all duration-200
                        peer-data-[state=checked]:border-[#8e44ad]/50 [&:has([data-state=checked])]:border-[#8e44ad]/50
                        [&:has([data-state=checked])]:bg-[#8e44ad]/20 [&:has([data-state=checked])]:shadow-md cursor-pointer"
                    >
                      <div className="flex gap-5 justify-center mb-5 bg-[#8e44ad]/5 p-4 rounded-lg w-full">
                        <Twitter className="w-5 h-5" style={{ color: monoColor }} />
                        <Instagram className="w-5 h-5" style={{ color: monoColor }} />
                        <SiDiscord className="w-5 h-5" style={{ color: monoColor }} />
                        <SiSpotify className="w-5 h-5" style={{ color: monoColor }} />
                      </div>
                      <div className="font-medium">Monochrome</div>
                      <div className="text-sm text-white/70 text-center mb-3 mt-1">Single custom color for all icons</div>
                      <Input
                        type="color"
                        value={monoColor}
                        onChange={(e) => setMonoColor(e.target.value)}
                        className="h-8 w-full bg-[#8e44ad]/10 border-[#8e44ad]/20 hover:border-[#8e44ad]/30 cursor-pointer"
                      />
                    </Label>
                  </div>
                </RadioGroup>

                {/* Add a toggle for the glow effect */}
                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-[#8e44ad]/20 bg-[#8e44ad]/10">
                  <div>
                    <h4 className="font-medium">Icon Glow Effect</h4>
                    <p className="text-sm text-white/70">Enable subtle glow around icons</p>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="glow-toggle"
                      checked={glowEnabled}
                      onChange={(e) => setGlowEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="glow-toggle"
                      className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out
                        ${glowEnabled ? 'bg-[#8e44ad]' : 'bg-[#8e44ad]/30'}
                      `}
                    >
                      <span 
                        className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out
                          ${glowEnabled ? 'transform translate-x-6' : ''}
                        `}
                      />
                    </label>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const updatedTheme = {
                      ...theme,
                      socialIcons: {
                        colorMode,
                        monoColor: colorMode === "mono" ? monoColor : undefined,
                        glowEnabled: glowEnabled
                      }
                    };
                    updateThemeMutation.mutate({ theme: updatedTheme });
                  }}
                  disabled={updateThemeMutation.isPending}
                  className="mt-2 bg-[#8e44ad] hover:bg-[#9b59b6] text-white"
                >
                  {updateThemeMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                      Applying...
                    </div>
                  ) : "Apply Color Settings"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Icon Grid */}
        <Card className="p-6 border-white/10 backdrop-filter backdrop-blur-sm">
          <div className="space-y-6">
            {/* Icon Grid */}
            <div
              className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-15
              gap-2 transition-all duration-300 ${animating === "add" ? "scale-105" : ""}`}
            >
              {SOCIAL_PLATFORMS.map((platform) => {
                // Check if this platform is already added by the user
                const isAdded = links.some(link => link.icon === platform.id);

                return (
                  <div
                    key={platform.id}
                    onClick={() => {
                      if (!isAdded) {
                        handleIconSelect(platform.id);
                      } else {
                        toast({
                          title: "Platform already added",
                          description: "Edit or delete the existing link instead"
                        });
                      }
                    }}
                    className={`relative p-1 sm:p-2 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer
                      ${isAdded
                        ? 'bg-[#8e44ad]/30 border-[#8e44ad]/50'
                        : 'bg-[#8e44ad]/10 hover:bg-[#8e44ad]/20 active:scale-95 hover:scale-105'
                      } border border-[#8e44ad]/20 aspect-square`}
                  >
                    <platform.icon
                      className="w-8 h-8"
                      style={{ color: colorMode === "multi" ? platform.color : monoColor }}
                    />
                    {isAdded && (
                      <div className="absolute -top-1 -right-1 bg-[#8e44ad] text-white rounded-full w-4 h-4 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Draggable Links List */}
            <div className="mt-10">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="flex flex-col">
                    <ChevronUp className="w-5 h-5 text-[#8e44ad]" />
                    <ChevronDown className="w-5 h-5 text-[#8e44ad] -mt-2" />
                  </div>
                  Your Social Links
                </h3>
                <div className="text-sm text-white/60 italic">
                  Reorder using arrows
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-[#8e44ad]/10 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#8e44ad]/30 rounded-xl bg-gradient-to-b from-[#8e44ad]/10 to-transparent">
                  <p className="text-white/60">
                    Click on an icon above to add your first social link
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-sm text-center text-white/60 mb-4 pb-2 border-b border-dashed border-[#8e44ad]/20">
                    <p>Use the <ChevronUp className="w-4 h-4 inline-block mx-1 text-white/80" /> <ChevronDown className="w-4 h-4 inline-block mx-1 text-white/80" /> buttons to reorder your links</p>
                  </div>
                  <div className={`space-y-3 transition-all duration-300 ${animating === "remove" ? "scale-95" : ""} ${animating === "add" ? "scale-105" : ""} ${animating === "reorder" ? "scale-[1.02]" : ""}`}>
                    {userLinks.map((link, index) => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.id === link.icon) || SOCIAL_PLATFORMS.find(p => p.id === 'website');
                      return (
                        <div
                          key={link.id.toString()}
                          className={`flex items-center justify-between p-4 rounded-xl 
                            bg-[#8e44ad]/10 hover:bg-[#8e44ad]/20 border border-[#8e44ad]/20 
                            hover:border-[#8e44ad]/40 hover:shadow-md
                            transition-all duration-200`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveUp(index);
                                }}
                                disabled={index === 0}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 
                                  ${index === 0 
                                    ? 'opacity-30 cursor-not-allowed bg-[#8e44ad]/10' 
                                    : 'bg-[#8e44ad]/20 hover:bg-[#8e44ad]/50 hover:shadow-md active:scale-90'}`}
                                aria-label="Move up"
                              >
                                <ChevronUp className="w-5 h-5 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveDown(index);
                                }}
                                disabled={index === userLinks.length - 1}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                                  ${index === userLinks.length - 1 
                                    ? 'opacity-30 cursor-not-allowed bg-[#8e44ad]/10' 
                                    : 'bg-[#8e44ad]/20 hover:bg-[#8e44ad]/50 hover:shadow-md active:scale-90'}`}
                                aria-label="Move down"
                              >
                                <ChevronDown className="w-5 h-5 text-white" />
                              </button>
                            </div>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#8e44ad]/20`}
                            >
                              {platform && <platform.icon className="w-5 h-5" style={{ color: colorMode === "multi" ? platform.color : monoColor }} />}
                            </div>
                            <div>
                              <div className="font-medium">{link.title}</div>
                              <div className="text-sm text-white/70 truncate max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">{link.url}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-[#8e44ad]/20 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(link);
                              }}
                            >
                              <Pencil className="w-4 h-4 text-white/70" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-[#8e44ad]/20 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(link.id);
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-white/70" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Add Link Dialog */}
      <Dialog open={addLinkOpen} onOpenChange={setAddLinkOpen}>
        <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-[#8e44ad]/30 rounded-xl shadow-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {selectedPlatformInfo && (
                <div className="p-2 rounded-full bg-[#8e44ad]/20 mr-1">
                  <selectedPlatformInfo.icon
                    className="w-5 h-5"
                    style={{ color: colorMode === "multi" ? selectedPlatformInfo.color : monoColor }}
                  />
                </div>
              )}
              Add {selectedPlatformInfo?.name || "Social"} Link
            </DialogTitle>
            <p className="text-sm text-white/60">
              Enter the details for your {selectedPlatformInfo?.name || "social"} profile
            </p>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {selectedPlatformInfo && !selectedPlatformInfo.isCrypto && (
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-white/80">Display Name</Label>
                <Input
                  id="title"
                  ref={titleInputRef}
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder={`Your ${selectedPlatformInfo.name} username`}
                  className="bg-[#8e44ad]/10 border-[#8e44ad]/20 focus:border-[#8e44ad]/40"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="url" className="text-white/80">
                {selectedPlatformInfo?.isCrypto ? "Wallet Address" : "URL"}
              </Label>
              <Input
                id="url"
                ref={urlInputRef}
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder={selectedPlatformInfo?.isCrypto ? "Enter your wallet address" : `https://...`}
                className="bg-[#8e44ad]/10 border-[#8e44ad]/20 focus:border-[#8e44ad]/40"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddLinkOpen(false)}
              className="border-[#8e44ad]/20 hover:bg-[#8e44ad]/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddLink}
              disabled={!selectedPlatform || !newLinkUrl || createMutation.isPending}
              className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white"
            >
              {createMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : "Add Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-[#8e44ad]/30 rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingLink && (
                <>
                  <div className="p-2 rounded-full bg-[#8e44ad]/20 mr-1">
                    {(() => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.id === editingLink.icon);
                      if (platform) {
                        return <platform.icon className="w-5 h-5" style={{ color: colorMode === "multi" ? platform.color : monoColor }} />;
                      }
                      return <LinkIcon className="w-5 h-5" />;
                    })()}
                  </div>
                  Edit {editingLink.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="text-white/80">Display Name</Label>
              <Input
                id="edit-title"
                value={editingLink?.title || ""}
                onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                className="bg-[#8e44ad]/10 border-[#8e44ad]/20 focus:border-[#8e44ad]/40"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-url" className="text-white/80">URL</Label>
              <Input
                id="edit-url"
                value={editingLink?.url || ""}
                onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                className="bg-[#8e44ad]/10 border-[#8e44ad]/20 focus:border-[#8e44ad]/40"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-[#8e44ad]/20 hover:bg-[#8e44ad]/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateLink}
              disabled={!editingLink?.title || !editingLink?.url || updateMutation.isPending}
              className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white"
            >
              {updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : "Update Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Feature Dialog */}
      <PremiumFeatureDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        featureName={premiumFeatureName}
      />
    </div>
  );
}

interface SocialLink {
  id: number;
  icon: string;
  title: string;
  url: string;
  order: number;
}