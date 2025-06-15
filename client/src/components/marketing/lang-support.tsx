import { SOCIAL_PLATFORMS } from "@/constants/socials";
import { Plus } from "lucide-react";
import Container from "../global/container";
import BlurText from "@/components/blur-text";

const SocialPlatforms = () => {
    return (
        <div className="relative flex flex-col items-center justify-center max-w-5xl py-20 mx-auto">
            <Container>
                <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-6">
                        <BlurText 
                            text="Seamlessly connect with 50+" 
                            delay={100}
                        />
                        {" "}
                        <span className="font-subheading italic">
                            <BlurText 
                                text="social platforms" 
                                delay={150}
                            />
                        </span>
                    </h2>
                </div>
            </Container>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-start justify-start max-w-4xl mx-auto pt-10 relative w-full">
                <div className="absolute top-1/2 -translate-y-1/2 right-1/4 w-3/5 h-14 lg:h-20 bg-gradient-to-r from-[#a631d6] to-[#9034b5] rounded-full -rotate-12 blur-[10rem] -z-10"></div>

                {SOCIAL_PLATFORMS.map((platform, idx) => (
                    <Container
                        key={platform.code}
                        delay={0.05 * idx}
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors h-auto"
                    >
                        <platform.icon className="text-2xl" />
                        <span className="text-lg lg:text-xl">
                            {platform.name}
                        </span>
                    </Container>
                ))}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                        <Plus size={14} />
                    </span>
                    <span>And more</span>
                </div>
            </div>
        </div>
    );
};

export default SocialPlatforms;
