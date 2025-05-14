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
    <Card>
      <CardHeader className="border-b border-neutral-200 py-5 flex justify-between items-center">
        <div>
          <CardTitle className="text-lg font-semibold">Generated Content</CardTitle>
          <p className="text-sm text-muted-foreground">Your AI-generated content appears here</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!content}
            title="Copy to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!content}
            title="Download as text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div
          ref={contentRef}
          className="min-h-[250px] prose prose-sm max-w-none content-output"
        >
          {content ? (
            // Render HTML content safely
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          ) : (
            // Empty state
            <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-300 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Generated content will appear here</p>
              <p className="text-xs mt-2">Enter a product name and click "Generate Content" to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentOutput;
