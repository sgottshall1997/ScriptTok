import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import MultiPlatformPreview from '@/components/MultiPlatformPreview';

export default function PlatformPreviewPage() {
  return (
    <>
      <Helmet>
        <title>Multi-Platform Preview | GlowBot</title>
        <meta name="description" content="Preview how your content will look across different social media platforms and generate platform-specific optimized versions." />
      </Helmet>
      <Navbar />
      <main>
        <MultiPlatformPreview />
      </main>
    </>
  );
}