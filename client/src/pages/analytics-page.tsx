import { useQuery } from "@tanstack/react-query";
import { AnalyticsCard } from "@/components/analytics-card";
import { PageView } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { DocumentTitle } from "@/components/document-title";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function AnalyticsPage() {
  const { user } = useAuth();

  const { data: analytics, isLoading, error } = useQuery<PageView[]>({
    queryKey: ["/api/analytics"],
    queryFn: getQueryFn<PageView[]>({ on401: "returnNull" }),
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    placeholderData: []
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DocumentTitle title="Analytics" />
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DocumentTitle title="Analytics" />
        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300">Failed to load analytics data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DocumentTitle title="Analytics" />
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-400">No Analytics Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-300">Start sharing your profile to see analytics data here!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentTitle title="Analytics" />
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold tracking-tighter">
            Analytics
          </h1>
        </div>
        <AnalyticsCard data={analytics} />
      </div>
    </div>
  );
}