import { FC, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GenerationResponse } from "@/lib/types";

// Maps niche to a Tailwind color
const getNicheColor = (niche?: string): string => {
  const colorMap: Record<string, string> = {
    skincare: 'pink',
    tech: 'blue',
    fashion: 'purple',
    fitness: 'green',
    food: 'orange',
    travel: 'sky',
    pet: 'amber'
  };
  return niche && colorMap[niche] ? colorMap[niche] : 'blue';
};

// Format content with niche-specific styling
const getFormattedContent = (content: GenerationResponse): string => {
  if (!content || !content.content) return '';
  
  let formattedContent = content.content;
  const color = getNicheColor(content.niche);
  
  // Add branded intro - could be moved to the server-side
  if (content.niche && content.templateType) {
    const nicheCapitalized = content.niche.charAt(0).toUpperCase() + content.niche.slice(1);
    const template = content.templateType.replace(/_/g, ' ');
    
    // Add a niche-specific intro wrapper
    formattedContent = `<div class="p-3 mb-4 rounded-md bg-${color}-50 border border-${color}-100">
      <p class="text-sm text-${color}-800 font-medium">
        <span class="font-bold">${nicheCapitalized} ${template}</span> content for <span class="font-bold">${content.product}</span>
      </p>
    </div>${formattedContent}`;
  }
  
  return formattedContent;
};

interface ContentOutputProps {
  content: GenerationResponse | null;
}

const ContentOutput: FC<ContentOutputProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const copyContent = () => {
    if (contentRef.current) {
      const text = contentRef.current.innerText;
      navigator.clipboard.writeText(text);
    }
  };

  // Define niche-specific styling
  const getNicheStyles = (niche?: string) => {
    const styles: Record<string, { bgGradient: string, textGradient: string, icon: JSX.Element }> = {
      skincare: {
        bgGradient: "from-pink-50 to-purple-50",
        textGradient: "from-pink-600 to-purple-600",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20.5l9-5 9 5V3l-9-5-9 5v17.5M3 7.5l9-5m0 0L3 7.5m9-5v17.5" />
          </svg>
        )
      },
      tech: {
        bgGradient: "from-blue-50 to-cyan-50",
        textGradient: "from-blue-600 to-cyan-600",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      },
      fashion: {
        bgGradient: "from-purple-50 to-pink-50",
        textGradient: "from-purple-600 to-pink-600",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      },
      fitness: {
        bgGradient: "from-green-50 to-teal-50",
        textGradient: "from-green-600 to-teal-600",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      food: {
        bgGradient: "from-orange-50 to-yellow-50",
        textGradient: "from-orange-600 to-yellow-600",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        )
      },
      travel: {
        bgGradient: "from-sky-50 to-indigo-50",
        textGradient: "from-sky-600 to-indigo-600",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      },
      pet: {
        bgGradient: "from-amber-50 to-orange-50",
        textGradient: "from-amber-600 to-orange-600",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      }
    };

    const defaultStyle = {
      bgGradient: "from-slate-50 to-slate-50",
      textGradient: "from-blue-600 to-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
      )
    };
    
    return niche && styles[niche] ? styles[niche] : defaultStyle;
  };

  // Get appropriate style based on content niche
  const nicheStyles = getNicheStyles(content?.niche);

  return (
    <Card className="shadow-md">
      <CardHeader className={`bg-gradient-to-r ${nicheStyles.bgGradient} py-4 px-5 border-b flex flex-row items-center`}>
        <div className="flex-1">
          <CardTitle className={`text-xl text-gradient bg-gradient-to-r ${nicheStyles.textGradient} flex items-center`}>
            {content && nicheStyles.icon}
            {content?.niche 
              ? `${content.niche.charAt(0).toUpperCase() + content.niche.slice(1)} Content` 
              : "Generated Content"}
          </CardTitle>
          <p className="text-sm text-gray-600">AI-generated marketing text optimized for {content?.niche || "short videos"}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center text-blue-700 border-blue-200 hover:bg-blue-50" 
            onClick={copyContent}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy Text
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {content && (
          <div className="mb-4">
            {/* Content metadata */}
            <div className="mb-3 p-2 rounded-lg bg-gray-50 border border-gray-200 flex flex-wrap gap-2">
              <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                Product: {content.product}
              </div>
              <div className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium">
                Niche: {content.niche}
              </div>
              <div className="px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-medium">
                Template: {content.templateType}
              </div>
              <div className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-medium">
                Tone: {content.tone}
              </div>
              {content.fromCache && (
                <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                  From Cache
                </div>
              )}
            </div>
            
            {/* Video duration information - Only show if available */}
            {content.videoDuration && (
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-md font-medium text-indigo-900">Video Duration Estimate</h3>
                  <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    Target: 30-60 seconds
                  </span>
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-2 text-sm">
                  <div className={`rounded-lg px-3 py-2 shadow-sm border flex items-center flex-1 ${
                    content.videoDuration.seconds >= 30 && content.videoDuration.seconds <= 60 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${
                      content.videoDuration.seconds >= 30 && content.videoDuration.seconds <= 60
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className={`font-bold ${
                        content.videoDuration.seconds >= 30 && content.videoDuration.seconds <= 60
                          ? 'text-green-700'
                          : 'text-amber-700'
                      }`}>{content.videoDuration.readableTime}</span>
                      <span className="ml-1 text-xs">minutes:seconds</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-indigo-100 flex items-center flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <div>
                      <span className="font-bold text-indigo-700">{content.videoDuration.pacing}</span>
                      <span className="text-gray-600 ml-1 text-xs">speaking pace</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-indigo-100 flex items-center flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <div>
                      <span className="font-bold text-indigo-700">{content.videoDuration.wordCount}</span>
                      <span className="text-gray-600 ml-1 text-xs">word count</span>
                    </div>
                  </div>
                </div>
                
                {/* Dynamic status message based on isIdealLength */}
                <div className={`mt-2 p-3 rounded-lg border flex items-start ${
                  content.videoDuration.isIdealLength 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${
                    content.videoDuration.isIdealLength 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {content.videoDuration.isIdealLength 
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    }
                  </svg>
                  <div>
                    <p className={`text-sm font-medium ${
                      content.videoDuration.isIdealLength 
                        ? 'text-green-800' 
                        : 'text-amber-800'
                    }`}>
                      {content.videoDuration.isIdealLength 
                        ? 'Perfect video length!' 
                        : content.videoDuration.seconds < 30 
                          ? 'Content is shorter than the target range' 
                          : 'Content exceeds the target range'
                      }
                    </p>
                    <p className={`text-xs mt-1 ${
                      content.videoDuration.isIdealLength 
                        ? 'text-green-700' 
                        : 'text-amber-700'
                    }`}>
                      {content.videoDuration.lengthFeedback}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Main content display */}
        <div className="space-y-4">
          <div
            ref={contentRef}
            className={`min-h-[300px] prose prose-sm max-w-none content-output bg-white p-5 rounded-lg border ${content?.niche ? `border-${getNicheColor(content.niche)}-200` : 'border-gray-100'} shadow-inner`}
          >
            {content ? (
              // Render HTML content safely with niche-specific styling
              <div 
                dangerouslySetInnerHTML={{ __html: getFormattedContent(content) }} 
                className={`prose-headings:${getNicheColor(content.niche)}-800`}
              />
            ) : (
              // Empty state
              <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-300 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-lg font-medium text-gray-700">Ready to Create Content</p>
                <p className="text-sm mt-2 text-gray-600">Select a product, template type, and tone, then click "GENERATE CONTENT"</p>
              </div>
            )}
          </div>
          
          {/* Video duration estimate - simple version outside of content */}
          {content && content.videoDuration && (
            <div className="text-center text-gray-600 text-base flex items-center justify-center mt-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Estimated Video Length: <strong>{content.videoDuration.seconds} seconds</strong></span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentOutput;