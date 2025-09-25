import React from 'react';
import { Helmet } from 'react-helmet';
import CompetitiveAnalysis from '@/components/CompetitiveAnalysis';
import AboutThisPage from '@/components/AboutThisPage';

export default function CompetitiveAnalysisPage() {
  return (
    <>
      <Helmet>
        <title>Competitive Analysis | GlowBot</title>
        <meta name="description" content="Analyze your content against competitors to identify strengths, weaknesses, and opportunities for improvement." />
      </Helmet>
      <main>
        <CompetitiveAnalysis />
        <AboutThisPage 
          title="Competitive Analysis"
          whatItDoes="Advanced competitive intelligence and content analysis tool. Compare your content strategy against competitors, identify market gaps, analyze trending content patterns, and discover opportunities for differentiation. Features automated competitor tracking and performance benchmarking."
          setupRequirements={[
            "Identify primary competitors in your niche",
            "Set up competitor social media accounts for monitoring",
            "Define key performance metrics for comparison"
          ]}
          usageInstructions={[
            "Enter competitor names or social media handles",
            "Select analysis parameters (engagement, content types, posting frequency)",
            "Review competitor content performance and trends",
            "Identify content gaps and opportunities in your niche",
            "Analyze successful competitor content patterns",
            "Export insights for strategic planning and content ideation"
          ]}
          relatedLinks={[
            {name: "Trending AI Picks", path: "/trending-ai-picks"},
            {name: "Content Calendar", path: "/content-calendar"},
            {name: "Performance Analytics", path: "/performance-analytics"}
          ]}
          notes={[
            "Analysis updates automatically as new competitor content is published",
            "Performance benchmarking helps set realistic growth targets",
            "Content gap analysis reveals untapped market opportunities",
            "Trend identification enables proactive content strategy",
            "Competitor insights inform both content creation and positioning"
          ]}
        />
      </main>
    </>
  );
}