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
import { FaDiscord, FaGithub, FaSpotify, FaEye } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { useState } from "react";
import { FaBell } from "react-icons/fa";
import { IoEyeOff } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../utils/api";
import { UserIcon } from "../components/icons/user-icon";
import { Clock } from "../components/icons/clock";
import { BookOpen } from "../components/icons/book-open";
import { Users } from "../components/icons/users";
import { Trash2, LogOut } from "lucide-react";

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

export default function SettingsPage() {
  const { user, changePasswordMutation, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentTitle title="Settings" />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold tracking-tighter">
            Settings
          </h1>
        </div>

        <Card className="p-3 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <FaDiscord className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-semibold">Discord Integration</h2>
              </div>
              <div className="bg-[#161616] border border-[#AAAAAA]/20 rounded-[40px] p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_transparent_70%)] before:pointer-events-none">
                {user?.discordId ? (
                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
                    {user.discordAvatar && (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=256`}
                        alt="Discord Avatar"
                        className="w-16 h-16 rounded-full border-2 border-indigo-500/30"
                      />
                    )}
                    <div className="flex-1 w-full">
                      <div className="flex justify-center sm:justify-start items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {user.discordUsername}
                        </h3>
                      </div>
                      <p className="text-indigo-300/80 text-sm">
                        @{user.discordUsername}
                      </p>
                      {user.lastOnline && (
                        <div className="flex justify-center sm:justify-start items-center gap-2 mt-1 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>
                            Last online: {formatLastOnline(user.lastOnline)}
                          </span>
                        </div>
                      )}
                      <div className="mt-4 flex justify-center sm:justify-start">
                        <Button
                          variant="outline"
                          className="bg-transparent border-white/10 hover:bg-white/5 rounded-2xl w-full sm:w-auto"
                          onClick={async () => {
                            try {
                              await fetch('/api/auth/discord/disconnect', {
                                method: 'POST',
                                credentials: 'include'
                              });
                              queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                              toast({
                                title: "Discord disconnected",
                                description: "Your Discord account has been unlinked"
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to disconnect Discord account",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Disconnect Discord
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white/70 mb-4">
                      Connect your Discord account to show your presence and
                      status
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="bg-transparent border-white/10 hover:bg-white/5 rounded-2xl w-full sm:w-auto"
                    >
                      <a href="/api/auth/discord">Connect Discord</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <FaGithub className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold">GitHub Integration</h2>
              </div>
              <div className="bg-[#1E1E1E] border border-[#AAAAAA]/20 rounded-[40px] p-4">
                {user?.githubId ? (
                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
                    {user.githubAvatar && (
                      <img
                        src={user.githubAvatar}
                        alt="GitHub Avatar"
                        className="w-16 h-16 rounded-full border-2 border-gray-500/30"
                      />
                    )}
                    <div className="flex-1 w-full">
                      <div className="flex justify-center sm:justify-start items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {user.githubDisplayName || user.githubUsername}
                        </h3>
                      </div>
                      <p className="text-gray-300/80 text-sm">
                        @{user.githubUsername}
                      </p>
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <BookOpen className="w-4 h-4" />
                          <span>{user.githubPublicRepos} repos</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <Users className="w-4 h-4" />
                          <span>{user.githubFollowers} followers</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-center sm:justify-start">
                        <Button
                          variant="outline"
                          className="bg-transparent border-white/10 hover:bg-white/5 rounded-2xl w-full sm:w-auto"
                          onClick={async () => {
                            try {
                              await fetch('/api/auth/github/disconnect', {
                                method: 'POST',
                                credentials: 'include'
                              });
                              queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                              toast({
                                title: "GitHub disconnected",
                                description: "Your GitHub account has been unlinked"
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to disconnect GitHub account",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Disconnect GitHub
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white/70 mb-4">
                      Connect your GitHub account to showcase your projects
                      and contributions
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="bg-transparent border-white/10 hover:bg-white/5 rounded-2xl w-full sm:w-auto"
                    >
                      <a href="/auth/github">Connect GitHub</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

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
                        Your current username is: {user?.username}
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

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FaShield className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold">Security</h2>
              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  className="bg-transparent border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
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
  );
}