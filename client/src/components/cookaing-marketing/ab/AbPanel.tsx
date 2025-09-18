import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, TrendingUp, Mail, MousePointer } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AbTestSummary {
  campaignId: number;
  abTestId: number | null;
  variantA: {
    sends: number;
    delivered: number;
    opens: number;
    clicks: number;
    openRate: number;
    clickRate: number;
  };
  variantB: {
    sends: number;
    delivered: number;
    opens: number;
    clicks: number;
    openRate: number;
    clickRate: number;
  };
  pValues: {
    openRate: number | null;
    clickRate: number | null;
  };
  winner: "A" | "B" | null;
  autoModeEnabled: boolean;
}

interface AbPanelProps {
  campaignId: string;
}

const AbPanel = ({ campaignId }: AbPanelProps) => {
  const { toast } = useToast();
  const [isRecomputing, setIsRecomputing] = useState(false);

  // Fetch A/B test summary for the campaign
  const { data: abSummary, isLoading, refetch } = useQuery<AbTestSummary>({
    queryKey: ['/api/cookaing-marketing/ab/summary', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/cookaing-marketing/ab/summary?campaignId=${campaignId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch A/B test summary');
      }
      return response.json();
    },
    retry: false,
  });

  // Mutation for recomputing A/B test winner
  const recomputeMutation = useMutation({
    mutationFn: async () => {
      if (!abSummary?.abTestId) {
        throw new Error('No A/B test found for this campaign');
      }
      const response = await apiRequest('POST', '/api/cookaing-marketing/ab/decide', {
        testId: abSummary.abTestId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "A/B test winner recomputed successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to recompute A/B test",
        variant: "destructive",
      });
    },
  });

  // Mutation for toggling auto mode
  const autoModeMutation = useMutation({
    mutationFn: async (autoModeEnabled: boolean) => {
      const response = await apiRequest('PATCH', '/api/cookaing-marketing/ab/auto', {
        campaignId: Number(campaignId),
        autoModeEnabled
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Auto mode setting updated successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update auto mode",
        variant: "destructive",
      });
    },
  });

  const handleRecompute = async () => {
    setIsRecomputing(true);
    try {
      await recomputeMutation.mutateAsync();
    } finally {
      setIsRecomputing(false);
    }
  };

  const handleAutoModeToggle = (checked: boolean) => {
    autoModeMutation.mutate(checked);
  };

  const getVariantCard = (variant: "A" | "B", data: AbTestSummary["variantA"]) => {
    const isWinner = abSummary?.winner === variant;
    const hasSignificantData = data.sends > 0;

    return (
      <Card className={`relative ${isWinner ? 'ring-2 ring-green-500' : ''}`} data-testid={`card-variant-${variant}`}>
        {isWinner && (
          <Badge className="absolute -top-2 -right-2 bg-green-500" data-testid={`badge-winner-${variant}`}>
            Winner
          </Badge>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Variant {variant}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sends</p>
                <p className="font-semibold" data-testid={`stat-sends-${variant}`}>{data.sends}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="font-semibold" data-testid={`stat-delivered-${variant}`}>{data.delivered}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Opens</p>
              <p className="font-semibold" data-testid={`stat-opens-${variant}`}>{data.opens}</p>
              <p className="text-xs text-muted-foreground" data-testid={`stat-open-rate-${variant}`}>
                {hasSignificantData ? `${(data.openRate * 100).toFixed(1)}%` : "0%"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clicks</p>
              <p className="font-semibold" data-testid={`stat-clicks-${variant}`}>{data.clicks}</p>
              <p className="text-xs text-muted-foreground" data-testid={`stat-click-rate-${variant}`}>
                {hasSignificantData ? `${(data.clickRate * 100).toFixed(1)}%` : "0%"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card data-testid="card-ab-panel">
        <CardHeader>
          <CardTitle>A/B Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-48" />
        </CardContent>
      </Card>
    );
  }

  if (!abSummary?.abTestId) {
    return (
      <Card data-testid="card-ab-panel">
        <CardHeader>
          <CardTitle>A/B Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No A/B Test Configured</h3>
            <p className="text-muted-foreground">
              Set up an A/B test for this campaign to start testing different variants.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasSignificantSampleSize = (abSummary.variantA.sends + abSummary.variantB.sends) >= 100;
  const pValueSignificant = abSummary.pValues.openRate !== null && abSummary.pValues.openRate < 0.05;

  return (
    <Card data-testid="card-ab-panel">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          A/B Testing
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecompute}
            disabled={isRecomputing || recomputeMutation.isPending}
            data-testid="button-recompute"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRecomputing || recomputeMutation.isPending ? 'animate-spin' : ''}`} />
            Recompute Now
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Variant Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getVariantCard("A", abSummary.variantA)}
          {getVariantCard("B", abSummary.variantB)}
        </div>

        {/* Statistical Significance */}
        <div className="space-y-2">
          <h4 className="font-semibold">Statistical Significance</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Open Rate p-value:</span>
              <span className="ml-2 font-mono" data-testid="stat-p-value-open">
                {abSummary.pValues.openRate !== null ? abSummary.pValues.openRate.toFixed(3) : "N/A"}
              </span>
              {abSummary.pValues.openRate !== null && (
                <Badge 
                  variant={abSummary.pValues.openRate < 0.05 ? "default" : "secondary"} 
                  className="ml-2"
                  data-testid="badge-significance-open"
                >
                  {abSummary.pValues.openRate < 0.05 ? "Significant" : "Not Significant"}
                </Badge>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Click Rate p-value:</span>
              <span className="ml-2 font-mono" data-testid="stat-p-value-click">
                {abSummary.pValues.clickRate !== null ? abSummary.pValues.clickRate.toFixed(3) : "N/A"}
              </span>
              {abSummary.pValues.clickRate !== null && (
                <Badge 
                  variant={abSummary.pValues.clickRate < 0.05 ? "default" : "secondary"} 
                  className="ml-2"
                  data-testid="badge-significance-click"
                >
                  {abSummary.pValues.clickRate < 0.05 ? "Significant" : "Not Significant"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Auto Mode Setting */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-semibold">Use winner automatically for future sends</h4>
            <p className="text-sm text-muted-foreground">
              {abSummary.autoModeEnabled && abSummary.winner
                ? `Variant ${abSummary.winner} will be used for future sends`
                : "When enabled, the winning variant will be used automatically"
              }
            </p>
          </div>
          <Switch
            checked={abSummary.autoModeEnabled}
            onCheckedChange={handleAutoModeToggle}
            disabled={autoModeMutation.isPending}
            data-testid="switch-auto-mode"
          />
        </div>

        {/* Sample Size Warning */}
        {!hasSignificantSampleSize && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Sample size too small:</strong> Need at least 100 total sends for reliable statistical analysis.
              Current: {abSummary.variantA.sends + abSummary.variantB.sends} sends
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AbPanel;