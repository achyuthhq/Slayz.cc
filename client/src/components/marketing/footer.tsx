import { Link } from "react-router-dom";
import Container from "../global/container";
import Icons from "../global/icons";

const Footer = () => {
    return (
        <footer className="flex flex-col relative items-center justify-center border-t border-foreground/5 pt-16 pb-8 px-6 lg:px-8 w-full max-w-6xl mx-auto lg:pt-32">
            <div className="grid gap-8 xl:grid-cols-3 xl:gap-8 w-full">
                <Container>
                    <div className="flex flex-col items-start justify-start md:max-w-[200px]">
                        <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
            <a href="/" className="flex items-center space-x-2 text-2xl font-mono font-bold tracking-tighter">
  <img src="https://huggingface.co/spaces/Achyuth4/lynk/resolve/main/slayz.png" alt="Slayz.cc Logo" className="h-[50px] w-[120px] object-contain" />
</a>
            </Link>
                        </div>
                        <p className="text-muted-foreground mt-4 text-sm text-start">
                            A dynamic platform to elevate your online presence—customize, share, and shine effortlessly.
                        </p>
                    </div>
                </Container>

            <div className="grid-cols-2 gap-8 grid mt-16 xl:col-span-2 xl:mt-0">
                <div className="md:grid md:grid-cols-2 md:gap-8">
                    <Container delay={0.1} className="h-auto">
                        <h3 className="text-base font-medium text-foreground">General</h3>
                        <ul className="mt-4 text-sm text-muted-foreground space-y-4">
                            <li className="mt-2">
                                <Link to="/auth" className="link hover:text-foreground transition-all duration-300">
                                    Login
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link to="/auth" className="link hover:text-foreground transition-all duration-300">
                                    Sign Up
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link to="/pricing" className="link hover:text-foreground transition-all duration-300">
                                    Pricing
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link to="/leaderboard" className="link hover:text-foreground transition-all duration-300">
                                    Leaderboard
                                </Link>
                            </li>
                        </ul>
                    </Container>
                    <Container delay={0.2} className="h-auto">
                        <div className="mt-10 md:mt-0 flex flex-col">
                            <h3 className="text-base font-medium text-foreground">Resources</h3>
                            <ul className="mt-4 text-sm text-muted-foreground space-y-4">
                                <li>
                                    <Link to="/dashboard/customize" className="link hover:text-foreground transition-all duration-300">
                                        Customization
                                    </Link>
                                </li>
                                <li className="mt-2">
                                    <Link to="/dashboard/badges" className="link hover:text-foreground transition-all duration-300">
                                        Badges
                                    </Link>
                                </li>
                                <li className="mt-2">
                                    <Link to="/dashboard/chatbot" className="link hover:text-foreground transition-all duration-300">
                                        Chatbot
                                    </Link>
                                </li>
                                <li className="mt-2">
                                    <Link to="/dashboard/pricing" className="link hover:text-foreground transition-all duration-300">
                                        Dashboard Pricing
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </Container>
                </div>
                <div className="md:grid md:grid-cols-2 md:gap-8">
                    <Container delay={0.3} className="h-auto">
                        <h3 className="text-base font-medium text-foreground">Contact</h3>
                        <ul className="mt-4 text-sm text-muted-foreground space-y-4">
                            <li className="mt-2">
                                <Link to="/blog" className="link hover:text-foreground transition-all duration-300">
                                    Discord Server
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link to="mailto:support@Slayz.cc" className="link hover:text-foreground transition-all duration-300">
                                    Email
                                </Link>
                            </li>
                        </ul>
                    </Container>
                    <Container delay={0.4} className="h-auto">
                        <div className="mt-10 md:mt-0 flex flex-col">
                            <h3 className="text-base font-medium text-foreground">Company</h3>
                            <ul className="mt-4 text-sm text-muted-foreground space-y-4">
                                <li className="mt-2">
                                    <Link to="/about" className="link hover:text-foreground transition-all duration-300">
                                        About Us
                                    </Link>
                                </li>
                                <li className="mt-2">
                                    <Link to="/" className="link hover:text-foreground transition-all duration-300">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li className="mt-2">
                                    <Link to="/" className="link hover:text-foreground transition-all duration-300">
                                        Terms & Conditions
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </Container>
                </div>
            </div>
            </div>

            <Container delay={0.5} className="w-full relative mt-12 lg:mt-20">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                    <div className="flex flex-col items-start mb-4 sm:mb-0">
                        <p className="text-sm text-muted-foreground mb-2">Website Made by</p>
                        <a href="https://seculex.com" target="_blank" rel="noopener noreferrer" className="flex">
                            <img
                                src="https://conexzo.com/icons/seculex.png"
                                alt="Seculex Logo"
                                className="h-8 w-auto"
                                width={32}
                                height={32}
                                onError={(e) => {
                                  console.error("Failed to load Seculex logo");
                                  e.currentTarget.src = `${window.location.origin}/icons/icon.png`;
                                }}
                            />
                        </a>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Copyright © Slayz.cc {new Date().getFullYear()} All rights reserved.
                    </p>
                </div>
            </Container>
        </footer>
    )
};

export default Footer
