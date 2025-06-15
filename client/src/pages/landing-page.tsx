import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentTitle } from "@/components/document-title";
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
import { FaDiscord } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PLANS } from "@/lib/constants/plans";
import { REVIEWS } from "@/lib/constants/reviews";
import { BorderBeam } from "@/components/ui/border-beam";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { GradientCircles } from "@/components/gradient-circles";
import {
  SiSpotify,
  SiDiscord,
  SiYoutube,
  SiSoundcloud,
  SiRoblox,
  SiSteam,
} from "react-icons/si";
import Wrapper from "@/components/global/wrapper";
import Analysis from "@/components/marketing/analysis";
import Companies from "@/components/marketing/companies";
import CTA from "@/components/marketing/cta";
import Features from "@/components/marketing/features";
import Hero from "@/components/marketing/hero";
import Integration from "@/components/marketing/integration";
import LanguageSupport from "@/components/marketing/lang-support";
import PricingMain from "@/components/marketing/pricing";
import Footer from "@/components/marketing/footer";
import Navbar from "@/components/marketing/navbar";
import { MarqueeDemo } from "@/components/marketing/reviews";
import BlurText from "@/components/blur-text";
import { Helmet } from "react-helmet";

// Split reviews into two rows for better visual effect
const firstRow = REVIEWS.slice(0, Math.ceil(REVIEWS.length / 2));
const secondRow = REVIEWS.slice(Math.ceil(REVIEWS.length / 2));

export default function LandingPage() {
  const title = "Slayz | Home";
  const description =
    "Slayz is a next-gen bio link platform that redefines how you showcase your online presence. Customize with stunning animations, AI-powered interactions, music, badges, and more—all in one seamless experience.";
  const keywords =
    "bio link, social media, profile customization, online presence, digital identity, link sharing";

  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(value);
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <div></div>

      <Wrapper className="relative">
        <Navbar />
        <Hero />
        <Features />
        <Analysis />
        <Integration />
        <PricingMain />
        <div className="mb-8 mt-[120px]">
          <h2 className="justify-center text-center text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-6">
            <BlurText 
              text="See what users say" 
              delay={100}
            />
            <br /> 
            about{" "}
            <span className="font-subheading italic">
              <BlurText 
                text="Slayz" 
                delay={150}
              />
            </span>
          </h2>
          <MarqueeDemo />
        </div>
        <LanguageSupport />
        <CTA />
        <Footer />
      </Wrapper>
    </>
  );
}
