import { Container } from "../global/container";
import { MagicCard } from "../ui/magic-card";
import BlurText from "@/components/blur-text";
import {
    BarChart3,
    Medal,
    Bell,
    PieChart,
    Layers,
    LineChart,
    Activity,
    Settings,
    Users,
} from "lucide-react";

const Analysis = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20">
            <Container>
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug">
                        <BlurText 
                            text="Your complete" 
                            delay={100}
                        />
                        <br />
                        <span className="font-subheading italic">
                            <BlurText 
                                text="digital presence" 
                                delay={150}
                            />
                        </span>
                    </h2>
                    <p className="text-base md:text-lg text-accent-foreground/80 mt-4">
                        Connect all your social profiles, showcase your content,
                        and track engagement with powerful analytics.
                    </p>
                </div>
            </Container>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                <Container delay={0.2}>
                    <div className="rounded-2xl bg-background/40 relative border border-border/50">
                        <MagicCard
                            gradientFrom="#3b82f6"
                            gradientTo="#2563eb"
                            gradientColor="rgba(37,99,235,0.1)"
                            className="p-4 lg:p-8 w-full overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 bg-[#a631d6] w-1/4 h-1/4 blur-[8rem] z-20"></div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-[#a631d6]/10 w-fit">
                                    <BarChart3 className="size-6 text-[#a631d6]" />
                                </div>
                                <h3 className="text-xl font-medium">
                                    Engagement Stats
                                </h3>
                                <p className="text-sm text-accent-foreground/70">
                                    Track real-time engagement metrics and
                                    visitor analytics.
                                </p>
                            </div>
                        </MagicCard>
                    </div>
                </Container>

                <Container delay={0.3}>
                    <div className="rounded-2xl bg-background/40 relative border border-border/50">
                        <MagicCard
                            gradientFrom="#a855f7"
                            gradientTo="#7c3aed"
                            gradientColor="rgba(124,58,237,0.1)"
                            className="p-4 lg:p-8 w-full overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 bg-purple-500 w-1/4 h-1/4 blur-[8rem] z-20"></div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-purple-500/10 w-fit">
                                    <Activity className="size-6 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-medium">
                                    Performance Insights
                                </h3>
                                <p className="text-sm text-accent-foreground/70">
                                    Get detailed insights about your content
                                    performance.
                                </p>
                            </div>
                        </MagicCard>
                    </div>
                </Container>

                <Container delay={0.4}>
                    <div className="rounded-2xl bg-background/40 relative border border-border/50">
                        <MagicCard
                            gradientFrom="#ec4899"
                            gradientTo="#f43f5e"
                            gradientColor="rgba(244,63,94,0.1)"
                            className="p-4 lg:p-8 w-full overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 bg-pink-500 w-1/4 h-1/4 blur-[8rem] z-20"></div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-pink-500/10 w-fit">
                                    <PieChart className="size-6 text-pink-500" />
                                </div>
                                <h3 className="text-xl font-medium">
                                    Profile Analytics
                                </h3>
                                <p className="text-sm text-accent-foreground/70">
                                    Track profile views, link clicks, and
                                    visitor engagement.
                                </p>
                            </div>
                        </MagicCard>
                    </div>
                </Container>

                <Container delay={0.5}>
                    <div className="rounded-2xl bg-background/40 relative border border-border/50">
                        <MagicCard
                            gradientFrom="#10b981"
                            gradientTo="#059669"
                            gradientColor="rgba(5,150,105,0.1)"
                            className="p-4 lg:p-8 w-full overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 bg-emerald-500 w-1/4 h-1/4 blur-[8rem] z-20"></div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-emerald-500/10 w-fit">
                                    <Medal className="size-6 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-medium">
                                    Custom Badges
                                </h3>
                                <p className="text-sm text-accent-foreground/70">
                                    Display achievement badges and custom status
                                    indicators.
                                </p>
                            </div>
                        </MagicCard>
                    </div>
                </Container>

                <Container delay={0.6}>
                    <div className="rounded-2xl bg-background/40 relative border border-border/50">
                        <MagicCard
                            gradientFrom="#f59e0b"
                            gradientTo="#d97706"
                            gradientColor="rgba(217,119,6,0.1)"
                            className="p-4 lg:p-8 w-full overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 bg-amber-500 w-1/4 h-1/4 blur-[8rem] z-20"></div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-amber-500/10 w-fit">
                                    <Bell className="size-6 text-amber-500" />
                                </div>
                                <h3 className="text-xl font-medium">
                                    Smart Notifications
                                </h3>
                                <p className="text-sm text-accent-foreground/70">
                                    Get real-time alerts for profile
                                    interactions.
                                </p>
                            </div>
                        </MagicCard>
                    </div>
                </Container>

                <Container delay={0.7}>
                    <div className="rounded-2xl bg-background/40 relative border border-border/50">
                        <MagicCard
                            gradientFrom="#06b6d4"
                            gradientTo="#0891b2"
                            gradientColor="rgba(8,145,178,0.1)"
                            className="p-4 lg:p-8 w-full overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 bg-cyan-500 w-1/4 h-1/4 blur-[8rem] z-20"></div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-cyan-500/10 w-fit">
                                    <Users className="size-6 text-cyan-500" />
                                </div>
                                <h3 className="text-xl font-medium">
                                    Audience Insights
                                </h3>
                                <p className="text-sm text-accent-foreground/70">
                                    Understand your audience demographics and
                                    behavior.
                                </p>
                            </div>
                        </MagicCard>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Analysis;
