import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { DocumentTitle } from "@/components/document-title";
import { PageTitle } from "@/components/page-title";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentCancelPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Get the order ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get("order_id");
    setOrderId(orderIdParam);
    
    // Show toast notification about cancelled payment
    toast({
      title: "Payment Cancelled",
      description: "Your payment process was cancelled.",
      variant: "default",
    });
  }, [toast]);

  return (
    <div className="container max-w-4xl py-10">
      <DocumentTitle title="Payment Cancelled" />
      <PageTitle 
        title="Payment Cancelled" 
        description="Your payment process was not completed."
      />

      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>
            The payment process was not completed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Your payment has been cancelled and no charges were made. If you experienced any issues during the payment process, please try again or contact our support team.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground">
              Order ID: {orderId}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <ShinyButton
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </ShinyButton>
          <ShinyButton 
            onClick={() => navigate("/dashboard/subscription")}
            className="flex items-center"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </ShinyButton>
        </CardFooter>
      </Card>
    </div>
  );
}