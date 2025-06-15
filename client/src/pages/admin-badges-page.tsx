import React, { useState, useCallback, useMemo, Component, ErrorInfo, ReactNode, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Search, Crown, User as UserIcon, X, Trash2, Filter, Users, Activity, Lock, ShieldAlert, AlertTriangle } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { badges } from "@/components/badge-display";

// Define interfaces
interface BadgeDefinition {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface Theme {
  badges: string[];
  color?: string;
}

interface User {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  subscriptionStatus: 'free' | 'premium' | null;
  lastOnline: string | null;
  theme: Theme | null;
}

interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  activeUsers: number;
  newUsers: number;
}

// Define types for error fallback props
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Extended ErrorFallback props with our additional props
interface ExtendedErrorFallbackProps extends ErrorFallbackProps {
  queryClient: any;
  setSearchInitiated: (value: boolean) => void;
  setCurrentPage: (value: number) => void;
  setIsAdminAuthenticated: (value: boolean) => void;
}

// ErrorBoundary class component
class ErrorBoundary extends Component<
  { 
    children: ReactNode, 
    fallback: (props: ErrorFallbackProps) => ReactNode 
  },
  { hasError: boolean, error: Error | null }
> {
  constructor(props: { children: ReactNode, fallback: (props: ErrorFallbackProps) => ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in AdminBadgesPage component:", error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({ 
        error: this.state.error, 
        resetErrorBoundary: this.resetErrorBoundary 
      });
    }

    return this.props.children;
  }
}

// ErrorFallback component moved outside the main component
const ErrorFallback = ({ error, resetErrorBoundary, queryClient, setSearchInitiated, setCurrentPage, setIsAdminAuthenticated }: ExtendedErrorFallbackProps) => (
  <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-4 font-sans">
    <Card className="max-w-md w-full bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl">
      <div className="p-6 border-b border-white/5 flex items-center">
        <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
        <h2 className="text-xl font-medium text-white">Something went wrong</h2>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="text-center">
          <p className="text-white/70 mb-4">
            An error occurred while displaying the admin dashboard.
          </p>
          <pre className="bg-[#111]/80 p-4 rounded-xl text-left text-sm text-white/80 overflow-auto max-h-40 border border-white/5">
            {error.message}
          </pre>
        </div>
        <div className="flex flex-col gap-3">
          <Button 
            className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] hover:from-[#9333ea] hover:to-[#7928ca] text-white transition-all duration-300 shadow-md shadow-purple-900/20 border-0 rounded-xl font-medium"
            onClick={() => {
              console.log("🔄 Error recovery: Resetting error boundary and refreshing data");
              resetErrorBoundary();
              queryClient.invalidateQueries({ queryKey: ['/api/users'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
              setSearchInitiated(false);
              setCurrentPage(1);
            }}
          >
            Try Again
          </Button>
          <Button 
            variant="outline"
            className="bg-[#111]/60 border-white/10 hover:bg-[#111]/80 hover:border-white/20 text-white transition-all duration-200 rounded-xl"
            onClick={() => {
              console.log("🔄 Error recovery: Resetting authentication and reloading page");
              setIsAdminAuthenticated(false);
              resetErrorBoundary();
              setSearchInitiated(false);
              setCurrentPage(1);
            }}
          >
            Return to Login
          </Button>
          <Button 
            variant="outline"
            className="bg-[#111]/60 border-white/10 hover:bg-[#111]/80 hover:border-white/20 text-white transition-all duration-200 rounded-xl"
            onClick={() => {
              console.log("🔄 Error recovery: Reloading page");
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </div>
      </div>
    </Card>
  </div>
);

export default function AdminBadgesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Core state
  const [username, setUsername] = useState("");
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination state for performance
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;
  
  // Admin authentication state
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  // Add state to track if we've checked admin session
  const [isCheckingAdminSession, setIsCheckingAdminSession] = useState(true);

  // Add a state variable for the CSRF token
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Check if user is authenticated
  const isUserAuthenticated = !!user;

  // Check for existing admin session on component mount
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        console.log("Checking for existing admin session...");
        // Only make the request if we're not already authenticated
        if (!isAdminAuthenticated) {
          console.log("Making request to /api/admin/stats to check session...");
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          try {
            // CRITICAL FIX: Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/admin/stats?_t=${timestamp}`, {
              credentials: "include",
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
              },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log("Admin session check response:", response.status);
            
            if (response.ok) {
              console.log("✅ Existing admin session detected");
              setIsAdminAuthenticated(true);
              
              // CRITICAL FIX: Wait a moment before triggering search
              setTimeout(() => {
                console.log("🔍 Session confirmed, triggering initial search");
                setSearchInitiated(true);
              }, 1000);
            } else if (response.status === 401) {
              // Check if this is a session expiration
              try {
                const errorData = await response.json();
                if (errorData.error === "Authentication expired") {
                  toast({
                    title: "Authentication error",
                    description: "Your admin session has expired. Please log in again.",
                    variant: "destructive",
                  });
                }
              } catch (e) {
                // If we can't parse the response, just handle as a generic auth error
              }
              console.log("❌ No existing admin session found:", response.status);
              // Make sure we're not authenticated if the response is not OK
              setIsAdminAuthenticated(false);
            } else {
              console.log("❌ No existing admin session found:", response.status);
              // Make sure we're not authenticated if the response is not OK
              setIsAdminAuthenticated(false);
            }
          } catch (fetchError: unknown) {
            console.error("Fetch error during admin session check:", fetchError);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              console.error("Request timed out - server may be unresponsive");
            }
            // Reset authentication state on error
            setIsAdminAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Error in checkAdminSession:", error);
        setIsAdminAuthenticated(false);
      } finally {
        // Mark that we've completed the admin session check
        setIsCheckingAdminSession(false);
      }
    };
    
    if (isUserAuthenticated) {
      checkAdminSession();
    } else {
      // If user is not authenticated, we don't need to check admin session
      setIsCheckingAdminSession(false);
      setIsAdminAuthenticated(false);
    }
  }, [isUserAuthenticated, isAdminAuthenticated, toast]);

  // FIX: Add effect to trigger initial search only after authentication is confirmed
  useEffect(() => {
    if (isAdminAuthenticated && !searchInitiated && !isCheckingAdminSession) {
      console.log("Authentication confirmed, triggering initial search");
      // Small delay to ensure state updates have propagated
      const timer = setTimeout(() => {
        setSearchInitiated(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAdminAuthenticated, searchInitiated, isCheckingAdminSession]);

  // At the component level, add state for dialog visibility
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  // Add handler to manage dialog state
  const toggleDialog = useCallback((userId: string, isOpen: boolean) => {
    setOpenDialogs(prev => ({
      ...prev,
      [userId]: isOpen
    }));
  }, []);

  // Handle admin authentication
  const handleAdminAuth = async () => {
    if (!adminPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }

    setIsAuthenticating(true);
    
    try {
      console.log("🔑 Initiating admin authentication request...");
      
      // Set up request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        // Make a real API call to the server for admin authentication
        const response = await fetch("/api/admin/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
          body: JSON.stringify({ password: adminPassword }),
          credentials: "include", // Important: Include cookies for session authentication
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log("🔑 Admin auth response status:", response.status);
        
        if (response.ok) {
          // Authentication succeeded
          console.log("✅ Admin authentication successful");
          
          // Clear the password field
          setAdminPassword("");
          
          // Get session ID and CSRF token from response
          const data = await response.json();
          console.log("🔑 Admin auth response data:", data);
          
          // Store the CSRF token for future admin requests
          if (data.csrfToken) {
            setCsrfToken(data.csrfToken);
          }
          
          // Set local state and show success message
          setIsAdminAuthenticated(true);
          toast({
            title: "Authenticated",
            description: "Welcome to the admin dashboard",
          });
          
          // Manually invalidate queries to ensure fresh data
          queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/users'] });
          
          // Wait a moment before triggering search to ensure session is fully established
          setTimeout(() => {
            console.log("🔍 Session established, triggering initial search");
            setSearchInitiated(true);
          }, 1000);
        } else if (response.status === 429) {
          // Rate limiting response
          const errorData = await response.json();
          toast({
            title: "Too Many Attempts",
            description: errorData.details || "Too many failed login attempts. Please try again later.",
            variant: "destructive",
          });
        } else {
          // Authentication failed
          console.error("❌ Admin authentication failed:", response.status);
          
          try {
            const errorData = await response.json();
            console.error("Error details:", errorData);
            
            toast({
              title: "Authentication Failed",
              description: errorData.error || "Invalid admin password",
              variant: "destructive",
            });
          } catch (parseError) {
            // If we can't parse the response as JSON, use the status text
            toast({
              title: "Authentication Failed",
              description: `Invalid admin password (${response.statusText})`,
              variant: "destructive",
            });
          }
        }
      } catch (fetchError: unknown) {
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            console.error("⏱️ Authentication request timed out");
            toast({
              title: "Authentication Error",
              description: "Request timed out. Server may be unresponsive.",
              variant: "destructive",
            });
          } else {
            console.error("❌ Fetch error during authentication:", fetchError);
            toast({
              title: "Authentication Error",
              description: fetchError.message || "Failed to connect to server",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error: unknown) {
      console.error("❌ Admin authentication error:", error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Badge definitions - using the same ones from badge-display.tsx
  const badgeDefinitions = badges.map(badge => ({
    id: badge.id,
    name: badge.name,
    icon: badge.icon,
    description: badge.description
  }));

  // User statistics query
  const { data: stats = { totalUsers: 0, premiumUsers: 0, activeUsers: 0, newUsers: 0 } } = useQuery<UserStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include" // Include cookies for session authentication
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user statistics");
      }
      return response.json();
      } catch (error) {
        console.error("Error fetching stats:", error);
        return { totalUsers: 0, premiumUsers: 0, activeUsers: 0, newUsers: 0 };
      }
    },
    enabled: isUserAuthenticated && isAdminAuthenticated,
    // Adding retry and refetchOnWindowFocus settings to improve stability
    retry: 3,
    refetchOnWindowFocus: false
  });

  // Users query - FIX: Simplify and make more robust
  const { data: users = [], isLoading, refetch, error: usersError } = useQuery<User[]>({
    queryKey: ["/api/users", username, statusFilter],
    queryFn: async () => {
      setIsSearching(true);
      console.log("🔍 Starting user search...");
      
      try {
        // Check if we're still authenticated before making the request
        if (!isAdminAuthenticated) {
          console.error("⚠️ Attempting to fetch users without admin authentication");
          return []; // Return empty array instead of throwing
        }
        
        // CRITICAL FIX: Always use wildcard search for empty username
        const searchTerm = username.trim() || "*";
        console.log("📊 Fetching users with params:", { 
          username: searchTerm, 
          status: statusFilter
        });
        
        // Set up request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        try {
          const response = await fetch(
            `/api/users?username=${encodeURIComponent(searchTerm)}&status=${statusFilter}`, 
            {
              credentials: "include", // Include cookies for session authentication
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
              },
              signal: controller.signal
            }
          );
          
          clearTimeout(timeoutId);
          
          console.log("📊 Users API response status:", response.status);
          
          if (response.status === 401) {
            console.error("🔒 Authentication error (401) when fetching users");
            setIsAdminAuthenticated(false);
            toast({
              title: "Authentication Error",
              description: "Your admin session has expired. Please log in again.",
              variant: "destructive",
            });
            return []; // Return empty array instead of throwing
          }
          
          if (!response.ok) {
            console.error("❌ Error fetching users:", response.status);
            toast({
              title: "Error",
              description: "Failed to fetch users. Please try again.",
              variant: "destructive",
            });
            return []; // Return empty array instead of throwing
          }
          
          // CRITICAL FIX: Handle empty responses properly
          const text = await response.text();
          if (!text || text.trim() === '') {
            console.log("⚠️ Empty response received from server");
            return [];
          }
          
          try {
            const data = JSON.parse(text);
            if (!Array.isArray(data)) {
              console.error("❌ Response is not an array:", data);
              return [];
            }
            console.log(`✅ Fetched ${data.length} users successfully`);
            return data;
          } catch (parseError) {
            console.error("❌ Error parsing JSON response:", parseError);
            toast({
              title: "Error",
              description: "Failed to parse server response. Please try again.",
              variant: "destructive",
            });
            return [];
          }
        } catch (fetchError: unknown) {
          console.error("❌ Fetch error in users query:", fetchError);
          toast({
            title: "Error",
            description: "Network error while fetching users. Please try again.",
            variant: "destructive",
          });
          return []; // Return empty array instead of throwing
        }
      } catch (error: unknown) {
        console.error("❌ Error in users query:", error);
        return []; // Return empty array instead of throwing
      } finally {
        setIsSearching(false);
      }
    },
    enabled: isUserAuthenticated && isAdminAuthenticated && searchInitiated && !isCheckingAdminSession,
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 30000 // Data remains fresh for 30 seconds
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user:', userId);
      
      const response = await fetch('/api/admin/user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
        credentials: "include" // Important: Include cookies for session authentication
      });
      
      // Check if the response is HTML instead of JSON (common server error)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.error("Server returned HTML instead of JSON. Endpoint may not exist or server error occurred.");
        throw new Error("API endpoint not implemented or server error occurred");
      }
      
      if (!response.ok) {
        let errorMessage = "Failed to delete user";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          // If we can't parse JSON, get the text content instead
          try {
            const textError = await response.text();
            console.error("Raw error response:", textError);
            if (textError.includes("<!DOCTYPE html>")) {
              errorMessage = "Server returned HTML instead of JSON. API endpoint may not be implemented.";
            }
          } catch (textError) {
            console.error("Error getting text content:", textError);
          }
        }
        throw new Error(errorMessage);
      }
      
      try {
        return await response.json();
      } catch (parseError) {
        console.error("Error parsing success response:", parseError);
        return { success: true }; // Fallback if response cannot be parsed
      }
    },
    onSuccess: () => {
      try {
      toast({
          title: "User deleted",
          description: "The user account has been permanently deleted.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      } catch (error) {
        console.error("Error in onSuccess handler:", error);
      }
    },
    onError: (error: Error) => {
      try {
        console.error("User deletion error:", error);
      toast({
          title: "Error",
        description: error.message,
        variant: "destructive",
      });
      } catch (toastError) {
        console.error("Error showing toast:", toastError);
      }
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: 'free' | 'premium' }) => {
      const response = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, status }),
        credentials: "include" // Important: Include cookies for session authentication
      });
      
      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }
      
      return response.json();
    },
    onSuccess: () => {
      try {
      toast({
          title: "Subscription Updated",
          description: "The user's subscription status has been updated.",
      });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      } catch (error) {
        console.error("Error in onSuccess handler:", error);
      }
    },
    onError: (error) => {
      try {
        console.error("Subscription update error:", error);
      toast({
          title: "Error",
          description: "Failed to update subscription status.",
        variant: "destructive",
      });
      } catch (toastError) {
        console.error("Error showing toast:", toastError);
      }
    },
  });

  // Assign badge mutation
  const assignBadgeMutation = useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string, badgeId: string }) => {
      // Log the request for debugging
      console.log('Assigning badge:', { userId, badgeId });
      
      try {
        const response = await fetch("/api/admin/badge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            userId, 
            badgeId, 
            action: "assign" 
          }),
          credentials: "include" // Important: Include cookies for session authentication
        });
        
        // Log response status and headers for debugging
        console.log('Badge assignment response status:', response.status);
        console.log('Badge assignment response headers:'); 
        response.headers.forEach((value, key) => {
          console.log(`${key}: ${value}`);
        });
        
        // Check if the response is HTML instead of JSON (common server error)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.error("Server returned HTML instead of JSON. Endpoint may not exist or server error occurred.");
          throw new Error("API endpoint not implemented or server error occurred");
        }
        
      if (!response.ok) {
          let errorMessage = "Failed to assign badge";
          try {
            const errorData = await response.json();
            console.error("Error response data:", errorData);
            errorMessage = errorData.message || errorMessage;
            if (errorData.error) {
              errorMessage += `: ${errorData.error}`;
            }
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
            // If we can't parse JSON, get the text content instead
            try {
              const textError = await response.text();
              console.error("Raw error response:", textError);
              if (textError.includes("<!DOCTYPE html>")) {
                errorMessage = "Server returned HTML instead of JSON. API endpoint may not be implemented.";
              }
            } catch (textError) {
              console.error("Error getting text content:", textError);
            }
          }
          throw new Error(errorMessage);
        }
        
        // Parse successful response
        try {
          const result = await response.json();
          console.log('Badge assignment success:', result);
          return result;
        } catch (parseError) {
          console.error("Error parsing success response:", parseError);
          return { success: true }; // Fallback if response cannot be parsed
        }
      } catch (error) {
        console.error("Badge assignment request error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      try {
        console.log('Badge assignment success data:', data);
      toast({
          title: "Badge Assigned",
          description: "The badge has been assigned to the user.",
      });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      } catch (error) {
        console.error("Error in onSuccess handler:", error);
      }
    },
    onError: (error: Error) => {
      try {
        console.error("Badge assignment error:", error);
      toast({
          title: "Error",
          description: error.message || "Failed to assign badge.",
        variant: "destructive",
      });
      } catch (toastError) {
        console.error("Error showing toast:", toastError);
      }
    },
  });

  // Remove badge mutation
  const removeBadgeMutation = useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string, badgeId: string }) => {
      const response = await fetch("/api/admin/badge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, badgeId, action: "remove" }),
        credentials: "include" // Important: Include cookies for session authentication
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove badge");
      }
      
      return response.json();
    },
    onSuccess: () => {
      try {
      toast({
          title: "Badge Removed",
          description: "The badge has been removed from the user.",
      });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      } catch (error) {
        console.error("Error in onSuccess handler:", error);
      }
    },
    onError: (error) => {
      try {
        console.error("Badge removal error:", error);
      toast({
          title: "Error",
          description: "Failed to remove badge.",
        variant: "destructive",
      });
      } catch (toastError) {
        console.error("Error showing toast:", toastError);
      }
    },
  });

  // Handlers
  const handleSearch = () => {
    try {
      setSearchInitiated(true);
      setCurrentPage(1);
      refetch();
    } catch (error) {
      console.error("Error in search handler:", error);
      toast({
        title: "Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    try {
      deleteUserMutation.mutate(userId);
    } catch (error) {
      console.error("Error in delete handler:", error);
    }
  };

  const handleUpdateSubscription = (userId: string, status: 'free' | 'premium') => {
    try {
      updateSubscriptionMutation.mutate({ userId, status });
    } catch (error) {
      console.error("Error in subscription update handler:", error);
    }
  };

  const handleAssignBadge = (userId: string, badgeId: string) => {
    try {
    assignBadgeMutation.mutate({ userId, badgeId });
    } catch (error) {
      console.error("Error in badge assignment handler:", error);
    }
  };

  const handleRemoveBadge = (userId: string, badgeId: string) => {
    try {
    removeBadgeMutation.mutate({ userId, badgeId });
    } catch (error) {
      console.error("Error in badge removal handler:", error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    try {
      setSelectedUsers((prev) =>
      prev.includes(userId)
          ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
    } catch (error) {
      console.error("Error toggling user selection:", error);
    }
  };

  const handleBulkAction = (action: string) => {
    try {
      // Implementation for bulk actions
        toast({
        title: "Bulk Action",
        description: `${action} applied to ${selectedUsers.length} users`,
        });
      // Reset selections after action
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error in bulk action handler:", error);
      toast({
        title: "Error",
        description: "Failed to apply bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Pagination calculation for user results
  const paginatedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return users.slice(startIndex, startIndex + PAGE_SIZE);
  }, [users, currentPage, PAGE_SIZE]);

  const totalPages = useMemo(() => {
    return users ? Math.ceil(users.length / PAGE_SIZE) : 0;
  }, [users, PAGE_SIZE]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Memoized empty states for better performance
  const emptySearchState = useMemo(() => (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="p-4 rounded-full bg-[#111]/60 mb-6 border border-white/5 shadow-md">
        <Search className="h-8 w-8 text-[#a855f7]" />
              </div>
      <h3 className="text-xl font-medium text-white mb-3">No users found</h3>
      <p className="text-white/60 max-w-md">No users match your search criteria. Try adjusting your search terms or filters.</p>
            </div>
  ), []);

  const initialSearchState = useMemo(() => (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="p-4 rounded-full bg-[#111]/60 mb-6 border border-white/5 shadow-md">
        <Search className="h-8 w-8 text-[#a855f7]" />
              </div>
      <h3 className="text-xl font-medium text-white mb-3">Search for users</h3>
      <p className="text-white/60 max-w-md">Enter a username in the search field above to find users and manage their badges.</p>
            </div>
  ), []);

  // Limit the number of users displayed to improve performance
  const limitedUsers = useMemo(() => {
    return users && users.length > 0 ? users.slice(0, 12) : [];
  }, [users]);

  // Optimize user rendering with useMemo to prevent re-renders
  const renderedUsers = useMemo(() => {
    if (!users || users.length === 0) return null;
    
    // Use paginatedUsers instead of limiting to 20
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {paginatedUsers.map((user) => (
          <div key={user.id} className="rounded-2xl overflow-hidden border border-white/5 bg-[#111]/60 backdrop-blur-sm shadow-lg">
            <div className="p-5 border-b border-white/5 bg-[#111]/80 backdrop-blur-md flex items-center gap-4">
              <div 
                className={`w-5 h-5 rounded-lg cursor-pointer flex items-center justify-center ${
                  selectedUsers.includes(user.id) 
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#9333ea] border-0 shadow-md shadow-purple-900/20' 
                    : 'border border-white/10 bg-[#111]/60'
                }`}
                onClick={() => toggleUserSelection(user.id)}
              >
                {selectedUsers.includes(user.id) && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-white">{user.username}</h3>
                  {user.lastOnline && new Date(user.lastOnline).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                    <Badge className="bg-green-950/40 text-green-400 hover:bg-green-950/60 border-green-500/20 rounded-full px-2 py-0.5 text-xs">Active Today</Badge>
                  )}
              </div>
                <div className="text-sm text-white/60 mt-1">{user.displayName || 'No display name'}</div>
            </div>
              <AlertDialog 
                open={openDialogs[user.id] || false}
                onOpenChange={(isOpen) => toggleDialog(user.id, isOpen)}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="bg-red-950/10 hover:bg-red-950/30 text-red-400 rounded-xl"
                    onClick={() => toggleDialog(user.id, true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#1a1a1a]/90 backdrop-blur-xl border-white/5 rounded-2xl shadow-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete User Account</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      Are you sure you want to delete {user.username}'s account? This action cannot be undone.
                      The user will be logged out and all their data will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      className="bg-[#111]/60 border-white/10 hover:bg-[#111]/80 hover:border-white/20 text-white rounded-xl transition-all duration-200"
                      onClick={() => toggleDialog(user.id, false)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 rounded-xl shadow-md shadow-red-900/20 transition-all duration-300"
                      onClick={() => {
                        handleDeleteUser(user.id);
                        toggleDialog(user.id, false);
                      }}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                        {/* Subscription Status */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-4 h-4 text-[#a855f7]" />
                      <h4 className="font-medium text-white">Subscription</h4>
                    </div>
                          <Select
                            value={user.subscriptionStatus || 'free'}
                      onValueChange={(value) => 
                        handleUpdateSubscription(user.id, value as 'free' | 'premium')
                            }
                          >
                      <SelectTrigger className="w-full bg-[#111]/60 border-white/10 focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] rounded-xl transition-all duration-200">
                              <SelectValue />
                            </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a]/90 backdrop-blur-md border-white/10 rounded-xl">
                        <SelectItem value="free" className="text-white focus:bg-white/10 focus:text-white">Free</SelectItem>
                        <SelectItem value="premium" className="text-white focus:bg-white/10 focus:text-white">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                  
                  {/* User Badges */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <UserIcon className="w-4 h-4 text-[#a855f7]" />
                      <h4 className="font-medium text-white">Current Badges</h4>
                    </div>
                        <div className="flex gap-2 flex-wrap">
                      {user.theme && Array.isArray(user.theme.badges) && user.theme.badges.length > 0 ? (
                        user.theme.badges.map((badgeId) => {
                            const badge = badgeDefinitions.find(b => b.id === badgeId);
                          return badge ? (
                              <div key={badge.id} className="relative group">
                              <Badge className="pr-7 bg-[#111]/60 hover:bg-[#111]/80 text-white border-white/10 rounded-full">
                                <span className="mr-1">{badge.icon}</span> {badge.name}
                                  <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveBadge(user.id, badge.id);
                                  }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              </div>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-white/40">No badges assigned</span>
                      )}
                        </div>
                      </div>
                </div>
                
                {/* Available Badges */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-[#a855f7]" />
                    <h4 className="font-medium text-white">Assign Badges</h4>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                    {badgeDefinitions.map((badge) => {
                      const hasBadge = user.theme && 
                        Array.isArray(user.theme.badges) && 
                        user.theme.badges.includes(badge.id);
                        
                      return (
                        <Button
                          key={badge.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`bg-[#111]/60 border-white/10 hover:bg-[#111]/80 hover:border-white/20 text-white rounded-xl transition-all duration-200 ${
                            hasBadge ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                          onClick={() => {
                            if (!hasBadge) {
                              handleAssignBadge(user.id, badge.id);
                            }
                          }}
                          disabled={!!hasBadge}
                        >
                          {badge.icon}
                          <span className="ml-1.5">{badge.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [paginatedUsers, selectedUsers, badgeDefinitions, handleRemoveBadge, handleAssignBadge, handleUpdateSubscription, handleDeleteUser, toggleUserSelection, toggleDialog, openDialogs]);

  // Add this effect to log important state changes
  useEffect(() => {
    console.log("AdminBadgesPage state change:", {
      isUserAuthenticated,
      isAdminAuthenticated,
      isCheckingAdminSession,
      searchInitiated
    });
  }, [isUserAuthenticated, isAdminAuthenticated, isCheckingAdminSession, searchInitiated]);

  // Add this effect to log when users data changes
  useEffect(() => {
    if (users) {
      console.log(`Users data updated: ${users.length} users loaded`);
    }
  }, [users]);

  // Add a failsafe mechanism to recover from blank page situations
  useEffect(() => {
    // If we're authenticated but have no data and not loading, something might be wrong
    if (isAdminAuthenticated && searchInitiated && !isLoading && !isSearching && (!users || users.length === 0)) {
      console.log("🛠️ Failsafe: Detected potential blank page situation");
      
      // Set a timer to trigger a refetch if the page stays blank
      const timer = setTimeout(() => {
        console.log("🔄 Failsafe: Triggering refetch to recover from potential blank page");
        refetch();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAdminAuthenticated, searchInitiated, isLoading, isSearching, users, refetch]);

  // Add a recovery mechanism for session issues
  useEffect(() => {
    // If we have a 401 error, try to recover by resetting authentication
    if (usersError && typeof usersError === 'object' && usersError.message && usersError.message.includes('401')) {
      console.log("🔄 Auto-recovery: Detected 401 error, resetting authentication state");
      setIsAdminAuthenticated(false);
    }
  }, [usersError]);

  // Add a timeout to prevent getting stuck in loading state
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isSearching || isLoading) {
      console.log("⏱️ Setting loading timeout safeguard");
      timeoutId = setTimeout(() => {
        console.log("⚠️ Loading timeout triggered - resetting search state");
        setIsSearching(false);
        toast({
          title: "Loading Timeout",
          description: "The request is taking longer than expected. Please try again.",
          variant: "destructive",
        });
      }, 15000); // 15 second timeout
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSearching, isLoading, toast]);

  // Add a safety check to reset search state if it gets stuck
  useEffect(() => {
    let safetyTimer: NodeJS.Timeout | null = null;
    
    // If we're searching but not getting results, reset after 10 seconds
    if (searchInitiated && isSearching) {
      console.log("⏱️ Setting safety timer for search state");
      safetyTimer = setTimeout(() => {
        console.log("⚠️ Safety timer triggered - search may be stuck");
        setIsSearching(false);
        
        // If we have no users after timeout, try a wildcard search
        if (!users || users.length === 0) {
          console.log("🔄 No users found after timeout, triggering wildcard search");
          setUsername("");
          setTimeout(() => {
            refetch();
          }, 500);
        }
      }, 10000);
    }
    
    return () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };
  }, [searchInitiated, isSearching, users, refetch]);

  // Return the main dashboard UI, wrapped in an error boundary
  return (
    <ErrorBoundary 
      fallback={(props) => 
        <ErrorFallback 
          {...props} 
          queryClient={queryClient} 
          setSearchInitiated={setSearchInitiated} 
          setCurrentPage={setCurrentPage} 
          setIsAdminAuthenticated={setIsAdminAuthenticated} 
        />
      }
    >
      {/* Show loading indicator while checking admin session */}
      {isCheckingAdminSession ? (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-4 font-sans">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#a855f7] border-t-transparent"></div>
            <p className="text-white/70">Checking authentication status...</p>
          </div>
        </div>
      ) : !isUserAuthenticated ? (
        // Not logged in screen
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans antialiased flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center">
              <ShieldAlert className="w-6 h-6 text-[#a855f7] mr-3" />
              <h2 className="text-xl font-medium text-white">Admin Authentication</h2>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="text-center py-8">
                <div className="bg-[#111]/80 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Lock className="w-8 h-8 text-[#a855f7]" />
                </div>
                <p className="text-white/70 mb-6">
                  You must be logged in to access the admin dashboard.
                </p>
                <Button 
                  className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] hover:from-[#9333ea] hover:to-[#7928ca] text-white transition-all duration-300 shadow-md shadow-purple-900/20 border-0 rounded-xl px-6 py-2.5 font-medium"
                  onClick={() => window.location.href = "/auth"}
                >
                  Go to Login Page
                </Button>
                    </div>
                  </div>
                </Card>
            </div>
      ) : !isAdminAuthenticated ? (
        // Admin password screen (separated from user authentication)
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans antialiased flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center">
              <ShieldAlert className="w-6 h-6 text-[#a855f7] mr-3" />
              <h2 className="text-xl font-medium text-white">Admin Authentication</h2>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <div className="bg-[#111]/80 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Lock className="w-8 h-8 text-[#a855f7]" />
                  </div>
                  <p className="text-white/70 mb-6">
                    Enter the admin password to access the badge management system.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="adminPassword" className="text-sm font-medium text-white/80">Admin Password</label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="bg-[#111] border-white/10 focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-white h-11 rounded-xl transition-all duration-200"
                      onKeyDown={(e) => e.key === "Enter" && handleAdminAuth()}
                    />
                  </div>
                  <LoadingButton
                    onClick={handleAdminAuth}
                    className="w-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] hover:from-[#9333ea] hover:to-[#7928ca] text-white h-11 transition-all duration-300 shadow-md shadow-purple-900/20 border-0 rounded-xl font-medium"
                    isLoading={isAuthenticating}
                    loadingText="Authenticating..."
                  >
                    Authenticate
                  </LoadingButton>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        // Main dashboard content
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans antialiased">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
            {/* Header Section */}
            <div className="mb-10">
              <h1 className="text-3xl font-medium tracking-tight text-white mb-2">Badge Management</h1>
              <p className="text-white/60">
                Control user badges and subscription status from a central dashboard
              </p>
            </div>

            {/* User Stats - Remove the Badges section */}
            <Card className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-lg overflow-hidden mb-10">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-medium text-white">User Statistics</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#111]/60 border border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-[#a855f7]" />
                      <h3 className="text-white/70 font-medium">Total Users</h3>
                    </div>
                    <p className="text-3xl font-medium text-white">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#111]/60 border border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-[#a855f7]" />
                      <h3 className="text-white/70 font-medium">Premium Users</h3>
                    </div>
                    <p className="text-3xl font-medium text-white">{stats.premiumUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#111]/60 border border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-[#a855f7]" />
                      <h3 className="text-white/70 font-medium">Active Today</h3>
                    </div>
                    <p className="text-3xl font-medium text-white">{stats.activeUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#111]/60 border border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-[#a855f7]" />
                      <h3 className="text-white/70 font-medium">New This Week</h3>
                    </div>
                    <p className="text-3xl font-medium text-white">{stats.newUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* User Search */}
            <Card className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-medium text-white">Search Users</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
                    <Input
                      placeholder="Search by username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-[#111] border-white/10 focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-white h-11 rounded-xl transition-all duration-200"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-[#111] border-white/10 focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] h-11 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Subscription" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10 rounded-xl">
                      <SelectItem value="all" className="text-white focus:bg-white/10 focus:text-white">All Users</SelectItem>
                      <SelectItem value="free" className="text-white focus:bg-white/10 focus:text-white">Free Users</SelectItem>
                      <SelectItem value="premium" className="text-white focus:bg-white/10 focus:text-white">Premium Users</SelectItem>
                    </SelectContent>
                  </Select>
                  <LoadingButton
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] hover:from-[#9333ea] hover:to-[#7928ca] text-white h-11 transition-all duration-300 shadow-md shadow-purple-900/20 border-0 rounded-xl font-medium px-6"
                    isLoading={isSearching}
                    loadingText="Searching..."
                  >
                    Search
                  </LoadingButton>
                </div>
              </div>
            </Card>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="mb-6 p-5 rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 shadow-lg flex flex-wrap items-center gap-4">
                <div className="text-white flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] flex items-center justify-center text-white text-sm font-medium mr-3 shadow-md shadow-purple-900/20">
                    {selectedUsers.length}
                  </div>
                  <span className="font-medium">users selected</span>
                </div>
                <div className="flex-1"></div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#111]/60 border-white/10 hover:bg-[#111]/80 hover:border-white/20 text-white transition-all duration-200 rounded-xl shadow-sm"
                  onClick={() => handleBulkAction("premium")}
                >
                  <Crown className="w-4 h-4 mr-1.5 text-[#a855f7]" />
                  Make Premium
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#111]/60 border-white/10 hover:bg-[#111]/80 hover:border-white/20 text-white transition-all duration-200 rounded-xl shadow-sm"
                  onClick={() => handleBulkAction("free")}
                >
                  <Users className="w-4 h-4 mr-1.5 text-[#a855f7]" />
                  Make Free
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#111]/60 border-red-500/20 hover:bg-red-950/20 hover:border-red-500/40 text-red-400 transition-all duration-200 rounded-xl shadow-sm"
                  onClick={() => handleBulkAction("delete")}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete Users
                </Button>
              </div>
            )}

            {/* User Results */}
            <Card className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-medium text-white">User Results</h2>
              </div>
              <div className="p-6">
                {isLoading || isSearching ? (
                  <div className="flex items-center justify-center p-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#a855f7] border-t-transparent"></div>
                  </div>
                ) : usersError ? (
                  <div className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="p-4 rounded-full bg-[#111]/60 mb-6 border border-red-500/20 shadow-md">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3">Error Loading Users</h3>
                    <p className="text-white/60 max-w-md mb-6">
                      There was a problem loading the user data. This could be due to an authentication issue or server error.
                    </p>
                    <Button
                      onClick={() => {
                        setIsAdminAuthenticated(false); // Reset authentication state
                        setSearchInitiated(false);
                      }}
                      className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] hover:from-[#9333ea] hover:to-[#7928ca] text-white transition-all duration-300 shadow-md shadow-purple-900/20 border-0 rounded-xl font-medium"
                    >
                      Return to Login
                    </Button>
                  </div>
                ) : users && users.length > 0 ? (
                  <>
                    {renderedUsers}
                    
                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-between">
                        <div className="text-white/60">
                          Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, users.length)} of {users.length} users
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`bg-[#111]/60 border-white/10 text-white rounded-xl shadow-sm ${
                              currentPage === 1 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-[#111]/80 hover:border-white/20 transition-all duration-200'
                            }`}
                          >
                            Previous
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`bg-[#111]/60 border-white/10 text-white rounded-xl shadow-sm ${
                              currentPage === totalPages 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-[#111]/80 hover:border-white/20 transition-all duration-200'
                            }`}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : searchInitiated ? (
                  emptySearchState
                ) : (
                  initialSearchState
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}