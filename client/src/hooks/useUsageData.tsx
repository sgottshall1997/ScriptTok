import { useQuery } from '@tanstack/react-query';

export interface UsageData {
  tier: 'free' | 'pro';
  gpt: { used: number; limit: number; remaining: number };
  claude: { used: number; limit: number; remaining: number };
  trendAnalyses: { used: number; limit: number; remaining: number };
  canBulkGenerate: boolean;
  templatesUnlocked: number;
}

export const useUsageData = () => {
  return useQuery<{ success: boolean; data: UsageData }>({
    queryKey: ['/api/billing/usage'],
    refetchOnMount: true,
    staleTime: 0,
  });
};
