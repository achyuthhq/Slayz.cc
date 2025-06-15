/**
 * @deprecated This component is deprecated. 
 * Please use either PublicPricing or DashboardPricing instead.
 * 
 * PublicPricing - For the public /pricing route (includes navbar and footer)
 * DashboardPricing - For the dashboard /dashboard/pricing route (no navbar/footer)
 */

"use client";

import { PLANS } from "@/constants";
import { PLAN } from "@/constants/plans";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import Container from "../global/container";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { PageTitle } from "@/components/page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Check, Star, Calendar, CreditCard, AlertCircle, Infinity as InfinityIcon } from "lucide-react";
import { DocumentTitle } from "@/components/document-title";


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
      description: "Perfect for starting out and exploring Slayz.cc.",
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
        "With the Sovereign Plan, you can connect your own domain to your Slayz.cc profile. We provide easy-to-follow instructions to set up the DNS records.",
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

/**
 * @deprecated Use PublicPricing or DashboardPricing instead
 */
const PricingMain = () => {
    const [billPlan, setBillPlan] = useState<Plan>("monthly");

    const handleSwitch = () => {
        setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
    };

    console.warn("PricingMain is deprecated. Use PublicPricing or DashboardPricing instead.");

    return (
        <div className="relative flex flex-col items-center justify-center max-w-5xl py-2 mx-auto">
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
                <Container>
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6">
                            Find the right plan that <br /> suits{" "}
                            <br className="hidden lg:block" />{" "}
                            <span className="font-subheading italic">
                                your needs
                            </span>
                        </h2>
                        <p className="text-base md:text-lg text-center text-accent-foreground/80 mt-6">
                            Transform your marketing with AI-powered automation.
                            Create campaigns faster, generate better content,
                            and make smarter decisions in minutes.
                        </p>
                    </div>
                </Container>
            </div>

            <div className="grid w-full grid-cols-1 lg:grid-cols-2 pt-8 lg:pt-12 gap-4 lg:gap-6 max-w-4xl mx-auto">
                {PLANS.map((plan, idx) => (
                    <Container key={idx} delay={0.1 * idx + 0.2}>
                        <Plan key={plan.id} plan={plan} billPlan={billPlan} />
                    </Container>
                ))}
            </div>
        </div>
    );
};

/**
 * @deprecated Use PublicPricing or DashboardPricing instead
 */
const Plan = ({ plan, billPlan }: { plan: PLAN; billPlan: Plan }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const isPremium = user?.subscriptionStatus === "premium";
  
    const handleManageSubscription = async () => {
      try {
        toast({
          title: "Subscription Management",
          description: "You have lifetime access with the Sovereign Plan. No management needed!",
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
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return (
        <div
            className={cn(
                "flex flex-col relative rounded-2xl lg:rounded-3xl transition-all bg-background/ items-start w-full border border-foreground/10 overflow-hidden",
                plan.title === "Sovereign" && "border-[#a631d6]",
            )}
        >
            {plan.title === "Sovereign" && (
                <div className="absolute top-1/2 inset-x-0 mx-auto h-12 -rotate-45 w-full bg-[#a631d6] rounded-2xl lg:rounded-3xl blur-[8rem] -z-10"></div>
            )}

            <div className="p-4 md:p-8 flex rounded-t-2xl lg:rounded-t-3xl flex-col items-start w-full relative">
                <h2 className="font-medium text-xl text-foreground pt-5">
                    {plan.title}
                </h2>
                <h3 className="mt-3 text-3xl font-medium md:text-5xl">
                    {plan.title === "Sovereign" ? (
                        <>$5 <span className="text-lg">/lifetime</span></>
                    ) : plan.title === "Soldier" ? (
                        <>$0 <span className="text-lg">/lifetime</span></>
                    ) : (
                        <NumberFlow
                            value={
                                billPlan === "monthly"
                                    ? plan.monthlyPrice
                                    : plan.annuallyPrice
                            }
                            suffix={billPlan === "monthly" ? "" : "/yr"}
                            format={{
                                currency: "USD",
                                style: "currency",
                                currencySign: "standard",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                                currencyDisplay: "narrowSymbol",
                            }}
                        />
                    )}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                    {plan.desc}
                </p>
            </div>
            <div className="flex flex-col items-start w-full px-4 py-2 md:px-8">
                <Button
                    className={cn(
                        "w-full",
                        plan.title === "Sovereign" ? "bg-primary" : "bg-secondary"
                    )}
                    onClick={() => {
                        if (plan.title === "Sovereign") {
                            const paymentId = crypto.randomUUID();
                            window.location.href = `/pay/${paymentId}`;
                        }
                    }}
                >
                    {plan.title === "Sovereign" ? "Get Lifetime Access" : "Get Started"}
                </Button>
                <div className="h-8 overflow-hidden w-full mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={billPlan}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <span className="text-sm text-center text-muted-foreground mt-3 mx-auto block">
                                {billPlan === "monthly"
                                    ? "Billed one-time"
                                    : "Billed in one annual payment"}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <div className="flex flex-col items-start w-full p-5 mb-4 ml-1 gap-y-2">
                <span className="text-base text-left mb-2">Includes:</span>
                {plan.features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-start gap-2"
                    >
                        <div className="flex items-center justify-center">
                            <CheckIcon className="size-5" />
                        </div>
                        <span>{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingMain;
