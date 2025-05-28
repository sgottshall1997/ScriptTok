import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DailyBatchResult {
  niche: string;
  product: string;
  template: string;
  tone: string;
  caption: string;
  script: string;
  platform: string;
  hashtags: string;
  mentions: number;
  affiliateLink?: string;
  finalCaption?: string;
  createdAt: string;
}

// Function to estimate video length based on script word count
function estimateVideoLength(script: string): string {
  const wordCount = script.trim().split(/\s+/).length;
  const wordsPerMinute = 155; // Average speaking pace
  const totalSeconds = Math.round((wordCount / wordsPerMinute) * 60);
  
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  } else {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

interface DailyBatchResponse {
  success: boolean;
  message: string;
  totalNiches: number;
  successCount: number;
  batchId: string;
  generatedAt: string;
  results: DailyBatchResult[];
}

const DailyBatchButton = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showResults, setShowResults] = useState(false);

  const batchMutation = useMutation({
    mutationFn: async (): Promise<DailyBatchResponse> => {
      const response = await fetch('/api/generate/daily-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Daily Batch Generated! 🎉",
        description: `Successfully generated ${data.successCount}/${data.totalNiches} pieces of content and sent to Make.com`,
      });
      setShowResults(true);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/trending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Batch Generation Failed",
        description: error.message || "Failed to generate daily batch content",
        variant: "destructive",
      });
    },
  });

  const handleGenerateBatch = () => {
    setShowResults(false);
    batchMutation.mutate();
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleGenerateBatch}
        disabled={batchMutation.isPending}
        variant="outline"
        className="w-full"
      >
        {batchMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Generate Daily Batch
          </>
        )}
      </Button>
      
      {batchMutation.isPending && (
        <div className="text-xs text-muted-foreground text-center">
          Creating content for all 7 niches...
        </div>
      )}
      
      {batchMutation.isSuccess && showResults && batchMutation.data && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Daily Batch Complete! Generated {batchMutation.data.successCount}/{batchMutation.data.totalAttempted} video scripts
            </span>
          </div>
          
          {batchMutation.data.results && batchMutation.data.results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">📝 Generated Video Scripts (30-45 seconds)</h3>
              <div className="grid gap-4">
                {batchMutation.data.results.map((result: DailyBatchResult, index: number) => (
                  <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {result.niche?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                          {result.platform || 'TikTok'}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          {estimateVideoLength(result.script || '')}
                        </span>
                        {result.mentions && (
                          <span className="text-xs text-gray-500">
                            {result.mentions.toLocaleString()} mentions
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(result.script || '')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Copy Script
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {result.product || 'Trending Product'}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Template: {result.template} • Tone: {result.tone}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">🎬 Video Script:</h5>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {result.script || 'Script content not available'}
                      </p>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Caption:</span> {result.caption || ''}
                      </div>
                      {result.hashtags && (
                        <div className="text-xs text-blue-600 mt-1">
                          {result.hashtags}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyBatchButton;