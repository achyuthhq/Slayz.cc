import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { DocumentTitle } from "@/components/document-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoPayment } from "@/components/crypto-payment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Shield } from "lucide-react";

export default function PaymentPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("crypto");
  const [location] = useLocation();
  const paymentId = location.split('pay/')[1] || crypto.randomUUID();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[140%] h-[140%] bg-gradient-to-br from-purple-500/10 via-transparent to-transparent rotate-12 blur-3xl opacity-30" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[140%] h-[140%] bg-gradient-to-tl from-blue-500/10 via-transparent to-transparent rotate-12 blur-3xl opacity-30" />
      </div>
      
      <div className="container max-w-xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <DocumentTitle title="Complete Payment" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
          <p className="text-muted-foreground mt-2">
            You're just one step away from lifetime premium access
          </p>
        </div>

        <div className="bg-black/20 p-6 rounded-lg border border-white/10 mb-8">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Secure Payment
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment information is securely processed. We never store your payment details.
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
  );
}