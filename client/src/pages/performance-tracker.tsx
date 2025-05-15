import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import ContentPerformanceTracker from '@/components/ContentPerformanceTracker';

export default function PerformanceTrackerPage() {
  return (
    <>
      <Helmet>
        <title>Content Performance Tracker | GlowBot</title>
        <meta name="description" content="Track and analyze the performance of your content across different platforms, niches, and time periods." />
      </Helmet>
      <Navbar />
      <main>
        <ContentPerformanceTracker />
      </main>
    </>
  );
}