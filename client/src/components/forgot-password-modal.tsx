import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { SimpleCaptcha } from '@/components/ui/simple-captcha';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCaptchaVerify = (isValid: boolean, token: string | null = null) => {
    console.log("Captcha validation:", isValid, "Token:", token);
    setCaptchaToken(token);
    setCaptchaValid(isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset debug info
    setDebugInfo(null);
    
    // Debug logging
    console.log("Submit pressed with:", { email, captchaValid, captchaToken });
    
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }
    
    if (!captchaValid || !captchaToken) {
      toast({
        title: 'Verification required',
        description: 'Please complete the verification',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Sending request to /api/forgot-password with:", {
        email,
        turnstileToken: captchaToken
      });
      
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          turnstileToken: captchaToken
        }),
      });
      
      console.log("Response status:", response.status);
      
      let data: {
        message?: string;
        debug?: { resetUrl: string };
        emailError?: any;
        error?: string;
      };
      try {
        data = await response.json();
        console.log("Response data:", data);
        
        // Check for debug information
        if (data.debug && data.debug.resetUrl) {
          const resetUrl = data.debug.resetUrl;
          setDebugInfo(
            `For testing: <a href="${resetUrl}" target="_blank" class="text-purple-300 underline">${resetUrl}</a>`
          );
          
          // Also log to console for easy copying
          console.log("DEBUG: Reset URL for testing:", resetUrl);
          
          // Show detailed error if available
          if (data.emailError) {
            console.error("Email sending error:", data.emailError);
            setDebugInfo(prev => prev + `<br/><br/><strong>Email Error:</strong> ${JSON.stringify(data.emailError)}`);
          }
          
          if (data.error) {
            console.error("Error detail:", data.error);
            setDebugInfo(prev => prev + `<br/><br/><strong>Error:</strong> ${data.error}`);
          }
        }
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        data = { message: "Invalid server response" };
      }
      
      if (response.ok) {
        toast({
          title: 'Check your email',
          description: data.message || 'If an account exists with this email, a password reset link has been sent',
        });
        onClose();
      } else if (response.status === 500) {
        if (data.message && data.message.includes('not configured')) {
          // Specific error for email service not configured
          toast({
            title: 'Email service not configured',
            description: 'The server is not properly configured to send emails. Please contact the administrator.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Server error',
            description: data.message || 'The server encountered an error processing your request.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to process your request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Detailed error in forgot password:", error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#111111] border border-[#8e44ad]/30 rounded-lg text-white max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white text-center">Reset Your Password</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white/70">
              Email
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="bg-[#111111] border border-[#8e44ad]/20 rounded-lg text-white pl-10 py-2 w-full transition-all duration-200 hover:border-[#8e44ad]/40 focus:border-[#8e44ad]/60 focus:ring-0 focus:outline-none"
                disabled={isSubmitting}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-white/50"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <SimpleCaptcha
              onChange={handleCaptchaVerify}
              className="w-full"
            />
          </div>
          
          {debugInfo && (
            <div className="mt-4 p-3 bg-purple-950/30 border border-purple-500/30 rounded-md">
              <p 
                className="text-xs text-purple-300 break-all"
                dangerouslySetInnerHTML={{ __html: `<strong>Debug Info:</strong> ${debugInfo}` }}
              />
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mr-2 border-[#8e44ad]/30 bg-transparent hover:bg-[#8e44ad]/10 text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !captchaValid}
              className="bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] text-white transition-all duration-200 hover:shadow-[0_5px_15px_rgba(142,68,173,0.4)] hover:translate-y-[-2px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 