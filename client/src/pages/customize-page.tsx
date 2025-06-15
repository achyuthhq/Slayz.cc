import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Brush, Layout, Palette, Image, Code, Clock, Sparkles, Play, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Theme } from "@shared/schema";
import { debounce } from "lodash";
import { PremiumFeatureDialog } from "@/components/premium-feature-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { DocumentTitle } from "@/components/document-title";
import { MediaUploader } from "@/components/media-uploader";

const FONTS = [
  { value: "sans", label: "System Sans" },
  { value: "serif", label: "System Serif" },
  { value: "mono", label: "System Mono" },
  { value: "roboto", label: "Roboto" },
  { value: "lato", label: "Lato" },
  { value: "poppins", label: "Poppins" },
  { value: "montserrat", label: "Montserrat" },
  { value: "unbounded", label: "Unbounded" },
  { value: "dm-sans", label: "DM Sans" }
];

const FONT_SIZES = [
  { value: "sm", label: "Small" },
  { value: "base", label: "Base" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
  { value: "2xl", label: "2X Large" },
  { value: "3xl", label: "3X Large" }
];

const FONT_WEIGHTS = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" }
];

const LAYOUTS = [
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "creative", label: "Creative" },
  { value: "professional", label: "Professional" },
  { value: "social", label: "Social" }
];

const SPACINGS = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" }
];

const ALIGNMENTS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" }
];

const AVAILABLE_EFFECTS = ["white", "gold", "silver", "rainbow"];
type SparkleEffectType = typeof AVAILABLE_EFFECTS[number];

const SparkleName = ({ displayName, effect, className }: { displayName: string; effect: { enabled: boolean; type: SparkleEffectType }; className: string }) => {
  return (
    <span className={className}>
      {effect.enabled ? (
        <span
          style={{
            position: "relative",
            display: "inline-block"
          }}
        >
          {displayName.split("").map((char, index) => (
            <span key={index} style={{ position: "relative", display: "inline-block" }}>
              {char}
              {effect.enabled && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    left: `${index * 10}px`,
                    fontSize: "0.5em",
                    color: effect.type,
                    animation: "sparkle 2s linear infinite"
                  }}
                >
                  ✨
                </span>
              )}
            </span>
          ))}
        </span>
      ) : (
        displayName
      )}
    </span>
  );
};

// Add this helper function to detect video URLs
const isVideoURL = (url: string | null): boolean => {
  if (!url) return false;
  const extensions = ['mp4', 'webm', 'ogg'];
  const urlLower = url.toLowerCase();
  return extensions.some(ext => urlLower.endsWith(`.${ext}`));
};

export default function CustomizePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appearance");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const [enterPageText, setEnterPageText] = useState("");
  const [enterPageColor, setEnterPageColor] = useState("");
  const [enterPageCustomCSS, setEnterPageCustomCSS] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState<{
    enterPageText: boolean;
    enterPageCustomCSS: boolean;
  }>({
    enterPageText: false,
    enterPageCustomCSS: false
  });

  const { data: subscriptionData, isLoading } = useQuery<{ status: 'free' | 'premium' }>({
    queryKey: ["/api/subscription/status"],
    enabled: !!user
  });

  const isPremium = subscriptionData?.status === 'premium';

  const canAccessFeature = (feature: string) => {
    return isPremium || ["basic"].includes(feature);
  };

  const theme: Theme = (user?.theme ? (typeof user.theme === 'string' ? JSON.parse(user.theme) : user.theme) : {
    particleEffect: {
      enabled: true,
      quantity: 50,
      speed: 1
    },
    sparkleEffect: {
      enabled: false,
      type: "white" as const
    },
    viewCountPlacement: "top-right" as const,
    badges: [],
    font: {
      family: "sans" as const,
      size: "base" as const,
      weight: "normal" as const
    },
    background: {
      type: "color" as const,
      value: "#000000"
    },
    layout: {
      template: "classic" as const,
      spacing: "comfortable" as const,
      alignment: "center" as const
    },
    decoration: {
      enabled: false,
      name: "default",
      animation: {
        type: "none",
        speed: 1,
        scale: 1
      }
    },
    chatbot: {
      enabled: false,
      systemPrompt: "You are a helpful assistant that provides information about this profile.",
      position: "bottom-right",
      style: {
        buttonColor: "#0070f3",
        bubbleColor: "#f5f5f5",
        textColor: "#000000",
        font: "system-ui"
      },
      welcomeMessage: "👋 Hi! Feel free to ask me anything about this profile!",
      placeholderText: "Type your message here..."
    },
    enterPage: {
      enabled: true,
      text: "Enter Page",
      fontSize: "2rem",
      fontWeight: "bold",
      textColor: "#ffffff",
      animation: "fade",
      customCSS: ""
    },
    schedule: {
      enabled: false,
      slots: []
    },
    typingAnimation: {
      enabled: false
    },
    cursor: {
      enabled: false,
      type: "url",
      value: ""
    }
  } satisfies Theme);
  const [localColors, setLocalColors] = useState({
    solid: theme.background.value || "#000000",
    gradientStart: theme.background.gradientStart || "#000000",
    gradientEnd: theme.background.gradientEnd || "#ffffff"
  });

  const debouncedUpdateProfile = useCallback(
    debounce((updates: { theme: Partial<Theme> }) => {
      updateProfileMutation.mutate(updates);
    }, 500),
    []
  );

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { theme: Partial<Theme> }) => {
      const response = await apiRequest("PATCH", "/api/profile", updates);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const sparkleEffect = theme.sparkleEffect || {
    enabled: false,
    type: "white" as const
  };

  const onSparkleEffectToggle = (checked: boolean) => {
    if (!isPremium) {
      setPremiumFeatureName("Display Name Effects");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...theme,
        sparkleEffect: {
          ...sparkleEffect,
          enabled: checked
        }
      }
    });
  };

  const onEffectTypeChange = (type: SparkleEffectType) => {
    if (!isPremium) {
      setPremiumFeatureName("Display Name Effects");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...theme,
        sparkleEffect: {
          ...sparkleEffect,
          type: type as "white" | "green" | "black" | "pink" | "red" | "yellow"
        }
      }
    });
  };

  const handleTypingAnimationToggle = (checked: boolean) => {
    if (!isPremium) {
      // Don't show the premium dialog, just return without making changes
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...theme,
        typingAnimation: {
          enabled: checked
        }
      }
    });
  };

  const handleParticleEffects = (enabled: boolean) => {
    if (!enabled || canAccessFeature("particles")) {
      updateProfileMutation.mutate({
        theme: {
          ...theme,
          particleEffect: {
            ...theme.particleEffect,
            enabled,
            quantity: theme.particleEffect?.quantity || 50,
            speed: theme.particleEffect?.speed || 1
          },
        },
      });
    } else {
      setPremiumFeatureName("Particle Effects");
      setShowPremiumDialog(true);
    }
  };

  const handleCursorCustomization = (enabled: boolean) => {
    if (!enabled || canAccessFeature("cursor")) {
      updateProfileMutation.mutate({
        theme: {
          ...theme,
          cursor: {
            enabled,
            type: theme.cursor?.type || "url",
            value: theme.cursor?.value || ""
          },
        },
      });
    } else {
      setPremiumFeatureName("Custom Cursor");
      setShowPremiumDialog(true);
    }
  };

  const handleProfileMusic = (enabled: boolean) => {
    if (!isPremium) {
      setPremiumFeatureName("Profile Music");
      setShowPremiumDialog(true);
      return;
    }
    // Using type assertion since profileMusic isn't in the Theme type
    const updatedTheme = {
      ...theme,
      profileMusic: {
        enabled
      }
    };
    updateProfileMutation.mutate({
      theme: updatedTheme as any
    });
  };

  const handleSparkleEffect = (enabled: boolean) => {
    if (!enabled || canAccessFeature("sparkles")) {
      updateProfileMutation.mutate({
        theme: {
          ...theme,
          sparkleEffect: {
            enabled,
            type: theme.sparkleEffect?.type || "white"
          },
        },
      });
    } else {
      setPremiumFeatureName("Sparkle Effect");
      setShowPremiumDialog(true);
    }
  };

  const handleBackgroundChange = (type: Theme["background"]["type"]) => {
    if (canAccessFeature("background")) {
      updateProfileMutation.mutate({
        theme: {
          ...theme,
          background: {
            type,
            value: "",
            gradientStart: type === "gradient" ? "#000000" : undefined,
            gradientEnd: type === "gradient" ? "#ffffff" : undefined
          },
        },
      });
    } else {
      setPremiumFeatureName("Custom Background");
      setShowPremiumDialog(true);
    }
  };

  const handleDecorationToggle = (checked: boolean) => {
    if (!isPremium) {
      setPremiumFeatureName("Avatar Decorations");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...theme,
        decoration: {
          ...theme.decoration,
          enabled: checked,
        },
      },
    });
  };

  const handleChatbotToggle = (checked: boolean) => {
    if (!isPremium) {
      setPremiumFeatureName("Chatbot");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...theme,
        chatbot: {
          ...theme.chatbot,
          enabled: checked
        }
      }
    });
  };
  const handleDecorationClick = () => {
    // Add your decoration logic here
    console.log("Decoration button clicked!");
  };

  const handleDecorationChange = (name: string) => {
    if (!isPremium) {
      setPremiumFeatureName("Avatar Decorations");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...theme,
        decoration: {
          ...theme.decoration,
          name,
        },
      },
    });
  };

  // Add a new function to handle saving changes manually
  const handleSaveChanges = (field: keyof typeof unsavedChanges) => {
    switch(field) {
      case 'enterPageText':
        debouncedUpdateProfile({
          theme: {
            ...theme,
            enterPage: {
              ...theme.enterPage,
              text: enterPageText,
            },
          },
        });
        break;
      case 'enterPageCustomCSS':
        debouncedUpdateProfile({
          theme: {
            ...theme,
            enterPage: {
              ...theme.enterPage,
              customCSS: enterPageCustomCSS,
            },
          },
        });
        break;
    }
    
    // Clear the unsaved changes flag
    setUnsavedChanges(prev => ({
      ...prev,
      [field]: false
    }));
  };

  // Add a new function to cancel changes
  const handleCancelChanges = (field: keyof typeof unsavedChanges) => {
    switch(field) {
      case 'enterPageText':
        setEnterPageText(theme.enterPage?.text || "Enter Page");
        break;
      case 'enterPageCustomCSS':
        setEnterPageCustomCSS(theme.enterPage?.customCSS || "");
        break;
    }
    
    // Clear the unsaved changes flag
    setUnsavedChanges(prev => ({
      ...prev,
      [field]: false
    }));
  };

  // Initialize local state from theme when it changes
  useEffect(() => {
    if (theme.enterPage) {
      setEnterPageText(theme.enterPage.text || "Enter Page");
      setEnterPageColor(theme.enterPage.textColor || "#ffffff");
      setEnterPageCustomCSS(theme.enterPage.customCSS || "");
      // Reset unsaved changes flags when loading data from server
      setUnsavedChanges({
        enterPageText: false,
        enterPageCustomCSS: false
      });
    }
  }, [theme.enterPage?.text, theme.enterPage?.textColor, theme.enterPage?.customCSS]);

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentTitle title="Customize" />
      <PremiumFeatureDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        featureName={premiumFeatureName}
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold tracking-tighter">Customize Your Profile</h1>
        </div>

        <Card className="p-4 sm:p-6 border-[#8e44ad]/20 bg-[#8e44ad]/10 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="relative">
              <TabsList className="sticky top-0 z-[200] flex flex-wrap justify-center items-center gap-2 sm:gap-4 bg-[#1a1a1a] backdrop-blur-sm border-[#8e44ad]/20 py-4 px-3 mb-8 shadow-lg">
                <TabsTrigger value="appearance" className="flex-1 min-w-[100px] glass-button data-[state=active]:bg-[#8e44ad]/30">
                  <Brush className="w-4 h-4 mr-2" />
                  Font
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex-1 min-w-[100px] glass-button data-[state=active]:bg-[#8e44ad]/30">
                  <Layout className="w-4 h-4 mr-2" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="background" className="flex-1 min-w-[100px] glass-button data-[state=active]:bg-[#8e44ad]/30">
                  <Palette className="w-4 h-4 mr-2" />
                  Background
                </TabsTrigger>
                <TabsTrigger value="enter-page" className="flex-1 min-w-[100px] glass-button data-[state=active]:bg-[#8e44ad]/30">
                  <Play className="w-4 h-4 mr-2" />
                  Enter Page
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex-1 min-w-[100px] glass-button data-[state=active]:bg-[#8e44ad]/30">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </TabsTrigger>
                {isPremium && (
                  <TabsTrigger value="chatbot" className="flex-1 min-w-[100px] glass-button data-[state=active]:bg-[#8e44ad]/30">
                    <Code className="w-4 h-4 mr-2" />
                    Chatbot
                  </TabsTrigger>
                )}
              </TabsList>


              <TabsContent value="appearance" className="space-y-6 mt-2">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Typography</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Font Family</Label>
                        <Select
                          value={theme.font?.family || "sans"}
                          onValueChange={(value: Theme["font"]["family"]) =>
                            updateProfileMutation.mutate({
                              theme: {
                                ...theme,
                                font: {
                                  ...theme.font,
                                  family: value,
                                },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONTS.map((font) => (
                              <SelectItem
                                key={font.value}
                                value={font.value}
                                className={`font-${font.value}`}
                              >
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Font Size</Label>
                        <Select
                          value={theme.font?.size || "base"}
                          onValueChange={(value: Theme["font"]["size"]) =>
                            updateProfileMutation.mutate({
                              theme: {
                                ...theme,
                                font: {
                                  ...theme.font,
                                  size: value,
                                },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_SIZES.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Font Weight</Label>
                        <Select
                          value={theme.font?.weight || "normal"}
                          onValueChange={(value: Theme["font"]["weight"]) =>
                            updateProfileMutation.mutate({
                              theme: {
                                ...theme,
                                font: {
                                  ...theme.font,
                                  weight: value,
                                },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHTS.map((weight) => (
                              <SelectItem key={weight.value} value={weight.value}>
                                {weight.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border border-[#8e44ad]/20 rounded-lg p-4 bg-[#8e44ad]/20 hover:bg-[#8e44ad]/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sparkle-toggle">Display Name Effects</Label>
                      <Switch
                        id="sparkle-toggle"
                        checked={sparkleEffect.enabled}
                        onCheckedChange={onSparkleEffectToggle}
                        disabled={!isPremium}
                      />
                    </div>
                    {!isPremium && (
                      <div className="mt-2 p-3 bg-[#1a1a1a] border border-[#8e44ad]/20 rounded text-sm text-white/70">
                        This feature is only available with a premium subscription
                      </div>
                    )}
                    {isPremium && sparkleEffect.enabled && (
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="p-4 rounded-lg bg-[#8e44ad]/20 border border-[#8e44ad]/20">
                            <SparkleName
                              displayName={user?.displayName || user?.username || ''}
                              effect={sparkleEffect}
                              className="text-2xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Effect Type</Label>
                          <RadioGroup
                            value={sparkleEffect.type}
                            onValueChange={onEffectTypeChange}
                            className="grid grid-cols-3 gap-2"
                          >
                            {AVAILABLE_EFFECTS.map((effect) => (
                              <div key={effect} className="flex items-center space-x-2">
                                <RadioGroupItem value={effect} id={`effect-${effect}`} />
                                <Label htmlFor={`effect-${effect}`} className="capitalize">
                                  {effect}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border border-[#8e44ad]/20 rounded-lg p-4 bg-[#8e44ad]/20 hover:bg-[#8e44ad]/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="particle-effects-toggle">Particle Effects</Label>
                      <Switch
                        id="particle-effects-toggle"
                        checked={theme.particleEffect?.enabled}
                        onCheckedChange={handleParticleEffects}
                        disabled={!isPremium}
                      />
                    </div>
                    {!isPremium && (
                      <div className="mt-2 p-3 bg-[#1a1a1a] border border-[#8e44ad]/20 rounded text-sm text-white/70">
                        This feature is only available with a premium subscription
                      </div>
                    )}
                    {isPremium && theme.particleEffect?.enabled && (
                      <div className="grid gap-4">
                        <h4 className="text-sm text-white/80 -mb-2">
                          Beautiful falling dots from top to bottom of screen
                        </h4>

                        <div className="grid gap-2">
                          <Label>Quantity ({theme.particleEffect?.quantity || 50}) - Particles on screen</Label>
                          <input 
                            type="range"
                            min="10" 
                            max="200" 
                            step="5"
                            value={theme.particleEffect?.quantity || 50}
                            onChange={(e) => 
                              updateProfileMutation.mutate({
                                theme: {
                                  ...theme,
                                  particleEffect: {
                                    ...theme.particleEffect,
                                    quantity: parseInt(e.target.value),
                                  },
                                },
                              })
                            }
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Speed ({theme.particleEffect?.speed || 1}) - How fast particles fall</Label>
                          <input 
                            type="range"
                            min="0.5" 
                            max="5" 
                            step="0.1"
                            value={theme.particleEffect?.speed || 1}
                            onChange={(e) => 
                              updateProfileMutation.mutate({
                                theme: {
                                  ...theme,
                                  particleEffect: {
                                    ...theme.particleEffect,
                                    speed: parseFloat(e.target.value),
                                  },
                                },
                              })
                            }
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Size ({theme.particleEffect?.size || 3}) - Size of each particle</Label>
                          <input 
                            type="range"
                            min="1" 
                            max="10" 
                            step="0.5"
                            value={theme.particleEffect?.size || 3}
                            onChange={(e) => 
                              updateProfileMutation.mutate({
                                theme: {
                                  ...theme,
                                  particleEffect: {
                                    ...theme.particleEffect,
                                    size: parseFloat(e.target.value),
                                  },
                                },
                              })
                            }
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Color - Select the color of particles</Label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={theme.particleEffect?.color || "#ffffff"}
                              onChange={(e) => 
                                updateProfileMutation.mutate({
                                  theme: {
                                    ...theme,
                                    particleEffect: {
                                      ...theme.particleEffect,
                                      color: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-10 h-10 rounded-md cursor-pointer border-0"
                            />
                            <span className="text-sm text-white/80 font-mono">
                              {theme.particleEffect?.color || "#ffffff"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border border-[#8e44ad]/20 rounded-lg p-4 bg-[#8e44ad]/20 hover:bg-[#8e44ad]/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cursor-customization-toggle">Cursor Customization</Label>
                      <Switch
                        id="cursor-customization-toggle"
                        checked={theme.cursor?.enabled}
                        onCheckedChange={handleCursorCustomization}
                        disabled={!isPremium}
                      />
                    </div>
                    {!isPremium && (
                      <div className="mt-2 p-3 bg-[#1a1a1a] border border-[#8e44ad]/20 rounded text-sm text-white/70">
                        This feature is only available with a premium subscription
                      </div>
                    )}
                    {isPremium && theme.cursor?.enabled && (
                      <div className="grid gap-4">
                        {/* Add cursor customization options here */}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#8e44ad]/20 rounded-lg bg-[#8e44ad]/20 hover:bg-[#8e44ad]/30 transition-all duration-300">
                    <Label htmlFor="typing-animation-toggle">Enable Typing Animation for Bio</Label>
                    <Switch
                      id="typing-animation-toggle"
                      checked={theme.typingAnimation?.enabled || false}
                      onCheckedChange={handleTypingAnimationToggle}
                      disabled={!isPremium}
                    />
                  </div>
                  {!isPremium && (
                    <div className="mt-2 p-3 bg-[#1a1a1a] border border-[#8e44ad]/20 rounded text-sm text-white/70">
                      The typing animation feature is only available with a premium subscription
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 border border-[#8e44ad]/20 rounded-lg bg-[#8e44ad]/20 hover:bg-[#8e44ad]/30 transition-all duration-300">
                    <Label htmlFor="profile-music-toggle">Enable Profile Music</Label>
                    <Switch
                      id="profile-music-toggle"
                      checked={theme.profileMusic?.enabled || false}
                      onCheckedChange={handleProfileMusic}
                      disabled={!isPremium}
                    />
                  </div>
                  {!isPremium && (
                    <div className="mt-2 p-3 bg-[#1a1a1a] border border-[#8e44ad]/20 rounded text-sm text-white/70 flex items-center justify-between">
                      <span>Premium feature</span>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setPremiumFeatureName("Profile Music");
                          setShowPremiumDialog(true);
                        }}
                      >
                        Upgrade
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 border border-[#8e44ad]/20 rounded-lg bg-[#8e44ad]/20 hover:bg-[#8e44ad]/30 transition-all duration-300">
                    <Label htmlFor="decoration-toggle">Enable Avatar Decorations</Label>
                    <Switch
                      id="decoration-toggle"
                      checked={theme.decoration?.enabled || false}
                      onCheckedChange={handleDecorationToggle}
                      disabled={!isPremium}
                    />
                  </div>
                  {!isPremium && (
                    <div className="mt-2 p-3 bg-[#1a1a1a] border border-[#8e44ad]/20 rounded text-sm text-white/70 flex items-center justify-between">
                      <span>Premium feature</span>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setPremiumFeatureName("Avatar Decorations");
                          setShowPremiumDialog(true);
                        }}
                      >
                        Upgrade
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="layout" className="space-y-6 mt-2">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Layout Settings</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Template</Label>
                        <Select
                          value={theme.layout?.template || "classic"}
                          onValueChange={(value: Theme["layout"]["template"]) =>
                            updateProfileMutation.mutate({
                              theme: {
                                ...theme,
                                layout: {
                                  ...theme.layout,
                                  template: value,
                                },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LAYOUTS.map((layout) => (
                              <SelectItem key={layout.value} value={layout.value}>
                                {layout.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Spacing</Label>
                        <Select
                          value={theme.layout?.spacing || "comfortable"}
                          onValueChange={(value: Theme["layout"]["spacing"]) =>
                            updateProfileMutation.mutate({
                              theme: {
                                ...theme,
                                layout: {
                                  ...theme.layout,
                                  spacing: value,
                                },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SPACINGS.map((spacing) => (
                              <SelectItem key={spacing.value} value={spacing.value}>
                                {spacing.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Alignment</Label>
                        <Select
                          value={theme.layout?.alignment || "center"}
                          onValueChange={(value: Theme["layout"]["alignment"]) =>
                            updateProfileMutation.mutate({
                              theme: {
                                ...theme,
                                layout: {
                                  ...theme.layout,
                                  alignment: value,
                                },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALIGNMENTS.map((alignment) => (
                              <SelectItem key={alignment.value} value={alignment.value}>
                                {alignment.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="background" className="space-y-6 mt-2">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Background Settings</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Background Type</Label>
                        <Select
                          value={theme.background?.type || "color"}
                          onValueChange={handleBackgroundChange}
                        >
                          <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="color">Solid Color</SelectItem>
                            {isPremium && (
                              <>
                                <SelectItem value="gradient">Gradient</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="animation">Animation</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {theme.background?.type === "color" && (
                        <div>
                          <Label>Background Color</Label>
                          <Input
                            type="color"
                            value={localColors.solid}
                            onChange={(e) => {
                              setLocalColors((prev) => ({ ...prev, solid: e.target.value }));
                            }}
                            onBlur={() => {
                              debouncedUpdateProfile({
                                theme: {
                                  ...theme,
                                  background: {
                                    ...theme.background,
                                    type: "color",
                                    value: localColors.solid,
                                  },
                                },
                              });
                            }}
                            className="bg-[#8e44ad]/20 border-[#8e44ad]/20"
                          />
                        </div>
                      )}

                      {theme.background?.type === "gradient" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Color</Label>
                            <Input
                              type="color"
                              value={localColors.gradientStart}
                              onChange={(e) => {
                                setLocalColors((prev) => ({
                                  ...prev,
                                  gradientStart: e.target.value,
                                }));
                              }}
                              onBlur={() => {
                                debouncedUpdateProfile({
                                  theme: {
                                    ...theme,
                                    background: {
                                      ...theme.background,
                                      type: "gradient",
                                      gradientStart: localColors.gradientStart,
                                      gradientEnd: localColors.gradientEnd,
                                      value: `linear-gradient(to right, ${localColors.gradientStart}, ${localColors.gradientEnd})`,
                                    },
                                  },
                                });
                              }}
                              className="bg-[#8e44ad]/20 border-[#8e44ad]/20"
                            />
                          </div>
                          <div>
                            <Label>End Color</Label>
                            <Input
                              type="color"
                              value={localColors.gradientEnd}
                              onChange={(e) => {
                                setLocalColors((prev) => ({
                                  ...prev,
                                  gradientEnd: e.target.value,
                                }));
                              }}
                              onBlur={() => {
                                debouncedUpdateProfile({
                                  theme: {
                                    ...theme,
                                    background: {
                                      ...theme.background,
                                      type: "gradient",
                                      gradientStart: localColors.gradientStart,
                                      gradientEnd: localColors.gradientEnd,
                                      value: `linear-gradient(to right, ${localColors.gradientStart}, ${localColors.gradientEnd})`,
                                    },
                                  },
                                });
                              }}
                              className="bg-[#8e44ad]/20 border-[#8e44ad]/20"
                            />
                          </div>
                        </div>
                      )}

                      {(theme.background?.type === "image" || theme.background?.type === "video") && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Upload {theme.background.type === "image" ? "Image" : "Video"}</h3>
                            {theme.background?.value && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  updateProfileMutation.mutate({
                                    theme: {
                                      ...theme,
                                      background: {
                                        ...theme.background,
                                        value: "",
                                      },
                                    },
                                  });
                                }}
                                className="border-[#8e44ad]/20 bg-[#8e44ad]/10 hover:bg-[#8e44ad]/20 text-white"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          
                          <MediaUploader 
                            type="background"
                            onUpload={(url) => {
                              updateProfileMutation.mutate({
                                theme: {
                                  ...theme,
                                  background: {
                                    ...theme.background,
                                    value: url,
                                  },
                                },
                              });
                            }}
                          />
                          
                          {theme.background?.value && (
                            <div className="mt-4 border border-[#8e44ad]/20 rounded-lg p-3 flex justify-center bg-[#8e44ad]/10">
                              {theme.background.type === "image" || !isVideoURL(theme.background.value) ? (
                                <img
                                  src={theme.background.value}
                                  alt="Background preview"
                                  className="max-h-40 rounded"
                                />
                              ) : (
                                <video
                                  src={theme.background.value}
                                  className="max-h-40 rounded"
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                >
                                  Your browser does not support video playback.
                                </video>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {theme.background?.type === "animation" && (
                      <>
                        <div className="grid gap-2">
                          <Label>Animation Type</Label>
                          <Select
                            value={theme.background?.animation?.name || "none"}
                            onValueChange={(value: Theme["background"]["animation"]["name"]) =>
                              updateProfileMutation.mutate({
                                theme: {
                                  ...theme,
                                  background: {
                                    ...theme.background,
                                    animation: {
                                      ...theme.background.animation,
                                      name: value,
                                    },
                                  },
                                },
                              })
                            }
                          >
                            <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="fade">Fade</SelectItem>
                              <SelectItem value="slide">Slide</SelectItem>
                              <SelectItem value="zoom">Zoom</SelectItem>
                              <SelectItem value="bounce">Bounce</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Animation Duration (seconds)</Label>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={theme.background?.animation?.duration || 1}
                            onChange={(e) =>
                              updateProfileMutation.mutate({
                                theme: {
                                  ...theme,
                                  background: {
                                    ...theme.background,
                                    animation: {
                                      ...theme.background.animation,
                                      duration: parseFloat(e.target.value),
                                    },
                                  },
                                },
                              })                            
                            }
                            className="bg-[#8e44ad]/20 border-[#8e44ad]/20"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="custom-css" className="space-y-6 mt-2">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Custom CSS</h3>
                    <div className="grid gap-4">
                      <Textarea
                        placeholder="Enter your custom CSS here..."
                        value={theme.customCSS || ""}
                        onChange={(e) =>
                          updateProfileMutation.mutate({
                            theme: {
                              ...theme,
                              customCSS: e.target.value,
                            },
                          })
                        }
                        className="font-mono min-h-[200px] bg-[#8e44ad]/20 border-[#8e44ad]/20"
                      />
                      <p className="text-sm text-muted-foreground">
                        Add custom CSS to further customize your profile's appearance.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="enter-page" className="space-y-6 mt-2">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Enter Page Settings</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enter-page-toggle">Enable Enter Page</Label>
                        <Switch
                          id="enter-page-toggle"
                          checked={theme.enterPage?.enabled || false}
                          onCheckedChange={(checked) =>
                            updateProfileMutation.mutate({
                              theme: {
                                ...theme,
                                enterPage: {
                                  ...theme.enterPage,
                                  enabled: checked,
                                },
                              },
                            })
                          }
                        />
                      </div>

                      {(theme.enterPage?.enabled || false) && (
                        <>
                          <div className="grid gap-2">
                            <Label>Text</Label>
                            <div className="relative">
                              <Input
                                type="text"
                                value={enterPageText}
                                onChange={(e) => {
                                  setEnterPageText(e.target.value);
                                  // Mark as having unsaved changes
                                  setUnsavedChanges(prev => ({
                                    ...prev,
                                    enterPageText: true
                                  }));
                                }}
                                className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30 pr-20"
                              />
                              {unsavedChanges.enterPageText && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                  <button 
                                    onClick={() => handleCancelChanges('enterPageText')}
                                    className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-gray-600/80 transition-colors"
                                    title="Cancel changes"
                                  >
                                    <X className="w-4 h-4 text-white" />
                                  </button>
                                  <button 
                                    onClick={() => handleSaveChanges('enterPageText')}
                                    className="h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] hover:from-[#9b59b6] hover:to-[#a569bd] transition-colors shadow-md"
                                    title="Save changes"
                                  >
                                    <Check className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label>Font Size</Label>
                            <Select
                              value={theme.enterPage?.fontSize || "2rem"}
                              onValueChange={(value) =>
                                debouncedUpdateProfile({
                                  theme: {
                                    ...theme,
                                    enterPage: {
                                      ...theme.enterPage,
                                      fontSize: value,
                                    },
                                  },
                                })
                              }
                            >
                              <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1rem">Small</SelectItem>
                                <SelectItem value="1.5rem">Medium</SelectItem>
                                <SelectItem value="2rem">Large</SelectItem>
                                <SelectItem value="3rem">Extra Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label>Font Weight</Label>
                            <Select
                              value={theme.enterPage?.fontWeight || "bold"}
                              onValueChange={(value) =>
                                debouncedUpdateProfile({
                                  theme: {
                                    ...theme,
                                    enterPage: {
                                      ...theme.enterPage,
                                      fontWeight: value as "normal" | "medium" | "semibold" | "bold",
                                    },
                                  },
                                })
                              }
                            >
                              <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FONT_WEIGHTS.map((weight) => (
                                  <SelectItem key={weight.value} value={weight.value}>
                                    {weight.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label>Animation</Label>
                            <Select
                              value={theme.enterPage?.animation || "fade"}
                              onValueChange={(value) =>
                                debouncedUpdateProfile({
                                  theme: {
                                    ...theme,
                                    enterPage: {
                                      ...theme.enterPage,
                                      animation: value as "none" | "fade" | "scale" | "slide",
                                    },
                                  },
                                })
                              }
                            >
                              <SelectTrigger className="glass-input bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="fade">Fade</SelectItem>
                                <SelectItem value="scale">Scale</SelectItem>
                                <SelectItem value="slide">Slide</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label>Custom CSS (Optional)</Label>
                            <div className="relative">
                              <Textarea
                                placeholder="Add custom CSS for enter page"
                                className="h-32 font-mono text-sm bg-[#8e44ad]/20 border-[#8e44ad]/20 hover:bg-[#8e44ad]/30"
                                value={enterPageCustomCSS}
                                onChange={(e) => {
                                  setEnterPageCustomCSS(e.target.value);
                                  // Mark as having unsaved changes
                                  setUnsavedChanges(prev => ({
                                    ...prev,
                                    enterPageCustomCSS: true
                                  }));
                                }}
                              />
                              {unsavedChanges.enterPageCustomCSS && (
                                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                                  <button 
                                    onClick={() => handleCancelChanges('enterPageCustomCSS')}
                                    className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-gray-600/80 transition-colors"
                                    title="Cancel changes"
                                  >
                                    <X className="w-4 h-4 text-white" />
                                  </button>
                                  <button 
                                    onClick={() => handleSaveChanges('enterPageCustomCSS')}
                                    className="h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] hover:from-[#9b59b6] hover:to-[#a569bd] transition-colors shadow-md"
                                    title="Save changes"
                                  >
                                    <Check className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Preview</Label>
                            <div className="p-8 rounded-lg bg-[#8e44ad]/20 border border-[#8e44ad]/20 flex items-center justify-center">
                              <div
                                style={{
                                  fontSize: theme.enterPage?.fontSize || "2rem",
                                  fontWeight: theme.enterPage?.fontWeight || "bold",
                                  color: theme.enterPage?.textColor || "#ffffff"
                                }}
                                className="cursor-pointer transition-all duration-300 hover:opacity-80"
                              >
                                {theme.enterPage?.text || "Enter Page"}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-6 mt-2">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Theme Scheduling</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={theme.schedule?.enabled || false}
                          onChange={(e) =>
                            updateProfileMutation.mutate({
                              theme: {
                                ...theme,
                                schedule: {
                                  enabled: e.target.checked,
                                  slots: theme.schedule?.slots || [],
                                },
                              },
                            })
                          }
                        />
                        <Label>Enable Theme Scheduling</Label>
                      </div>

                      {theme.schedule?.enabled && (
                        <div className="space-y-4">
                          {(theme.schedule?.slots || []).map((slot, index) => (
                            <Card key={slot.id} className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 hover:bg-[#8e44ad]/30 transition-all duration-300">
                              <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Start Time</Label>
                                    <Input
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) => {
                                        const newSlots = [...theme.schedule!.slots];
                                        newSlots[index] = {
                                          ...slot,
                                          startTime: e.target.value,
                                        };
                                        updateProfileMutation.mutate({
                                          theme: {
                                            ...theme,
                                            schedule: {
                                              ...theme.schedule!,
                                              slots: newSlots,
                                            },
                                          },
                                        });
                                      }}
                                      className="bg-[#8e44ad]/20 border-[#8e44ad]/20"
                                    />
                                  </div>
                                  <div>
                                    <Label>End Time</Label>
                                    <Input
                                      type="time"
                                      value={slot.endTime}
                                      onChange={(e) => {
                                        const newSlots = [...theme.schedule!.slots];
                                        newSlots[index] = {
                                          ...slot,
                                          endTime: e.target.value,
                                        };
                                        updateProfileMutation.mutate({
                                          theme: {
                                            ...theme,
                                            schedule: {
                                              ...theme.schedule!,
                                              slots: newSlots,
                                            },
                                          },
                                        });
                                      }}
                                      className="bg-[#8e44ad]/20 border-[#8e44ad]/20"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Days</Label>
                                  <div className="flex gap-2 flex-wrap">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                                      (day, dayIndex) => (
                                        <Button
                                          key={day}
                                          variant={
                                            slot.days.includes(dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6)
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() => {
                                            const newSlots = [...theme.schedule!.slots];
                                            const newDays = slot.days.includes(
                                              dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                                            )
                                              ? slot.days.filter((d) => d !== dayIndex)
                                              : [...slot.days, dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6];
                                            newSlots[index] = {
                                              ...slot,
                                              days: newDays,
                                            };
                                            updateProfileMutation.mutate({
                                              theme: {
                                                ...theme,
                                                schedule: {
                                                  ...theme.schedule!,
                                                  slots: newSlots,
                                                },
                                              },
                                            });
                                          }}
                                        >
                                          {day}
                                        </Button>
                                      ),
                                    )}
                                  </div>
                                </div>

                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    const newSlots = theme.schedule!.slots.filter((_, i) => i !== index);
                                    updateProfileMutation.mutate({
                                      theme: {
                                        ...theme,
                                        schedule: {
                                          ...theme.schedule!,
                                          slots: newSlots,
                                        },
                                      },
                                    });
                                  }}
                                  className="bg-red-500/80 hover:bg-red-500"
                                >
                                  Remove Slot
                                </Button>
                              </div>
                            </Card>
                          ))}

                          <Button
                            onClick={() => {
                              const newSlot = {
                                id: crypto.randomUUID(),
                                startTime: "00:00",
                                endTime: "23:59",
                                days: [],
                                theme: {
                                  ...theme,
                                  schedule: undefined,
                                },
                              };
                              updateProfileMutation.mutate({
                                theme: {
                                  ...theme,
                                  schedule: {
                                    ...theme.schedule!,
                                    slots: [...theme.schedule!.slots, newSlot],
                                  },
                                },
                              });
                            }}
                            className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white"
                          >
                            Add Time Slot
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>

    </div>
  );
}