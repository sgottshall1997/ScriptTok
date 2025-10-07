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
    platformCaptions?: {
      tiktok?: string;
      instagram?: string;
      youtube?: string;
      twitter?: string;
    };
  };
  timestamp: Date;
  sessionId?: string; // For preventing duplicates within sessions
  databaseId?: number; // Database ID for API operations
  aiModel?: string; // AI model used (ChatGPT, Claude, etc.)
  model?: string; // Alternative model field
  contentFormat?: string; // Regular Format, Spartan Format, etc.
  topRatedStyleUsed?: boolean; // Whether smart style was used
  useSmartStyle?: boolean; // Alternative smart style field
  contentType?: string; // Template type
  promptText?: string; // Original prompt text
  // Viral Score and Analysis
  viralScore?: {
    overall: number;
    breakdown: {
      hookStrength: number;
      engagement: number;
      clarity: number;
      length: number;
      trending: number;
    };
    suggestions: string[];
    colorCode?: 'green' | 'yellow' | 'red';
  };
  viralScoreOverall?: number; // Overall score for easy querying
  viralAnalysis?: {
    overallSummary: string;
    hookFeedback: string;
    engagementFeedback: string;
    clarityFeedback: string;
    lengthFeedback: string;
    trendingFeedback: string;
    topActions: string[];
    improvementPrompt: string; // For AI-powered regeneration
  };
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