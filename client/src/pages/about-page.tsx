import React from "react";
import { Link } from "wouter";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import TiltedCard from "@/components/ui/tilted-card";
import ChromaGrid, { ChromaGridItem } from "@/components/ui/chroma-grid";
import BlurText from "@/components/blur-text";
import { 
  ArrowRight, 
  ChevronRight, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Twitter,
  Sparkles,
  Bot,
  Shield,
  MessageSquare
} from "lucide-react";
import Wrapper from "@/components/global/wrapper";

const AboutPage = () => {
  const featureItems: ChromaGridItem[] = [
    {
      icon: <Sparkles className="w-16 h-16" />,
      title: "Beautiful Profiles",
      description: "Create stunning profiles with customizable themes, animations, and effects that make you stand out from the crowd. Choose from dozens of premium layouts.",
      borderColor: "#4F46E5",
      gradient: "linear-gradient(145deg, #4F46E5, #000)",
      url: "/auth"
    },
    {
      icon: <Bot className="w-16 h-16" />,
      title: "AI Chatbot Integration",
      description: "Add a personalized AI chatbot to your profile that answers questions about you, your work, or your content. Train it with your own data for a truly custom experience.",
      borderColor: "#10B981",
      gradient: "linear-gradient(210deg, #10B981, #000)",
      url: "/dashboard/customize"
    },
    {
      icon: <Shield className="w-16 h-16" />,
      title: "Advanced Analytics",
      description: "Gain deep insights into your profile visitors with our enterprise-grade analytics. Track engagement, geographic data, and conversion metrics in real-time.",
      borderColor: "#F59E0B",
      gradient: "linear-gradient(165deg, #F59E0B, #000)",
      url: "/dashboard/analytics"
    },
    {
      icon: <MessageSquare className="w-16 h-16" />,
      title: "Exclusive Community",
      description: "Join our private community of creators and professionals. Network with like-minded individuals, share tips, and get early access to new features.",
      borderColor: "#8B5CF6",
      gradient: "linear-gradient(225deg, #8B5CF6, #000)",
      url: "https://discord.gg/TseKvdPMYV"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Base black background */}
      <div className="fixed inset-0 z-[-2] bg-black"></div>
      
      {/* Just a few subtle gradients that flow throughout the page */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        {/* Top-right gradient */}
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#a631d6] opacity-40 blur-[60px] rounded-full"></div>
        
        {/* Bottom-left gradient */}
        <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-gradient-to-r from-[#9034b5] to-[#a631d6] opacity-45 blur-[70px] rounded-full"></div>
      </div>
      
      <Wrapper>
        <Navbar />
      
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Hero section gradient - moved from contact section */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#9034b5] to-[#a631d6] opacity-40 blur-[70px] rounded-full"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-center !leading-tight mb-6">
                <BlurText 
                  text="About Slayz.cc" 
                  delay={100}
                />
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Your ultimate platform for creating stunning personal profiles and connecting with your audience.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="group"
                  asChild
                >
                  <Link to="/pricing" className="flex items-center">
                    View Plans
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Our Mission" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <p className="text-lg mb-6">
                  At Slayz.cc, we believe everyone deserves a stunning online presence. Our mission is to empower creators, professionals, and individuals with tools to showcase their identity online in a way that's both beautiful and functional.
                </p>
                <p className="text-lg">
                  We're dedicated to providing a platform that combines cutting-edge design with powerful customization options, allowing you to express your unique style while connecting with your audience seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-12 text-center">
              <BlurText 
                text="What Makes Us" 
                delay={100}
              />
              <br />
              <span className="font-subheading italic">
                <BlurText 
                  text="Special" 
                  delay={150}
                />
              </span>
            </h2>
            
            <div className="w-full max-w-5xl mx-auto mb-16">
              <ChromaGrid 
                items={featureItems}
                radius={300}
                columns={2}
                damping={0.45}
                fadeOut={0.6}
                ease="power3.out"
              />
            </div>
          </div>
        </section>

        {/* Team Section - keeping this gradient as you liked it */}
        <section className="py-16 relative">
          {/* Team section gradient - kept as you liked it */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-gradient-to-r from-[#9034b5] to-[#a631d6] opacity-40 blur-[70px] rounded-full"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-12 text-center">
              <BlurText 
                text="Meet Our" 
                delay={100}
              />
              <br />
              <span className="font-subheading italic">
                <BlurText 
                  text="Team" 
                  delay={150}
                />
              </span>
            </h2>
            <div className="flex flex-wrap justify-center gap-12 max-w-6xl mx-auto">
              <div className="w-full sm:w-auto">
                <TiltedCard
                  imageSrc="https://cdn.discordapp.com/avatars/364141719597613056/eec98c1698e7074abd962132cd806114?size=1024"
                  altText="Achyuth - Founder"
                  captionText="Achyuth - Founder"
                  containerHeight="300px"
                  containerWidth="300px"
                  imageHeight="300px"
                  imageWidth="300px"
                  rotateAmplitude={12}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="tilted-card-demo-text">
                      <p className="text-lg font-bold">Achyuth ;O</p>
                      <p className="text-sm opacity-80">Co-Founder</p>
                      <div className="flex justify-center mt-3 gap-3">
                        <a href="http://x.com/@Achyuth_Rxch" className="text-white hover:text-blue-400 transition-colors">
                          <Twitter className="h-5 w-5" />
                        </a>
                        <a href="https://linkedin.com/in/achyuth04" className="text-white hover:text-blue-600 transition-colors">
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a href="https://github.com/achyuth0" className="text-white hover:text-purple-400 transition-colors">
                          <Github className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  }
                />
              </div>
              <div className="w-full sm:w-auto">
                <TiltedCard
                  imageSrc="https://cdn.discordapp.com/avatars/239495595952177152/fd21b1ea65f5cea154fff0b47d516db2?size=1024"
                  altText="Ayush - Co-Founder"
                  captionText="Ayush - Co-Founder"
                  containerHeight="300px"
                  containerWidth="300px"
                  imageHeight="300px"
                  imageWidth="300px"
                  rotateAmplitude={12}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="tilted-card-demo-text">
                      <p className="text-lg font-bold">Ayush</p>
                      <p className="text-sm opacity-80">Co-Founder</p>
                      <div className="flex justify-center mt-3 gap-3">
                        <a href="https://in.linkedin.com/in/ayush-kumar-jha-2857b6328" className="text-white hover:text-blue-600 transition-colors">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - removed gradient as requested */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-6 text-center">
                <BlurText 
                  text="Get In Touch" 
                  delay={100}
                />
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Have questions or feedback? We'd love to hear from you!
              </p>
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 inline-block shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <p className="mb-6 flex items-center justify-center gap-3">
                  <span className="font-semibold">Email:</span>{" "}
                  <a href="mailto:contact@slayz.cc" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all hover:gap-2">
                    contact@slayz.cc
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </p>
                <p className="flex items-center justify-center gap-3">
                  <span className="font-semibold">Discord:</span>{" "}
                  <Button 
                    variant="default" 
                    className="bg-[#5865F2] hover:bg-[#5865F2]/80 text-white"
                    asChild
                  >
                    <a 
                      href="https://discord.gg/TseKvdPMYV" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2"
                    >
                      Join our community
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of creators and professionals who are already using Slayz.cc to showcase their online presence.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  variant="default" 
                  size="lg"
                  className="group px-8 py-6 text-lg"
                  asChild
                >
                  <Link to="/auth" className="flex items-center">
                    Create Your Profile
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </Wrapper>
    </div>
  );
};

export default AboutPage; 