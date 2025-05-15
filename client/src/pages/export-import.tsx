import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import ExportImportSystem from '@/components/ExportImportSystem';

export default function ExportImportPage() {
  return (
    <>
      <Helmet>
        <title>Export & Import | GlowBot</title>
        <meta name="description" content="Export your content in various formats or import existing content to enhance with GlowBot's AI capabilities." />
      </Helmet>
      <Navbar />
      <main>
        <ExportImportSystem />
      </main>
    </>
  );
}