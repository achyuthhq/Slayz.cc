import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export interface SubscriptionStatus {
  status: 'free' | 'premium';
}

// Define premium features
const PREMIUM_FEATURES = {
  'sparkle.effects': 'Display Name Effects',
  'particle.effects': 'Particle Effects',
  'cursor.custom': 'Cursor Customization',
  'decoration.enabled': 'Avatar Decorations',
  'chatbot.enabled': 'Chatbot',
  'background.advanced': 'Advanced Background Options',
  'typing.animation': 'Typing Animation',
  'profile.music': 'Profile Music',
  'avatar.decorations': 'Avatar Decorations',
  'integrations.steam': 'Steam Integration'
} as const;

export type PremiumFeatureKey = keyof typeof PREMIUM_FEATURES;

export function useSubscriptionCheck() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { data: subscriptionData } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
  });

  const isPremium = subscriptionData?.status === 'premium';

  const showUpgradePrompt = (feature: string) => {
    toast({
      title: "Premium Feature",
      description: (
        <div className="space-y-2">
          <p>This feature requires a premium subscription.</p>
          <Button 
            variant="default" 
            onClick={() => navigate('/pricing')}
            className="w-full"
          >
            Upgrade to Premium
          </Button>
        </div>
      ) as ReactNode,
      duration: 5000,
    });
  };

  const isPremiumFeature = (feature: PremiumFeatureKey): boolean => {
    return Object.keys(PREMIUM_FEATURES).includes(feature);
  };

  const canAccessFeature = (feature: PremiumFeatureKey): boolean => {
    if (isPremiumFeature(feature) && !isPremium) {
      showUpgradePrompt(PREMIUM_FEATURES[feature]);
      return false;
    }
    return true;
  };

  const canAddMoreSocialLinks = (currentCount: number): boolean => {
    if (!isPremium && currentCount >= 5) {
      showUpgradePrompt("Additional Social Links");
      return false;
    }
    return true;
  };

  return {
    isPremium,
    canAccessFeature,
    canAddMoreSocialLinks,
    maxSocialLinks: isPremium ? Infinity : 5,
    showUpgradePrompt,
    PREMIUM_FEATURES
  };
}