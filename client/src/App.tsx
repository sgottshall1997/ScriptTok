import React, { useEffect } from 'react';
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Essential Pages for TikTok Viral Product Generator
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import EnhancedContentHistory from "@/pages/EnhancedContentHistory";
import TrendHistory from "@/pages/TrendHistory";
import AboutPage from "@/pages/about";
import FAQPage from "@/pages/faq";
import ContactPage from "@/pages/contact";
import GenerateContent from "@/pages/GenerateContent";
import TrendingAIPicks from "@/pages/TrendingAIPicks";
// import AffiliateLinks from "@/pages/AffiliateLinks"; // DISABLED: Amazon Associates functionality disabled
import Account from "@/pages/Account";
import CompliancePage from "@/pages/CompliancePage";
import HowItWorksPage from "@/pages/how-it-works";
import PricingPage from "@/pages/PricingPage";
import { ValidationDashboard } from "@/components/ValidationDashboard";

// New Legal Pages
import TermsBillingPage from "@/pages/TermsBilling";
import PrivacyCookiesPage from "@/pages/PrivacyCookies";
import CookiePreferencesPage from "@/pages/CookiePreferences";
import LegalNoticesPage from "@/pages/LegalNotices";
import TrustSafetyPage from "@/pages/TrustSafety";

// Feature Pages
import DualStudiosFeature from "@/pages/features/DualStudiosFeature";
import AIScriptGeneratorFeature from "@/pages/features/AIScriptGeneratorFeature";
import TemplateLibraryFeature from "@/pages/features/TemplateLibraryFeature";
import TrendDiscoveryFeature from "@/pages/features/TrendDiscoveryFeature";
import ViralScoreFeature from "@/pages/features/ViralScoreFeature";
import MultiPlatformFeature from "@/pages/features/MultiPlatformFeature";

// Tool Pages
import { 
  TrendDiscoveryTool,
  ScriptGeneratorTool,
  TemplateLibraryTool,
  ViralScoreAnalyzerTool,
  HistoryTool
} from "@/pages/tools";

// Use Cases Page
import UseCasesPage from "@/pages/UseCasesPage";

import Layout from "@/components/Layout";
import MarketingLayout from "@/components/MarketingLayout";
import { initScraperConsole } from "./lib/scraperConsole";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return <MainAppRouter />;
}

function MainAppRouter() {
  return (
    <Switch>
      {/* Landing page with MarketingLayout */}
      <Route path="/">
        <MarketingLayout>
          <LandingPage />
        </MarketingLayout>
      </Route>

      {/* Pricing page with MarketingLayout */}
      <Route path="/pricing">
        <MarketingLayout>
          <PricingPage />
        </MarketingLayout>
      </Route>

      {/* Feature pages with MarketingLayout */}
      <Route path="/features/dual-studios">
        <MarketingLayout>
          <DualStudiosFeature />
        </MarketingLayout>
      </Route>
      <Route path="/features/ai-script-generator">
        <MarketingLayout>
          <AIScriptGeneratorFeature />
        </MarketingLayout>
      </Route>
      <Route path="/features/template-library">
        <MarketingLayout>
          <TemplateLibraryFeature />
        </MarketingLayout>
      </Route>
      <Route path="/features/trend-discovery">
        <MarketingLayout>
          <TrendDiscoveryFeature />
        </MarketingLayout>
      </Route>
      <Route path="/features/viral-score">
        <MarketingLayout>
          <ViralScoreFeature />
        </MarketingLayout>
      </Route>
      <Route path="/features/multi-platform">
        <MarketingLayout>
          <MultiPlatformFeature />
        </MarketingLayout>
      </Route>

      {/* Tool pages with MarketingLayout */}
      <Route path="/tools/trend-discovery">
        <MarketingLayout>
          <TrendDiscoveryTool />
        </MarketingLayout>
      </Route>
      <Route path="/tools/script-generator">
        <MarketingLayout>
          <ScriptGeneratorTool />
        </MarketingLayout>
      </Route>
      <Route path="/tools/template-library">
        <MarketingLayout>
          <TemplateLibraryTool />
        </MarketingLayout>
      </Route>
      <Route path="/tools/viral-score">
        <MarketingLayout>
          <ViralScoreAnalyzerTool />
        </MarketingLayout>
      </Route>
      <Route path="/tools/history">
        <MarketingLayout>
          <HistoryTool />
        </MarketingLayout>
      </Route>

      {/* Use Cases page with MarketingLayout */}
      <Route path="/use-cases">
        <MarketingLayout>
          <UseCasesPage />
        </MarketingLayout>
      </Route>
      
      {/* App pages with Layout */}
      <Route>
        {(params) => (
          <Layout>
            <Switch>
              <Route path="/dashboard">
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Route>
              
              {/* Core content generation functionality */}
              <Route path="/generate">
                <ProtectedRoute>
                  <GenerateContent />
                </ProtectedRoute>
              </Route>
              <Route path="/niche/:niche">
                <ProtectedRoute>
                  <GenerateContent />
                </ProtectedRoute>
              </Route>
              <Route path="/trending-ai-picks" component={TrendingAIPicks} />
              
              {/* Content management */}
              <Route path="/content-history">
                <ProtectedRoute>
                  <EnhancedContentHistory />
                </ProtectedRoute>
              </Route>
              <Route path="/trend-history">
                <ProtectedRoute>
                  <TrendHistory />
                </ProtectedRoute>
              </Route>
              <Route path="/validation">
                <ProtectedRoute>
                  <ValidationDashboard />
                </ProtectedRoute>
              </Route>
              {/* <Route path="/affiliate-links" component={AffiliateLinks} /> */} {/* DISABLED: Amazon Associates functionality disabled */}
              
              {/* Settings */}
              <Route path="/compliance" component={CompliancePage} />
              <Route path="/account">
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              </Route>
              
              {/* Support pages */}
              <Route path="/how-it-works" component={HowItWorksPage} />
              <Route path="/about" component={AboutPage} />
              <Route path="/faq" component={FAQPage} />
              <Route path="/contact" component={ContactPage} />
              
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
