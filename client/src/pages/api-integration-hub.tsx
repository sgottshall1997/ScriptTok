import React from 'react';
import AboutThisPage from '@/components/AboutThisPage';
import { Helmet } from "react-helmet";
import ApiIntegrationHub from "@/components/ApiIntegrationHub";

const ApiIntegrationHubPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>API Integration Hub - GlowBot Content Engine</title>
        <meta
          name="description"
          content="Connect and manage your social media platforms and publishing integrations with GlowBot Content Engine's API Integration Hub."
        />
        {/* Open Graph tags */}
        <meta property="og:title" content="API Integration Hub - GlowBot Content Engine" />
        <meta property="og:description" content="Connect social media platforms and publishing tools with GlowBot Content Engine" />
        <meta property="og:type" content="website" />
      </Helmet>
      <ApiIntegrationHub />
      
      <AboutThisPage 
        title="API Integration Hub"
        whatItDoes="Central hub for connecting and managing integrations with social media platforms, publishing tools, and external APIs. Streamlines authentication, configuration, and monitoring of all third-party connections for seamless content distribution and automation."
        setupRequirements={[
          "API credentials for platforms you want to connect",
          "Understanding of OAuth authentication processes",
          "Knowledge of platform-specific posting requirements",
          "Active accounts on social media platforms for integration"
        ]}
        usageInstructions={[
          "Browse available integrations by category (Social Media, Analytics, Publishing)",
          "Follow authentication flows to connect your accounts",
          "Configure posting preferences and automation settings",
          "Test connections to ensure proper functionality",
          "Monitor integration status and manage permissions",
          "Troubleshoot connection issues through diagnostic tools"
        ]}
        relatedLinks={[
          {name: "Cross-Platform Scheduling", path: "/cross-platform-scheduling"},
          {name: "Webhook Settings", path: "/webhook-settings"},
          {name: "Performance Analytics", path: "/performance-analytics"},
          {name: "How It Works", path: "/how-it-works"}
        ]}
        notes={[
          "Secure OAuth authentication protects your account credentials",
          "Integration status monitoring ensures reliable content distribution",
          "Platform-specific optimizations improve posting success rates",
          "Regular connection testing prevents publishing failures",
          "Centralized management simplifies multi-platform workflows"
        ]}
      />
    </>
  );
};

export default ApiIntegrationHubPage;