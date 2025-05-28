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
  createdAt: string;
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
      
      {batchMutation.isSuccess && showResults && (
        <div className="space-y-2 p-3 bg-green-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Batch Complete!
            </span>
          </div>
          <div className="text-xs text-green-700">
            Generated {batchMutation.data?.successCount}/{batchMutation.data?.totalNiches} pieces
          </div>
          <div className="text-xs text-green-600">
            Sent to Make.com for scheduling
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyBatchButton;