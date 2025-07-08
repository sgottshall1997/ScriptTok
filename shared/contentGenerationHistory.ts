// Content Generation History Types for structured logging
// This defines the enhanced content history tracking system

export interface ContentGenerationEntry {
  id: string;
  productName: string;
  niche: string;
  platformsSelected: string[];
  templateUsed: string;
  tone: string;
  generatedOutput: {
    content: string;
    hook: string;
    platform: string;
    niche: string;
    // Platform-specific content
    tiktokCaption?: string;
    instagramCaption?: string;
    youtubeCaption?: string;
    twitterCaption?: string;
    // Additional metadata
    hashtags?: string[];
    affiliateLink?: string;
    viralInspo?: {
      hook: string;
      format: string;
      caption: string;
      hashtags: string[];
    };
  };
  timestamp: Date;
  sessionId?: string; // For preventing duplicates within sessions
}

export interface ContentHistoryFilters {
  niche?: string;
  platform?: string;
  template?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Local storage key for content history
export const CONTENT_HISTORY_STORAGE_KEY = 'glow_bot_content_history';

// Maximum entries to store locally (keeps performance good)
export const MAX_HISTORY_ENTRIES = 100;