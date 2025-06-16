import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import Container from "../global/container";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import { ShinyButton } from "../ui/shiny-button";
import { OrbitingCircles } from "../ui/orbiting-circles";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth"; // Adjust the import path based on your project structure
import { Input } from "@/components/ui/input";
import BlurText from "@/components/blur-text";
import {
    ChevronRight,
    Crown,
    Eye,
    Users,
    Upload,
    Check,
    Command,
    Layout,
    Wand2,
    Star,
    Settings,
    Globe,
    MessageSquare,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { IoSparkles } from "react-icons/io5";
import { FiArrowUpRight } from "react-icons/fi";
import { FaGift } from "react-icons/fa";
import { ShinyLoadingButton } from '@/components/ui/shiny-loading-button';
import { HiMiniArrowTopRightOnSquare } from "react-icons/hi2";

const Hero = () => {
    const [username, setUsername] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        setUsername(value);
    };

    const handleAuth = () => {
        setIsLoading(true);
        // Simulate loading for demo purposes
        setTimeout(() => {
            window.location.href = "/auth";
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20">
            <div className="absolute flex lg:hidden size-40 rounded-full bg-[#a631d6] blur-[10rem] top-0 left-1/2 -translate-x-1/2 -z-10"></div>

            <div className="flex flex-col items-center justify-center gap-y-8 relative">
                <Container className="hidden lg:flex absolute inset-0 top-0 mb-auto flex-col items-center justify-center w-full min-h-screen -z-10">
                    <OrbitingCircles speed={0.5} radius={400}>
                        <Icons.circle1 className="size-4 text-foreground/70" />
                        <Icons.circle2 className="size-1 text-foreground/80" />
                    </OrbitingCircles>
                    <OrbitingCircles speed={0.25} radius={300}>
                        <Icons.circle2 className="size-1 text-foreground/50" />
                        <Icons.circle1 className="size-4 text-foreground/60" />
                        <Icons.circle2 className="size-1 text-foreground/90" />
                    </OrbitingCircles>
                    <OrbitingCircles speed={0.1} radius={200}>
                        <Icons.circle2 className="size-1 text-foreground/50" />
                        <Icons.circle2 className="size-1 text-foreground/90" />
                        <Icons.circle1 className="size-4 text-foreground/60" />
                        <Icons.circle2 className="size-1 text-foreground/90" />
                    </OrbitingCircles>
                </Container>

                <div className="flex flex-col items-center justify-center text-center gap-y-4 bg-background/0">
                    <Container className="relative hidden lg:block overflow-hidden">
                        <button className="group relative grid overflow-hidden rounded-full px-2 py-1 shadow-[0_1000px_0_0_hsl(0_0%_15%)_inset] transition-colors duration-200 mx-auto">
                            <span>
                                <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
                            </span>
                            <span className="backdrop absolute inset-[1px] rounded-full bg-background transition-colors duration-200 group-hover:bg-neutral-800" />
                            <span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center">
                                <span className="px-2 py-[0.5px] h-[18px] tracking-wide flex items-center justify-center rounded-full bg-gradient-to-r from-[#a631d6] to-[#9034b5] text-[9px] font-medium mr-2 text-white">
                                    NEW
                                </span>
                                Future Of Your Online Presence
                            </span>
                        </button>
                    </Container>
                    <Container delay={0.15}>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-center !leading-tight max-w-4xl mx-auto">
                            <BlurText 
                                text="Your Digital Identity," 
                                delay={100}
                            />
                            <br />
                            <span className="italic">
                                <BlurText 
                                    text="Upgraded." 
                                    delay={150}
                                />
                            </span>
                        </h1>
                    </Container>
                    <Container delay={0.2}>
                        <p className="max-w-xl mx-auto mt-2 text-base lg:text-lg text-center text-muted-foreground">
                            Slayz lets you create a stunning bio link with
                            animations, effects, AI-enabled chatbots, music, socials,
                            badges, and more—your online identity, reimagined.
                        </p>
                    </Container>
                    <Container delay={0.25} className="z-20">
                        <div className="flex items-center justify-center mt-6 gap-x-4">
                            {!user ? (
                                <div className="max-w-lg mx-auto mb-16 flex justify-center">
                                    <div className="flex items-center gap-2 w-full max-w-[300px]">
                                        <div className="relative flex items-center bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1 flex-1 max-w-[230px]">
                                            <div className="px-1 py-1 text-white/50 font-mono text-sm whitespace-nowrap">
                                                Slayz.cc/
                                            </div>
                                            <Input
                                                value={username}
                                                onChange={handleUsernameChange}
                                                placeholder="username"
                                                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/30 font-mono py-1 h-7 text-sm min-w-0 pl-0"
                                            />
                                        </div>
                                        <ShinyLoadingButton
                                            onClick={handleAuth}
                                            variant="outline"
                                            className="backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:text-white transition-all duration-300 shadow-md rounded-xl px-4 py-2"
                                            href="/auth"
                                            isLoading={isLoading}
                                            spinnerColor="white"
                                        >
                                            <FaGift className="ml-0 text-white" />
                                        </ShinyLoadingButton>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto mb-16">
                                    <div className="flex justify-center">
                                    <ShinyLoadingButton
    onClick={() => {
        setIsLoading(true);
        setTimeout(() => {
            window.location.href = "/dashboard/overview";
        }, 1500);
    }}
    variant="outline"
    className="bg-transparent border-white/20 hover:bg-white/5"
    href="/dashboard/overview"
    isLoading={isLoading}
    spinnerColor="white"
>
    <span className="flex items-center gap-1">
        Visit Dashboard
        <HiMiniArrowTopRightOnSquare />
    </span>
</ShinyLoadingButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Container>
                    <Container delay={0.3} className="relative">
                        <div className="relative rounded-xl lg:rounded-[32px] border border-border p-2 backdrop-blur-lg mt-10 max-w-6xl mx-auto">
                            <div className="absolute top-1/8 left-1/2 -z-10 bg-gradient-to-r from-[#a631d6] to-[#9034b5] w-1/2 lg:w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[4rem] lg:blur-[10rem] animate-image-glow"></div>
                            <div className="hidden lg:block absolute -top-1/8 left-1/2 -z-20 bg-[#a631d6] w-1/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem] animate-image-glow"></div>

                            <div className="rounded-lg lg:rounded-[22px] border border-border bg-background">
                                <img
                                    src="https://huggingface.co/spaces/Achyuth4/lynk/resolve/main/dashboard-lynk.png"
                                    alt="dashboard"
                                    width={1920}
                                    height={1080}
                                    className="rounded-lg lg:rounded-[20px] w-full max-w-full"
                                />
                            </div>
                        </div>
                        <div className="bg-gradient-to-t from-background to-transparent absolute bottom-0 inset-x-0 w-full h-1/2"></div>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Hero;
