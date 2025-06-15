import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DocumentTitle } from "@/components/document-title";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Trophy, Medal, Award } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import Wrapper from "@/components/global/wrapper";
import { DecorationPreview } from "@/components/decoration-preview";
import { StarBorder } from "@/components/star-border";
import GlowCounter from "@/components/glow-counter";

// Extended User type with view count and theme
type UserWithViewCount = {
  id: string;
  username: string;
  display_name: string | null;
  logo: string | null;
  backgroundImage: string | null;
  viewCount: number;
  theme?: {
    decoration?: {
      enabled: boolean;
      name: string;
      animation: {
        type: "bounce" | "glow" | "fade" | "none";
        speed: number;
        scale: number;
      };
    };
    badges?: string[];
  };
}

// Gradient combinations for avatar placeholders
const GRADIENT_COMBINATIONS = [
  ["from-purple-500 to-pink-500", "purple-pink"],
  ["from-blue-500 to-teal-400", "blue-teal"],
  ["from-red-500 to-orange-500", "red-orange"],
  ["from-green-500 to-emerald-400", "green-emerald"],
  ["from-indigo-600 to-violet-500", "indigo-violet"],
  ["from-amber-500 to-yellow-400", "amber-yellow"],
  ["from-rose-500 to-pink-400", "rose-pink"],
  ["from-cyan-500 to-blue-400", "cyan-blue"],
  ["from-fuchsia-600 to-pink-400", "fuchsia-pink"],
  ["from-lime-500 to-green-400", "lime-green"],
];

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserWithViewCount[]>([]);

  // Fetch users from API
  const { data: userData, isLoading: isLoadingUsers } = useQuery<UserWithViewCount[]>({
    queryKey: ["/api/leaderboard"],
    retry: false,
    refetchInterval: 60000, // Refetch every minute to keep the leaderboard updated
  });

  useEffect(() => {
    if (userData) {
      setUsers(userData);
    }
  }, [userData]);

  // Get rank styling based on position
  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: // 1st place
        return {
          icon: <Trophy className="h-6 w-6 text-yellow-400 drop-shadow-glow-yellow" />,
          badge: <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-glow-sm shadow-yellow-400/20">1st</Badge>,
          color: "#FFD700", // Gold
          showAnimation: true
        };
      case 1: // 2nd place
        return {
          icon: <Medal className="h-6 w-6 text-slate-300 drop-shadow-glow-slate" />,
          badge: <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 shadow-glow-sm shadow-slate-400/20">2nd</Badge>,
          color: "#8A2BE2", // Dark purple
          showAnimation: true
        };
      case 2: // 3rd place
        return {
          icon: <Medal className="h-6 w-6 text-amber-600 drop-shadow-glow-amber" />,
          badge: <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-glow-sm shadow-amber-400/20">3rd</Badge>,
          color: "#00BFFF", // Sky blue cyan
          showAnimation: true
        };
      default: // Other ranks
        return {
          icon: <Award className="h-6 w-6 text-blue-400 drop-shadow-glow-blue" />,
          badge: <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-glow-sm shadow-blue-400/20">{index + 1}th</Badge>,
          color: "#4f9cff", // Blue
          showAnimation: false
        };
    }
  };

  // Generate a stable random gradient for each user based on their ID
  const getGradientForUser = (userId: string) => {
    // Use a simple hash function to get a consistent number from the user ID
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % GRADIENT_COMBINATIONS.length;
    return GRADIENT_COMBINATIONS[index][0];
  };

  // Get top 10 users sorted by view count
  const topUsers = useMemo(() => {
    return [...users].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);
  }, [users]);

  return (
    <Wrapper>
      <Navbar />
      <div className="min-h-screen text-white">
        <DocumentTitle title="Leaderboard" />
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="max-w-6xl mx-auto">
            <PageTitle
              title="Leaderboard"
              description="Top 10 profiles ranked by views"
            />

            <div className="mt-8 space-y-4">
              {isLoadingUsers ? (
                // Loading skeletons - show only 10
                Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="p-1">
                    <Card className="p-4 border border-white/10 bg-white/5">
                      <div className="flex items-center">
                        <div className="w-16 flex-shrink-0">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-6 w-48 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <Skeleton className="h-6 w-16 ml-auto" />
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              ) : (
                // Actual leaderboard entries - top 10 only
                topUsers.map((user, index) => {
                  const rankStyle = getRankStyles(index);
                  const baseUrl = window.location.origin;
                  const profileUrl = `/${user.username}`;
                  const hasDecoration = user.theme?.decoration?.enabled && user.theme?.decoration?.name;
                  const gradientClass = getGradientForUser(user.id);

                  return (
                    <div key={user.id} className="relative">
                      {/* Crown completely outside of the card */}
                      {index === 0 && (
                        <div className="absolute -top-[36px] -left-[-36px] z-50 pointer-events-none">
                          <img 
                            src="https://i.ibb.co/tM7VGF3j/download-1.png"
                            alt="Crown"
                            className="w-[100px] h-[100px] transform -rotate-[25deg] drop-shadow-2xl filter brightness-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://cdn-icons-png.flaticon.com/512/2171/2171971.png"; 
                              console.error("Failed to load crown image, using fallback");
                            }}
                          />
                        </div>
                      )}
                      <StarBorder 
                        className="p-1"
                        color={rankStyle.color}
                        speed="10s"
                        showAnimation={rankStyle.showAnimation}
                      >
                        <Card className="py-2.5 px-4 border-none bg-transparent">
                          <div className="flex items-center">
                            <div className="w-14 flex-shrink-0 flex items-center justify-center">
                              {rankStyle.icon}
                            </div>
                            <div className="flex-1 min-w-0 flex items-center">
                              <Link href={profileUrl}>
                                <div className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
                                  <div className="relative w-12 h-12">
                                    <Avatar className="h-12 w-12 mr-3 border-2 border-white/20">
                                      {user.logo ? (
                                        <img
                                          src={user.logo.startsWith("http") ? user.logo : `${baseUrl}${user.logo}`}
                                          alt={user.display_name || user.username}
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${gradientClass} text-white text-lg font-bold`}>
                                          {(user.display_name || user.username || "?").charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </Avatar>
                                    {hasDecoration && (
                                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                                        <DecorationPreview decoration={user.theme?.decoration} />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium truncate max-w-[200px] flex items-center space-x-1.5">
                                      <span>{user.display_name || user.username}</span>
                                      {rankStyle.badge}
                                    </div>
                                    <div className="text-sm text-white/60 truncate max-w-[200px]">
                                      @{user.username}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                            <div className="flex-shrink-0">
                              <GlowCounter 
                                value={user.viewCount} 
                                label="profile views"
                                icon={<Eye className="w-4 h-4 text-blue-400" />}
                                color={rankStyle.color}
                              />
                            </div>
                          </div>
                        </Card>
                      </StarBorder>
                    </div>
                  );
                })
              )}

              {!isLoadingUsers && topUsers.length === 0 && (
                <Card className="p-8 border border-white/10 bg-white/5 text-center">
                  <div className="text-white/60">No users found</div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Wrapper>
  );
}