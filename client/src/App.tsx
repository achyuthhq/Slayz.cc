import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import AccountOverviewPage from "./pages/account-overview-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import LandingPage from "@/pages/landing-page";
import HomePage from "@/pages/home-page"; // Home page is now used as the customization page
import SocialsPage from "@/pages/socials-page";
import SettingsPage from "@/pages/settings-page";
import BadgesPage from "@/pages/badges-page";
import AdminBadgesPage from "@/pages/admin-badges-page";
import AdminUsersPage from "@/pages/admin-users-page";
import AnalyticsPage from "@/pages/analytics-page";
import PricingPage from "@/pages/pricing-page";
import AboutPage from "@/pages/about-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import TermsPage from "@/pages/terms-page";
import NotFound from "@/pages/not-found";
import ChatbotPage from "@/pages/chatbot-page";
import SubscriptionPage from "@/pages/subscription-page";
import PaymentSuccessPage from "@/pages/payment-success-page";
import PaymentCancelPage from "@/pages/payment-cancel-page";
import PaymentPage from "@/pages/payment-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import ResetPasswordPage from "@/pages/reset-password";
import LoadingProvider from "./hooks/use-loading";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./styles/dnd.css";

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Switch>
        <Route
          path="/dashboard"
          component={() => {
            window.location.href = "/dashboard/overview";
            return null;
          }}
        />
        <Route path="/dashboard/overview" component={AccountOverviewPage} />
        <Route path="/dashboard/analytics" component={AnalyticsPage} />
        <Route path="/dashboard/customize" component={HomePage} />
        <Route path="/dashboard/socials" component={SocialsPage} />
        <Route path="/dashboard/settings" component={SettingsPage} />
        <Route path="/dashboard/badges" component={BadgesPage} />
        <Route path="/dashboard/pricing" component={PricingPage} />
        <Route path="/dashboard/chatbot" component={ChatbotPage} />
        <Route path="/dashboard/subscription" component={SubscriptionPage} />
        {/* Payment route is now defined outside the dashboard to avoid showing the navbar */}
        
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/payment/success" component={PaymentSuccessPage} />
      <Route path="/payment/cancel" component={PaymentCancelPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <ProtectedRoute path="/pay/:paymentId" component={PaymentPage} />
      <Route path="/manage-system-x92/badges" component={AdminBadgesPage} />
      <Route path="/haha-manage-this-system/x983/users" component={AdminUsersPage} />
      <ProtectedRoute path="/dashboard/*" component={DashboardRoutes} />
      <Route path="/:username" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider>
            <ScrollToTop />
            <Router />
            <Toaster />
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
