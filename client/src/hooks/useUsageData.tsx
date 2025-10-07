import { useQuery } from '@tanstack/react-query';

export interface UsageData {
  usage: {
    gptGenerationsUsed: number;
    claudeGenerationsUsed: number;
    trendAnalysesUsed: number;
    periodMonth: string;
  };
  limits: {
    gpt: number;
    claude: number;
    trends: number;
  };
  features: {
    tier: 'starter' | 'creator' | 'pro' | 'agency';
    viralScoreType: string;
    canBulkGenerate: boolean;
    bulkGenerationLimit: number;
    unlockedNiches: string[];
    historyLimit: number;
    canExportContent: boolean;
    canAccessAffiliate: boolean;
    trendForecastingLevel: string;
    canUseAPI: boolean;
    canUseBrandTemplates: boolean;
    teamSeats: number;
    templatesUnlocked: number;
  };
  remaining: {
    gpt: number;
    claude: number;
    trends: number;
  };
}

export const useUsageData = () => {
  return useQuery<{ success: boolean; data: UsageData }>({
    queryKey: ['/api/billing/usage'],
    refetchOnMount: true,
    staleTime: 0,
  });
};
