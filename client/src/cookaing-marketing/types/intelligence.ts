// Shared Intelligence Data Types for CookAIng Marketing
export interface IntelligenceViralData {
  score?: number | string;
  description?: string;
}

export interface IntelligenceSentimentData {
  score?: number | string;
  description?: string;
}

export interface IntelligenceCompetitorData {
  level?: string;
  description?: string;
  ideas?: Array<{ text?: string; description?: string } | string>;
}

export interface IntelligenceSuggestions {
  recommendations?: Array<{ text?: string; description?: string } | string>;
}

// Type guards for runtime validation
export const isViralData = (data: unknown): data is IntelligenceViralData => {
  return typeof data === 'object' && data !== null;
};

export const isSentimentData = (data: unknown): data is IntelligenceSentimentData => {
  return typeof data === 'object' && data !== null;
};

export const isCompetitorData = (data: unknown): data is IntelligenceCompetitorData => {
  return typeof data === 'object' && data !== null;
};

export const isSuggestionsData = (data: unknown): data is IntelligenceSuggestions => {
  return typeof data === 'object' && data !== null;
};