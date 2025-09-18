export interface TrendingItem {
  keyword: string;
  score: number;
  platform: 'google_trends' | 'reddit' | 'tiktok';
  category: string;
  region?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SeasonalEvent {
  name: string;
  date: Date;
  leadTimeDays: number;
  category: string;
  keywords: string[];
  templates: {
    blog?: string;
    social?: string;
  };
}

export interface ReferralTemplate {
  id: string;
  name: string;
  shareText: string;
  ctaText: string;
  platform: string;
  trackingParams: Record<string, string>;
}

export interface TrendingDetectorConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  platforms: string[];
  minScore: number;
  maxCampaignsPerDay: number;
}

export interface SeasonalGeneratorConfig {
  enabled: boolean;
  leadTimeDays: number;
  holidays: string[];
  autoPublish: boolean;
}

export interface ReferralGeneratorConfig {
  enabled: boolean;
  platforms: string[];
  defaultTemplate: string;
  trackConversions: boolean;
}