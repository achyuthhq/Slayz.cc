import React from "react";
import { Link } from "wouter";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import BlurText from "@/components/blur-text";
import { 
  ArrowRight, 
  ChevronRight, 
  Shield,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Database,
  Server
} from "lucide-react";
import Wrapper from "@/components/global/wrapper";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Base black background */}
      <div className="fixed inset-0 z-[-2] bg-black"></div>
      
      {/* Subtle gradients */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        {/* Top-right gradient */}
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#a631d6] opacity-40 blur-[60px] rounded-full"></div>
        
        {/* Bottom-left gradient */}
        <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-gradient-to-r from-[#9034b5] to-[#a631d6] opacity-45 blur-[70px] rounded-full"></div>
      </div>
      
      <Wrapper>
        <Navbar />
      
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Hero section gradient */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#9034b5] to-[#a631d6] opacity-40 blur-[70px] rounded-full"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-center !leading-tight mb-6">
                <BlurText 
                  text="Privacy Policy" 
                  delay={100}
                />
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                How we protect your data and respect your privacy
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="group"
                  asChild
                >
                  <Link to="/terms" className="flex items-center">
                    Terms & Conditions
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Last Updated Section */}
        <section className="py-8 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <p className="text-md text-center text-white/70">
                  Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Introduction" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <div className="flex items-start mb-6">
                  <Shield className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    At Slayz.cc, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                  </p>
                </div>
                <div className="flex items-start">
                  <Lock className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Information We Collect Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Information We Collect" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500 space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <UserCheck className="w-6 h-6 text-purple-500 mr-3" />
                    Personal Data
                  </h3>
                  <p className="text-lg mb-4">
                    When you register with us, we may collect the following types of personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>Name and email address</li>
                    <li>Username and password</li>
                    <li>Profile information you choose to provide</li>
                    <li>Social media account information when you link accounts</li>
                    <li>Payment information (processed securely through our payment processors)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Database className="w-6 h-6 text-purple-500 mr-3" />
                    Usage Data
                  </h3>
                  <p className="text-lg mb-4">
                    We may also collect information about how you access and use our website:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>IP address and browser type</li>
                    <li>Pages you visit and features you use</li>
                    <li>Time spent on pages and interaction information</li>
                    <li>Device information including operating system</li>
                    <li>Referral source and exit pages</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Eye className="w-6 h-6 text-purple-500 mr-3" />
                    Cookies and Tracking
                  </h3>
                  <p className="text-lg">
                    We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Use Your Information Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="How We Use Your Information" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <p className="text-lg mb-6">
                  We may use the information we collect about you for various purposes, including to:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Server className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Provide, maintain, and improve our services, including to process transactions and send related information</span>
                  </li>
                  <li className="flex items-start">
                    <Server className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Send administrative information, such as updates, security alerts, and support messages</span>
                  </li>
                  <li className="flex items-start">
                    <Server className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Respond to your comments, questions, and requests and provide customer service</span>
                  </li>
                  <li className="flex items-start">
                    <Server className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Personalize your experience and deliver content relevant to your interests</span>
                  </li>
                  <li className="flex items-start">
                    <Server className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Monitor and analyze trends, usage, and activities in connection with our services</span>
                  </li>
                  <li className="flex items-start">
                    <Server className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Detect, investigate, and prevent fraudulent transactions and other illegal activities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Data Security" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <div className="flex items-start mb-6">
                  <Shield className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                  </p>
                </div>
                <div className="flex items-start">
                  <Lock className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    We use industry-standard encryption technologies when transferring and receiving user data. We also maintain physical, electronic, and procedural safeguards in connection with the collection, storage, and disclosure of personal data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Your Rights" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <p className="text-lg mb-6">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">The right to access personal information we hold about you</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">The right to request correction of inaccurate personal information</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">The right to request deletion of your personal information</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">The right to object to processing of your personal information</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">The right to data portability</span>
                  </li>
                </ul>
                <p className="text-lg mt-6">
                  To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Contact Us" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <p className="text-lg mb-6">
                  If you have questions or concerns about this Privacy Policy, please contact us at:
                </p>
                <div className="text-center">
                  <p className="text-xl font-semibold mb-2">Slayz.cc</p>
                  <p className="text-lg text-white/80 mb-1">Email: privacy@slayz.cc</p>
                  <p className="text-lg text-white/80">Discord: <a href="https://discord.gg/TseKvdPMYV" className="text-purple-400 hover:underline">Join our server</a></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </Wrapper>
    </div>
  );
};

export default PrivacyPolicyPage; 