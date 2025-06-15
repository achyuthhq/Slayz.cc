import axios from 'axios';
import { z } from 'zod';

const recaptchaConfigSchema = z.object({
  secretKey: z.string().min(1),
  siteKey: z.string().min(1),
});

export type RecaptchaConfig = z.infer<typeof recaptchaConfigSchema>;

export const getRecaptchaConfig = (): RecaptchaConfig => {
  return {
    secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    siteKey: process.env.RECAPTCHA_SITE_KEY || '',
  };
};

export const validateRecaptchaConfig = (): boolean => {
  try {
    recaptchaConfigSchema.parse(getRecaptchaConfig());
    return true;
  } catch (error) {
    console.warn('Invalid reCAPTCHA configuration:', error);
    return false;
  }
};

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  try {
    const { secretKey } = getRecaptchaConfig();
    
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY is not set');
      return false;
    }

    const url = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);

    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;
    
    if (data.success) {
      return true;
    } else {
      console.warn('reCAPTCHA verification failed:', data['error-codes']);
      return false;
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return false;
  }
}