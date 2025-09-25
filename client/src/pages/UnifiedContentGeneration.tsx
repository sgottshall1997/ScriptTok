import React from 'react';
import UnifiedContentGenerator from '../components/UnifiedContentGenerator';
import AboutThisPage from '../components/AboutThisPage';
import { getGlowBotSectionByPath } from '../lib/glowbot-sections';

const UnifiedContentGeneration: React.FC = () => {
  // Get section metadata for this page
  const sectionData = getGlowBotSectionByPath('/unified-generator');

  return (
    <div>
      <UnifiedContentGenerator />
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

export default UnifiedContentGeneration;