import axios from 'axios';
import { z } from 'zod';

// Define schema for API key validation
export const nowPaymentsConfigSchema = z.object({
  apiKey: z.string().min(1, "NOWPayments API key is required"),
  ipnSecret: z.string().min(1, "NOWPayments IPN Secret is required"),
  ipnCallbackUrl: z.string().url("Must be a valid URL"),
});

export type NOWPaymentsConfig = z.infer<typeof nowPaymentsConfigSchema>;

// Get config from environment variables
export const getNOWPaymentsConfig = (): NOWPaymentsConfig => {
  return {
    apiKey: process.env.NOWPAYMENTS_API_KEY || '',
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET || '',
    ipnCallbackUrl: process.env.NOWPAYMENTS_IPN_CALLBACK_URL || '',
  };
};

// Validate configuration
export const validateNOWPaymentsConfig = (): boolean => {
  try {
    nowPaymentsConfigSchema.parse(getNOWPaymentsConfig());
    return true;
  } catch (error) {
    console.error('NOWPayments configuration error:', error);
    return false;
  }
};

// Supported currencies
export const SUPPORTED_CURRENCIES = [
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

// Define response types
export interface NOWPaymentsInvoice {
  id: string;
  token_id: number;
  order_id: string;
  order_description: string;
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  ipn_callback_url: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
  updated_at: string;
}

export interface NOWPaymentsPayment {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  created_at: string;
  updated_at: string;
}

// Create an invoice
export async function createInvoice(params: {
  price: number; 
  currency: string;
  orderId: string;
  orderDescription: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<NOWPaymentsInvoice> {
  const config = getNOWPaymentsConfig();
  
  try {
    const response = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      {
        price_amount: params.price,
        price_currency: 'USD',
        pay_currency: params.currency,
        order_id: params.orderId,
        order_description: params.orderDescription,
        ipn_callback_url: config.ipnCallbackUrl,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      },
      {
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating NOWPayments invoice:', error);
    throw new Error('Failed to create payment invoice');
  }
}

// Get payment status
export async function getPaymentStatus(paymentId: string): Promise<NOWPaymentsPayment> {
  const config = getNOWPaymentsConfig();
  
  try {
    const response = await axios.get(
      `https://api.nowpayments.io/v1/payment/${paymentId}`,
      {
        headers: {
          'x-api-key': config.apiKey,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error checking NOWPayments payment status:', error);
    throw new Error('Failed to check payment status');
  }
}

// Verify IPN signature
export function verifyIPNSignature(
  request: { headers: Record<string, string | undefined>; body: any },
  ipnSecret: string
): boolean {
  const hmacHeader = request.headers['x-nowpayments-sig'];
  
  if (!hmacHeader) {
    return false;
  }
  
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha512', ipnSecret);
  const digest = hmac.update(JSON.stringify(request.body)).digest('hex');
  
  return digest === hmacHeader;
}