import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Crown, Settings, ArrowRight, Check, X, Zap } from 'lucide-react';
import { TierBadge } from '@/components/TierBadge';
import { UsageProgress } from '@/components/UsageProgress';
import { useUsageData } from '@/hooks/useUsageData';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function Account() {
  const { data: usageResponse, isLoading: usageLoading } = useUsageData();
  const { toast } = useToast();
  
  const usageData = usageResponse?.data;

  const createCheckoutMutation = useMutation({
    mutationFn: async ({ tier, billingPeriod }: { tier: string; billingPeriod: 'monthly' | 'annual' }) => {
      const response = await apiRequest('POST', '/api/billing/create-checkout', { tier, billingPeriod });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create checkout session',
        variant: 'destructive'
      });
    }
  });

  const getTierPricing = (tier: string) => {
    const pricing: Record<string, { monthly: number; annual: number }> = {
      starter: { monthly: 7, annual: 5 },
      creator: { monthly: 15, annual: 10 },
      pro: { monthly: 35, annual: 25 },
      agency: { monthly: 69, annual: 50 }
    };
    return pricing[tier] || pricing.starter;
  };

  const getNextTier = (currentTier: string) => {
    const tiers = ['starter', 'creator', 'pro', 'agency'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getPreviousTier = (currentTier: string) => {
    const tiers = ['starter', 'creator', 'pro', 'agency'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex > 0 ? tiers[currentIndex - 1] : null;
  };

  const handleUpgrade = (tier: string) => {
    createCheckoutMutation.mutate({ tier, billingPeriod: 'monthly' });
  };

  if (usageLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load account data</p>
      </div>
    );
  }

  const currentTier = usageData.features.tier;
  const nextTier = getNextTier(currentTier);
  const previousTier = getPreviousTier(currentTier);
  const pricing = getTierPricing(currentTier);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and view usage statistics
          </p>
        </div>
        <TierBadge tier={currentTier} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
              <TierBadge tier={currentTier} size="lg" />
              <div>
                <p className="text-2xl font-bold">${pricing.monthly}/month</p>
                <p className="text-sm text-muted-foreground">
                  or ${pricing.annual}/month (annual)
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {nextTier && (
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => handleUpgrade(nextTier)}
                  disabled={createCheckoutMutation.isPending}
                  data-testid="button-upgrade"
                >
                  {createCheckoutMutation.isPending ? (
                    'Processing...'
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Upgrade to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
                    </>
                  )}
                </Button>
              )}
              
              {currentTier === 'agency' && (
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:sales@pheme.com">
                    Contact Sales for Enterprise
                  </a>
                </Button>
              )}

              <Link href="/pricing">
                <Button variant="outline" className="w-full" data-testid="button-view-plans">
                  <Settings className="h-4 w-4 mr-2" />
                  View All Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
            <CardDescription>
              Current billing period: {usageData.usage.periodMonth}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <UsageProgress
              used={usageData.usage.gptGenerationsUsed}
              limit={usageData.limits.gpt}
              label="GPT-4 Generations"
            />
            
            <UsageProgress
              used={usageData.usage.claudeGenerationsUsed}
              limit={usageData.limits.claude}
              label="Claude Generations"
            />
            
            <UsageProgress
              used={usageData.usage.trendAnalysesUsed}
              limit={usageData.limits.trends}
              label="Trend Analyses"
            />

            {(usageData.remaining.gpt < 5 || usageData.remaining.claude < 5 || usageData.remaining.trends < 5) && nextTier && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  ⚠️ You're running low on generations
                </p>
                <p className="text-xs text-yellow-700 mb-3">
                  Upgrade to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} for more capacity
                </p>
                <Button 
                  size="sm" 
                  onClick={() => handleUpgrade(nextTier)}
                  disabled={createCheckoutMutation.isPending}
                >
                  Upgrade Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access</CardTitle>
          <CardDescription>
            Features available in your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureItem
              label="Viral Score Type"
              value={usageData.features.viralScoreType}
              enabled={true}
            />
            
            <FeatureItem
              label="Bulk Generation"
              value={usageData.features.canBulkGenerate ? `Up to ${usageData.features.bulkGenerationLimit} items` : 'Not available'}
              enabled={usageData.features.canBulkGenerate}
            />
            
            <FeatureItem
              label="Templates"
              value={`${usageData.features.templatesUnlocked} templates`}
              enabled={true}
            />
            
            <FeatureItem
              label="Niches"
              value={`${usageData.features.unlockedNiches.length} niches`}
              enabled={true}
            />
            
            <FeatureItem
              label="History Limit"
              value={usageData.features.historyLimit === 999999 ? 'Unlimited' : `${usageData.features.historyLimit} items`}
              enabled={true}
            />
            
            <FeatureItem
              label="Content Export"
              value={usageData.features.canExportContent ? 'Enabled' : 'Not available'}
              enabled={usageData.features.canExportContent}
            />
            
            <FeatureItem
              label="Trend Forecasting"
              value={usageData.features.trendForecastingLevel || 'None'}
              enabled={usageData.features.trendForecastingLevel !== 'none'}
            />
            
            <FeatureItem
              label="Affiliate Studio"
              value={usageData.features.canAccessAffiliate ? 'Enabled' : 'Not available'}
              enabled={usageData.features.canAccessAffiliate}
            />
            
            <FeatureItem
              label="API Access"
              value={usageData.features.canUseAPI ? 'Enabled' : 'Not available'}
              enabled={usageData.features.canUseAPI}
            />
            
            <FeatureItem
              label="Team Seats"
              value={`${usageData.features.teamSeats} seat${usageData.features.teamSeats > 1 ? 's' : ''}`}
              enabled={true}
            />
            
            <FeatureItem
              label="Brand Templates"
              value={usageData.features.canUseBrandTemplates ? 'Enabled' : 'Not available'}
              enabled={usageData.features.canUseBrandTemplates}
            />
          </div>

          {nextTier && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                🚀 Want more features?
              </p>
              <p className="text-xs text-blue-700 mb-3">
                Upgrade to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} to unlock additional capabilities
              </p>
              <Link href="/pricing">
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Compare Plans <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureItem({ label, value, enabled }: { label: string; value: string; enabled: boolean }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200" data-testid={`feature-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      {enabled ? (
        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
      ) : (
        <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className={`text-xs ${enabled ? 'text-gray-600' : 'text-gray-400'} truncate`}>
          {value}
        </p>
      </div>
    </div>
  );
}