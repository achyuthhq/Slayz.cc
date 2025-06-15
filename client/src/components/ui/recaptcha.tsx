import { useState, useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { cn } from '@/lib/utils';

interface RecaptchaProps {
  onChange: (token: string | null) => void;
  className?: string;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

export function Recaptcha({
  onChange,
  className,
  onExpired,
  theme = 'light',
  size = 'normal'
}: RecaptchaProps) {
  const [siteKey, setSiteKey] = useState<string | undefined>(undefined);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // Fetch site key from Vite environment variables
    const key = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (key) {
      setSiteKey(key);
    } else {
      console.warn('CAPTCHA site key not found in environment variables');
    }
  }, []);

  return (
    <div className={cn('flex justify-center items-center my-4', className)}>
      {siteKey ? (
        <div className="bg-black/10 backdrop-blur-md rounded-lg p-4 shadow-xl">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={siteKey}
            onChange={onChange}
            onExpired={() => {
              onExpired?.();
              onChange(null);
            }}
            theme={theme}
            size={size === 'compact' ? 'compact' : 'normal'}
          />
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">
          CAPTCHA configuration is missing
        </div>
      )}
    </div>
  );
}