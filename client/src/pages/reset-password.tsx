import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ShinyLoadingButton } from '@/components/ui/shiny-loading-button';
import { GradientCircles } from '@/components/gradient-circles';
import AuthCard from '@/components/auth-card';
import TrueFocus from '@/components/true-focus';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Extract token and email from URL
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  useEffect(() => {
    // Detect mobile devices
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);
  
  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setTokenError('Missing token or email');
        setIsVerifying(false);
        return;
      }
      
      try {
        // Make an API call to verify the token is valid
        const response = await fetch(`/api/verify-token?token=${token}&email=${encodeURIComponent(email)}`);
        
        if (response.ok) {
          setIsValid(true);
        } else {
          const data = await response.json();
          setTokenError(data.message || 'Invalid or expired token');
          setIsValid(false);
        }
      } catch (error) {
        setTokenError('Error verifying token');
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyToken();
  }, [token, email]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords match',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your password has been reset successfully',
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          setLocation('/auth');
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to reset password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div
      className="min-h-screen flex text-white relative overflow-hidden bg-[#0f0f0f]"
      style={{
        backgroundImage:
          "url('https://media1.tenor.com/m/MkI8xJLf6iwAAAAC/background-aesthetic.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Blurred Black Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0 pointer-events-none" />
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#8e44ad]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#8e44ad]/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0 pointer-events-none" />
      {!isMobile && <GradientCircles />}
      
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <AuthCard>
            <div className="flex flex-col items-center justify-center mb-6 text-center">
              <div className="w-10 h-10 rounded-full bg-[#8e44ad]/30 flex items-center justify-center border border-[#8e44ad]/50 mb-4">
                <img 
                  src={`${window.location.origin}/icons/storm.gif`} 
                  alt="Reset Password Icon" 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    // Fallback to Tenor GIF if local file fails
                    const target = e.target as HTMLImageElement;
                    target.src = "https://i.ibb.co/236CqJQH/storm.gif";
                  }}
                />
              </div>
              
              <div className="text-2xl mb-1">
                <TrueFocus 
                  sentence="Reset Your"
                  manualMode={false}
                  blurAmount={5}
                  borderColor="#8e44ad"
                  animationDuration={2}
                  pauseBetweenAnimations={1}
                />
              </div>
              <div className="text-xl font-mono tracking-tight bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] bg-clip-text text-transparent">
                Password
              </div>
            </div>
            
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-[#8e44ad] animate-spin mb-4" />
                <p className="text-white/70">Verifying your reset link...</p>
              </div>
            ) : !isValid ? (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h2>
                <p className="text-white/70 text-center mb-6">
                  {tokenError || 'The password reset link is invalid or has expired.'}
                </p>
                <button 
                  onClick={() => setLocation('/auth')}
                  className="bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] text-white rounded-lg px-6 py-2 transition-all duration-200 hover:shadow-[0_5px_15px_rgba(142,68,173,0.4)] hover:translate-y-[-2px]"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-white/70">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="bg-[#111111] border border-[#8e44ad]/20 rounded-lg text-white pl-10 py-2 w-full transition-all duration-200 hover:border-[#8e44ad]/40 focus:border-[#8e44ad]/60 focus:ring-0 focus:outline-none"
                      disabled={isSubmitting}
                      required
                      minLength={8}
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-white/70">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <ShinyLoadingButton 
                  type="submit" 
                  variant="default"
                  size="default"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  loadingText="Resetting Password..."
                  spinnerColor="white"
                  className="w-full bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] text-white rounded-lg py-2 transition-all duration-200 hover:shadow-[0_5px_15px_rgba(142,68,173,0.4)] hover:translate-y-[-2px]"
                >
                  Set New Password
                </ShinyLoadingButton>
                
                <div className="text-center mt-4 text-white/70">
                  <button
                    type="button"
                    onClick={() => setLocation('/auth')}
                    className="text-[#8e44ad] hover:text-[#9b59b6] transition-colors font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </AuthCard>
        </div>
      </div>
    </div>
  );
} 