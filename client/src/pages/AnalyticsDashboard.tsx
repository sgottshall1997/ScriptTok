import React from 'react';
import AnalyticsDashboardComponent from '@/components/AnalyticsDashboard';
import AboutThisPage from '@/components/AboutThisPage';
import { getGlowBotSectionByPath } from '@/lib/glowbot-sections';

const AnalyticsDashboard: React.FC = () => {
  // Get section metadata for this page
  const sectionData = getGlowBotSectionByPath('/analytics');

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      <AnalyticsDashboardComponent />
      
      {/* About This Page */}
      {sectionData && (
        <AboutThisPage
          title={sectionData.name}
          whatItDoes={sectionData.whatItDoes}
          setupRequirements={sectionData.setupRequirements}
          usageInstructions={sectionData.usageInstructions}
          relatedLinks={sectionData.relatedLinks}
          notes={sectionData.notes}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;