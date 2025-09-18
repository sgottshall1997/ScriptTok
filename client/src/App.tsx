import React, { useEffect } from 'react';
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalComplianceHeader } from "@/components/GlobalComplianceHeader";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

import Dashboard from "@/pages/Dashboard";
import EnhancedContentHistory from "@/pages/EnhancedContentHistory";
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


import AiModelConfigPage from "@/pages/ai-model-config";
import EmojiHashtagTestPage from "@/pages/emoji-hashtag-test";
import ApiIntegrationHubPage from "@/pages/api-integration-hub";
import WebhookSettings from "@/pages/WebhookSettings";
import GenerateContent from "@/pages/GenerateContent";
import UnifiedContentGeneration from "@/pages/UnifiedContentGeneration";
import ClickTracking from "@/pages/ClickTracking";
import BTBStatus from "@/pages/BTBStatus";
import TrendingAIPicks from "@/pages/TrendingAIPicks";
import CrossPlatformScheduling from "@/pages/CrossPlatformScheduling";
import BulkContentGeneration from "@/pages/BulkContentGeneration";
import PerformanceAnalytics from "@/pages/PerformanceAnalytics";
import CompliancePage from "@/pages/CompliancePage";
import SpartanContentPage from "@/pages/SpartanContentPage";
import ScheduleManager from "@/pages/schedule-manager";
import SupportPage from "@/pages/SupportPage";

// CookAIng Marketing Engine pages
import CookAIngMarketingDashboard from "@/pages/cookaing-marketing/index";
import CookAIngOrganizations from "@/pages/cookaing-marketing/organizations";
import CookAIngContacts from "@/pages/cookaing-marketing/contacts";
import CookAIngCampaigns from "@/pages/cookaing-marketing/campaigns";
import CookAIngWorkflows from "@/pages/cookaing-marketing/workflows";
import CookAIngForms from "@/pages/cookaing-marketing/forms";
import CookAIngAffiliateProducts from "@/pages/cookaing-marketing/affiliate-products";
import CookAIngMarketingDocs from "@/pages/cookaing-marketing/docs";
import CookAIngIntegrationsHealth from "@/pages/cookaing-marketing/integrations-health";
import PublicForm from "@/pages/public-form";

import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
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
      <Route path="/unified-generator" component={UnifiedContentGeneration} />
      <Route path="/niche/:niche" component={GenerateContent} />

      <Route path="/dashboard" component={Dashboard} />

      <Route path="/templates" component={TemplateExplorerPage} />
      <Route path="/content-history" component={EnhancedContentHistory} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      {/* Static pages */}
      <Route path="/about" component={AboutPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/ai-model-test" component={AIModelTestPage} />
      <Route path="/claude-generator" component={ClaudeGeneratorPage} />
      <Route path="/content-calendar" component={ContentCalendarPage} />
      <Route path="/competitive-analysis" component={CompetitiveAnalysisPage} />
      <Route path="/export-import" component={ExportImportPage} />


      <Route path="/ai-model-config" component={AiModelConfigPage} />
      <Route path="/emoji-hashtag-test" component={EmojiHashtagTestPage} />
      <Route path="/api-integration-hub" component={ApiIntegrationHubPage} />
      <Route path="/webhook-settings" component={WebhookSettings} />
      <Route path="/click-tracking" component={ClickTracking} />
      <Route path="/btb-status" component={BTBStatus} />
      <Route path="/trending-ai-picks" component={TrendingAIPicks} />
      
      {/* BTB Framework Pages */}
      <Route path="/schedule-manager" component={ScheduleManager} />
      <Route path="/cross-platform-scheduling" component={CrossPlatformScheduling} />
      <Route path="/bulk-content-generation" component={BulkContentGeneration} />
      <Route path="/performance-analytics" component={PerformanceAnalytics} />
      <Route path="/compliance" component={CompliancePage} />
      <Route path="/spartan-generator" component={SpartanContentPage} />
      
      {/* CookAIng Marketing Engine routes */}
      <Route path="/cookaing-marketing" component={CookAIngMarketingDashboard} />
      <Route path="/cookaing-marketing/organizations" component={CookAIngOrganizations} />
      <Route path="/cookaing-marketing/contacts" component={CookAIngContacts} />
      <Route path="/cookaing-marketing/campaigns" component={CookAIngCampaigns} />
      <Route path="/cookaing-marketing/workflows" component={CookAIngWorkflows} />
      <Route path="/cookaing-marketing/forms" component={CookAIngForms} />
      <Route path="/cookaing-marketing/affiliate-products" component={CookAIngAffiliateProducts} />
      <Route path="/cookaing-marketing/docs" component={CookAIngMarketingDocs} />
      <Route path="/cookaing-marketing/integrations-health" component={CookAIngIntegrationsHealth} />
      
      {/* Public form route */}
      <Route path="/forms/:slug" component={PublicForm} />
      
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
        <GlobalComplianceHeader />
        <Layout>
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
