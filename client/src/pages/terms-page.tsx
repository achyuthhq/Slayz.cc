import React from "react";
import { Link } from "wouter";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import BlurText from "@/components/blur-text";
import { 
  ArrowRight, 
  ChevronRight, 
  Scale,
  FileText,
  AlertTriangle,
  Ban,
  Gavel,
  Globe,
  Copyright,
  ShieldAlert
} from "lucide-react";
import Wrapper from "@/components/global/wrapper";

const TermsPage = () => {
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
                  text="Terms & Conditions" 
                  delay={100}
                />
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                The rules that govern your use of our platform
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="group"
                  asChild
                >
                  <Link to="/privacy" className="flex items-center">
                    Privacy Policy
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
                  <Scale className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    Welcome to Slayz.cc. These Terms & Conditions govern your use of our website, services, and platform. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our services.
                  </p>
                </div>
                <div className="flex items-start">
                  <FileText className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    We reserve the right to update these Terms & Conditions at any time. Changes will be effective immediately upon posting to our website. Your continued use of our platform following the posting of revised Terms means that you accept and agree to the changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Terms Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Account Terms" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500 space-y-6">
                <p className="text-lg">
                  By creating an account with us, you agree to the following terms:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">You must be at least 13 years of age to use our services</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">You must provide accurate, complete, and up-to-date information</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">You are responsible for maintaining the security of your account and password</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">You are responsible for all activities that occur under your account</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">We reserve the right to terminate accounts or refuse service to anyone for any reason at any time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Acceptable Use Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Acceptable Use" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <p className="text-lg mb-6">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Ban className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Using our services for any illegal purpose or in violation of any laws</span>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Posting or transmitting content that infringes on intellectual property rights</span>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Sharing harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content</span>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Attempting to interfere with, compromise, or disrupt our services or servers</span>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Using our platform to distribute unsolicited promotions or advertisements</span>
                  </li>
                </ul>
                <p className="text-lg mt-6">
                  Violation of these terms may result in immediate termination of your account and services without refund.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Terms Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Payment Terms" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <div className="space-y-6">
                  <p className="text-lg">
                    For premium services and subscriptions, the following terms apply:
                  </p>
                  <div className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Subscription fees are billed in advance on a recurring basis according to your selected plan</span>
                  </div>
                  <div className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">You authorize us to charge your payment method for all fees incurred</span>
                  </div>
                  <div className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period</span>
                  </div>
                  <div className="flex items-start">
                    <FileText className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">Refunds are processed according to our Refund Policy, which may be updated from time to time</span>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-lg">We reserve the right to change our pricing with reasonable notice before the change takes effect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Intellectual Property" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <div className="flex items-start mb-6">
                  <Copyright className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    The Slayz.cc service, including all content, features, and functionality, is owned by us and is protected by copyright, trademark, and other intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                  </p>
                </div>
                <div className="flex items-start">
                  <Copyright className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    While you retain ownership of content you upload to our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content for the purpose of operating and improving our services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Limitation of Liability Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Limitation of Liability" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <div className="flex items-start mb-6">
                  <ShieldAlert className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    In no event shall Slayz.cc, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                  </p>
                </div>
                <div className="flex items-start">
                  <ShieldAlert className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    We do not guarantee that our services will be uninterrupted, timely, secure, or error-free. We reserve the right to modify, suspend, or discontinue our services at any time without notice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governing Law Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-8 text-center">
                <BlurText 
                  text="Governing Law" 
                  delay={100}
                />
              </h2>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-purple-500/20 transition-all duration-500">
                <div className="flex items-start">
                  <Gavel className="w-8 h-8 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    These Terms shall be governed and construed in accordance with the laws applicable in our jurisdiction, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                  </p>
                </div>
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
                  If you have any questions about these Terms & Conditions, please contact us at:
                </p>
                <div className="text-center">
                  <p className="text-xl font-semibold mb-2">Slayz.cc</p>
                  <p className="text-lg text-white/80 mb-1">Email: legal@slayz.cc</p>
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

export default TermsPage; 