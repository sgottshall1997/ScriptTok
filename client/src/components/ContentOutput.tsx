import { FC, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { GenerationResponse } from "@/lib/types";

interface ContentOutputProps {
  content: GenerationResponse | null;
}

const ContentOutput: FC<ContentOutputProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopy = () => {
    if (contentRef.current) {
      // Get text content without HTML tags
      const textToCopy = contentRef.current.innerText;
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast({
            title: "Copied to clipboard",
            description: "Content has been copied to your clipboard"
          });
        })
        .catch((err) => {
          toast({
            title: "Copy failed",
            description: "Could not copy content to clipboard",
            variant: "destructive"
          });
          console.error("Copy failed", err);
        });
    }
  };

  const handleDownload = () => {
    if (!content) return;
    
    // Create text file
    const element = document.createElement("a");
    const file = new Blob([contentRef.current?.innerText || ""], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    
    // Clean up product name for filename
    const filename = content.product.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    element.download = `${filename}_${content.templateType}.txt`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded",
      description: "Content has been downloaded as a text file"
    });
  };

  return (
    <Card className="shadow-xl bg-white/80 backdrop-blur-sm border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg border-b border-neutral-200 py-5 flex justify-between items-center">
        <div>
          <CardTitle className="text-gradient bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-xl">Generated Content</CardTitle>
          <p className="text-sm text-gray-700">Your AI-generated content for beauty affiliate marketing</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!content}
            title="Copy to clipboard"
            className="hover:bg-blue-50 border-blue-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!content}
            title="Download as text"
            className="hover:bg-violet-50 border-violet-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
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
                
                {/* Status message */}
                {content.videoDuration.seconds < 30 && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-amber-800 text-sm font-medium">Content is shorter than the target range</p>
                      <p className="text-amber-700 text-xs mt-1">Consider adding more details or choosing a different template to reach the minimum 30-second target for effective social media videos.</p>
                    </div>
                  </div>
                )}
                {content.videoDuration.seconds > 60 && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-amber-800 text-sm font-medium">Content exceeds the target range</p>
                      <p className="text-amber-700 text-xs mt-1">Consider shortening or editing for optimal social media performance. Most effective short-form videos stay under 60 seconds.</p>
                    </div>
                  </div>
                )}
                {content.videoDuration.seconds >= 30 && content.videoDuration.seconds <= 60 && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-green-800 text-sm font-medium">Perfect video length!</p>
                      <p className="text-green-700 text-xs mt-1">This content is optimized for 30-60 second social media videos, the ideal length for engagement and audience retention.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div
          ref={contentRef}
          className="min-h-[300px] prose prose-sm max-w-none content-output bg-white p-5 rounded-lg border border-gray-100 shadow-inner"
        >
          {content ? (
            // Render HTML content safely
            <div>
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
            
            {/* Simple estimated video length display */}
            {content.videoDuration && (
              <div className="mt-6 text-gray-600 text-base italic flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Estimated Video Length: <strong>{content.videoDuration.seconds} seconds</strong></span>
              </div>
            )}
          </div>
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
      </CardContent>
    </Card>
  );
};

export default ContentOutput;
