import React, { lazy, Suspense } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import NichePage from "@/pages/niche";
import TemplateExplorerPage from "@/pages/template-explorer";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

// Lazy load static pages
const AboutPage = lazy(() => import('./pages/about'));
const HowItWorksPage = lazy(() => import('./pages/how-it-works'));
const FAQPage = lazy(() => import('./pages/faq'));
const PrivacyPolicyPage = lazy(() => import('./pages/privacy'));
const TermsPage = lazy(() => import('./pages/terms'));
const ContactPage = lazy(() => import('./pages/contact'));

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={() => <NichePage />} />
      <Route path="/dashboard" component={Home} />
      <Route path="/niche/:niche" component={NichePage} />
      <Route path="/templates" component={TemplateExplorerPage} />
      {/* Static pages */}
      <Route path="/about" component={() => React.lazy(() => import('./pages/about'))} />
      <Route path="/how-it-works" component={() => React.lazy(() => import('./pages/how-it-works'))} />
      <Route path="/faq" component={() => React.lazy(() => import('./pages/faq'))} />
      <Route path="/privacy" component={() => React.lazy(() => import('./pages/privacy'))} />
      <Route path="/terms" component={() => React.lazy(() => import('./pages/terms'))} />
      <Route path="/contact" component={() => React.lazy(() => import('./pages/contact'))} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
      console.info('Add your GA Measurement ID to Replit Secrets with key VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
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
