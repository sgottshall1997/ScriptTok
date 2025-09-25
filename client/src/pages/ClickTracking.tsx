import React from 'react';
import { ClickTrackingDashboard } from '@/components/ClickTrackingDashboard';
import AboutThisPage from '@/components/AboutThisPage';

export default function ClickTracking() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Click Tracking Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and analyze your affiliate link performance across all platforms
        </p>
      </div>
      
      <ClickTrackingDashboard />
      
      <AboutThisPage 
        title="Click Tracking Dashboard"
        whatItDoes="Comprehensive affiliate link performance monitoring system. Tracks clicks, conversions, and revenue across all platforms and content pieces. Provides detailed analytics on which links perform best and helps optimize your monetization strategy."
        setupRequirements={[
          "Affiliate links must be properly configured in the system",
          "Click tracking pixels need to be embedded in your content",
          "Revenue tracking requires affiliate program integration"
        ]}
        usageInstructions={[
          "View real-time click metrics and performance data",
          "Filter by date ranges, platforms, or specific content pieces",
          "Analyze conversion rates and revenue per click",
          "Identify top-performing links and content types",
          "Export data for external analysis and reporting",
          "Set up alerts for significant performance changes"
        ]}
        relatedLinks={[
          {name: "Performance Analytics", path: "/performance-analytics"},
          {name: "Product Research", path: "/product-research"},
          {name: "Content History", path: "/content-history"}
        ]}
        notes={[
          "Click data updates in real-time as users interact with your content",
          "Revenue tracking requires proper affiliate program API integration",
          "Historical data helps identify seasonal trends and optimal posting times",
          "Click tracking respects user privacy and follows applicable regulations"
        ]}
      />
    </div>
  );
}