import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { DocumentTitle } from "@/components/document-title";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FaDiscord, FaGithub, FaEye, FaSteam } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { IoEyeOff } from "react-icons/io5";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { UserIcon } from "../components/icons/user-icon";
import { Clock } from "../components/icons/clock";
import { BookOpen } from "../components/icons/book-open";
import { Users } from "../components/icons/users";
import { Trash2, LogOut, X, ExternalLink, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { DiscordIntegrationCard } from "@/components/discord-integration-card";
import SteamConnectForm from "@/components/SteamConnectForm";
import { toast } from "@/hooks/use-toast";
import { toDiscordUser, hasDiscordConnected, toGitHubUser, hasGitHubConnected, toSteamUser, hasSteamConnected, safeString } from "@/types/user";
import { MotionWrapper, MotionImage } from "@/components/ui/motion-wrapper";
import { PremiumFeatureDialog } from "@/components/premium-feature-dialog";
import { verifyDiscordDataConsistency } from "@/lib/discord-refresh";
import { clearDiscordData } from "@/lib/discord-storage";
import { logStoredDiscordData } from "@/lib/debug-discord";
import { clearSteamData } from "@/lib/steam-helper";
import { DiscordConnectButton } from "@/components/discord-connect-button";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const usernameChangeSchema = z.object({
  newUsername: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string().min(1, "Password is required to confirm this change"),
});

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;
type UsernameChangeForm = z.infer<typeof usernameChangeSchema>;

// Helper function to safely parse JSON
const safeJsonParse = (jsonString: string | null | undefined): any => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return null;
  }
};

// Helper functions for Discord activity
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

// Helper function to get status emoji and color
const getStatusInfo = (status: string | null | undefined) => {
  if (!status) return { emoji: '⚫', color: 'bg-gray-500' };
  
  switch (status) {
    case 'online':
      return { emoji: '🟢', color: 'bg-green-500' };
    case 'idle':
      return { emoji: '🟡', color: 'bg-yellow-500' };
    case 'dnd':
      return { emoji: '🔴', color: 'bg-red-500' };
    default:
      return { emoji: '⚫', color: 'bg-gray-500' };
  }
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

const isDevelopment = process.env.NODE_ENV === 'development';

export default function SettingsPage() {
  const { user, changePasswordMutation, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  
  // Get subscription status
  const { data: subscriptionData } = useQuery<{ status: 'free' | 'premium' }>({
    queryKey: ["/api/subscription/status"],
    enabled: !!user
  });

  const isPremium = subscriptionData?.status === 'premium';

  // Parse query parameters for Discord connection messages
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    // Check Discord data consistency on page load
    if (user && user.discordId) {
      console.log('[Settings] Verifying Discord data consistency on page load');
      verifyDiscordDataConsistency();
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Handle Discord connection errors and success
    if (params.has('error')) {
      const error = params.get('error');
      
      // Enhanced error message based on error code
      let errorMessage = '';
      
      if (error === 'discord_auth_failed') {
        errorMessage = 'Failed to authenticate with Discord. Please make sure you are logged in first.';
      } else if (error === 'discord_link_failed') {
        errorMessage = 'Failed to link Discord account. You need to be logged in first.';
      } else if (error === 'login_failed') {
        errorMessage = 'Login failed after Discord authentication.';
      } else {
        // Default error message
        errorMessage = decodeURIComponent(error || 'Failed to connect account');
      }
      
      setConnectionStatus({ type: 'error', message: errorMessage });
      
      // Clean up URL
      const currentUrl = window.location.pathname;
      window.history.replaceState({}, document.title, currentUrl);
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
    } 
    else if (params.has('success')) {
      const success = params.get('success');
      setConnectionStatus({ 
        type: 'success', 
        message: decodeURIComponent(success || 'Account connected successfully') 
      });
      
      // Clean up URL
      const currentUrl = window.location.pathname;
      window.history.replaceState({}, document.title, currentUrl);
      
      // Show success toast
      toast({
        title: "Success",
        description: decodeURIComponent(success || 'Account connected successfully'),
      });
      
      // Check Discord data in localStorage
      console.log('Checking Discord data after successful connection:');
      logStoredDiscordData();
      
      // Refresh user data to get the latest Discord info
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    }
  }, [location, queryClient, toast]);

  const usernameForm = useForm<UsernameChangeForm>({
    resolver: zodResolver(usernameChangeSchema),
    defaultValues: {
      newUsername: "",
      password: "",
    },
  });

  const usernameChangeMutation = useMutation({
    mutationFn: async (data: UsernameChangeForm) => {
      const response = await fetch("/api/settings/username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change username");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Username updated",
        description: "Your username has been changed successfully",
      });
      usernameForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update username",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onUsernameSubmit = (data: UsernameChangeForm) => {
    usernameChangeMutation.mutate(data);
  };

  const form = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordChangeForm) => {
    changePasswordMutation.mutate(data);
  };

  const formatLastOnline = (lastOnline: Date | null) => {
    if (!lastOnline) return "Never";
    return new Date(lastOnline).toLocaleString();
  };

  const handleDisconnectDiscord = async () => {
    try {
      // Call the server API to disconnect Discord
      const response = await fetch('/api/auth/discord/disconnect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect Discord account');
      }
      
      // Clear Discord data from localStorage
      clearDiscordData();
      
      // Remove Discord fields from user in query cache
      const currentUser = queryClient.getQueryData(['/api/user']);
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          discordId: null,
          discordUsername: null,
          discordGlobalName: null,
          discordAvatar: null,
          discordDiscriminator: null,
          discordStatus: null,
          hasDiscordConnected: false
        };
        
        queryClient.setQueryData(['/api/user'], updatedUser);
      }
      
      // Invalidate the query to force a refetch of user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Show success toast
      toast({
        title: "Discord Disconnected",
        description: "Your Discord account has been disconnected successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error disconnecting Discord:', error);
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "There was an error disconnecting your Discord account.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectSteam = async () => {
    try {
      // Call the server API to disconnect Steam
      const response = await fetch('/api/auth/steam/disconnect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect Steam account');
      }
      
      // Clear Steam data from localStorage
      clearSteamData();
      
      // Remove Steam fields from user in query cache
      const currentUser = queryClient.getQueryData(['/api/user']);
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          steamId: null,
          steamUsername: null,
          steamAvatar: null,
          steamProfileUrl: null,
          steamGamesCount: null,
          hasSteamConnected: false
        };
        
        queryClient.setQueryData(['/api/user'], updatedUser);
      }
      
      // Invalidate the query to force a refetch of user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Show success toast
      toast({
        title: "Steam Disconnected",
        description: "Your Steam account has been disconnected successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error disconnecting Steam:', error);
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "There was an error disconnecting your Steam account.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentTitle title="Settings" />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold tracking-tighter">
            Settings
          </h1>
        </div>

        {connectionStatus && (
          <Alert variant={connectionStatus.type === 'success' ? 'default' : 'destructive'} className={connectionStatus.type === 'success' ? "border-green-500/50 bg-green-500/10" : ""}>
            {connectionStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {connectionStatus.type === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>
              {connectionStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Social Integrations Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discord Integration Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <FaDiscord className="h-5 w-5 text-[#5865F2]" />
              Discord
            </h3>
            
            <div className="flex flex-col gap-3">
              {!user?.discordId && (
                <p className="text-sm text-gray-400">
                  Connect your Discord account to show your profile and presence status.
                </p>
              )}
              
              {user?.discordId ? (
                <MotionWrapper
                  className="backdrop-blur-md bg-[#2f3136]/60 border border-[#5865F2]/30 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.15 }}
                  wrapperClassName="w-full"
                >
                  {(() => {
                    return (
                      <>
                        {user.discordAvatar && (
                          <MotionImage
                            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=256`}
                            alt="Discord Avatar"
                            className="w-16 h-16 rounded-full border-2 border-[#5865F2]/50 shadow-lg shadow-[#5865F2]/20"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                            wrapperClassName="flex-shrink-0"
                          />
                        )}
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold flex items-center">
                            {user.discordGlobalName || user.discordUsername}
                            {user.discordStatus && (
                              <span 
                                className={`ml-2 inline-block w-3 h-3 rounded-full ${getStatusColor(user.discordStatus)}`} 
                                title={user.discordStatus}
                              ></span>
                            )}
                          </h3>
                          
                          <div className="text-sm text-gray-400 mt-1">
                            {user.discordUsername && (
                              <span>@{user.discordUsername}</span>
                            )}
                          </div>
                          
                          {user.discordActivity && (
                            <div className="mt-2 text-sm">
                              <span className="text-[#5865F2]">
                                {typeof user.discordActivity === 'string' 
                                  ? user.discordActivity 
                                  : getDiscordActivityName(user.discordActivity)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex gap-4 mt-2">
                            <button
                              onClick={handleDisconnectDiscord}
                              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                            >
                              <X size={14} />
                              Disconnect
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </MotionWrapper>
              ) : (
                <div className="flex">
                  <DiscordConnectButton 
                    isConnected={!!user?.discordId}
                    onDisconnect={handleDisconnectDiscord}
                    extraScopes={['email', 'connections']}
                    disconnectText="Disconnect Discord"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Steam Integration Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <FaSteam className="h-5 w-5 text-[#66c0f4]" />
              Steam
            </h3>
            
            <div className="flex flex-col gap-3">
              {!hasSteamConnected(user as any) && (
                <p className="text-sm text-gray-400">
                  Connect your Steam account to show your profile, games, and playtime on your Slayz.cc profile.
                </p>
              )}
              
              {hasSteamConnected(user as any) ? (
                <MotionWrapper
                  className="backdrop-blur-md bg-[#1b2838]/60 border border-[#66c0f4]/30 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.15 }}
                  wrapperClassName="w-full"
                >
                  {(() => {
                    const steamUser = toSteamUser(user as any);
                    const statusInfo = (() => {
                      if (steamUser.personastate === undefined) return { text: 'Unknown', color: 'bg-gray-400' };
                      
                      const statuses = [
                        { text: 'Offline', color: 'bg-gray-400' },
                        { text: 'Online', color: 'bg-green-500' },
                        { text: 'Busy', color: 'bg-red-500' },
                        { text: 'Away', color: 'bg-yellow-500' },
                        { text: 'Snooze', color: 'bg-blue-400' },
                        { text: 'Looking to Trade', color: 'bg-purple-500' },
                        { text: 'Looking to Play', color: 'bg-indigo-500' }
                      ];
                      
                      return steamUser.personastate >= 0 && steamUser.personastate < statuses.length 
                        ? statuses[steamUser.personastate] 
                        : { text: 'Unknown', color: 'bg-gray-400' };
                    })();
                    
                    // Format playtime
                    const formatPlaytime = (minutes: number | undefined): string => {
                      if (!minutes) return '0 hours';
                      const hours = Math.floor(minutes / 60);
                      const remainingMinutes = minutes % 60;
                      if (hours === 0) return `${remainingMinutes} minutes`;
                      if (remainingMinutes === 0) return `${hours} hours`;
                      return `${hours} hours, ${remainingMinutes} minutes`;
                    };
                    
                    return (
                      <>
                        {steamUser.avatar && (
                          <MotionImage
                            src={steamUser.avatarfull || steamUser.avatar}
                            alt="Steam Avatar"
                            className="w-16 h-16 rounded-full border-2 border-[#66c0f4]/50 shadow-lg shadow-[#66c0f4]/20"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                            wrapperClassName="flex-shrink-0"
                          />
                        )}
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold flex items-center">
                            {steamUser.personaname}
                            {steamUser.personastate !== undefined && (
                              <span 
                                className={`ml-2 inline-block w-3 h-3 rounded-full ${statusInfo.color}`} 
                                title={statusInfo.text}
                              ></span>
                            )}
                          </h3>
                          
                          <div className="text-sm text-gray-400 mt-1">
                            {steamUser.personastate !== undefined && (
                              <span>{statusInfo.text}</span>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-gray-400 text-sm">
                              <span className="text-[#66c0f4]">
                                {steamUser.recentlyPlayedGames ? steamUser.recentlyPlayedGames.length : (steamUser.gamesCount || 0)}
                              </span> Games
                            </p>
                            
                            {steamUser.totalPlaytime && (
                              <p className="text-gray-400 text-sm">
                                <span className="text-[#66c0f4]">{formatPlaytime(steamUser.totalPlaytime)}</span> played in total
                              </p>
                            )}
                            
                            {steamUser.recentPlaytime && steamUser.recentPlaytime > 0 && (
                              <p className="text-gray-400 text-sm">
                                <span className="text-[#1ed761]">{formatPlaytime(steamUser.recentPlaytime)}</span> played in last 2 weeks
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-4 mt-2">
                            <a
                              href={steamUser.profileurl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#66c0f4] hover:text-[#a4d7f5] text-sm flex items-center gap-1"
                            >
                              <ExternalLink size={14} />
                              View Profile
                            </a>
                            <button
                              onClick={handleDisconnectSteam}
                              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                            >
                              <X size={14} />
                              Disconnect
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </MotionWrapper>
              ) : (
                <>
                  {isPremium ? (
                    <SteamConnectForm 
                      onSuccess={(steamUser) => {
                        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                        toast({
                          title: "Steam Connected",
                          description: "Your Steam account has been connected successfully.",
                          variant: "default"
                        });
                      }}
                      onError={(error) => {
                        toast({
                          title: "Connection Failed",
                          description: error instanceof Error ? error.message : "There was an error connecting your Steam account.",
                          variant: "destructive"
                        });
                      }}
                      onDisconnect={handleDisconnectSteam}
                    />
                  ) : (
                    <div className="mt-2 p-3 bg-[#1a1a1a] border border-[#8e44ad]/20 rounded text-sm text-white/70 flex items-center justify-between">
                      <span>Steam integration is a premium feature</span>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setPremiumFeatureName("Steam Integration");
                          setShowPremiumDialog(true);
                        }}
                        className="bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] text-white hover:from-[#9b59b6] hover:to-[#8e44ad]"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* GitHub Integration Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <FaGithub className="h-5 w-5 text-gray-300" />
              GitHub
            </h3>
            
            {user && hasGitHubConnected(user) ? (
              <MotionWrapper
                className="backdrop-blur-md bg-zinc-900/60 border border-zinc-700/30 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.15 }}
                wrapperClassName="w-full"
              >
                {(() => {
                  const githubUser = toGitHubUser(user);
                  return (
                    <>
                      {githubUser.avatar_url && (
                        <MotionImage
                          src={githubUser.avatar_url}
                          alt="GitHub Avatar"
                          className="w-16 h-16 rounded-full"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          wrapperClassName="flex-shrink-0"
                        />
                      )}
                      <div className="flex flex-col">
                        <h3 className="text-lg font-semibold">
                          {githubUser.name || githubUser.login}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          @{githubUser.login}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <a
                            href={`https://github.com/${githubUser.login}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                          >
                            <ExternalLink size={14} />
                            Profile
                          </a>
                          <button
                            onClick={async () => {
                              try {
                                await fetch('/api/auth/github/disconnect', {
                                  method: 'POST',
                                });
                                toast({
                                  title: "GitHub disconnected",
                                  description: "Your GitHub account has been disconnected",
                                });
                                queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                              } catch (error) {
                                console.error('Failed to disconnect GitHub:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to disconnect GitHub account",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                          >
                            <LogOut size={14} />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </MotionWrapper>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">
                  Connect your GitHub account to show your profile and repositories.
                </p>
                <a 
                  href="/api/auth/github" 
                  className="inline-flex w-fit items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-[#171515] to-[#444] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(23,21,21,0.3)]"
                >
                  <FaGithub className="h-5 w-5" />
                  Connect GitHub
                </a>
              </div>
            )}
          </Card>
        </div>

        {/* Account Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change Username Card */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Change Username</h2>
                  <p className="text-sm text-white/70">Update your account username</p>
                </div>
              </div>

              <Form {...usernameForm}>
                <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-4">
                  <FormField
                    control={usernameForm.control}
                    name="newUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-black/30 border-white/10"
                            placeholder="Enter new username"
                          />
                        </FormControl>
                        <FormDescription className="text-white/70">
                          Your current username is: <span>{safeString(user?.username)}</span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={usernameForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              className="bg-black/30 border-white/10 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <IoEyeOff className="w-4 h-4 text-white/50" />
                              ) : (
                                <FaEye className="w-4 h-4 text-white/50" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={usernameChangeMutation.isPending}
                    className="w-full bg-white text-black hover:bg-white/90"
                  >
                    {usernameChangeMutation.isPending ? "Updating..." : "Change Username"}
                  </Button>
                </form>
              </Form>
            </div>
          </Card>

          {/* Security Card */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FaShield className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold">Security</h2>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              className="bg-black/30 border-white/10 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <IoEyeOff className="w-4 h-4 text-white/50" />
                              ) : (
                                <FaEye className="w-4 h-4 text-white/50" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="bg-black/30 border-white/10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="bg-black/30 border-white/10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="w-full bg-white text-black hover:bg-white/90"
                  >
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </div>
          </Card>
        </div>

        {/* Additional Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications Card */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FaBell className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-white/70">
                      Receive notifications about your account
                    </div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Profile Updates</div>
                    <div className="text-sm text-white/70">
                      Get notified when someone visits your profile
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </Card>

          {/* Delete Account Card */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Delete Account</h2>
                  <p className="text-sm text-white/70">Permanently delete your account and all associated data</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/70">
                  Warning: This action is irreversible. All your data, including profiles, social links, and settings will be permanently deleted.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/user', {
                              method: 'DELETE',
                              credentials: 'include',
                              headers: {
                                'Content-Type': 'application/json'
                              }
                            });

                            if (!response.ok) {
                              const error = await response.json();
                              throw new Error(error.message || 'Failed to delete account');
                            }

                            // Successful deletion
                            toast({
                              title: "Account Deleted",
                              description: "Your account has been successfully deleted.",
                            });

                            // Redirect to home page after successful deletion
                            window.location.href = "/";
                          } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : "Failed to delete account. Please try again.";
                            console.error('Delete account error:', error);
                            toast({
                              title: "Error",
                              description: errorMessage,
                              variant: "destructive",
                            });
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/5"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Premium Feature Dialog */}
      <PremiumFeatureDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        featureName={premiumFeatureName}
      />
    </div>
  );
}