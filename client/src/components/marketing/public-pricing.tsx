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
import { ShinyButton } from "../ui/shiny-button";
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
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import Wrapper from "@/components/global/wrapper";
import BlurText from "@/components/blur-text";

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
      "Advanced analytics dashboard",
      "Priority support",
      "Custom domain",
      "Ad-free experience",
      "Early access to new features",
      "Exclusive premium badges",
      "AI-powered profile optimization",
      "Premium traffic insights",
      "Advanced SEO tools",
      "Priority indexing on Slayz",
      "Enhanced conversion tools",
      "Lifetime updates",
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
    feature: "Steam Integration",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Profile Decorations",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Display Name Effects",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Profile Particle Effects",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Premium Badges",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Chatbot",
    free: "Limited",
    pro: "Unlimited with custom prompts",
  },
  {
    feature: "Storage Space",
    free: "1GB",
    pro: "5GB",
  },
  {
    feature: "Analytics",
    free: "Basic",
    pro: "Advanced",
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
    feature: "Early Access to Features",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "AI Profile Optimization",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Traffic Insights",
    free: "Basic",
    pro: "Premium",
  },
  {
    feature: "SEO Tools",
    free: "❌",
    pro: "Advanced",
  },
  {
    feature: "Priority Indexing",
    free: "❌",
    pro: "✅",
  },
  {
    feature: "Conversion Tools",
    free: "❌",
    pro: "Enhanced",
  },
  {
    feature: "Lifetime Updates",
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
    question: "What are profile decorations and particle effects?",
    answer:
      "Profile decorations allow you to add visual elements like animated backgrounds, frames, and seasonal themes to your profile. Particle effects create dynamic visual elements like floating stars, confetti, or custom animations that appear when visitors interact with your profile.",
  },
  {
    question: "How does the Steam integration work?",
    answer:
      "Our Steam integration allows you to showcase your Steam profile, game library, achievements, and current playing status directly on your Slayz profile. Visitors can see your gaming activity and connect with you on Steam.",
  },
  {
    question: "What are display name effects?",
    answer:
      "Display name effects give your username visual flair with animated gradients, glowing effects, custom colors, and special animations that make your profile stand out and express your unique style.",
  },
  {
    question: "How does the unlimited chatbot feature work?",
    answer:
      "Premium users get access to an AI chatbot with no usage limits. You can customize the system prompt to give the chatbot a specific personality, knowledge base, or purpose that aligns with your brand or personal style.",
  },
  {
    question: "Will I get new features as they're released?",
    answer:
      "Absolutely! All future premium features will be included in your Sovereign Plan lifetime access. You'll also get early access to new features before they're released to free users.",
  },
  {
    question: "How do the advanced SEO tools work?",
    answer:
      "Our advanced SEO tools help optimize your profile for better visibility. They include keyword optimization, performance tracking, and recommendations to improve your profile's search ranking.",
  },
  {
    question: "What is AI-powered profile optimization?",
    answer:
      "Our AI analyzes your profile content and visitor behavior to suggest improvements that can increase engagement and conversion. It provides personalized recommendations based on your specific audience.",
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

const PublicPricingMain = () => {
  const [billPlan, setBillPlan] = useState<Plan>("monthly");

  const handleSwitch = () => {
    setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  return (
    <div className="relative flex flex-col items-center justify-center max-w-5xl py-2 mx-auto">
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
        <Container>
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6">
              <BlurText 
                text="Find the right plan that" 
                delay={100}
              />
              <br /> 
              suits{" "}
              <br className="hidden lg:block" />{" "}
              <span className="font-subheading italic">
                <BlurText 
                  text="your needs" 
                  delay={150}
                />
              </span>
            </h2>
            <p className="text-base md:text-lg text-center text-accent-foreground/80 mt-6">
              Elevate your online presence with our premium features.
              Get advanced SEO tools, AI-powered optimization,
              and exclusive benefits that drive real results.
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
        <ShinyButton
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
        </ShinyButton>
        <div className="h-8 overflow-hidden w-full mx-auto">
          <AnimatePresence mode="wait">
            {billPlan === "monthly" ? (
              <motion.div
                key="monthly"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="text-sm text-center text-muted-foreground mt-3 mx-auto block">
                  Billed one-time
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="annually"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="text-sm text-center text-muted-foreground mt-3 mx-auto block">
                  Billed in one annual payment
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex flex-col items-start w-full p-5 mb-4 ml-1 gap-y-3">
        <span className="text-base text-left mb-2 text-white font-medium">Includes:</span>
        {plan.features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center justify-start gap-2"
          >
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center">
                <CheckIcon className="h-3 w-3 text-white" />
              </div>
            </div>
            <span className="text-white text-sm ml-2">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// This component is specifically for use in the public route
function PublicPricing() {
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
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Wrapper>
      <Navbar />
      <div className="min-h-screen text-white">
        <div className="container mx-auto px-4 pt-20 pb-16">
          <DocumentTitle title="Pricing" />
          <PageTitle
            title="Pricing"
            description="Choose the perfect plan for your needs"
          />

          {/* Always show pricing options on public pricing page */}
          <PublicPricingMain />

          {/* Feature comparison */}
          <div className="mb-20 mt-10">
            <div className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Feature Comparison
              </h2>
              <p className="mt-4 text-white/80">
                Compare features across our different plans
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                      Free
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                      Sovereign Plan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {featureComparisonData.map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-secondary/20" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {row.free === "✅" ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        ) : row.free === "❌" ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-400 to-red-500 flex items-center justify-center">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-white font-medium">{row.free}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm bg-primary-foreground/30 text-white">
                        {row.pro === "✅" ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        ) : row.pro === "❌" ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-400 to-red-500 flex items-center justify-center">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-white font-medium">{row.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ section */}
          <div className="mb-20">
            <div className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-white/80">
                Got questions? We've got answers.
              </p>
            </div>

            <div className="mx-auto max-w-3xl divide-y divide-border">
              {faqData.map((faq, index) => (
                <div key={index} className="py-6">
                  <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                  <p className="mt-2 text-white/80">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Wrapper>
  );
}

export default PublicPricing; 