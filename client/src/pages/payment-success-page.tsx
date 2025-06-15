import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { DocumentTitle } from "@/components/document-title";
import { PageTitle } from "@/components/page-title";
import { AlertTriangle, CheckCircle, Home, Loader2, Settings } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccessPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is authenticated
    checkAuthentication();
    
    // Get the order ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get("order_id");
    setOrderId(orderIdParam);
    
    // If there's an order ID, check payment status
    if (orderIdParam) {
      checkPaymentStatus(orderIdParam);
    } else {
      setIsLoading(false);
      setVerificationStatus('error');
      toast({
        title: "Verification Failed",
        description: "Missing order information. Please contact support.",
        variant: "destructive",
      });
    }
  }, []);
  
  const checkAuthentication = async () => {
    try {
      const response = await axios.get('/api/user');
      if (response.status === 200) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("User not authenticated:", error);
      setIsAuthenticated(false);
    }
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      // Make an API call to confirm the payment status on the server
      const response = await axios.get(`/api/payment/status?order_id=${orderId}`);
      
      if (response.data.success) {
        setVerificationStatus('success');
        toast({
          title: "Payment Verified",
          description: "Your premium subscription is now active!",
          variant: "default",
        });
      } else {
        setVerificationStatus('error');
        toast({
          title: "Payment Not Completed",
          description: "Your payment is pending or has not been completed. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setVerificationStatus('error');
      toast({
        title: "Verification Failed",
        description: "Could not verify your payment status. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <DocumentTitle title="Verifying Payment" />
        <PageTitle 
          title="Verifying Payment" 
          description="Please wait while we verify your payment..."
        />
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-primary mb-4 animate-spin" />
            <CardTitle>Verifying Payment</CardTitle>
            <CardDescription>
              Please wait while we verify your payment status...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl py-10">
        <DocumentTitle title="Authentication Required" />
        <PageTitle 
          title="Authentication Required" 
          description="Please log in to verify your payment status"
        />
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to verify your payment status
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Please log in to your account to verify your payment and activate your premium subscription.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button 
              onClick={() => navigate("/auth")}
              className="flex items-center"
            >
              Login Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <DocumentTitle title={verificationStatus === 'success' ? "Payment Successful" : "Payment Verification"} />
      <PageTitle 
        title={verificationStatus === 'success' ? "Payment Successful" : "Payment Status"} 
        description={verificationStatus === 'success' ? "Thank you for your payment" : "Your payment status information"}
      />

      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          {verificationStatus === 'success' ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <CardTitle>Payment Successful!</CardTitle>
              <CardDescription>
                Your premium subscription has been activated.
              </CardDescription>
            </>
          ) : (
            <>
              <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <CardTitle>Payment Verification Issue</CardTitle>
              <CardDescription>
                We couldn't verify your payment status.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          {verificationStatus === 'success' ? (
            <p className="mb-4">
              Thank you for subscribing to our premium plan. You now have access to all premium features for the next 30 days.
            </p>
          ) : (
            <p className="mb-4">
              There was an issue verifying your payment. This could be because the payment is still being processed, or there might have been a problem with the transaction.
            </p>
          )}
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
            onClick={() => navigate("/dashboard/account")}
            className="flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Account
          </ShinyButton>
        </CardFooter>
      </Card>
    </div>
  );
}