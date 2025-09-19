import React, { useEffect } from 'react';
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { Switch, Route, Redirect } from "wouter";
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
import CookAIngSegments from "@/pages/cookaing-marketing/segments";
import CookAIngExperiments from "@/pages/cookaing-marketing/experiments";
import CookAIngPersonalization from "@/pages/cookaing-marketing/personalization";
import CookAIngSubmissions from "@/pages/cookaing-marketing/submissions";
import CookAIngTrends from "@/pages/cookaing-marketing/trends";
import CookAIngReports from "@/pages/cookaing-marketing/reports";
import CookAIngCosts from "@/pages/cookaing-marketing/costs";
import CookAIngAttribution from "@/pages/cookaing-marketing/attribution";
import CookAIngWebhooks from "@/pages/cookaing-marketing/webhooks";
import CookAIngEmailTest from "@/pages/cookaing-marketing/email-test";
import CookAIngDevTools from "@/pages/cookaing-marketing/devtools";
import PublicForm from "@/pages/public-form";

// CookAIng Mode components
import CookAIngLayout from "@/cookaing-marketing/layouts/CookAIngLayout";
import CookAIngRouter from "@/components/CookAIngRouter";

import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { initScraperConsole } from "./lib/scraperConsole";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      {/* CookAIng Mode - Separate routing namespace (no main layout) */}
      <Route path="/cookaing" nest>
        <CookAIngRouter />
      </Route>
      
      {/* All other routes wrapped in main Layout */}
      <Route path="*">
        <Layout>
          <MainAppRouter />
        </Layout>
      </Route>
    </Switch>
  );
}

function MainAppRouter() {
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
      
      {/* Router guards - redirect /cookaing-marketing/* to /cookaing/* for CookAIng layout adoption */}
      <Route path="/cookaing-marketing" component={() => <Redirect to="/cookaing/cookaing-marketing" />} />
      <Route path="/cookaing-marketing/organizations" component={() => <Redirect to="/cookaing/organizations" />} />
      <Route path="/cookaing-marketing/contacts" component={() => <Redirect to="/cookaing/contacts" />} />
      <Route path="/cookaing-marketing/segments" component={() => <Redirect to="/cookaing/segments" />} />
      <Route path="/cookaing-marketing/campaigns" component={() => <Redirect to="/cookaing/campaigns" />} />
      <Route path="/cookaing-marketing/experiments" component={() => <Redirect to="/cookaing/experiments" />} />
      <Route path="/cookaing-marketing/workflows" component={() => <Redirect to="/cookaing/workflows" />} />
      <Route path="/cookaing-marketing/personalization" component={() => <Redirect to="/cookaing/personalization" />} />
      <Route path="/cookaing-marketing/forms" component={() => <Redirect to="/cookaing/forms" />} />
      <Route path="/cookaing-marketing/submissions" component={() => <Redirect to="/cookaing/submissions" />} />
      <Route path="/cookaing-marketing/affiliate-products" component={() => <Redirect to="/cookaing/affiliate-products" />} />
      <Route path="/cookaing-marketing/trends" component={() => <Redirect to="/cookaing/trends" />} />
      <Route path="/cookaing-marketing/reports" component={() => <Redirect to="/cookaing/reports" />} />
      <Route path="/cookaing-marketing/costs" component={() => <Redirect to="/cookaing/costs" />} />
      <Route path="/cookaing-marketing/attribution" component={() => <Redirect to="/cookaing/attribution" />} />
      <Route path="/cookaing-marketing/integrations-health" component={() => <Redirect to="/cookaing/integrations-health" />} />
      <Route path="/cookaing-marketing/webhooks" component={() => <Redirect to="/cookaing/webhooks" />} />
      <Route path="/cookaing-marketing/email-test" component={() => <Redirect to="/cookaing/email-test" />} />
      <Route path="/cookaing-marketing/devtools" component={() => <Redirect to="/cookaing/devtools" />} />
      <Route path="/cookaing-marketing/content" component={() => <Redirect to="/cookaing/content" />} />
      <Route path="/cookaing-marketing/docs" component={() => <Redirect to="/cookaing/docs" />} />
      
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
