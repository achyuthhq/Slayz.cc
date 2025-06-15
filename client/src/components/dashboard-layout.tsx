import { ReactNode, useState } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Palette,
  Share2,
  Settings,
  Medal,
  User,
  ChevronRight,
  BarChart,
  CreditCard,
  MessageSquare,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Card } from "./ui/card";
import { FaDiscord } from "react-icons/fa";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DISCORD_LINK = "https://discord.gg/TseKvdPMYV";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
  },
  {
    name: "Customization",
    href: "/dashboard/customize",
    icon: Palette,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    name: "Socials",
    href: "/dashboard/socials",
    icon: Share2,
  },
  {
    name: "Badges",
    href: "/dashboard/badges",
    icon: Medal,
  },
  {
    name: "Chatbot",
    href: "/dashboard/chatbot",
    icon: MessageSquare,
  },
  {
    name: "Pricing",
    href: "/dashboard/pricing",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function NavigationContent() {
  const { user } = useAuth();

  return (
    <nav className="flex flex-col h-full py-6">
      <ul role="list" className="flex flex-col h-full">
        <li className="flex-1">
          <ul role="list" className="space-y-2 px-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-semibold text-white/70 hover:text-white hover:bg-[#8e44ad]/20 transition-colors duration-150"
                >
                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  {item.name}
                  <ChevronRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                </Link>
              </li>
            ))}
          </ul>
        </li>
        <li className="space-y-4 px-4 py-6 mt-auto">
          <Card className="p-4 bg-[#8e44ad]/10 border-[#8e44ad]/20">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <FaDiscord className="h-5 w-5 text-[#8e44ad]" />
                <h3 className="font-semibold">Join Our Community</h3>
              </div>
              <p className="text-sm text-white/70">
                Get help, share your work, and connect with other creators!
              </p>
              <a
                href={DISCORD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <ShinyButton className="w-full bg-[#8e44ad] hover:bg-[#9b59b6]">
                  <FaDiscord className="w-4 h-4 mr-2" />
                  Join Server
                </ShinyButton>
              </a>
            </div>
          </Card>

          <Link href={`/${user?.username}`}>
            <div className="w-full relative group">
              <ShinyButton
                variant="outline"
                className="w-full relative overflow-hidden glass-button mt-4 border-[#8e44ad]/20 hover:bg-[#8e44ad]/10"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#8e44ad]/20 via-[#9b59b6]/20 to-[#8e44ad]/20 opacity-0 group-hover:opacity-20 transition-opacity duration-150"></span>
                <User className="mr-2 h-4 w-4 relative z-10" />
                <span className="relative z-10">View My Profile</span>
              </ShinyButton>
            </div>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-[50] lg:pt-6 lg:pb-6 lg:pl-6">
        <div className="flex flex-col h-full relative">
          <div className="mb-6 ml-2">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-mono font-bold tracking-tighter">
              <img src="https://huggingface.co/spaces/Achyuth4/lynk/resolve/main/slayz.png" alt="Slayz.cc Logo" className="h-[50px] w-[120px] object-contain" />
            </Link>
          </div>
          <div className="flex flex-col flex-grow glass-card-elevated shadow-xl h-full">
            <NavigationContent />
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="fixed top-4 z-[100] lg:hidden w-full px-4">
        <div className="mx-auto max-w-7xl">
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/15 px-6 py-4 flex items-center justify-between shadow-xl">
            <Button
              variant="ghost"
              className="p-0 w-9 h-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="space-y-1.5">
                <div
                  className={`h-0.5 w-6 bg-white transition-all duration-200 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <div
                  className={`h-0.5 w-6 bg-white transition-all duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`}
                />
                <div
                  className={`h-0.5 w-6 bg-white transition-all duration-200 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </div>
            </Button>
            
            <a 
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-base font-medium text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:translate-y-[-2px] hover:shadow-[0_5px_10px_rgba(88,101,242,0.3)]"
            >
              <FaDiscord className="h-5 w-5" />
              Discord
            </a>

            {mobileMenuOpen && (
              <div className="absolute left-4 right-4 top-full mt-2 animate-slideDown z-[100]">
                <div className="mx-auto w-full bg-[#1a1a1a] rounded-xl border border-white/15 p-4 shadow-xl">
                  <div className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 text-white/70 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                    <hr className="border-white/10" />
                    <a
                      href={DISCORD_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white/70 hover:text-white"
                    >
                      <FaDiscord className="h-5 w-5" />
                      Join Discord
                    </a>
                    <Link 
                      href="/leaderboard"
                      className="flex items-center gap-2 text-white/70 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Trophy className="h-5 w-5" />
                      Leaderboard
                    </Link>
                    <Link href={`/${user?.username}`} onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-full relative group">
                        <ShinyButton
                          variant="outline"
                          className="w-full relative overflow-hidden glass-button mt-2"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                          <User className="mr-2 h-4 w-4 relative z-10" />
                          <span className="relative z-10">View My Profile</span>
                        </ShinyButton>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 lg:pl-72">
        <main className="relative z-[40] min-h-screen">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-28 md:pt-28 lg:pt-12 pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}