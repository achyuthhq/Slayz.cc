export type PlanFeature = {
  name: string;
  description: string;
  enabled: boolean;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
  color?: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      { name: "Basic Customization", description: "Customize your profile with basic options", enabled: true },
      { name: "Basic Effects", description: "Access to basic visual effects", enabled: true },
      { name: "Social Links", description: "Add up to 5 social media links", enabled: true },
      { name: "Analytics", description: "Basic profile visit analytics", enabled: true },
      { name: "Background Options", description: "Basic background customization", enabled: true }
    ],
    cta: "Get Started",
    color: "blue"
  },
  {
    id: "premium",
    name: "Premium",
    price: 6.99,
    features: [
      { name: "Unlimited Social Links", description: "Add unlimited social media links", enabled: true },
      { name: "Monochrome Icons", description: "Access to monochrome social icons", enabled: true },
      { name: "Advanced Customization", description: "Full profile customization options", enabled: true },
      { name: "Premium Effects", description: "Access to all visual effects", enabled: true },
      { name: "AI Chatbot", description: "AI-powered chatbot for your profile", enabled: true },
      { name: "Advanced Analytics", description: "Detailed visitor analytics", enabled: true },
      { name: "Premium Themes", description: "Access to exclusive themes", enabled: true },
      { name: "Custom Domain", description: "Use your own domain name", enabled: true }
    ],
    cta: "Upgrade Now",
    popular: true,
    color: "purple"
  }
];
