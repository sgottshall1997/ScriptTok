// Trending product data structure
export interface TrendingProduct {
  id: number;
  title: string;
  source: string;
  mentions?: number;
  sourceUrl?: string;
  createdAt?: string;
  niche?: string;
}

// Dashboard trending products response
export interface DashboardTrendingResponse {
  byNiche: Record<string, TrendingProduct[]>;
  count: number;
  lastRefresh: string;
  nextScheduledRefresh: string;
}

// Source platform colors for trending products
export const SOURCE_COLORS: Record<string, string> = {
  'tiktok': 'bg-pink-100 text-pink-800',
  'instagram': 'bg-purple-100 text-purple-800',
  'reddit': 'bg-orange-100 text-orange-800',
  'youtube': 'bg-red-100 text-red-800',
  'amazon': 'bg-yellow-100 text-yellow-800',
  'google-trends': 'bg-blue-100 text-blue-800',
  'openai': 'bg-emerald-100 text-emerald-800'
};