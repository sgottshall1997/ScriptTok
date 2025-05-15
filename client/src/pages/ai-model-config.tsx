import React from 'react';
import AiModelConfigInterface from '@/components/AiModelConfigInterface';
import { Helmet } from 'react-helmet';

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
    </>
  );
};

export default AiModelConfigPage;