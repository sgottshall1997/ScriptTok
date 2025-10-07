import React, { useEffect } from 'react';
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignIn, SignUp } from "@clerk/clerk-react";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

// Essential Pages for TikTok Viral Product Generator
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import EnhancedContentHistory from "@/pages/EnhancedContentHistory";
import TrendHistory from "@/pages/TrendHistory";
import AboutPage from "@/pages/about";
import FAQPage from "@/pages/faq";
import PrivacyPolicyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import ContactPage from "@/pages/contact";
import GenerateContent from "@/pages/GenerateContent";
import TrendingAIPicks from "@/pages/TrendingAIPicks";
// import AffiliateLinks from "@/pages/AffiliateLinks"; // DISABLED: Amazon Associates functionality disabled
import Account from "@/pages/Account";
import CompliancePage from "@/pages/CompliancePage";
import HowItWorksPage from "@/pages/how-it-works";

// New Legal Pages
import TermsBillingPage from "@/pages/TermsBilling";
import PrivacyCookiesPage from "@/pages/PrivacyCookies";
import CookiePreferencesPage from "@/pages/CookiePreferences";
import LegalNoticesPage from "@/pages/LegalNotices";
import TrustSafetyPage from "@/pages/TrustSafety";

import Layout from "@/components/Layout";
import { initScraperConsole } from "./lib/scraperConsole";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Track page views when routes change
  useAnalytics();
  
  return <MainAppRouter isAuthenticated={isAuthenticated} isLoading={isLoading} />;
}

function MainAppRouter({ isAuthenticated, isLoading }: { isAuthenticated: boolean; isLoading: boolean }) {
  const [location, setLocation] = useLocation();
  
  // Redirect authenticated users from root to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && location === '/') {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Authentication routes */}
      <Route path="/sign-in">
        {() => (
          <div className="flex min-h-screen items-center justify-center">
            <SignIn signUpUrl="/sign-up" />
          </div>
        )}
      </Route>
      <Route path="/sign-up">
        {() => (
          <div className="flex min-h-screen items-center justify-center">
            <SignUp signInUrl="/sign-in" />
          </div>
        )}
      </Route>
      
      {/* Root path - Landing Page for unauthenticated */}
      <Route path="/">
        {() => <LandingPage />}
      </Route>
      
      {/* App pages with layout */}
      <Route path="/dashboard">
        {() => (
          <Layout>
            <Dashboard />
          </Layout>
        )}
      </Route>
      
      {/* Core content generation functionality */}
      <Route path="/generate">
        {() => (
          <Layout>
            <GenerateContent />
          </Layout>
        )}
      </Route>
      <Route path="/niche/:niche">
        {() => (
          <Layout>
            <GenerateContent />
          </Layout>
        )}
      </Route>
      <Route path="/trending-ai-picks">
        {() => (
          <Layout>
            <TrendingAIPicks />
          </Layout>
        )}
      </Route>
      
      {/* Content management */}
      <Route path="/content-history">
        {() => (
          <Layout>
            <EnhancedContentHistory />
          </Layout>
        )}
      </Route>
      <Route path="/trend-history">
        {() => (
          <Layout>
            <TrendHistory />
          </Layout>
        )}
      </Route>
      
      {/* Settings */}
      <Route path="/compliance">
        {() => (
          <Layout>
            <CompliancePage />
          </Layout>
        )}
      </Route>
      <Route path="/account">
        {() => (
          <Layout>
            <Account />
          </Layout>
        )}
      </Route>
      
      {/* Support pages */}
      <Route path="/how-it-works">
        {() => (
          <Layout>
            <HowItWorksPage />
          </Layout>
        )}
      </Route>
      <Route path="/about">
        {() => (
          <Layout>
            <AboutPage />
          </Layout>
        )}
      </Route>
      <Route path="/faq">
        {() => (
          <Layout>
            <FAQPage />
          </Layout>
        )}
      </Route>
      <Route path="/contact">
        {() => (
          <Layout>
            <ContactPage />
          </Layout>
        )}
      </Route>
      <Route path="/privacy">
        {() => (
          <Layout>
            <PrivacyPolicyPage />
          </Layout>
        )}
      </Route>
      <Route path="/terms">
        {() => (
          <Layout>
            <TermsPage />
          </Layout>
        )}
      </Route>
      
      {/* New Legal Pages */}
      <Route path="/terms-billing">
        {() => (
          <Layout>
            <TermsBillingPage />
          </Layout>
        )}
      </Route>
      <Route path="/privacy-cookies">
        {() => (
          <Layout>
            <PrivacyCookiesPage />
          </Layout>
        )}
      </Route>
      <Route path="/cookie-preferences">
        {() => (
          <Layout>
            <CookiePreferencesPage />
          </Layout>
        )}
      </Route>
      <Route path="/legal-notices">
        {() => (
          <Layout>
            <LegalNoticesPage />
          </Layout>
        )}
      </Route>
      <Route path="/trust-safety">
        {() => (
          <Layout>
            <TrustSafetyPage />
          </Layout>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        {() => (
          <Layout>
            <NotFound />
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics and scraper console when app loads
  useEffect(() => {
    // Verify required environment variable is present for GA
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
      console.info('Add your GA Measurement ID to Replit Secrets with key VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
    
    // Initialize the scraper console for developer tools
    initScraperConsole();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
