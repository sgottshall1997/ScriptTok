import React from 'react';
import AiModelConfigInterface from '@/components/AiModelConfigInterface';
import { Helmet } from 'react-helmet';
import AboutThisPage from '@/components/AboutThisPage';

const AiModelConfigPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Model Configuration | GlowBot</title>
        <meta 
          name="description" 
          content="Fine-tune AI generation parameters for specific niches, template types, and tones to optimize your content generation" 
        />
      </Helmet>
      <AiModelConfigInterface />
      
      <AboutThisPage 
        title="AI Model Configuration"
        whatItDoes="Advanced AI model fine-tuning interface for optimizing content generation across different niches, templates, and tones. Configure temperature, token limits, and other parameters to achieve optimal content quality for specific use cases."
        setupRequirements={[
          "Administrator access to modify global AI settings",
          "Understanding of AI parameters (temperature, tokens, penalties)",
          "Testing data to validate configuration changes"
        ]}
        usageInstructions={[
          "Select the niche you want to optimize AI settings for",
          "Choose template type and tone combination to configure",
          "Adjust temperature for creativity vs consistency balance",
          "Set max tokens to control content length",
          "Configure frequency and presence penalties for content variety",
          "Test changes using the model test page before applying globally",
          "Save configurations and monitor performance improvements"
        ]}
        relatedLinks={[
          {name: "AI Model Test", path: "/ai-model-test"},
          {name: "Performance Analytics", path: "/performance-analytics"},
          {name: "Generate Content", path: "/niche/all"}
        ]}
        notes={[
          "Configuration changes affect all future content generation for selected criteria",
          "Higher temperature values increase creativity but may reduce consistency",
          "Token limits should be balanced between completeness and efficiency",
          "Regular testing ensures optimal settings as content needs evolve",
          "Changes may take time to show measurable impact in analytics"
        ]}
      />
    </>
  );
};

export default AiModelConfigPage;