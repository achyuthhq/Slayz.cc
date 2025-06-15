import "@fontsource/dm-sans";
import "@fontsource/unbounded";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ShinyLoadingButton } from "@/components/ui/shiny-loading-button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { SimpleCaptcha } from "@/components/ui/simple-captcha";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GradientCircles } from "@/components/gradient-circles";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence } from "framer-motion";
import TrueFocus from "@/components/true-focus";
import AuthCard from "@/components/auth-card";
import ForgotPasswordModal from "@/components/forgot-password-modal";

// Define login form schema and type
const loginFormSchema = z.object({
  credential: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

// Define register form schema and type
const registerFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [loginCaptchaValid, setLoginCaptchaValid] = useState(false);
  const [registerCaptchaValid, setRegisterCaptchaValid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  useEffect(() => {
    if (user) setLocation("/dashboard/overview");
  }, [user, setLocation]);

  useEffect(() => {
    // Detect mobile devices
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      credential: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      displayName: "",
      bio: "",
    },
  });

  const handleLogin = (data: LoginFormData) => {
    if (!loginCaptchaValid) {
      toast({
        title: "Verification Required",
        description: "Please complete the captcha verification",
        variant: "destructive",
      });
      return;
    }

    setIsLoginLoading(true);
    loginMutation.mutate(
      { username: data.credential, password: data.password },
      {
        onSuccess: () => {
          setIsLoginLoading(false);
          setLocation("/dashboard/overview");
        },
        onError: (error) => {
          setIsLoginLoading(false);
          toast({
            title: "Login Failed",
            description: error.message || "Invalid username or password",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRegister = (data: RegisterFormValues) => {
    if (!registerCaptchaValid) {
      toast({
        title: "Verification Required",
        description: "Please complete the captcha verification",
        variant: "destructive",
      });
      return;
    }

    setIsRegisterLoading(true);
    registerMutation.mutate(data, {
      onSuccess: () => {
        setIsRegisterLoading(false);
        toast({
          title: "Account created successfully!",
          description: "Welcome to Slayz.cc! Redirecting you to the dashboard...",
        });
        setLocation("/dashboard/overview");
      },
      onError: (error) => {
        setIsRegisterLoading(false);
        toast({
          title: "Registration Failed",
          description: error.message || "An error occurred during registration",
          variant: "destructive",
        });
      },
    });
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
        <div className="w-full max-w-md relative overflow-hidden">
          {/* AuthCard component now handles all card styling */}
          <AuthCard>
            <div className="flex flex-col items-center justify-center mb-6 text-center">
              <div className="w-10 h-10 rounded-full bg-[#8e44ad]/30 flex items-center justify-center border border-[#8e44ad]/50 mb-4">
                <img 
                  src={`${window.location.origin}/icons/storm.gif`} 
                  alt="Welcome Icon" 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    // Fallback to Tenor GIF if local file fails
                    const target = e.target as HTMLImageElement;
                    target.src = "https://i.ibb.co/236CqJQH/storm.gif";
                    console.error("Failed to load storm.gif, using fallback");
                  }}
                />
              </div>
              
              <div className="text-2xl mb-1">
                <TrueFocus 
                  sentence="Welcome To"
                  manualMode={false}
                  blurAmount={5}
                  borderColor="#8e44ad"
                  animationDuration={2}
                  pauseBetweenAnimations={1}
                />
              </div>
              <div className="text-xl font-mono tracking-tight bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] bg-clip-text text-transparent">
                Slayz.cc
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 bg-transparent border border-[#8e44ad]/30 rounded-xl p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-lg border border-transparent data-[state=active]:border-[#8e44ad]/30 data-[state=active]:bg-[#8e44ad]/20 data-[state=active]:text-white transition-all"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg border border-transparent data-[state=active]:border-[#8e44ad]/30 data-[state=active]:bg-[#8e44ad]/20 data-[state=active]:text-white transition-all"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-6"
                  >
                    <FormField
                      control={loginForm.control}
                      name="credential"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">Username or Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                className="bg-[#111111] border border-[#8e44ad]/20 rounded-lg text-white pl-10 py-2 w-full transition-all duration-200 hover:border-[#8e44ad]/40 focus:border-[#8e44ad]/60 focus:ring-0 focus:outline-none"
                                placeholder="Enter your username or email"
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
                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm-4-8a8 8 0 00-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-5.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 00-8-8z"
                                  />
                                </svg>
                              </div>
                            </div>
                          </FormControl>
                          <div className="text-xs text-white/50 mt-1">You can use either your username or the email address connected to your account</div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="password"
                                {...field}
                                className="bg-[#111111] border border-[#8e44ad]/20 rounded-lg text-white pl-10 py-2 w-full transition-all duration-200 hover:border-[#8e44ad]/40 focus:border-[#8e44ad]/60 focus:ring-0 focus:outline-none"
                                placeholder="Enter your password"
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Login Captcha */}
                    <div className="mt-4">
                      <SimpleCaptcha
                        onChange={(isValid) => setLoginCaptchaValid(isValid)}
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <ShinyLoadingButton
                        type="submit"
                        variant="default"
                        size="default"
                        disabled={loginMutation.isPending || !loginForm.formState.isValid}
                        isLoading={isLoginLoading}
                        loadingText="Logging in..."
                        spinnerColor="white"
                        className="w-full bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] text-white rounded-lg py-2 transition-all duration-200 hover:shadow-[0_5px_15px_rgba(142,68,173,0.4)] hover:translate-y-[-2px]"
                      >
                        Sign In
                      </ShinyLoadingButton>
                    </div>
                  </form>
                  <div className="text-center mt-6 text-white/70">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setActiveTab("register")}
                      className="text-[#8e44ad] hover:text-[#9b59b6] transition-colors font-medium"
                    >
                      Register Now
                    </button>
                  </div>
                  
                  {/* Add Forgot Password link below "Don't have an account" - centered */}
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordModalOpen(true)}
                      className="text-sm text-[#8e44ad] hover:text-[#9b59b6] transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-6"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                className="bg-[#111111] border border-[#8e44ad]/20 rounded-lg text-white pl-10 py-2 w-full transition-all duration-200 hover:border-[#8e44ad]/40 focus:border-[#8e44ad]/60 focus:ring-0 focus:outline-none"
                                placeholder="Choose a username"
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="password"
                                {...field}
                                className="bg-[#111111] border border-[#8e44ad]/20 rounded-lg text-white pl-10 py-2 w-full transition-all duration-200 hover:border-[#8e44ad]/40 focus:border-[#8e44ad]/60 focus:ring-0 focus:outline-none"
                                placeholder="Create a password"
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type="email"
                                className="bg-[#111111] border border-[#8e44ad]/20 rounded-lg text-white pl-10 py-2 w-full transition-all duration-200 hover:border-[#8e44ad]/40 focus:border-[#8e44ad]/60 focus:ring-0 focus:outline-none"
                                placeholder="Enter your email address"
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70">Display Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                className="bg-[#111111] border border-[#8e44ad]/20 rounded-lg text-white pl-10 py-2 w-full transition-all duration-200 hover:border-[#8e44ad]/40 focus:border-[#8e44ad]/60 focus:ring-0 focus:outline-none"
                                placeholder="Enter your display name"
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Register Captcha */}
                    <div className="mt-4">
                      <SimpleCaptcha
                        onChange={(isValid) => setRegisterCaptchaValid(isValid)}
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-end mt-4">
                      <ShinyLoadingButton
                        type="submit"
                        variant="default"
                        size="default"
                        disabled={registerMutation.isPending || !registerForm.formState.isValid}
                        isLoading={isRegisterLoading}
                        loadingText="Creating Account..."
                        spinnerColor="white"
                        className="w-full bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] text-white rounded-lg py-2 transition-all duration-200 hover:shadow-[0_5px_15px_rgba(142,68,173,0.4)] hover:translate-y-[-2px]"
                      >
                        Create Account
                      </ShinyLoadingButton>
                    </div>
                  </form>
                  <div className="text-center mt-6 text-white/70">
                    Already have an account?{" "}
                    <button
                      onClick={() => setActiveTab("login")}
                      className="text-[#8e44ad] hover:text-[#9b59b6] transition-colors font-medium"
                    >
                      Login Now
                    </button>
                  </div>
                </Form>
              </TabsContent>
            </Tabs>
          </AuthCard>
        </div>
      </div>

      {!isMobile && (
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10">
          <div className="max-w-lg">
            <h1 className="text-4xl font-unbounded tracking-tight leading-tight mb-6 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]">
              Your Digital Identity, Simplified.
            </h1>
            <p className="text-lg text-white/80 font-sans leading-relaxed tracking-wide">
              Craft a stunning profile that reflects your online persona.<br />
              Easily share social links, media, and files — all in one place.
            </p>
          </div>
        </div>
      )}

      {/* Add Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
      />
    </div>
  );
}