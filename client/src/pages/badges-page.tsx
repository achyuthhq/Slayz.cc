import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { badges } from "@/components/badge-display";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PremiumFeatureDialog } from "@/components/premium-feature-dialog";
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Info, Gift, ExternalLink, ShieldCheck, Zap, Bug, Award, Crown, Heart, ShoppingCart, Users, Check } from "lucide-react";
import { DocumentTitle } from "@/components/document-title";
import { SiDiscord } from "react-icons/si";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoDiamond } from "react-icons/io5";
import { FaMedal, FaLaptopCode, FaShieldAlt, FaBug } from "react-icons/fa";
import { cn } from "@/lib/utils";

type BadgePosition = "below-username" | "above-username" | "beside-username" | "hidden";
type BadgeColorMode = "default" | "mono" | "custom";

// Define user theme interface to fix type errors
interface UserTheme {
  badges?: string[];
  badgePosition?: BadgePosition;
  badgeStyle?: {
    colorMode?: BadgeColorMode;
    monoColor?: string;
    customColor?: string;
  };
  [key: string]: any;
}

// Discord invite link
const DISCORD_INVITE = "https://discord.gg/TseKvdPMYV";

export default function BadgesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Cast theme to our interface to fix type errors
  const userTheme = (user?.theme || {}) as UserTheme;
  const userBadges = userTheme.badges || [];
  const currentPosition = userTheme.badgePosition || "beside-username";
  const currentColorMode = userTheme.badgeStyle?.colorMode || "default";
  const currentMonoColor = userTheme.badgeStyle?.monoColor || "#ffffff";
  const currentCustomColor = userTheme.badgeStyle?.customColor || "#ffffff";
  
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const isPremium = user?.subscriptionStatus === "premium";

  // Badge settings mutations
  const updateBadgePositionMutation = useMutation({
    mutationFn: async (position: BadgePosition) => {
      const response = await apiRequest("PATCH", "/api/profile", {
        theme: {
          ...userTheme,
          badgePosition: position,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update badge position");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Badge position updated",
        description: "Your badge display settings have been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update badge position",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBadgeStyleMutation = useMutation({
    mutationFn: async (style: { colorMode: BadgeColorMode; monoColor?: string; customColor?: string }) => {
      if (!isPremium && style.colorMode !== "default") {
        setPremiumFeatureName("Badge Color Customization");
        setShowPremiumDialog(true);
        return;
      }

      const response = await apiRequest("PATCH", "/api/profile", {
        theme: {
          ...userTheme,
          badgeStyle: style,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update badge style");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Badge style updated",
        description: "Your badge appearance settings have been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update badge style",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const claimMemberBadgeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/badges/claim-member", {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to claim member badge");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Member Badge Claimed!",
        description: "You've successfully claimed your member badge",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to claim badge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Badge action handler - opens external links or performs actions
  const handleBadgeAction = (badgeId: string) => {
    switch (badgeId) {
      case "member":
        claimMemberBadgeMutation.mutate();
        break;
      case "premium":
        window.location.href = "/pricing";
        break;
      case "staff":
      case "contributor":
      case "developer":
        window.open(`${DISCORD_INVITE}?ref=staff-application`, "_blank");
        break;
      case "server-booster":
        window.open(`${DISCORD_INVITE}?ref=server-boost`, "_blank");
        break;
      case "bug-hunter":
        window.open(`${DISCORD_INVITE}?ref=bug-report`, "_blank");
        break;
      default:
        window.open(DISCORD_INVITE, "_blank");
        break;
    }
  };

  // Get button text and action based on badge type
  const getBadgeActionDetails = (badgeId: string) => {
    const hasBadge = userBadges.includes(badgeId);
    
    if (hasBadge) {
      return { text: "Earned", disabled: true, color: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" };
    }
    
    switch (badgeId) {
      case "member":
        return { 
          text: "Claim Now", 
          disabled: false, 
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
        };
      case "premium":
        return { 
          text: "Buy Premium", 
          disabled: false, 
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
        };
      case "staff":
        return { 
          text: "Apply for Staff", 
          disabled: false, 
          color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30"
        };
      case "server-booster":
        return { 
          text: "Boost Server", 
          disabled: false, 
          color: "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30" 
        };
      case "bug-hunter":
        return { 
          text: "Report Bugs", 
          disabled: false, 
          color: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" 
        };
      case "developer":
        return { 
          text: "Join Development", 
          disabled: false, 
          color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30" 
        };
      case "contributor":
        return { 
          text: "Contribute", 
          disabled: false, 
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30" 
        };
      default:
        return { 
          text: "Learn More", 
          disabled: false, 
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30" 
        };
    }
  };

  // Get card highlight color based on badge
  const getBadgeCardStyle = (badgeId: string) => {
    const hasBadge = userBadges.includes(badgeId);
    
    if (hasBadge) {
      return "border-green-500/20 bg-gradient-to-r from-green-950/20 to-green-900/5";
    }

    switch (badgeId) {
      case "member":
        return "border-blue-500/20 bg-gradient-to-r from-blue-950/20 to-blue-900/5";
      case "premium":
        return "border-yellow-500/20 bg-gradient-to-r from-yellow-950/20 to-yellow-900/5";
      case "staff":
        return "border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 to-indigo-900/5";
      case "developer":
        return "border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 to-cyan-900/5";
      case "founder":
        return "border-red-500/20 bg-gradient-to-r from-red-950/20 to-red-900/5";
      case "server-booster":
        return "border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-purple-900/5";
      case "bug-hunter":
        return "border-green-500/20 bg-gradient-to-r from-green-950/20 to-green-900/5";
      default:
        return "border-white/10 bg-black/20";
    }
  };

  // Render badge icon with appropriate component
  const renderBadgeIcon = (badgeId: string) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge) return null;
    
    return (
      <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
        {badge.icon}
      </div>
    );
  };

  // Get priority badges to show at the top
  const priorityBadges = ["member", "premium", "staff", "developer", "founder", "server-booster", "bug-hunter", "contributor"];
  const remainingBadges = badges.filter(badge => !priorityBadges.includes(badge.id));
  
  // All badges in proper order
  const orderedBadges = [
    ...badges.filter(badge => priorityBadges.includes(badge.id))
      .sort((a, b) => priorityBadges.indexOf(a.id) - priorityBadges.indexOf(b.id)),
    ...remainingBadges
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentTitle title="Badges" />
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold tracking-tighter bg-clip-text">
            Badge Collection
          </h1>
        </div>

        {/* Badge settings section */}
        <Card className="p-6 border-white/10 backdrop-filter backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Badge Position</h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-white/50 hover:text-white/90 transition-all duration-200 ease-in-out hover:scale-110" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Choose where your badges appear relative to your username on your profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  defaultValue={currentPosition}
                  onValueChange={(value: BadgePosition) => 
                    updateBadgePositionMutation.mutate(value)
                  }
                >
                  <SelectTrigger className="w-full max-w-xs bg-black/30 border-white/10 rounded-xl backdrop-filter backdrop-blur-sm transition-all duration-300 hover:border-white/20 focus:ring-[#8e44ad]/40 focus:border-[#8e44ad]/40">
                    <SelectValue placeholder="Select badge position" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 text-white backdrop-filter backdrop-blur-md">
                    <SelectItem value="beside-username" className="focus:bg-[#8e44ad]/20 focus:text-white data-[state=checked]:bg-[#8e44ad]/20">
                      <div className="flex items-center justify-between w-full">
                        <span>Beside Username</span>
                        <Check className="w-4 h-4 text-[#8e44ad] opacity-0 data-[state=checked]:opacity-100 transition-opacity" />
                      </div>
                    </SelectItem>
                    <SelectItem value="above-username" className="focus:bg-[#8e44ad]/20 focus:text-white data-[state=checked]:bg-[#8e44ad]/20">
                      <div className="flex items-center justify-between w-full">
                        <span>Above Username</span>
                        <Check className="w-4 h-4 text-[#8e44ad] opacity-0 data-[state=checked]:opacity-100 transition-opacity" />
                      </div>
                    </SelectItem>
                    <SelectItem value="below-username" className="focus:bg-[#8e44ad]/20 focus:text-white data-[state=checked]:bg-[#8e44ad]/20">
                      <div className="flex items-center justify-between w-full">
                        <span>Below Username</span>
                        <Check className="w-4 h-4 text-[#8e44ad] opacity-0 data-[state=checked]:opacity-100 transition-opacity" />
                      </div>
                    </SelectItem>
                    <SelectItem value="hidden" className="focus:bg-[#8e44ad]/20 focus:text-white data-[state=checked]:bg-[#8e44ad]/20">
                      <div className="flex items-center justify-between w-full">
                        <span>Hidden</span>
                        <Check className="w-4 h-4 text-[#8e44ad] opacity-0 data-[state=checked]:opacity-100 transition-opacity" />
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 p-3 bg-black/20 border border-white/5 rounded-xl text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-[#8e44ad]" />
                    <span>Badge position affects how badges appear on your profile</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Badge Color Style</h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-white/50 hover:text-white/90 transition-all duration-200 ease-in-out hover:scale-110" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Customize how your badges appear with different color styles</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  defaultValue={currentColorMode}
                  onValueChange={(value: BadgeColorMode) => {
                    if (!isPremium && value !== "default") {
                      setPremiumFeatureName("Badge Color Customization");
                      setShowPremiumDialog(true);
                      return;
                    }

                    if (value === "mono") {
                      updateBadgeStyleMutation.mutate({
                        colorMode: "mono",
                        monoColor: currentMonoColor,
                      });
                    } else if (value === "custom") {
                      updateBadgeStyleMutation.mutate({
                        colorMode: "custom",
                        customColor: currentCustomColor,
                      });
                    } else {
                      updateBadgeStyleMutation.mutate({
                        colorMode: "default",
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full max-w-xs bg-black/30 border-white/10 rounded-xl backdrop-filter backdrop-blur-sm transition-all duration-300 hover:border-white/20 focus:ring-[#8e44ad]/40 focus:border-[#8e44ad]/40">
                    <SelectValue placeholder="Select color style" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 text-white backdrop-filter backdrop-blur-md">
                    <SelectItem value="default" className="focus:bg-[#8e44ad]/20 focus:text-white data-[state=checked]:bg-[#8e44ad]/20">
                      <div className="flex items-center justify-between w-full">
                        <span>Default Colors</span>
                        <Check className="w-4 h-4 text-[#8e44ad] opacity-0 data-[state=checked]:opacity-100 transition-opacity" />
                      </div>
                    </SelectItem>
                    <SelectItem value="mono" disabled={!isPremium} className="focus:bg-[#8e44ad]/20 focus:text-white data-[state=checked]:bg-[#8e44ad]/20">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span>Monochrome</span>
                          {!isPremium && <Crown className="w-3 h-3 ml-1 text-yellow-400" />}
                        </div>
                        <Check className="w-4 h-4 text-[#8e44ad] opacity-0 data-[state=checked]:opacity-100 transition-opacity" />
                      </div>
                    </SelectItem>
                    <SelectItem value="custom" disabled={!isPremium} className="focus:bg-[#8e44ad]/20 focus:text-white data-[state=checked]:bg-[#8e44ad]/20">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span>Custom Color</span>
                          {!isPremium && <Crown className="w-3 h-3 ml-1 text-yellow-400" />}
                        </div>
                        <Check className="w-4 h-4 text-[#8e44ad] opacity-0 data-[state=checked]:opacity-100 transition-opacity" />
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {!isPremium && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border border-yellow-500/20 rounded-xl text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span>Upgrade to Premium to unlock custom badge colors</span>
                    </div>
                  </div>
                )}

                {currentColorMode === "mono" && isPremium && (
                  <div className="flex gap-4 items-center mt-4 p-3 bg-black/20 border border-white/10 rounded-xl">
                    <Input
                      type="color"
                      value={currentMonoColor}
                      onChange={(e) => {
                        updateBadgeStyleMutation.mutate({
                          colorMode: "mono",
                          monoColor: e.target.value,
                        });
                      }}
                      className="w-16 h-10 p-1 rounded-lg border-white/20 shadow-md"
                    />
                    <span className="text-sm text-white/80">Monochrome Color</span>
                  </div>
                )}

                {currentColorMode === "custom" && isPremium && (
                  <div className="flex gap-4 items-center mt-4 p-3 bg-black/20 border border-white/10 rounded-xl">
                    <Input
                      type="color"
                      value={currentCustomColor}
                      onChange={(e) => {
                        updateBadgeStyleMutation.mutate({
                          colorMode: "custom",
                          customColor: e.target.value,
                        });
                      }}
                      className="w-16 h-10 p-1 rounded-lg border-white/20 shadow-md"
                    />
                    <span className="text-sm text-white/80">Custom Badge Color</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Badge cards */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold bg-clip-text">Available Badges</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-white/50 hover:text-white/90 transition-all duration-200 ease-in-out hover:scale-110" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Collect badges to display on your profile. Some badges require specific actions to earn.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {orderedBadges.map(badge => {
              const hasBadge = userBadges.includes(badge.id);
              const actionDetails = getBadgeActionDetails(badge.id);
              const cardStyle = getBadgeCardStyle(badge.id);
              
              return (
                <Card 
                  key={badge.id} 
                  className={cn("overflow-hidden border backdrop-blur-sm transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]", cardStyle)}
                >
                  <div className="flex items-center p-5">
                    <div className="flex items-center gap-5 flex-1">
                      {/* Badge icon with glow effect */}
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full ${hasBadge ? 'bg-green-500/20' : 'bg-white/5'} blur-md transform scale-125`}></div>
                        <div className="relative">
                          {renderBadgeIcon(badge.id)}
                          {hasBadge && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-black/20">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Badge info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold text-md ${hasBadge ? 'text-white' : 'text-white/90'}`}>{badge.name}</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3.5 w-3.5 text-white/50 hover:text-white/90 transition-all duration-200 ease-in-out hover:scale-110" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>{badge.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-white/60 mt-1">{badge.description}</p>
                      </div>
                    </div>
                    
                    {/* Badge action button with improved styling */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionDetails.disabled}
                      className={cn("rounded-xl px-4 py-2 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium", actionDetails.color)}
                      onClick={() => handleBadgeAction(badge.id)}
                    >
                      {hasBadge ? (
                        <ShieldCheck className="w-4 h-4 mr-2" />
                      ) : badge.id === "server-booster" ? (
                        <SiDiscord className="w-3.5 h-3.5 mr-2" />
                      ) : badge.id === "premium" ? (
                        <Crown className="w-3.5 h-3.5 mr-2" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      )}
                      {actionDetails.text}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* User's earned badges summary */}
        <Card className="p-6 border-white/10 bg-gradient-to-br from-[#1a1a2e]/50 to-[#16213e]/50 backdrop-filter backdrop-blur-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#8e44ad] to-[#3498db]">Your Badge Collection ({userBadges.length}/{badges.length})</h2>
            {userBadges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {userBadges.map(badgeId => {
                  const badge = badges.find(b => b.id === badgeId);
                  if (!badge) return null;
                  
                  return (
                    <TooltipProvider key={badgeId}>
                      <Tooltip>
                        <TooltipTrigger>
                          <UIBadge className="bg-black/30 backdrop-blur-sm hover:bg-black/40 text-white border-white/10 py-2 px-3.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                            <div className="mr-2">{badge.icon}</div>
                            {badge.name}
                          </UIBadge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{badge.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-black/20 rounded-xl border border-white/5">
                <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/70 font-medium">You haven't earned any badges yet.</p>
                <p className="text-white/60 text-sm mt-2">Start by claiming your member badge!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Join Discord community card */}
        <Card className="p-6 border-purple-500/20 bg-gradient-to-r from-purple-950/30 to-indigo-950/20 backdrop-filter backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-purple-500/30 to-indigo-500/20 rounded-xl shadow-inner border border-purple-500/30 backdrop-filter backdrop-blur-sm">
                <SiDiscord className="w-10 h-10 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">Join Our Community</h3>
                <p className="text-white/80 mt-1">Connect with other users and earn exclusive badges</p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium"
              onClick={() => window.open(DISCORD_INVITE, "_blank")}
            >
              <SiDiscord className="w-5 h-5 mr-2" />
              Join Discord
            </Button>
          </div>
        </Card>
      </div>

      {/* Premium feature dialog */}
      {showPremiumDialog && (
        <PremiumFeatureDialog
          featureName={premiumFeatureName}
          open={showPremiumDialog}
          onOpenChange={setShowPremiumDialog}
        />
      )}
    </div>
  );
}