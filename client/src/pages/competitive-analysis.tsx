import React from 'react';
import { Helmet } from 'react-helmet';
import CompetitiveAnalysis from '@/components/CompetitiveAnalysis';

export default function CompetitiveAnalysisPage() {
  return (
    <>
      <Helmet>
        <title>Competitive Analysis | GlowBot</title>
        <meta name="description" content="Analyze your content against competitors to identify strengths, weaknesses, and opportunities for improvement." />
      </Helmet>
      <main>
        <CompetitiveAnalysis />
      </main>
    </>
  );
}