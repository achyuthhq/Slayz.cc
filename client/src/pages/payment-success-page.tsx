import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { DocumentTitle } from "@/components/document-title";
import { PageTitle } from "@/components/page-title";
import { AlertTriangle, CheckCircle, Home, Loader2, RefreshCw, Settings } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentSuccessPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'processing'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pollingActive, setPollingActive] = useState(true);

  useEffect(() => {
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

    // Clean up polling when component unmounts
    return () => {
      setPollingActive(false);
    };
  }, []);

  // Start polling for payment status if it's still processing
  useEffect(() => {
    let pollingTimer: NodeJS.Timeout;

    if (pollingActive && orderId && verificationStatus === 'processing' && retryCount < 10) {
      pollingTimer = setTimeout(() => {
        verifyPaymentStatus(orderId);
        setRetryCount(prev => prev + 1);
      }, 10000); // Poll every 10 seconds
    }

    return () => {
      if (pollingTimer) clearTimeout(pollingTimer);
    };
  }, [verificationStatus, orderId, retryCount, pollingActive]);

  const checkPaymentStatus = async (orderId: string) => {
    try {
      // First check if the user is authenticated
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Start with the regular status check
      const response = await axios.get(`/api/payment/status?order_id=${orderId}`);
      
      if (response.data.success) {
        setVerificationStatus('success');
        // Refresh user data to get updated subscription status
        await refreshUser();
        toast({
          title: "Payment Verified",
          description: "Your premium subscription is now active!",
          variant: "default",
        });
      } else {
        // If not successful yet, try the direct verification
        await verifyPaymentStatus(orderId);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      // If initial check fails, try direct verification
      await verifyPaymentStatus(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPaymentStatus = async (orderId: string) => {
    setIsVerifying(true);
    try {
      const response = await axios.get(`/api/payment/verify?order_id=${orderId}`);
      
      if (response.data.verified) {
        setVerificationStatus('success');
        // Refresh user data to get updated subscription status
        await refreshUser();
        toast({
          title: "Payment Verified",
          description: "Your premium subscription is now active!",
          variant: "default",
        });
      } else if (response.data.status === 'failed' || response.data.status === 'expired') {
        setVerificationStatus('error');
        toast({
          title: "Payment Failed",
          description: response.data.message || "Your payment could not be processed.",
          variant: "destructive",
        });
      } else {
        // Payment is still processing
        setVerificationStatus('processing');
        setPaymentDetails(response.data.details);
        toast({
          title: "Payment Processing",
          description: response.data.message || "Your payment is being processed. Please wait.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setVerificationStatus('error');
      toast({
        title: "Verification Error",
        description: "Could not verify your payment status. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerification = () => {
    if (orderId) {
      setRetryCount(0); // Reset retry count
      verifyPaymentStatus(orderId);
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
  if (!user) {
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
          ) : verificationStatus === 'processing' ? (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-blue-500 mb-4 animate-spin" />
              <CardTitle>Payment Processing</CardTitle>
              <CardDescription>
                Your payment is being processed by the cryptocurrency network.
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
              Thank you for subscribing to our premium plan. You now have lifetime access to all premium features.
            </p>
          ) : verificationStatus === 'processing' ? (
            <>
              <p className="mb-4">
                Your payment is being processed by the cryptocurrency network. This can take some time depending on network congestion.
              </p>
              <p className="mb-4">
                This page will automatically check for updates every 10 seconds. You can also manually check the status using the "Verify Payment" button below.
              </p>
              {paymentDetails && paymentDetails.pay_address && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-sm font-medium">Payment Details:</p>
                  <p className="text-xs mt-1">Status: {paymentDetails.payment_status}</p>
                  <p className="text-xs mt-1 break-all">Address: {paymentDetails.pay_address}</p>
                </div>
              )}
            </>
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
          {verificationStatus !== 'success' && (
            <Button
              onClick={handleManualVerification}
              disabled={isVerifying}
              className="flex items-center"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verify Payment
                </>
              )}
            </Button>
          )}
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