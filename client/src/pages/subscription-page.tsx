import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { PageTitle } from "@/components/page-title";
import { DocumentTitle } from "@/components/document-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoPayment } from "@/components/crypto-payment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Check, Shield, Star, Infinity as InfinityIcon } from "lucide-react";
import { PLANS } from "@/lib/constants/plans";
import { BorderBeam } from "@/components/ui/border-beam";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("crypto");
  const [location] = useLocation();
  const paymentId = location.split('pay/')[1] || crypto.randomUUID();

  const isPremium = user?.subscriptionStatus === "premium";

  const handleManageSubscription = async () => {
    try {
      // This could be used to show account details, payment history, etc.
      // For now it's just a placeholder for future functionality
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

  return (
    <div className="container mx-auto px-4 py-6">
      <DocumentTitle title="Subscription" />
      <PageTitle
        title="Manage Subscription"
        description="Update your subscription plan and payment methods"
      />

      {isPremium ? (
        <div className="my-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">Current Subscription</CardTitle>
              <CardDescription>
                Details about your active subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-900/10 to-primary/10 rounded-lg border border-primary/20">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Sovereign Plan</h3>
                  <div className="flex items-center gap-2 text-primary mt-1">
                    <InfinityIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Lifetime Access</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-emerald-500 gap-1">
                  <Check className="h-4 w-4" />
                  <span>Active</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-medium">Premium Benefits</h4>
                <ul className="space-y-3 mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  {PLANS.find(plan => plan.id === "premium")?.features.map((feature, index) => (
                    <li key={index} className="flex gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 p-4 bg-black/20 rounded-lg border border-white/10">
                <p className="text-sm text-muted-foreground">
                  You have lifetime access to all premium features with the Sovereign Plan.
                  No renewal required! Enjoy all current and future premium features.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="text-primary border-primary/20 hover:bg-primary/5"
                onClick={handleManageSubscription}
              >
                View Payment History
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="my-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-black/20 p-6 rounded-lg border border-white/10 mb-8">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Secure Payment Options
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose your preferred payment method below. All transactions are secure and encrypted.
              </p>
            </div>

            <Tabs defaultValue="crypto" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="crypto" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Cryptocurrency
                </TabsTrigger>
                <TabsTrigger value="credit-card" disabled className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Credit Card (Coming Soon)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="crypto" className="mt-6">
                <CryptoPayment />
              </TabsContent>
              <TabsContent value="credit-card" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Card Payment</CardTitle>
                    <CardDescription>
                      This payment option is coming soon.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Credit card payments will be available in the near future.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-end">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm bg-gradient-to-br from-white/5 via-white/10 to-white/5 h-fit transform hover:scale-[1.02] transition-all duration-300 overflow-hidden ${
              plan.popular ? "border-white/20" : ""
            } ${plan.id === "free" ? "mt-auto" : ""}`}
          >
            <BorderBeam
              colorFrom={plan.id === "premium" ? "#9333ea" : "#4f46e5"}
              colorTo={plan.id === "premium" ? "#6366f1" : "#60a5fa"}
              duration={8}
              size={30}
              delay={plan.id === "premium" ? 0 : 4}
            />
            {/* Placeholder for plan card content - needs to be added based on the PLAN object */}
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature.name}</li>
                ))}
              </ul>
            </div>
            {plan.price && (
              <div className="mt-4">
                <p>Price: {plan.price}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}