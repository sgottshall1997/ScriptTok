import React from 'react';
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
    </>
  );
};

export default ApiIntegrationHubPage;