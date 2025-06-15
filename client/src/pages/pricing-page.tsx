import React from "react";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Star,
  Calendar,
  CreditCard,
  AlertCircle,
  Infinity as InfinityIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentTitle } from "@/components/document-title";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import Wrapper from "@/components/global/wrapper";
import { PLANS } from "@/constants";
import { PLAN } from "@/constants/plans";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import Container from "../global/container";
import { Link } from "react-router-dom";
import PricingMain from "@/components/marketing/pricing";
import { useLocation } from "wouter";
import PublicPricing from "@/components/marketing/public-pricing";
import DashboardPricing from "@/components/marketing/dashboard-pricing";

type Plan = "monthly" | "annually";


type PricingTier = {
  name: string;
  description: string;
  price: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Perfect for starting out and exploring Slayz.",
    price: "$0",
    features: [
      "Basic profile customization",
      "Up to 5 social links",
      "Standard themes",
      "1GB storage space",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    name: "Sovereign Plan",
    description: "Lifetime access to premium features with a one-time payment.",
    price: "$5",
    features: [
      "Advanced profile customization",
      "Unlimited social links",
      "Premium themes and layouts",
      "5GB storage space",
      "Analytics dashboard",
      "Priority support",
      "Custom domain",
      "Ad-free experience",
      "Lifetime access",
    ],
    cta: "Get Lifetime Access",
    popular: true,
  },
];

const featureComparisonData = [
  {
    feature: "Profile Customization",
    free: "Basic",
    pro: "Advanced",
  },
  {
    feature: "Social Links",
    free: "Up to 5",
    pro: "Unlimited",
  },
  {
    feature: "Themes",
    free: "Standard",
    pro: "Premium",
  },
  {
    feature: "Storage Space",
    free: "1GB",
    pro: "20GB",
  },
  {
    feature: "Analytics",
    free: "Basic",
    pro: "Detailed",
  },
  {
    feature: "Support",
    free: "Community",
    pro: "Priority",
  },
  {
    feature: "Custom Domain",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Ad-Free",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Team Management",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Multiple Profiles",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "API Access",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "White-Label Option",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Lifetime Access",
    free: "❌",
    pro: "✅",
  },
];

const faqData = [
  {
    question: "How do I upgrade my account?",
    answer:
      "You can upgrade your account by going to the Pricing page and purchasing the Sovereign Plan. This provides lifetime access to all premium features with a one-time payment.",
  },
  {
    question: "Is the Sovereign Plan really lifetime access?",
    answer:
      "Yes, the Sovereign Plan is a one-time payment that gives you lifetime access to all premium features. No renewals or subscriptions to worry about.",
  },
  {
    question: "Will I get new features as they're released?",
    answer:
      "Absolutely! All future premium features will be included in your Sovereign Plan lifetime access.",
  },
  {
    question: "How do custom domains work?",
    answer:
      "With the Sovereign Plan, you can connect your own domain to your Slayz profile. We provide easy-to-follow instructions to set up the DNS records.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and cryptocurrency payments.",
  },
  {
    question: "Can I upgrade from the free plan later?",
    answer:
      "Yes, you can upgrade from the free plan to the Sovereign Plan at any time. Your existing profile and settings will be preserved.",
  },
];

function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isPremium = user?.subscriptionStatus === "premium";
  const [location] = useLocation();

  // Check if we're in the dashboard route
  const isDashboard = location.startsWith("/dashboard");

  const handleManageSubscription = async () => {
    try {
      // This could be used to show account details, payment history, etc.
      // For now it's just a placeholder for future functionality
      toast({
        title: "Subscription Management",
        description:
          "You have lifetime access with the Sovereign Plan. No management needed!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error managing subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [billPlan, setBillPlan] = useState<Plan>("monthly");

  const handleSwitch = () => {
      setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  // Use the appropriate component based on the route
  return isDashboard ? <DashboardPricing /> : <PublicPricing />;
}

export default Pricing;
