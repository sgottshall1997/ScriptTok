import { useQuery, UseQueryResult } from '@tanstack/react-query';

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
    tier: 'free' | 'starter' | 'creator' | 'pro' | 'agency';
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

export interface UsageResponse {
  success: boolean;
  data: UsageData;
}

export const useUsageData = (): UseQueryResult<UsageResponse> => {
  return useQuery<UsageResponse>({
    queryKey: ['/api/billing/usage'],
    queryFn: async () => {
      const res = await fetch('/api/billing/usage', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};
