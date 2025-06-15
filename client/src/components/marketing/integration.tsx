import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import Container from "../global/container";
import Icons from "../global/icons";
import Images from "../global/images";
import { Button } from "../ui/button";
import Ripple from "../ui/ripple";
import { ShinyButton } from "../ui/shiny-button";

const SOCIAL_PLATFORMS = [
    {
        icon: Icons.linkedin,
        position: "left-3",
        size: "small",
        iconSize: "small",
        className: "hidden lg:flex",
    },
    {
        icon: Icons.tiktok,
        position: "left-2",
        size: "medium",
        iconSize: "medium",
    },
    { icon: Icons.insta, position: "left-1", size: "large", iconSize: "large" },
    {
        icon: Icons.youtube,
        position: "right-1",
        size: "large",
        iconSize: "large",
    },
    { icon: Icons.x, position: "right-2", size: "medium", iconSize: "medium" },
    {
        icon: Icons.facebook,
        position: "right-3",
        size: "small",
        iconSize: "small",
        className: "hidden lg:flex",
    },
];

// Mobile-specific platform configuration
const MOBILE_SOCIAL_PLATFORMS = [
    {
        icon: Icons.tiktok,
        position: "top-left",
        size: "medium",
        iconSize: "medium",
    },
    { 
        icon: Icons.insta, 
        position: "top-right", 
        size: "large", 
        iconSize: "large" 
    },
    {
        icon: Icons.youtube,
        position: "bottom-left",
        size: "large",
        iconSize: "large",
    },
    { 
        icon: Icons.x, 
        position: "bottom-right", 
        size: "medium", 
        iconSize: "medium" 
    },
];

const Integration = () => {
    const getPositionClasses = (position: string) => {
        switch (position) {
            case "left-3":
                return "-translate-x-[285px]";
            case "left-2":
                return "-translate-x-[210px]";
            case "left-1":
                return "-translate-x-[125px]";
            case "right-1":
                return "translate-x-[125px]";
            case "right-2":
                return "translate-x-[210px]";
            case "right-3":
                return "translate-x-[285px]";
            default:
                return "";
        }
    };

    const getMobilePositionClasses = (position: string) => {
        switch (position) {
            case "top-left":
                return "-translate-x-[60px] -translate-y-[60px]";
            case "top-right":
                return "translate-x-[60px] -translate-y-[60px]";
            case "bottom-left":
                return "-translate-x-[60px] translate-y-[60px]";
            case "bottom-right":
                return "translate-x-[60px] translate-y-[60px]";
            default:
                return "";
        }
    };

    const getSizeClasses = (size: string) => {
        switch (size) {
            case "large":
                return "size-20";
            case "medium":
                return "size-16";
            case "small":
                return "size-12";
            default:
                return "size-20";
        }
    };

    const getMobileSizeClasses = (size: string) => {
        switch (size) {
            case "large":
                return "size-16";
            case "medium":
                return "size-14";
            case "small":
                return "size-10";
            default:
                return "size-16";
        }
    };

    const getIconSizeClasses = (size: string) => {
        switch (size) {
            case "large":
                return "size-10";
            case "medium":
                return "size-7";
            case "small":
                return "size-5";
            default:
                return "size-10";
        }
    };

    const getMobileIconSizeClasses = (size: string) => {
        switch (size) {
            case "large":
                return "size-8";
            case "medium":
                return "size-6";
            case "small":
                return "size-4";
            default:
                return "size-8";
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20 scale-">
            <Container className="relative">
                <div className="relative flex flex-col lg:hidden items-center justify-center overflow-visible">
                    <div className="absolute top-1/2 -translate-y-1/2 right-1/4 w-3/5 h-14 lg:h-20 bg-gradient-to-r from-[#a631d6] to-[#9034b5] rounded-full -rotate-12 blur-[6.5rem] -z-10"></div>

                    {/* Replace static image with dynamic icons for mobile */}
                    <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-visible my-8">
                        {/* Mobile ripple effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute w-[200px] h-[200px] rounded-full border border-white/10 animate-pulse"></div>
                            <div className="absolute w-[150px] h-[150px] rounded-full border border-white/20 animate-pulse animation-delay-200"></div>
                            <div className="absolute w-[100px] h-[100px] rounded-full border border-white/30 animate-pulse animation-delay-400"></div>
                        </div>

                        {/* Center logo */}
                        <div className="absolute z-20 flex items-center justify-center group">
                            <img src="https://huggingface.co/spaces/Achyuth4/lynk/resolve/main/favicon.png" className="w-[70px] h-[70px] transition-all duration-300 hover:scale-110"/>
                        </div>

                        {/* Mobile social platforms */}
                        {MOBILE_SOCIAL_PLATFORMS.map((platform, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "absolute z-20 p-3 rounded-full flex items-center justify-center bg-gradient-to-b from-foreground/5 to-transparent shadow-xl shadow-black/10 backdrop-blur-lg transition-all duration-300 hover:scale-110",
                                    getMobilePositionClasses(platform.position),
                                    getMobileSizeClasses(platform.size),
                                )}
                            >
                                <platform.icon
                                    className={cn(
                                        "size-auto text-foreground",
                                        getMobileIconSizeClasses(platform.iconSize),
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Container>

            <div className="flex flex-col items-center text-center max-w-3xl mx-auto lg:absolute lg:top-1/4 inset-x-0 mt-12 lg:mt-0">
                <h2 className="text-2xl md:text-4xl lg:text-6xl font-heading font-semibold !leading-snug">
                    Social Media Integration
                </h2>
            </div>
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto lg:absolute lg:bottom-1/4 inset-x-0 z-20 mt-8 lg:mt-0">
                <Link to="#">
                    <ShinyButton 
                variant="outline" 
                className="bg-transparent border-white/20 hover:bg-white/5" 
                href="/auth"
              >
                See all Integrations
                <ArrowRightIcon className="size-4" />
              </ShinyButton>
                </Link>
            </div>

            <Container delay={0.3}>
                <div className="relative hidden lg:flex items-center justify-center overflow-visible">
                    <div className="absolute top-1/2 -translate-y-1/2 right-1/4 w-3/5 h-14 lg:h-20 bg-gradient-to-r from-[#a631d6] to-[#9034b5] rounded-full -rotate-12 blur-[6.5rem] -z-10"></div>

                    <div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-visible">
                        <Ripple />
                    </div>

                    <div className="absolute z-20 flex items-center justify-center group">
                        <img src="https://huggingface.co/spaces/Achyuth4/lynk/resolve/main/favicon.png" className="w-[90px] h-[90px] transition-all duration-300 hover:scale-110"/>
                    </div>

                    {SOCIAL_PLATFORMS.map((platform, index) => (
                        <div
                            key={index}
                            className={cn(
                                "absolute z-20 size-16 p-3 rounded-full flex items-center justify-center bg-gradient-to-b from-foreground/5 to-transparent shadow-xl shadow-black/10 backdrop-blur-lg transition-all duration-300 hover:scale-110",
                                getPositionClasses(platform.position),
                                getSizeClasses(platform.size),
                                platform.className,
                            )}
                        >
                            <platform.icon
                                className={cn(
                                    "size-auto text-foreground",
                                    getIconSizeClasses(platform.iconSize),
                                )}
                            />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default Integration;
