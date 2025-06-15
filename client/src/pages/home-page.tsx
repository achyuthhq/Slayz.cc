import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DocumentTitle } from "@/components/document-title";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Loader2,
  Upload,
  Music,
  User,
  Image as ImageIcon,
  Sparkles,
  Snowflake,
  ChevronRight,
  Clock,
  BookOpen,
  Users,
  MousePointer,
  DoorOpen,
  MessageSquare,
  Check,
  X,
  Cog,
  Copy,
  Edit,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { uploadToServer } from "@/lib/firebase";
import { Link } from "wouter";
import { Theme } from "@shared/schema";
import { DecorationSelector } from "@/components/decoration-selector";
import { DecorationPreview } from "@/components/decoration-preview";
import { ParticlesComponent } from "@/components/particles";
import { SparkleName, AVAILABLE_EFFECTS, type SparkleEffect, type SparkleEffectType } from "@/components/sparkle-name";
import { FaSpotify, FaDiscord, FaGithub } from "react-icons/fa";
import { AssetUploader } from "@/components/asset-uploader";
import { Textarea } from "@/components/ui/textarea";
import { Crown } from "lucide-react";
import { useLocation } from 'wouter';

const SPOTIFY_URL_REGEX = /^https:\/\/open\.spotify\.com\/(track|album|artist)\/([a-zA-Z0-9]+)(\?.*)?$/;

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localBio, setLocalBio] = useState(user?.bio || "");
  const [localDisplayName, setLocalDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState("");
  const bioUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const [decorationSelectorOpen, setDecorationSelectorOpen] = useState(false);
  const [localParticleSettings, setLocalParticleSettings] = useState<
    Partial<NonNullable<Theme["particleEffect"]>>
  >({});
  const debouncedParticleSettings = useDebounce(localParticleSettings, 500);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const isPremium = user?.subscriptionStatus === "premium";
  const [, navigate] = useLocation();
  
  // Add state for tracking unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState<{
    enterPageText: boolean;
    enterPageTextColor: boolean;
    enterPageCustomCSS: boolean;
    displayName: boolean;
    bio: boolean;
    spotifyDisplayText: boolean;
  }>({
    enterPageText: false,
    enterPageTextColor: false,
    enterPageCustomCSS: false,
    displayName: false,
    bio: false,
    spotifyDisplayText: false
  });
  
  // Add local state for enter page fields
  const [enterPageText, setEnterPageText] = useState("");
  const [enterPageTextColor, setEnterPageTextColor] = useState("#ffffff");
  const [enterPageCustomCSS, setEnterPageCustomCSS] = useState("");
  const [spotifyDisplayText, setSpotifyDisplayText] = useState("");

  const sparkleEffect = user?.theme?.sparkleEffect || {
    enabled: false,
    type: "white" as const
  };

  useEffect(() => {
    if (user?.bio) {
      setLocalBio(user.bio);
    }
    if (user?.displayName) {
      setLocalDisplayName(user.displayName);
    }
  }, [user?.bio, user?.displayName]);

  const updateProfileMutation = useMutation({
    mutationFn: async (
      data: FormData | { theme?: Partial<Theme> } | object,
    ) => {
      setIsUploading(true);
      try {
        const res = await apiRequest("PATCH", "/api/profile", data);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.details || errorData.error || "Failed to update profile",
          );
        }
        return await res.json();
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      if (user?.username) {
        queryClient.invalidateQueries({
          queryKey: [`/api/profile/${user.username}`],
        });
      }
      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved",
      });
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSpotifyLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      const match = url.match(SPOTIFY_URL_REGEX);
      if (!match) {
        throw new Error("Invalid Spotify URL");
      }

      const response = await apiRequest("PATCH", "/api/profile", {
        theme: {
          ...user?.theme,
          spotifyLink: url,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update Spotify link");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Spotify link updated",
        description: "Your profile music has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update Spotify link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDecorationSelect = (decoration: Theme["decoration"]) => {
    const currentTheme = (user?.theme as Theme) || {};
    updateProfileMutation.mutate({
      theme: {
        ...currentTheme,
        decoration,
      },
    });
    setDecorationSelectorOpen(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "background",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      if (type === "logo") {
        formData.append("logo", file);
      } else {
        formData.append("backgroundImage", file);
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      if (event.target) event.target.value = "";

      toast({
        title: "Upload successful",
        description: `Your ${type} has been updated.`,
      });
    } catch (error) {
      console.error(`${type} upload error:`, error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    setLocalBio(newBio);
    setUnsavedChanges(prev => ({
      ...prev,
      bio: true
    }));

    // Clear any existing timeout
    if (bioUpdateTimeoutRef.current) {
      clearTimeout(bioUpdateTimeoutRef.current);
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayName = e.target.value;
    setLocalDisplayName(newDisplayName);
    setUnsavedChanges(prev => ({
      ...prev,
      displayName: true
    }));
  };

  useEffect(() => {
    return () => {
      if (bioUpdateTimeoutRef.current) {
        clearTimeout(bioUpdateTimeoutRef.current);
      }
    };
  }, []);

  const handleParticleUpdate = (
    updates: Partial<NonNullable<Theme["particleEffect"]>>,
  ) => {
    setLocalParticleSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const onSparkleEffectToggle = (checked: boolean) => {
    if (!isPremium && checked) {
      setPremiumFeatureName("Display Name Effects");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...user?.theme,
        sparkleEffect: {
          ...sparkleEffect,
          enabled: checked
        }
      }
    });
  };

  const handleParticleEffects = (checked: boolean) => {
    if (!isPremium && checked) {
      setPremiumFeatureName("Particle Effects");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...user?.theme,
        particleEffect: {
          ...user?.theme?.particleEffect,
          enabled: checked
        }
      }
    });
  };

  const handleCursorCustomization = (checked: boolean) => {
    if (!isPremium && checked) {
      setPremiumFeatureName("Cursor Customization");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...user?.theme,
        cursor: {
          ...user?.theme?.cursor,
          enabled: checked
        }
      }
    });
  };


  useEffect(() => {
    if (Object.keys(debouncedParticleSettings).length > 0) {
      const currentTheme = (user?.theme as Theme) || {};
      const currentParticleEffect = currentTheme.particleEffect || {
        enabled: true,
        mode: "snow",
        quantity: 50,
        direction: "down",
        speed: 1,
        size: 3,
      };

      updateProfileMutation.mutate({
        theme: {
          ...currentTheme,
          particleEffect: {
            ...currentParticleEffect,
            ...debouncedParticleSettings,
          },
        },
      });

      setLocalParticleSettings({});
    }
  }, [debouncedParticleSettings]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(value);
  };

  const handleCursorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("cursor", file);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload cursor");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Upload successful",
        description: "Your cursor has been updated.",
      });
    } catch (error) {
      console.error("Cursor upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload cursor",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const cursorPreviewStyle = user?.theme?.cursor?.enabled && user.theme.cursor.value
    ? { cursor: `url(${user.theme.cursor.value}) 0 0, auto` }
    : {};

  if (!user) return null;

  const theme = (user.theme as Theme) || {};

  const handleChatbotToggle = (checked: boolean) => {
    if (!isPremium) {
      setPremiumFeatureName("AI Chatbot");
      setShowPremiumDialog(true);
      return;
    }
    updateProfileMutation.mutate({
      theme: {
        ...theme,
        chatbot: {
          ...theme.chatbot,
          enabled: checked,
          systemPrompt: theme.chatbot?.systemPrompt || "You are a helpful assistant.",
          position: theme.chatbot?.position || "bottom-right",
          style: theme.chatbot?.style || {
            buttonColor: "#007af3",
            bubbleColor: "#f5f5f5",
            textColor: "#000000",
            font: "system-ui"
          },
          greeting: theme.chatbot?.greeting || "Hello! How can I help you?",
          placeholderText: theme.chatbot?.placeholderText || "Type your message here..."
        }
      }
    });
  };

  const onEffectTypeChange = (type: SparkleEffectType) => {
    updateProfileMutation.mutate({
      theme: {
        ...user?.theme,
        sparkleEffect: {
          ...sparkleEffect,
          type
        }
      }
    });
  }

  const debouncedUpdateProfile = (updates: { theme?: Partial<Theme> }) => {
    updateProfileMutation.mutate(updates);
  }

  // Add a new function to handle saving changes manually
  const handleSaveChanges = (field: keyof typeof unsavedChanges) => {
    switch(field) {
      case 'enterPageText':
        debouncedUpdateProfile({
          theme: {
            ...theme,
            enterPage: {
              ...(theme.enterPage || {}),
              text: enterPageText,
            },
          },
        });
        break;
      case 'enterPageTextColor':
        debouncedUpdateProfile({
          theme: {
            ...theme,
            enterPage: {
              ...(theme.enterPage || {}),
              textColor: enterPageTextColor,
            },
          },
        });
        break;
      case 'enterPageCustomCSS':
        debouncedUpdateProfile({
          theme: {
            ...theme,
            enterPage: {
              ...(theme.enterPage || {}),
              customCSS: enterPageCustomCSS,
            },
          },
        });
        break;
      case 'displayName':
        updateProfileMutation.mutate({
          displayName: localDisplayName,
        });
        break;
      case 'bio':
        updateProfileMutation.mutate({ 
          bio: localBio 
        });
        break;
      case 'spotifyDisplayText':
        updateProfileMutation.mutate({
          theme: {
            ...theme,
            spotifyDisplayText: spotifyDisplayText,
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
      case 'enterPageTextColor':
        setEnterPageTextColor(theme.enterPage?.textColor || "#ffffff");
        break;
      case 'enterPageCustomCSS':
        setEnterPageCustomCSS(theme.enterPage?.customCSS || "");
        break;
      case 'displayName':
        setLocalDisplayName(user?.displayName || "");
        break;
      case 'bio':
        setLocalBio(user?.bio || "");
        break;
      case 'spotifyDisplayText':
        setSpotifyDisplayText(user?.theme?.spotifyDisplayText || "Favourite Song");
        break;
    }
    
    // Clear the unsaved changes flag
    setUnsavedChanges(prev => ({
      ...prev,
      [field]: false
    }));
  };

  // Initialize local state when the user data changes
  useEffect(() => {
    if (user?.theme) {
      if (user.theme.enterPage) {
        setEnterPageText(user.theme.enterPage.text || "Enter Page");
        setEnterPageTextColor(user.theme.enterPage.textColor || "#ffffff");
        setEnterPageCustomCSS(user.theme.enterPage.customCSS || "");
      }
      
      // Initialize Spotify display text
      setSpotifyDisplayText(user.theme.spotifyDisplayText || "Favourite Song");
      
      // Reset unsaved changes flags
      setUnsavedChanges({
        enterPageText: false,
        enterPageTextColor: false,
        enterPageCustomCSS: false,
        displayName: false,
        bio: false,
        spotifyDisplayText: false
      });
    }
  }, [user?.theme]);

  return (
    <div className="min-h-screen text-white">
      <DocumentTitle title="Customize" />
      <div className="w-full max-w-full px-4 sm:px-6 py-8">
        <div className="grid gap-6 w-full">
          <Card className="p-3 sm:p-6 border-white/10">
            <div className="grid gap-3 sm:gap-6">
              <div>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-24 sm:w-32 h-24 sm:h-32 flex items-center justify-center">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-black/20">
                      {user.logo ? (
                        <img
                          src={user.logo}
                          alt="Profile Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                    </div>

                    {user.theme?.decoration?.enabled && (
                      <div className="absolute w-[150px] sm:w-[150px] h-[150px] sm:h-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <DecorationPreview
                          decoration={user.theme.decoration}
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    <Button
                      variant="outline"
                      className="bg-transparent border-white/10 text-sm w-full sm:w-auto"
                      onClick={() => setDecorationSelectorOpen(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Choose Decoration
                    </Button>
                    {user.theme?.decoration?.enabled && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-transparent border-white/10 w-9 h-9 rounded-full hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
                        onClick={() =>
                          updateProfileMutation.mutate({
                            theme: {
                              ...user.theme,
                              decoration: {
                                ...user.theme.decoration,
                                enabled: false,
                              },
                            },
                          })
                        }
                        title="Remove Decoration"
                      >
                        <X className="w-5 h-5 text-red-400 hover:text-red-300" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <div className="relative">
                    <Input
                      value={localDisplayName}
                      onChange={handleDisplayNameChange}
                      placeholder="Enter your display name"
                      className="bg-black/20 border-white/10 w-full pr-20"
                    />
                    {unsavedChanges.displayName && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 mb-0.5">
                        <button 
                          onClick={() => handleCancelChanges('displayName')}
                          className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-gray-600/80 transition-colors"
                          title="Cancel changes"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        <button 
                          onClick={() => handleSaveChanges('displayName')}
                          className="h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] hover:from-[#9b59b6] hover:to-[#a569bd] transition-colors shadow-md"
                          title="Save changes"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <div className="relative">
                    <textarea
                      value={localBio}
                      onChange={handleBioChange}
                      placeholder="Tell us about yourself"
                      className="w-full h-24 px-3 py-2 bg-black/30 border border-white/10 rounded-lg resize-none pr-20"
                    />
                    {unsavedChanges.bio && (
                      <div className="absolute right-2 bottom-2 flex items-center gap-2 mb-0.5">
                        <button 
                          onClick={() => handleCancelChanges('bio')}
                          className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-gray-600/80 transition-colors"
                          title="Cancel changes"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        <button 
                          onClick={() => handleSaveChanges('bio')}
                          className="h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] hover:from-[#9b59b6] hover:to-[#a569bd] transition-colors shadow-md"
                          title="Save changes"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Switch
                      id="typing-animation"
                      checked={user?.theme?.typingAnimation?.enabled || false}
                      onCheckedChange={(checked) => {
                        if (!isPremium) {
                          // Don't show the premium dialog, just return without making changes
                          return;
                        }
                        
                        const currentTheme = (user?.theme || {}) as Theme;
                        updateProfileMutation.mutate({
                          theme: {
                            ...currentTheme,
                            typingAnimation: {
                              ...(currentTheme.typingAnimation || {}),
                              enabled: checked,
                              speed: currentTheme.typingAnimation?.speed || 100,
                              startDelay: currentTheme.typingAnimation?.startDelay || 500
                            }
                          }
                        });
                      }}
                      disabled={!isPremium}
                    />
                    <Label htmlFor="typing-animation" className="text-sm">Enable typing animation for bio</Label>
                  </div>
                  
                  {!isPremium && (
                    <div className="text-xs text-muted-foreground mt-1 ml-7">
                      This feature is only available with a premium subscription
                    </div>
                  )}

                  <p className="text-xs text-white/50 mt-2">
                    When enabled, your bio will appear with a typewriter effect on your profile page
                  </p>
                </div>
                <div>
                  <AssetUploader className="mb-6" />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-3 sm:p-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold">Display Name Effects</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sparkle-toggle">Enable Sparkle Effect</Label>
                  <Switch
                    id="sparkle-toggle"
                    checked={sparkleEffect.enabled}
                    onCheckedChange={onSparkleEffectToggle}
                  />
                </div>

                {sparkleEffect.enabled && (
                  <>
                    <div className="p-4 rounded-lg bg-black/30 border border-white/10 my-2">
                      <div className="flex justify-center">
                        <SparkleName
                          displayName={user?.displayName || user?.username || ''}
                          effect={sparkleEffect}
                          className="text-3xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Effect Color</Label>
                      <RadioGroup
                        value={sparkleEffect.type}
                        onValueChange={onEffectTypeChange}
                        className="grid grid-cols-3 gap-2"
                      >
                        {AVAILABLE_EFFECTS.map((effect) => (
                          <div key={effect} className="flex items-center space-x-2">
                            <RadioGroupItem value={effect} id={`effect-${effect}`} />
                            <Label htmlFor={`effect-${effect}`} className="capitalize text-xs sm:text-sm truncate">
                              {effect}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </>
                )}

                <div className="text-xs text-white/70">
                  <p>This effect adds sparkles to your display name...</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <FaSpotify className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold">Profile Music</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Spotify Link</Label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input
                      value={spotifyUrl}
                      onChange={(e) => setSpotifyUrl(e.target.value)}
                      placeholder="Paste Spotify link..."
                      className="bg-black/30 border-white/10 flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/10 hover:bg-white/5 w-full sm:w-auto"
                      onClick={() => {
                        if (spotifyUrl) {
                          updateSpotifyLinkMutation.mutate(spotifyUrl);
                        }
                      }}
                      disabled={updateSpotifyLinkMutation.isPending}
                    >
                      {updateSpotifyLinkMutation.isPending ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : (
                        <Music className="w-3 h-3 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-white/70 mt-1">
                    Paste Spotify track/album/artist link
                  </p>
                </div>

                <div>
                  <Label>Display Text</Label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <div className="relative flex-1">
                      <Input
                        value={spotifyDisplayText}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSpotifyDisplayText(value);
                          setUnsavedChanges(prev => ({
                            ...prev,
                            spotifyDisplayText: true
                          }));
                        }}
                        placeholder="Favourite Song"
                        className="bg-black/30 border-white/10 w-full pr-20"
                      />
                      {unsavedChanges.spotifyDisplayText && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 mb-0.5">
                          <button 
                            onClick={() => handleCancelChanges('spotifyDisplayText')}
                            className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-gray-600/80 transition-colors"
                            title="Cancel changes"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          <button 
                            onClick={() => handleSaveChanges('spotifyDisplayText')}
                            className="h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] hover:from-[#9b59b6] hover:to-[#a569bd] transition-colors shadow-md"
                            title="Save changes"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/70 mt-1">
                    Customize the text shown above your Spotify player
                  </p>
                </div>

                {user.theme?.spotifyLink && (
                  <div className="mt-2">
                    <Label>Current Music</Label>
                    <div className="mt-1 p-3 rounded-lg bg-black/30 border border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white/70 text-xs truncate flex-1">
                          {user.theme.spotifyLink}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-white/10 hover:bg-white/5 h-7 px-2 text-xs"
                          onClick={() => {
                            updateProfileMutation.mutate({
                              theme: {
                                ...user?.theme,
                                spotifyLink: null,
                              },
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-3 sm:p-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Snowflake className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Particle Effects</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Effects</Label>
                  <Switch
                    checked={theme.particleEffect?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      handleParticleEffects(checked)
                    }
                  />
                </div>

                {theme.particleEffect?.enabled && (
                  <>
                    <div className="space-y-3">
                      <Label>Particle Amount</Label>
                      <Slider
                        value={[
                          localParticleSettings.quantity ??
                            theme.particleEffect?.quantity ??
                            50,
                        ]}
                        onValueChange={(value) =>
                          handleParticleUpdate({ quantity: value[0] })
                        }
                        min={10}
                        max={200}
                        step={10}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Particle Speed</Label>
                      <Slider
                        value={[
                          localParticleSettings.speed ??
                            theme.particleEffect?.speed ??
                            1,
                        ]}
                        onValueChange={(value) =>
                          handleParticleUpdate({ speed: value[0] })
                        }
                        min={0.1}
                        max={5}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Particle Size</Label>
                      <Slider
                        value={[
                          localParticleSettings.size ??
                            theme.particleEffect?.size ??
                            3,
                        ]}
                        onValueChange={(value) =>
                          handleParticleUpdate({ size: value[0] })
                        }
                        min={1}
                        max={10}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Particle Color</Label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                          type="color"
                          value={theme.particleEffect?.color ?? "#ffffff"}
                          onChange={(e) =>
                            handleParticleUpdate({ color: e.target.value })
                          }
                          className="w-full sm:w-16 h-10 p-1 bg-transparent border-white/10"
                        />
                        <Input
                          type="text"
                          value={theme.particleEffect?.color ?? "#ffffff"}
                          onChange={(e) =>
                            handleParticleUpdate({ color: e.target.value })
                          }
                          placeholder="#ffffff"
                          className="flex-1 bg-black/30 border-white/10"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
            <Card className="p-3 sm:p-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <MousePointer className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Cursor Customization</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Custom Cursor</Label>
                  <Switch
                    checked={theme.cursor?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      handleCursorCustomization(checked)
                    }
                  />
                </div>

                {theme.cursor?.enabled && (
                  <>
                    <div className="space-y-4">
                      <Label>Cursor Preview</Label>
                      <div
                        className="w-full h-24 sm:h-32 bg-black/30 rounded-lg border border-white/10 flex items-center justify-center"
                        style={cursorPreviewStyle}
                      >
                        <p className="text-xs sm:text-sm text-white/50 px-2 text-center">Move your mouse here to preview cursor</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Cursor URL</Label>
                      <Input
                        type="url"
                        placeholder="Enter cursor image URL"
                        value={theme.cursor?.value || ""}
                        onChange={(e) =>
                          updateProfileMutation.mutate({
                            theme: {
                              ...theme,
                              cursor: {
                                enabled: true,
                                type: "url",
                                value: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-black/30 border-white/10"
                      />
                      <p className="text-sm text-white/70">
                        Enter a direct URL to a cursor image (.cur, .png)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-3 sm:p-6 border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <DoorOpen className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Enter Page Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enter-page-toggle">Enable Enter Page</Label>
                <Switch
                  id="enter-page-toggle"
                  checked={theme.enterPage?.enabled ?? false}
                  onCheckedChange={(checked) =>
                    updateProfileMutation.mutate({
                      theme: {
                        ...theme,
                        enterPage: {
                          ...(theme.enterPage || {
                            text: "Enter Page",
                            fontSize: "2rem",
                            fontWeight: "bold",
                            textColor: "#ffffff",
                            animation: "fade",
                            customCSS: ""
                          }),
                          enabled: checked,
                        },
                      },
                    })
                  }
                />
              </div>

              {(theme.enterPage?.enabled ?? false) && (
                <>
                  <div className="grid gap-2">
                    <Label>Text</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={enterPageText}
                        onChange={(e) => {
                          setEnterPageText(e.target.value);
                          setUnsavedChanges(prev => ({
                            ...prev,
                            enterPageText: true
                          }));
                        }}
                        className="bg-black/20 border-white/10 pr-20"
                      />
                      {unsavedChanges.enterPageText && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 mb-0.5">
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
                    <select
                      value={theme.enterPage?.fontSize || "2rem"}
                      onChange={(e) =>
                        updateProfileMutation.mutate({
                          theme: {
                            ...theme,
                            enterPage: {
                              ...(theme.enterPage || {}),
                              fontSize: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full p-2 rounded bg-black/20 border border-white/10 text-white"
                    >
                      <option value="1rem">Small</option>
                      <option value="1.5rem">Medium</option>
                      <option value="2rem">Large</option>
                      <option value="3rem">Extra Large</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Font Weight</Label>
                    <select
                      value={theme.enterPage?.fontWeight || "bold"}
                      onChange={(e) =>
                        updateProfileMutation.mutate({
                          theme: {
                            ...theme,
                            enterPage: {
                              ...(theme.enterPage || {}),
                              fontWeight: e.target.value as "normal" | "medium" | "semibold" | "bold",
                            },
                          },
                        })
                      }
                      className="w-full p-2 rounded bg-black/20 border border-white/10 text-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Text Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={enterPageTextColor}
                        onChange={(e) => {
                          setEnterPageTextColor(e.target.value);
                          setUnsavedChanges(prev => ({
                            ...prev,
                            enterPageTextColor: true
                          }));
                        }}
                        className="w-16 h-10"
                      />
                      <div className="relative flex-1">
                        <Input
                          type="text"
                          value={enterPageTextColor}
                          onChange={(e) => {
                            setEnterPageTextColor(e.target.value);
                            setUnsavedChanges(prev => ({
                              ...prev,
                              enterPageTextColor: true
                            }));
                          }}
                          className="flex-1 bg-black/20 border-white/10 pr-20"
                        />
                        {unsavedChanges.enterPageTextColor && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 mb-0.5">
                            <button 
                              onClick={() => handleCancelChanges('enterPageTextColor')}
                              className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-600/50 hover:bg-gray-600/80 transition-colors"
                              title="Cancel changes"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                            <button 
                              onClick={() => handleSaveChanges('enterPageTextColor')}
                              className="h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] hover:from-[#9b59b6] hover:to-[#a569bd] transition-colors shadow-md"
                              title="Save changes"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Animation</Label>
                    <select
                      value={theme.enterPage?.animation || "fade"}
                      onChange={(e) =>
                        updateProfileMutation.mutate({
                          theme: {
                            ...theme,
                            enterPage: {
                              ...(theme.enterPage || {}),
                              animation: e.target.value as "none" | "fade" | "scale" | "slide",
                            },
                          },
                        })
                      }
                      className="w-fullp-2 rounded bg-black/30 border border-white/10 text-white"
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade</option>
                      <option value="scale">Scale</option>
                      <option value="slide">Slide</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Custom CSS (Optional)</Label>
                    <div className="relative">
                      <textarea
                        placeholder="Add custom CSS for enter page"
                        className="h-32 font-mono text-sm w-full p-2 rounded bg-black/20 border border-white/10 text-white"
                        value={enterPageCustomCSS}
                        onChange={(e) => {
                          setEnterPageCustomCSS(e.target.value);
                          setUnsavedChanges(prev => ({
                            ...prev,
                            enterPageCustomCSS: true
                          }));
                        }}
                      />
                      {unsavedChanges.enterPageCustomCSS && (
                        <div className="absolute right-2 bottom-2 flex items-center gap-2 mb-0.5">
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
                    <div className="p-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center">
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
          </Card>


        </div>
      </div>

      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="sm:max-w-md bg-black border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Premium Feature: {premiumFeatureName}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Upgrade to access exclusive profile features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-base text-white/80">
              Bio animations are exclusively available with a Premium subscription.
              Upgrade now to unlock all premium features and enhance your profile!
            </p>
            <div className="bg-white/5 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-white">Premium includes:</p>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                <li>Custom profile decorations</li>
                <li>Unlimited social links</li>
                <li>Special effects and animations</li>
                <li>AI-powered chatbot</li>
                <li>Advanced background options</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>
                Maybe Later
              </Button>
              <Button 
                onClick={() => {
                  setShowPremiumDialog(false);
                  navigate('/pricing');
                }}
                className="bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 hover:from-yellow-500 hover:to-yellow-600"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <DecorationSelector
        open={decorationSelectorOpen}
        onOpenChange={setDecorationSelectorOpen}
        onSelect={handleDecorationSelect}
        currentDecoration={theme.decoration}
      />
    </div>
  );
}

function formatLastOnline(lastOnline: Date) {
  const now = new Date();
  const diff = now.getTime() - lastOnline.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}