import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

// Schema for form validation
const cryptoPaymentSchema = z.object({
  currency: z.string({
    required_error: "Please select a cryptocurrency",
  }),
  amount: z.number(),
});

type CryptoPaymentFormValues = z.infer<typeof cryptoPaymentSchema>;

// Supported cryptocurrencies
const SUPPORTED_CURRENCIES = [
  { id: 'btc', name: 'Bitcoin (BTC)' },
  { id: 'eth', name: 'Ethereum (ETH)' },
  { id: 'ltc', name: 'Litecoin (LTC)' },
  { id: 'doge', name: 'Dogecoin (DOGE)' },
  { id: 'sol', name: 'Solana (SOL)' },
  { id: 'usdt', name: 'Tether (USDT)' },
  { id: 'usdc', name: 'USD Coin (USDC)' },
  { id: 'bnb', name: 'Binance Coin (BNB)' },
  { id: 'xrp', name: 'XRP' },
  { id: 'ada', name: 'Cardano (ADA)' },
];

export function CryptoPayment() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Default subscription amount for Sovereign Plan (one-time payment)
  const defaultValues: CryptoPaymentFormValues = {
    currency: "btc",
    amount: 5, // Lifetime access price
  };

  const form = useForm<CryptoPaymentFormValues>({
    resolver: zodResolver(cryptoPaymentSchema),
    defaultValues,
  });

  const onSubmit = async (values: CryptoPaymentFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a payment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/payment/crypto/create-invoice", {
        currency: values.currency,
        amount: values.amount, //The amount is already a string here
      });

      if (response.data && response.data.invoiceUrl) {
        // Redirect user to NOWPayments invoice page
        window.location.href = response.data.invoiceUrl;
      } else {
        throw new Error("Invalid response from payment service");
      }
    } catch (error) {
      console.error("Payment error:", error);

      toast({
        title: "Payment Error",
        description: "There was a problem creating your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sovereign Plan Payment</CardTitle>
        <CardDescription>
          Get lifetime access to all premium features with a one-time cryptocurrency payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cryptocurrency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cryptocurrency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred cryptocurrency for payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="5"
                      step="1"
                      disabled={true}
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    One-time payment of $5 USD for lifetime access to all premium features
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Get Lifetime Access
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
        Powered by NOWPayments
      </CardFooter>
    </Card>
  );
}