import { PageView, AnalyticsSummary } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import {
  Globe2,
  Monitor,
  Clock,
  Users,
  Eye,
  Chrome,
  Globe,
  Smartphone,
  Laptop,
  TrendingUp,
  Clock3,
  MousePointer,
  Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveGlobe } from "@/components/interactive-globe";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const getBrowserIcon = (browser: string) => {
  const lowerBrowser = browser.toLowerCase();
  if (lowerBrowser.includes('chrome')) return Chrome;
  return Globe;
};

type AnalyticsCardProps = {
  data: PageView[];
  className?: string;
};

const BadgeDisplay = ({ badges }: { badges: string[] }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[200px]">
      {badges.map((badge, index) => (
        <div
          key={badge}
          className={cn(
            "relative group",
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-purple-500/20 to-blue-500/20",
            "border border-purple-500/30",
            "transition-all duration-300 hover:scale-110",
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-gradient-to-br before:from-purple-500/20 before:to-blue-500/20",
            "before:animate-pulse before:opacity-0 group-hover:before:opacity-100",
            "sm:w-10 sm:h-10"
          )}
        >
          <Medal className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors duration-300 sm:w-5 sm:h-5" />
          <span className="absolute -bottom-1 right-0 w-3 h-3 bg-purple-500 rounded-full border-2 border-black"></span>
          <div className="absolute opacity-0 group-hover:opacity-100 bottom-full right-0 mb-2 px-2 py-1 bg-[#8e44ad]/90 text-xs rounded whitespace-nowrap transition-opacity duration-200">
            {badge}
          </div>
        </div>
      ))}
    </div>
  );
};

export function AnalyticsCard({ data, className }: AnalyticsCardProps) {
  const summary: AnalyticsSummary = {
    totalViews: data.length,
    uniqueVisitors: new Set(data.map(view => view.browser)).size,
    averageTimeOnPage: 0,
    topCountries: Object.entries(
      data.reduce((acc, view) => {
        if (view.country) {
          acc[view.country] = (acc[view.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
    topDevices: Object.entries(
      data.reduce((acc, view) => {
        if (view.device) {
          acc[view.device] = (acc[view.device] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    topBrowsers: Object.entries(
      data.reduce((acc, view) => {
        if (view.browser) {
          acc[view.browser] = (acc[view.browser] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    viewsByTime: Object.entries(
      data.reduce((acc, view) => {
        const date = new Date(view.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([timestamp, count]) => ({ timestamp, count })),
  };

  const last24Hours = data.filter(view => {
    const viewTime = new Date(view.timestamp).getTime();
    const now = new Date().getTime();
    return now - viewTime <= 24 * 60 * 60 * 1000;
  }).length;

  const engagementRate = summary.uniqueVisitors > 0
    ? ((summary.totalViews / summary.uniqueVisitors) * 100).toFixed(1)
    : "0";

  // Prepare chart data specifically for the last 7 days, formatted the same as the overview page
  const prepareChartData = () => {
    if (!data.length) return [];

    const viewsByDate = data.reduce((acc, view) => {
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
    <div className={`space-y-6 ${className}`}>
      <Card className="p-6 shadow-lg relative transition-all duration-300">
        <h2 className="text-xl font-mono font-bold mb-6">Analytics Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Views Card */}
          <Card className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 relative overflow-hidden transition-all duration-300 hover:bg-[#8e44ad]/30 hover:scale-[1.02] transform">
            <div className="absolute right-0 top-0 p-3">
              <Eye className="h-6 w-6 text-[#8e44ad] opacity-50 transition-all duration-300 group-hover:opacity-75" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/70">Total Views</p>
              <p className="text-3xl font-bold transition-all duration-300">{summary.totalViews}</p>
              <p className="text-sm text-white/50">Lifetime</p>
            </div>
          </Card>

          {/* Unique Visitors Card */}
          <Card className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 relative overflow-hidden transition-all duration-300 hover:bg-[#8e44ad]/30 hover:scale-[1.02] transform">
            <div className="absolute right-0 top-0 p-3">
              <Users className="h-6 w-6 text-[#8e44ad] opacity-50 transition-all duration-300 group-hover:opacity-75" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/70">Unique Visitors</p>
              <p className="text-3xl font-bold transition-all duration-300">{summary.uniqueVisitors}</p>
              <p className="text-sm text-white/50">Total unique visitors</p>
            </div>
          </Card>

          {/* Last 24 Hours Card */}
          <Card className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 relative overflow-hidden transition-all duration-300 hover:bg-[#8e44ad]/30 hover:scale-[1.02] transform">
            <div className="absolute right-0 top-0 p-3">
              <Clock3 className="h-6 w-6 text-[#8e44ad] opacity-50 transition-all duration-300 group-hover:opacity-75" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/70">Last 24 Hours</p>
              <p className="text-3xl font-bold transition-all duration-300">{last24Hours}</p>
              <p className="text-sm text-white/50">Recent views</p>
            </div>
          </Card>

          {/* Engagement Rate Card */}
          <Card className="p-4 bg-[#8e44ad]/20 border border-[#8e44ad]/20 relative overflow-hidden transition-all duration-300 hover:bg-[#8e44ad]/30 hover:scale-[1.02] transform">
            <div className="absolute right-0 top-0 p-3">
              <MousePointer className="h-6 w-6 text-[#8e44ad] opacity-50 transition-all duration-300 group-hover:opacity-75" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/70">Engagement Rate</p>
              <p className="text-3xl font-bold transition-all duration-300">{engagementRate}%</p>
              <p className="text-sm text-white/50">Views per visitor</p>
            </div>
          </Card>
        </div>
      </Card>

      <div className="grid gap-6">
        {/* Views Over Time - Updated to match the Overview page style */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Last 7 days of traffic to your profile</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {chartData.length > 0 ? (
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Enhanced Top Countries with Interactive 3D Globe */}
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-[#8e44ad]" />
                Top Countries
              </CardTitle>
              <CardDescription>Geographic distribution of your profile visitors</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.topCountries.length > 0 ? (
                <>
                  <div className="mb-6">
                    <InteractiveGlobe 
                      data={summary.topCountries} 
                      totalViews={summary.totalViews}
                    />
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <h4 className="text-sm font-medium text-white/80">Top Visitor Locations</h4>
                    <div className="space-y-2">
                      {summary.topCountries.map(({ country, views }) => (
                        <div key={country} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-white/50" />
                            <span>{country || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white/70">{views}</span>
                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#8e44ad]/50"
                                style={{
                                  width: `${(views / summary.totalViews) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-center items-center h-[350px] text-center">
                  <Globe2 className="h-16 w-16 text-[#8e44ad]/30 mb-4" />
                  <p className="text-muted-foreground mb-2">No location data available yet</p>
                  <p className="text-sm">Geographic data will appear as your profile gets visitors from around the world</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-6 transition-all duration-300">
            <h3 className="text-lg font-mono mb-6 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-[#8e44ad]" />
              Devices & Browsers
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm text-white/70 mb-4">Top Devices</h4>
                <div className="space-y-2">
                  {summary.topDevices.map(({ device, count }) => (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.toLowerCase().includes('mobile') ? (
                          <Smartphone className="h-4 w-4 text-white/50" />
                        ) : (
                          <Laptop className="h-4 w-4 text-white/50" />
                        )}
                        <span>{device || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70">{count}</span>
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#8e44ad]/50"
                            style={{
                              width: `${(count / summary.totalViews) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-white/70 mb-4">Top Browsers</h4>
                <div className="space-y-2">
                  {summary.topBrowsers.map(({ browser, count }) => {
                    const BrowserIcon = getBrowserIcon(browser);
                    return (
                      <div key={browser} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BrowserIcon className="h-4 w-4 text-white/50" />
                          <span>{browser || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/70">{count}</span>
                          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#8e44ad]/50"
                              style={{
                                width: `${(count / summary.totalViews) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}