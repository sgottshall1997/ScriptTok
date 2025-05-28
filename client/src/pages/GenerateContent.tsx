import { FC, useState } from 'react';
import ContentGenerator from '@/components/ContentGenerator';
import MultiPlatformContentOutput from '@/components/MultiPlatformContentOutput';
import { GenerationResponse } from '@/lib/types';

const GenerateContent: FC = () => {
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isMultiPlatform, setIsMultiPlatform] = useState(false);

  const handleGenerate = (content: any) => {
    console.log('Generated content received:', content);
    setGeneratedContent(content);
    
    // Check if this is multi-platform content
    if (content.platformContent && content.metadata) {
      setIsMultiPlatform(true);
    } else {
      setIsMultiPlatform(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Content Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Create optimized, multi-platform content with AI intelligence
          </p>
        </div>

        {/* Content Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ContentGenerator 
              onGenerate={handleGenerate}
              scrollToTopOnGenerate={false}
            />
          </div>
          
          {/* Generated Content Display */}
          <div>
            {generatedContent ? (
              <div>
                {isMultiPlatform ? (
                  <MultiPlatformContentOutput data={generatedContent} />
                ) : (
                  <div className="bg-white rounded-lg shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Generated Content
                    </h3>
                    <div className="prose max-w-none">
                      {JSON.stringify(generatedContent, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No content generated yet
                  </h3>
                  <p className="text-gray-500">
                    Fill out the form and click "Generate Content" to see your AI-powered content here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateContent;