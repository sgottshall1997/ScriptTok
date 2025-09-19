/**
 * Shared interfaces for CookAIng Marketing Engine extensions
 * Provider requests/responses and domain types
 */

// =============================================================================
// Content Enhancement Types
// =============================================================================

export interface ImageGenRequest {
  prompt: string;
  style?: string;
  size?: string;
  count?: number;
  versionId?: number;
}

export interface ImageGenResponse {
  mode: 'mock' | 'live';
  images: Array<{
    url: string;
    thumbnailUrl?: string;
    prompt: string;
    style?: string;
  }>;
  provider: string;
  requestId?: string;
}

export interface VideoGenRequest {
  templateId: string;
  assets: string[];
  duration?: number;
  style?: string;
  versionId?: number;
}

export interface VideoGenResponse {
  mode: 'mock' | 'live';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  storyboard?: string[];
  provider: string;
  jobId: string;
}

export interface TTSAudioRequest {
  text: string;
  voice?: string;
  pace?: number;
  language?: string;
  versionId?: number;
}

export interface TTSAudioResponse {
  mode: 'mock' | 'live';
  audioUrl: string;
  duration?: number;
  voice: string;
  provider: string;
  format: string;
}

export interface RewriteRequest {
  text: string;
  style: 'casual' | 'professional' | 'enthusiastic' | 'authoritative';
  constraints?: string[];
  versionId?: number;
}

export interface RewriteResponse {
  mode: 'mock' | 'live';
  variations: Array<{
    text: string;
    style: string;
    score?: number;
  }>;
  provider: string;
  originalLength: number;
  avgLength: number;
}

// =============================================================================
// Intelligence & Analytics Types
// =============================================================================

export interface CompetitorPost {
  id?: number;
  sourcePlatform: string;
  author: string;
  url: string;
  capturedAt: Date;
  text: string;
  metrics: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    engagement_rate?: number;
  };
  tags: string[];
}

export interface SentimentSnapshot {
  id?: number;
  scope: 'campaign' | 'post' | 'brand';
  refId: number;
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  labels: {
    positive?: number;
    negative?: number;
    neutral?: number;
    emotion?: string;
  };
  createdAt?: Date;
}

export interface ViralScore {
  id?: number;
  contentVersionId: number;
  features: {
    engagement_potential?: number;
    trend_alignment?: number;
    emotional_impact?: number;
    shareability?: number;
    timing_score?: number;
  };
  score: number; // 0 to 100
  model: string;
  createdAt?: Date;
}

export interface FatigueSignal {
  id?: number;
  segmentId?: number;
  topic: string;
  slope: number; // negative indicates declining engagement
  lastSeenAt: Date;
  createdAt?: Date;
}

// =============================================================================
// Social Automation Types
// =============================================================================

export interface SocialQueueItem {
  id?: number;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  accountId: string;
  scheduledAt: Date;
  payload: {
    text?: string;
    mediaUrls?: string[];
    hashtags?: string[];
    mentions?: string[];
    location?: string;
  };
  status: 'queued' | 'published' | 'failed' | 'cancelled';
  result?: {
    postId?: string;
    url?: string;
    error?: string;
  };
  createdAt?: Date;
}

export interface HashtagSuggestion {
  id?: number;
  topic: string;
  platform: string;
  tags: string[];
  metrics: {
    popularity?: number;
    competition?: number;
    relevance?: number;
  };
  createdAt?: Date;
}

export interface OptimalTimes {
  id?: number;
  platform: string;
  segmentId?: number;
  times: {
    [day: string]: string[]; // ['09:00', '12:00', '18:00']
  };
  confidence?: number;
  createdAt?: Date;
}

// =============================================================================
// Personalization & Brand Voice Types
// =============================================================================

export interface BrandVoiceProfile {
  id?: number;
  name: string;
  corpus: {
    samples: string[];
    characteristics: string[];
    tone_markers: string[];
  };
  embeddingVector?: number[];
  createdAt?: Date;
}

export interface PersonalizationRule {
  id?: number;
  name: string;
  conditions: {
    demographic?: object;
    behavioral?: object;
    geographic?: object;
  };
  adaptations: {
    tone?: string;
    messaging?: string;
    visuals?: string;
  };
  status: 'active' | 'inactive';
}

// =============================================================================
// Collaboration & Workflow Types
// =============================================================================

export interface Approval {
  id?: number;
  entityType: 'campaign' | 'artifact' | 'version';
  entityId: number;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  assignee?: string;
  notes?: string;
  createdAt?: Date;
}

export interface CollaborationRole {
  id?: number;
  user: string; // email or user ID
  role: 'admin' | 'editor' | 'viewer' | 'client';
  scopes: {
    content?: boolean;
    campaigns?: boolean;
    analytics?: boolean;
    settings?: boolean;
  };
  createdAt?: Date;
}

export interface CalendarItem {
  id?: number;
  title: string;
  startAt: Date;
  endAt: Date;
  channel: string;
  refId?: number; // campaign, content, etc.
  status: 'scheduled' | 'published' | 'cancelled';
  createdAt?: Date;
}

// =============================================================================
// Integration Types
// =============================================================================

export interface EcomProduct {
  id?: number;
  source: 'shopify' | 'woocommerce' | 'manual';
  externalId: string;
  title: string;
  price: number;
  url: string;
  image?: string;
  inventory: {
    quantity?: number;
    variants?: object[];
  };
  tags: string[];
}

export interface CRMSync {
  contactId: string;
  platform: 'hubspot' | 'zoho' | 'salesforce';
  data: {
    email: string;
    name?: string;
    phone?: string;
    company?: string;
    properties?: object;
  };
  status: 'synced' | 'pending' | 'failed';
}

export interface MessagingSequence {
  id?: number;
  channel: 'email' | 'sms' | 'whatsapp';
  name: string;
  steps: Array<{
    delay?: number;
    template: string;
    trigger?: string;
  }>;
  triggers: {
    events?: string[];
    conditions?: object;
  };
  status: 'active' | 'paused' | 'draft';
  createdAt?: Date;
}

// =============================================================================
// AI & Compliance Types
// =============================================================================

export interface MultimodalPrompt {
  text: string;
  images?: string[];
  audio?: string;
  context?: object;
}

export interface MultimodalResponse {
  mode: 'mock' | 'live';
  output: string;
  confidence?: number;
  provider: string;
  processing_time?: number;
}

export interface ModerationReport {
  id?: number;
  versionId: number;
  checks: {
    toxic?: boolean;
    spam?: boolean;
    inappropriate?: boolean;
    hate_speech?: boolean;
    scores?: object;
  };
  decisions: {
    approved: boolean;
    blocked_reasons?: string[];
    manual_review?: boolean;
  };
  status: 'passed' | 'flagged' | 'blocked';
  createdAt?: Date;
}

export interface PlagiarismReport {
  id?: number;
  versionId: number;
  score: number; // 0 to 100
  matches: Array<{
    source: string;
    similarity: number;
    text_fragment: string;
  }>;
  createdAt?: Date;
}

// =============================================================================
// Provider Status Types
// =============================================================================

export interface ProviderStatus {
  name: string;
  status: 'ok' | 'mock_mode' | 'missing_keys' | 'error';
  message?: string;
  lastCheck?: Date;
  features?: string[];
}

// =============================================================================
// API Response Wrappers
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  mode?: 'mock' | 'live';
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// =============================================================================
// Health Status Types
// =============================================================================

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down' | 'mock';
  latency?: number;
  features?: string[];
  lastCheck: string;
  error?: string;
}