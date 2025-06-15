import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { PageTitle } from "@/components/page-title";
import { DocumentTitle } from "@/components/document-title";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLastOnline } from "@/utils/date";
import { TypingAnimation } from "@/components/typing-animation";
import { PageView } from "@shared/schema";
import { Chart } from "@/components/ui/chart";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Edit, User, Eye, Fingerprint, Crown } from "lucide-react";
import { QRCodeGenerator } from "@/components/qr-code-generator";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Query for user data first
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
    retry: 3,
    retryDelay: 1000,
    staleTime: 30000,
  });

  // Fetch analytics data after user data is loaded - using the regular analytics endpoint
  const { data: pageViews, isLoading: isLoadingAnalytics } = useQuery<PageView[]>({
    queryKey: ['/api/analytics', user?.id],
    queryFn: getQueryFn<PageView[]>({ on401: "throw" }),
    enabled: !!user?.id && !!userData,
    refetchOnWindowFocus: true,
    retry: 3,
    placeholderData: []
  });

  const getUserNumericUid = (userId: string | undefined): number => {
    if (!userId) return 0;
    const idPrefix = userId.substring(0, 8);
    const numericId = parseInt(idPrefix, 16) % 10000;
    return numericId + 1;
  };

  const formatCreationDate = (
    timestamp: string | number | null | undefined, 
    useShortFormat: boolean = false
  ): string => {
    if (!timestamp) {
      const today = new Date();
      return formatDate(today, useShortFormat);
    }

    let date: Date;

    if (typeof timestamp === 'number') {
      date = timestamp < 10000000000 ? new Date(timestamp * 1000) : new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      const today = new Date();
      return formatDate(today, useShortFormat);
    }

    return formatDate(date, useShortFormat);
  };

  const formatDate = (date: Date, useShortFormat: boolean): string => {
    if (useShortFormat) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state - show skeleton UI while fetching data
  if (isLoadingUser || !user) {
    return (
      <div className="container mx-auto p-4">
        <PageTitle title="Account Overview" description="Loading your account information..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Process the data for the chart
  const prepareChartData = () => {
    if (!pageViews?.length) return [];

    const viewsByDate = pageViews.reduce((acc, view) => {
      const date = new Date(view.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(viewsByDate)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7)
      .map(([date, count]) => ({ date, views: count }));
  };

  const chartData = prepareChartData();

  return (
    <div className="container mx-auto p-4">
      <DocumentTitle title="Account Overview" />
      <PageTitle 
        title="Account Overview" 
        description="Welcome back! Here's an overview of your Slayz.cc profile and statistics."
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Username Card */}
        <Card className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 relative overflow-hidden transition-all duration-300 hover:bg-[#8e44ad]/30 hover:scale-[1.02] transform">
          <div className="absolute right-0 top-0 p-3">
            <User className="h-6 w-6 text-[#8e44ad] opacity-50 transition-all duration-300 group-hover:opacity-75" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-white/70">Username</p>
            <p className="text-3xl font-bold transition-all duration-300">{user.username}</p>
            {user.displayName && (
              <p className="text-sm text-white/50">Display name: {user.displayName}</p>
            )}
          </div>
        </Card>

        {/* Profile Views Card */}
        <Card className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 relative overflow-hidden transition-all duration-300 hover:bg-[#8e44ad]/30 hover:scale-[1.02] transform">
          <div className="absolute right-0 top-0 p-3">
            <Eye className="h-6 w-6 text-[#8e44ad] opacity-50 transition-all duration-300 group-hover:opacity-75" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-white/70">Profile Views</p>
            {isLoadingAnalytics ? (
              <span className="text-3xl font-bold">
                <Skeleton className="h-8 w-20 inline-block" />
              </span>
            ) : (
              <p className="text-3xl font-bold transition-all duration-300">
                {pageViews?.length || 0}
              </p>
            )}
            <p className="text-sm text-white/50">All time views on your profile</p>
          </div>
        </Card>

        {/* User ID Card */}
        <Card className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 relative overflow-hidden transition-all duration-300 hover:bg-[#8e44ad]/30 hover:scale-[1.02] transform">
          <div className="absolute right-0 top-0 p-3">
            <Fingerprint className="h-6 w-6 text-[#8e44ad] opacity-50 transition-all duration-300 group-hover:opacity-75" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-white/70">Account ID</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold transition-all duration-300">#{getUserNumericUid(user.id)}</p>
              {user.id && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-mono bg-[#8e44ad]/20 hover:bg-[#8e44ad]/30 border-[#8e44ad]/30 text-[#d6a9e6]"
                  title={user.id}
                >
                  {user.id.substring(0, 6)}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center text-sm text-white/50">
              <span className="mr-1">Joined:</span>
              <span className="whitespace-nowrap hidden sm:inline">
                {formatCreationDate(user.createdAt ? Number(user.createdAt) : null, false)}
              </span>
              <span className="whitespace-nowrap sm:hidden">
                {formatCreationDate(user.createdAt ? Number(user.createdAt) : null, true)}
              </span>
            </div>
          </div>
        </Card>

        {/* Subscription Tier Card */}
        <Card className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 relative overflow-hidden transition-all duration-300 hover:bg-[#8e44ad]/30 hover:scale-[1.02] transform">
          <div className="absolute right-0 top-0 p-3">
            <Crown className="h-6 w-6 text-[#8e44ad] opacity-50 transition-all duration-300 group-hover:opacity-75" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-white/70">Subscription</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold capitalize transition-all duration-300">
                {user.subscriptionStatus || "Free"}
              </p>
              {user.subscriptionStatus === "pro" && (
                <Badge className="bg-gradient-to-r from-[#8e44ad] to-[#9b59b6]">PRO</Badge>
              )}
            </div>
            <div className="text-sm text-white/50">
              {user.subscriptionEnd ? (
                <div className="flex flex-wrap items-center">
                  <span className="mr-1">Renews:</span>
                  <span className="whitespace-nowrap hidden sm:inline">
                  ꝏ
                  </span>
                  <span className="whitespace-nowrap sm:hidden">
                    {formatCreationDate(user.subscriptionEnd ? Number(user.subscriptionEnd) : null, true)}
                  </span>
                </div>
              ) : (
                <Link 
                  to="/pricing" 
                  className="text-[#d6a9e6] hover:text-white transition-colors duration-200"
                >
                  Upgrade now
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Graph Card */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Profile Visits</CardTitle>
            <CardDescription>Last 7 days of traffic to your profile</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingAnalytics ? (
              <div className="flex justify-center items-center h-full">
                <Skeleton className="h-4/5 w-full" />
              </div>
            ) : chartData.length > 0 ? (
              <Chart 
                type="area"
                data={chartData}
                options={{
                  xKey: "date",
                  yKey: "views",
                  fill: true,
                  fillOpacity: 0.2,
                  smooth: true,
                  grid: {
                    horizontal: true,
                    vertical: false,
                    strokeDasharray: "5 5",
                    opacity: 0.5
                  }
                }}
                className="h-full"
              />
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center">
                <p className="text-muted-foreground mb-2">No data available yet</p>
                <p className="text-sm">View data will appear here as your profile gets visitors</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Code Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <QRCodeGenerator
          profileUrl={`${window.location.origin}/${user.username}`}
          userName={user.username}
          profileImage={typeof user.logo === 'string' ? user.logo : undefined}
        />

        {/* Account Connections */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow bg-gradient-to-br from-[#1a1a2e]/50 to-[#16213e]/50 border-[#0f3460]/30">
          <CardHeader className="bg-black/20 backdrop-filter backdrop-blur-sm">
            <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8e44ad] to-[#3498db]">Connected Accounts</CardTitle>
            <CardDescription className="text-white/70">Manage your linked social accounts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Discord Connection */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#5865F2]/20 to-[#5865F2]/10 backdrop-filter backdrop-blur-sm rounded-xl border border-[#5865F2]/30 hover:border-[#5865F2]/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Discord</p>
                    <p className="text-sm text-white/70">
                      {(user.discordUsername as string) || "Not connected"}
                    </p>
                  </div>
                </div>
                <Link 
                  to="/dashboard/settings" 
                  className={`px-4 py-2 rounded-lg ${(user.discordId as string) ? 'bg-[#5865F2]/20 hover:bg-[#5865F2]/40' : 'bg-[#5865F2] hover:bg-[#4752c4]'} text-white text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md`}
                >
                  {(user.discordId as string) ? "Manage" : "Connect"}
                </Link>
              </div>

              {/* GitHub Connection */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#333333]/20 to-[#24292e]/10 backdrop-filter backdrop-blur-sm rounded-xl border border-[#333333]/30 hover:border-[#333333]/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#333333] flex items-center justify-center text-white shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">GitHub</p>
                    <p className="text-sm text-white/70">
                      {(user.githubUsername as string) || "Not connected"}
                    </p>
                  </div>
                </div>
                <Link 
                  to="/dashboard/settings" 
                  className={`px-4 py-2 rounded-lg ${(user.githubId as string) ? 'bg-[#333333]/20 hover:bg-[#333333]/40' : 'bg-[#333333] hover:bg-[#24292e]'} text-white text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md`}
                >
                  {(user.githubId as string) ? "Manage" : "Connect"}
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-white/60 bg-black/20 backdrop-filter backdrop-blur-sm">
            Connect accounts to enhance your profile and enable additional features
          </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground mt-16 pb-8">
        <p>Copyright © Slayz.cc {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
}