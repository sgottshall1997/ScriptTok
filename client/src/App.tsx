import React, { useEffect } from 'react';
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

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
  // Track page views when routes change
  useAnalytics();
  
  return <MainAppRouter />;
}

function MainAppRouter() {
  return (
    <Switch>
      {/* Landing page without layout */}
      <Route path="/" component={LandingPage} />
      
      {/* App pages with layout */}
      <Route>
        {(params) => (
          <Layout>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              
              {/* Core content generation functionality */}
              <Route path="/generate" component={GenerateContent} />
              <Route path="/niche/:niche" component={GenerateContent} />
              <Route path="/trending-ai-picks" component={TrendingAIPicks} />
              
              {/* Content management */}
              <Route path="/content-history" component={EnhancedContentHistory} />
              <Route path="/trend-history" component={TrendHistory} />
              {/* <Route path="/affiliate-links" component={AffiliateLinks} /> */} {/* DISABLED: Amazon Associates functionality disabled */}
              
              {/* Settings */}
              <Route path="/compliance" component={CompliancePage} />
              <Route path="/account" component={Account} />
              
              {/* Support pages */}
              <Route path="/how-it-works" component={HowItWorksPage} />
              <Route path="/about" component={AboutPage} />
              <Route path="/faq" component={FAQPage} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/privacy" component={PrivacyPolicyPage} />
              <Route path="/terms" component={TermsPage} />
              
              {/* New Legal Pages */}
              <Route path="/terms-billing" component={TermsBillingPage} />
              <Route path="/privacy-cookies" component={PrivacyCookiesPage} />
              <Route path="/cookie-preferences" component={CookiePreferencesPage} />
              <Route path="/legal-notices" component={LegalNoticesPage} />
              <Route path="/trust-safety" component={TrustSafetyPage} />
              
              {/* Fallback to 404 */}
              <Route component={NotFound} />
            </Switch>
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
