import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getDiscordData } from "@/lib/discord-storage";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  changePasswordMutation: UseMutationResult<void, Error, ChangePasswordData>;
  refreshUser: () => Promise<SelectUser | undefined>;
};

type LoginData = {
  username: string; // Keep as username for backward compatibility with the API
  password: string;
};

type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<SelectUser>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 3,
    retryDelay: 1000,
    gcTime: 3600000, // Keep in cache for 1 hour
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  console.log("[AuthProvider] User data:", user);

  // Load Discord data from localStorage on startup
  useEffect(() => {
    // Only attempt to load Discord data if we have a user but no Discord data
    if (user && !user.discordId) {
      const discordData = getDiscordData();
      if (discordData) {
        console.log('[AuthProvider] Found Discord data in localStorage:', discordData);
        
        // Update user data with Discord information
        const updatedUser = {
          ...user,
          ...discordData // Spread all Discord fields
        };
        
        // Set the updated data back in the cache
        queryClient.setQueryData(["/api/user"], updatedUser);
        console.log('[AuthProvider] Updated user data with Discord information from localStorage');
      }
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: async (userData: SelectUser) => {
      // First set user data in cache
      queryClient.setQueryData(["/api/user"], userData);

      // Then invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/enhanced"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] }),
        refetchUser() // Explicitly refetch user data
      ]);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: async (userData: SelectUser) => {
      // First set user data in cache
      queryClient.setQueryData(["/api/user"], userData);

      // Then invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/enhanced"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] }),
        refetchUser() // Explicitly refetch user data
      ]);

      toast({
        title: "Welcome!",
        description: "Your account has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New passwords do not match");
      }
      const res = await apiRequest("POST", "/api/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to change password");
      }
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      // Refetch user data to ensure everything is up to date
      refetchUser();
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      // Reset user data
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        changePasswordMutation,
        refreshUser: async () => {
          const result = await refetchUser();
          return result.data;
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}