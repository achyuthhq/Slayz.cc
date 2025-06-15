import { type } from "os";

export const SUBSCRIPTION_FEATURES = {
  free: {
    // Overview Page
    'overview': true,

    // Home Page Features
    'home.logo': true,
    'home.displayName': true,
    'home.audio': true,
    'home.background.basic': true,
    'home.pageSettings': true,
    'home.decorations': false,
    'home.effects': false,
    'home.customCursor': false,
    'home.music': false,

    // Analytics Features
    'analytics': true,

    // Social Features
    'socials.original': true,
    'socials.monochrome': false,
    'socials.maxLinks': 5,
    'socials.unlimited': false,

    // Badges Features
    'badges': true,

    // Chatbot Features
    'chatbot.enabled': false,
    'chatbot.customization': false,

    // Integrations
    'integrations.steam': false,

    // Settings
    'settings': true
  },

  premium: {
    // Overview Page
    'overview': true,

    // Home Page Features
    'home.logo': true,
    'home.displayName': true,
    'home.audio': true,
    'home.background.all': true,
    'home.pageSettings': true,
    'home.decorations': true,
    'home.effects': true,
    'home.customCursor': true,
    'home.music': true,

    // Analytics Features
    'analytics': true,

    // Social Features
    'socials.original': true,
    'socials.monochrome': true,
    'socials.maxLinks': Infinity,
    'socials.unlimited': true,

    // Badges Features
    'badges': true,

    // Chatbot Features
    'chatbot.enabled': true,
    'chatbot.customization': true,
    
    // Integrations
    'integrations.steam': true,

    // Settings
    'settings': true
  }
} as const;

export type SubscriptionTier = 'free' | 'premium';
export type Feature = keyof typeof SUBSCRIPTION_FEATURES.premium;

export function hasAccess(tier: SubscriptionTier, feature: Feature): boolean {
  return !!SUBSCRIPTION_FEATURES[tier][feature];
}

export function getMaxSocialLinks(tier: SubscriptionTier): number {
  return SUBSCRIPTION_FEATURES[tier]['socials.maxLinks'];
}

export function isFeaturePremium(feature: Feature): boolean {
  return !SUBSCRIPTION_FEATURES.free[feature] && SUBSCRIPTION_FEATURES.premium[feature];
}
