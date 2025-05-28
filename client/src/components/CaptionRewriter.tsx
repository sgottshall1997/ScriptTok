import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CaptionRewriterProps {
  originalCaption: string;
  outputId: string; // Unique identifier for this specific output
}

export const CaptionRewriter: React.FC<CaptionRewriterProps> = ({ 
  originalCaption, 
  outputId 
}) => {
  const [selectedTone, setSelectedTone] = useState<string>("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenCaption, setRewrittenCaption] = useState<string>("");
  const [showRewrite, setShowRewrite] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const toneOptions = [
    { value: "funny", label: "Funny & Humorous" },
    { value: "serious", label: "Professional & Serious" },
    { value: "clickbaity", label: "Clickbait & Attention-Grabbing" },
    { value: "genZ", label: "Gen Z & Trendy" }
  ];

  const handleRewrite = async () => {
    if (!selectedTone) {
      toast({
        title: "Select a tone",
        description: "Please choose a tone before rewriting the caption.",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);
    
    try {
      const response = await fetch('/api/post/rewrite-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalCaption,
          tone: selectedTone
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRewrittenCaption(data.data.rewrittenCaption);
        setShowRewrite(true);
        toast({
          title: "Caption rewritten!",
          description: `Successfully rewrote caption with ${selectedTone} tone.`,
        });
      } else {
        throw new Error(data.error || "Failed to rewrite caption");
      }
    } catch (error) {
      console.error('Caption rewrite error:', error);
      toast({
        title: "Rewrite failed",
        description: error instanceof Error ? error.message : "Failed to rewrite caption. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rewrittenCaption);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Rewritten caption copied to clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy caption to clipboard.",
        variant: "destructive",
      });
    }
  };

  const resetRewrite = () => {
    setShowRewrite(false);
    setRewrittenCaption("");
    setSelectedTone("");
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Rewrite Caption</h4>
          {showRewrite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetRewrite}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              New Rewrite
            </Button>
          )}
        </div>

        {!showRewrite ? (
          // Original rewrite interface
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose tone style..." />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleRewrite}
              disabled={isRewriting || !selectedTone}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isRewriting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rewrite Caption
                </>
              )}
            </Button>
          </div>
        ) : (
          // Rewritten caption display
          <Card className="bg-white border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-purple-600 font-medium mb-2 uppercase">
                    {toneOptions.find(t => t.value === selectedTone)?.label} Style
                  </div>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {rewrittenCaption}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="ml-3 flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CaptionRewriter;