import React from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

import Dashboard from "@/pages/Dashboard";
import MyContentHistory from "@/pages/MyContentHistory";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import TemplateExplorerPage from "@/pages/template-explorer";
import AboutPage from "@/pages/about";
import HowItWorksPage from "@/pages/how-it-works";
import FAQPage from "@/pages/faq";
import PrivacyPolicyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import ContactPage from "@/pages/contact";
import AIModelTestPage from "@/pages/ai-model-test";
import ClaudeGeneratorPage from "@/pages/claude-generator";
import ContentCalendarPage from "@/pages/content-calendar";
import CompetitiveAnalysisPage from "@/pages/competitive-analysis";
import ExportImportPage from "@/pages/export-import";
import PlatformPreviewPage from "@/pages/platform-preview";
import PerformanceTrackerPage from "@/pages/performance-tracker";
import AiModelConfigPage from "@/pages/ai-model-config";
import EmojiHashtagTestPage from "@/pages/emoji-hashtag-test";
import ApiIntegrationHubPage from "@/pages/api-integration-hub";
import WebhookSettings from "@/pages/WebhookSettings";
import GenerateContent from "@/pages/GenerateContent";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { initScraperConsole } from "./lib/scraperConsole";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      {/* Dashboard as the landing page */}
      <Route path="/" component={Dashboard} />
      <Route path="/home" component={Home} />
      <Route path="/generate" component={GenerateContent} />
      <Route path="/dashboard" component={Dashboard} />

      <Route path="/templates" component={TemplateExplorerPage} />
      <Route path="/history" component={MyContentHistory} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      {/* Static pages */}
      <Route path="/about" component={AboutPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/ai-model-test" component={AIModelTestPage} />
      <Route path="/claude-generator" component={ClaudeGeneratorPage} />
      <Route path="/content-calendar" component={ContentCalendarPage} />
      <Route path="/competitive-analysis" component={CompetitiveAnalysisPage} />
      <Route path="/export-import" component={ExportImportPage} />
      <Route path="/platform-preview" component={PlatformPreviewPage} />
      <Route path="/performance-tracker" component={PerformanceTrackerPage} />
      <Route path="/ai-model-config" component={AiModelConfigPage} />
      <Route path="/emoji-hashtag-test" component={EmojiHashtagTestPage} />
      <Route path="/api-integration-hub" component={ApiIntegrationHubPage} />
      <Route path="/webhook-settings" component={WebhookSettings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
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
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Router />
          </div>
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
