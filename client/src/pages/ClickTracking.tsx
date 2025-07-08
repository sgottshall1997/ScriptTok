import React from 'react';
import { ClickTrackingDashboard } from '@/components/ClickTrackingDashboard';

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
    </div>
  );
}