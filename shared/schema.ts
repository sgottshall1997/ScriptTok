import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, varchar, decimal, unique, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with role management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  role: text("role").notNull().default("writer"), // writer, editor, admin
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  status: text("status").notNull().default("active"), // active, suspended, pending
  lastLogin: timestamp("last_login"),
  loginCount: integer("login_count").default(0),
  preferences: jsonb("preferences"), // User-specific preferences
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Roles and permissions
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isCustom: boolean("is_custom").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Available permissions in the system
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(), // content, user, analytics, system, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Role permissions join table
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.roleId, table.permissionId),
  };
});

// User activity logs
export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text("action").notNull(), // login, content_generation, api_integration, etc.
  metadata: jsonb("metadata"), // Additional details about the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table for auth
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// User team permissions
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull().default("member"), // owner, admin, member
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.teamId, table.userId),
  };
});

// AI Model Configuration schema
export const aiModelConfigs = pgTable("ai_model_configs", {
  id: serial("id").primaryKey(),
  niche: text("niche").notNull(),
  templateType: text("template_type").notNull(),
  tone: text("tone").notNull(),
  temperature: decimal("temperature").notNull().default("0.7"),
  frequencyPenalty: decimal("frequency_penalty").notNull().default("0.0"),
  presencePenalty: decimal("presence_penalty").notNull().default("0.0"),
  modelName: text("model_name").notNull().default("gpt-4"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
}, (table) => {
  return {
    unq: unique().on(table.niche, table.templateType, table.tone),
  };
});

// Content generated schema
export const contentGenerations = pgTable("content_generations", {
  id: serial("id").primaryKey(),
  product: text("product").notNull(),
  niche: text("niche").notNull().default("skincare"),
  templateType: text("template_type").notNull(),
  tone: text("tone").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Trending products schema
export const trendingProducts = pgTable("trending_products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(), // tiktok, instagram, youtube, reddit, amazon, google-trends, perplexity
  mentions: integer("mentions"),
  sourceUrl: text("source_url"),
  niche: text("niche").notNull().default("skincare"),
  dataSource: text("data_source").default("gpt"), // 'gpt', 'perplexity', 'scraper'
  reason: text("reason"), // Why this product is trending - from Perplexity or other sources
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(), // When this product was fetched from external source
  engagement: integer("engagement"), // Engagement score if available
  description: text("description"), // Full product description
  viralKeywords: text("viral_keywords").array(), // Viral keyword highlights
  perplexityNotes: text("perplexity_notes"), // Additional notes from Perplexity
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User favorites for trending products
export const favoriteProducts = pgTable("favorite_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => trendingProducts.id, { onDelete: 'cascade' }),
  pinnedAt: timestamp("pinned_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.productId),
  };
});

// Scraper health schema
export const scraperStatus = pgTable("scraper_status", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: text("status").notNull(), // "active", "gpt-fallback", "degraded", "error", "rate-limited"
  lastCheck: timestamp("last_check").defaultNow().notNull(),
  errorMessage: text("error_message"),
});

// API usage schema
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  count: integer("count").notNull().default(0),
  niche: text("niche"),
  templateType: text("template_type"),
  tone: text("tone"),
  userId: integer("user_id").references(() => users.id),
});

// Content optimization data
export const contentOptimizations = pgTable("content_optimizations", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  readabilityScore: decimal("readability_score"),
  keywordDensity: jsonb("keyword_density"), // { keyword: density }
  seoScore: integer("seo_score"),
  uniquenessScore: decimal("uniqueness_score"),
  suggestions: text("suggestions").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Advanced content optimization metrics
export const advancedContentOptimizations = pgTable("advanced_content_optimizations", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  // SEO Analysis
  keywordRelevance: decimal("keyword_relevance"), // 0-1 score of how well content matches keyword intent
  titleOptimization: decimal("title_optimization"), // 0-1 score for title quality
  metaDescriptionScore: decimal("meta_description_score"), // 0-1 score for meta description
  headingStructureScore: decimal("heading_structure_score"), // 0-1 score for proper heading usage
  
  // Readability Analysis
  fleschKincaidScore: decimal("flesch_kincaid_score"), // Standard readability score
  sentenceLengthVariation: decimal("sentence_length_variation"), // Measure of sentence variety
  passiveVoicePercentage: decimal("passive_voice_percentage"), // % of sentences with passive voice
  adverbDensity: decimal("adverb_density"), // Percentage of adverbs (potentially weakening content)
  
  // Engagement Metrics
  emotionalToneAnalysis: jsonb("emotional_tone_analysis"), // Object with emotional tone scores
  engagementPrediction: decimal("engagement_prediction"), // Predicted engagement score
  targetAudienceRelevance: decimal("target_audience_relevance"), // Relevance to specified audience
  
  // Competitive Analysis
  uniquenessVsCompetitors: decimal("uniqueness_vs_competitors"), // Uniqueness compared to top content
  topPerformingPhrases: text("top_performing_phrases").array(), // Phrases that engage well
  competitorKeyGaps: text("competitor_key_gaps").array(), // Content gaps vs competitors
  
  // Content Quality
  grammarIssuesCount: integer("grammar_issues_count"), // Number of grammar issues
  spellingIssuesCount: integer("spelling_issues_count"), // Number of spelling issues
  brandVoiceConsistency: decimal("brand_voice_consistency"), // Consistency with brand voice
  citationNeeds: text("citation_needs").array(), // Areas that need citation/backing
  
  // Recommendations
  optimizationSuggestions: jsonb("optimization_suggestions"), // Structured suggestions
  abTestingSuggestions: jsonb("ab_testing_suggestions"), // Suggestions for testing variations
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User feedback ratings for content pieces
export const contentRatings = pgTable("content_ratings", {
  id: serial("id").primaryKey(),
  contentHistoryId: integer("content_history_id").notNull().references(() => contentHistory.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  
  // Overall and platform-specific ratings (1-100)
  overallRating: integer("overall_rating"), // General content quality
  instagramRating: integer("instagram_rating"), // Instagram caption quality
  tiktokRating: integer("tiktok_rating"), // TikTok caption quality
  youtubeRating: integer("youtube_rating"), // YouTube Shorts caption quality
  twitterRating: integer("twitter_rating"), // X (Twitter) caption quality
  
  // Additional metadata
  notes: text("notes"), // Optional user notes about the rating
  ratedAt: timestamp("rated_at").defaultNow().notNull(),
  
}, (table) => {
  return {
    unq: unique().on(table.contentHistoryId, table.userId),
  };
});

// Smart learning patterns extracted from high-rated content
export const contentPatterns = pgTable("content_patterns", {
  id: serial("id").primaryKey(),
  
  // Pattern identification
  patternName: text("pattern_name").notNull(), // e.g., "high_engagement_beauty_hooks"
  description: text("description"), // Human-readable description
  
  // Content attributes that define this pattern
  niche: text("niche"),
  templateType: text("template_type"),
  tone: text("tone"),
  platform: text("platform"), // instagram, tiktok, youtube, twitter, or "all"
  
  // Pattern characteristics
  averageRating: decimal("average_rating").notNull(), // Average rating of content matching this pattern
  sampleCount: integer("sample_count").notNull(), // Number of samples used to derive pattern
  confidence: decimal("confidence").notNull(), // Confidence score (0-1)
  
  // Structural patterns
  averageWordCount: integer("average_word_count"),
  commonPhrases: text("common_phrases").array(), // Frequently used phrases
  sentenceStructures: text("sentence_structures").array(), // Common sentence patterns
  
  // Content style attributes
  emotionalTone: text("emotional_tone"), // excited, calm, urgent, etc.
  callToActionStyle: text("call_to_action_style"), // direct, subtle, question, etc.
  hookType: text("hook_type"), // question, statement, stat, story, etc.
  
  // Performance insights
  bestPerformingElements: jsonb("best_performing_elements"), // Structured data about what works
  avoidancePatterns: jsonb("avoidance_patterns"), // What to avoid based on low ratings
  
  // Pattern lifecycle
  isActive: boolean("is_active").notNull().default(true),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Pattern validation
  minimumSamples: integer("minimum_samples").notNull().default(5), // Min samples needed to trust pattern
});

// Content generation preferences and learning settings
export const userContentPreferences = pgTable("user_content_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Learning system preferences
  useSmartLearning: boolean("use_smart_learning").notNull().default(true), // "Use my best-rated style"
  learningIntensity: text("learning_intensity").notNull().default("moderate"), // conservative, moderate, aggressive
  
  // Minimum rating thresholds for pattern extraction
  minOverallRating: integer("min_overall_rating").notNull().default(70),
  minPlatformRating: integer("min_platform_rating").notNull().default(65),
  
  // User-specific pattern weights
  personalizedWeights: jsonb("personalized_weights"), // Custom weights for different attributes
  
  // Feedback behavior tracking
  totalRatingsGiven: integer("total_ratings_given").notNull().default(0),
  averageRatingGiven: decimal("average_rating_given"),
  ratingConsistency: decimal("rating_consistency"), // How consistent user ratings are
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    unqUser: unique().on(table.userId),
  };
});

// Pattern application tracking (for A/B testing the learning system)
export const patternApplications = pgTable("pattern_applications", {
  id: serial("id").primaryKey(),
  contentHistoryId: integer("content_history_id").notNull().references(() => contentHistory.id, { onDelete: 'cascade' }),
  patternId: integer("pattern_id").references(() => contentPatterns.id, { onDelete: 'set null' }),
  
  // Application metadata
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  applicationStrength: decimal("application_strength"), // How strongly the pattern was applied (0-1)
  modifiedAttributes: text("modified_attributes").array(), // Which attributes were influenced
  
  // Results tracking
  resultingRating: integer("resulting_rating"), // Rating received after applying pattern
  patternEffectiveness: decimal("pattern_effectiveness"), // Calculated effectiveness score
});

// Content performance data for analytics
export const contentPerformance = pgTable("content_performance", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  platform: text("platform").notNull(), // instagram, facebook, twitter, etc.
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  clickthroughRate: decimal("clickthrough_rate"),
  conversionRate: decimal("conversion_rate"),
  revenue: decimal("revenue"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Content versions for revision history
export const contentVersions = pgTable("content_versions", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  changedBy: integer("changed_by").references(() => users.id),
  version: integer("version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// API integrations
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(), // instagram, facebook, twitter, mailchimp, etc.
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Social media platform configurations
export const socialMediaPlatforms = pgTable("social_media_platforms", {
  id: serial("id").primaryKey(),
  platformName: text("platform_name").notNull().unique(), // instagram, facebook, twitter, tiktok, etc.
  description: text("description"),
  apiDocsUrl: text("api_docs_url"),
  logoUrl: text("logo_url"),
  supportedFeatures: jsonb("supported_features"), // e.g., {posting: true, stories: true, reels: false}
  postLengthLimit: integer("post_length_limit"),
  mediaTypeSupport: jsonb("media_type_support"), // e.g., {images: true, videos: true, carousels: true}
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Direct publishing records 
export const publishedContent = pgTable("published_content", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  platformId: integer("platform_id").notNull().references(() => socialMediaPlatforms.id),
  integrationId: integer("integration_id").notNull().references(() => apiIntegrations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  publishedUrl: text("published_url"),
  platformContentId: text("platform_content_id"), // ID of the content on the platform
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  publishStatus: text("publish_status").notNull(), // success, failed, scheduled
  statusMessage: text("status_message"),
  scheduledPublishTime: timestamp("scheduled_publish_time"),
  metadata: jsonb("metadata"), // Platform-specific metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// API Rate limits tracker
export const apiRateLimits = pgTable("api_rate_limits", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => socialMediaPlatforms.id),
  integrationId: integer("integration_id").notNull().references(() => apiIntegrations.id),
  requestsSent: integer("requests_sent").notNull().default(0),
  limitPerHour: integer("limit_per_hour"),
  limitPerDay: integer("limit_per_day"),
  resetTime: timestamp("reset_time"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Claude AI suggestions database for content improvement by niche
export const claudeAiSuggestions = pgTable("claude_ai_suggestions", {
  id: serial("id").primaryKey(),
  niche: varchar("niche", { length: 50 }).notNull(), // beauty, tech, fashion, fitness, food, travel, pets
  
  // Suggestion metadata
  suggestionType: varchar("suggestion_type", { length: 50 }).notNull(), // style_improvement, hook_optimization, engagement_boost, cta_enhancement
  category: varchar("category", { length: 50 }).notNull(), // writing_style, structure, tone, format, platform_optimization
  
  // The actual suggestion content
  suggestion: text("suggestion").notNull(), // The Claude recommendation
  context: text("context"), // When/where this suggestion applies
  example: text("example"), // Example implementation of the suggestion
  
  // Effectiveness tracking
  timesUsed: integer("times_used").notNull().default(0),
  effectiveness: decimal("effectiveness", { precision: 3, scale: 2 }).notNull().default("0.5"), // Effectiveness score (0-1)
  // Note: using effectiveness instead of success_rate and avg_rating_increase
  
  // Suggestion validation
  isValidated: boolean("is_validated").notNull().default(false), // Has this been tested?
  confidence: varchar("confidence", { length: 10 }), // Claude's confidence in this suggestion (kept as varchar to match DB)
  source: varchar("source", { length: 50 }), // automated_analysis, user_feedback, pattern_analysis
  
  // Content targeting
  templateTypes: text("template_types").array(), // Which templates this applies to
  platforms: text("platforms").array(), // Which platforms this works best on
  tones: text("tones").array(), // Which tones this suggestion works with
  templateType: varchar("template_type", { length: 50 }), // Single template type
  platform: varchar("platform", { length: 50 }), // Single platform
  tone: varchar("tone", { length: 50 }), // Single tone
  
  // Performance data
  appliedToContent: integer("applied_to_content").notNull().default(0), // How many times used
  usageCount: integer("usage_count").notNull().default(0), // Usage tracking
  reasoning: text("reasoning"), // AI reasoning for suggestion
  
  // Lifecycle management
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(50), // 1-100, higher = more important
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Track applications of Claude suggestions to content
export const suggestionApplications = pgTable("suggestion_applications", {
  id: serial("id").primaryKey(),
  suggestionId: integer("suggestion_id").notNull().references(() => claudeAiSuggestions.id, { onDelete: 'cascade' }),
  contentHistoryId: integer("content_history_id").notNull().references(() => contentHistory.id, { onDelete: 'cascade' }),
  
  // Application details
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  applicationMethod: text("application_method"), // automatic, manual, a_b_test
  
  // Results tracking
  beforeRating: integer("before_rating"), // Rating before applying suggestion
  afterRating: integer("after_rating"), // Rating after applying suggestion
  improvementScore: decimal("improvement_score"), // Calculated improvement
  
  // User feedback on the suggestion
  userFeedback: text("user_feedback"),
  userRating: integer("user_rating"), // User's rating of the suggestion (1-10)
  
  // Metadata
  metadata: jsonb("metadata"), // Additional details about the application
});

// Niche-specific content insights and patterns
export const nicheInsights = pgTable("niche_insights", {
  id: serial("id").primaryKey(),
  niche: text("niche").notNull(),
  
  // Content performance patterns
  bestPerformingTemplates: text("best_performing_templates").array(),
  topTones: text("top_tones").array(),
  highEngagementWords: text("high_engagement_words").array(),
  lowEngagementWords: text("low_engagement_words").array(),
  
  // Platform-specific insights
  platformPreferences: jsonb("platform_preferences"), // Which platforms work best for this niche
  optimalContentLength: jsonb("optimal_content_length"), // Length preferences by platform
  
  // Trend analysis
  trendingKeywords: text("trending_keywords").array(),
  seasonalPatterns: jsonb("seasonal_patterns"),
  audiencePreferences: jsonb("audience_preferences"),
  
  // Performance metrics
  avgRating: decimal("avg_rating"),
  totalContent: integer("total_content").notNull().default(0),
  lastAnalyzed: timestamp("last_analyzed").defaultNow().notNull(),
  
  // Analysis metadata
  dataQuality: decimal("data_quality"), // How reliable this insight is (0-100)
  sampleSize: integer("sample_size"), // Number of content pieces analyzed
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    unqNiche: unique().on(table.niche),
  };
});

// Webhooks for external integrations
export const integrationWebhooks = pgTable("integration_webhooks", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull().references(() => apiIntegrations.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: text("events").array(), // Event types to trigger this webhook
  secretKey: text("secret_key"), // For webhook signature verification
  isActive: boolean("is_active").notNull().default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Scheduled bulk generation jobs
export const scheduledBulkJobs = pgTable("scheduled_bulk_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(), // User-friendly name for the scheduled job
  
  // Schedule configuration
  scheduleTime: text("schedule_time").notNull(), // Format: "HH:mm" (e.g., "05:00")
  timezone: text("timezone").notNull().default("America/New_York"), // User's timezone
  isActive: boolean("is_active").notNull().default(true), // Whether the job should run
  
  // Generation settings (stored as JSON to preserve all configuration)
  selectedNiches: text("selected_niches").array().notNull(), // Array of niche strings
  tones: text("tones").array().notNull(), // Array of tone strings
  templates: text("templates").array().notNull(), // Array of template strings
  platforms: text("platforms").array().notNull(), // Array of platform strings
  
  // Advanced options
  useExistingProducts: boolean("use_existing_products").notNull().default(true),
  generateAffiliateLinks: boolean("generate_affiliate_links").notNull().default(false),
  useSpartanFormat: boolean("use_spartan_format").notNull().default(false),
  topRatedStyleUsed: boolean("top_rated_style_used").notNull().default(false),
  aiModel: text("ai_model").notNull().default("claude"), // AI model to use for generation
  affiliateId: text("affiliate_id").default("sgottshall107-20"),
  
  // Webhook configuration
  webhookUrl: text("webhook_url"),
  sendToMakeWebhook: boolean("send_to_make_webhook").notNull().default(true),
  
  // Execution tracking
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  totalRuns: integer("total_runs").notNull().default(0),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),
  lastError: text("last_error"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Marketing automation actions
export const marketingAutomations = pgTable("marketing_automations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  triggerEvent: text("trigger_event").notNull(), // content_generated, scheduled_time, etc.
  triggerConditions: jsonb("trigger_conditions"), // e.g., {niche: "skincare", templateType: "product_review"}
  actions: jsonb("actions").notNull(), // Array of actions to perform
  integrationIds: integer("integration_ids").array(), // Which integrations to use
  isActive: boolean("is_active").notNull().default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Trending emojis and hashtags
export const trendingEmojisHashtags = pgTable("trending_emojis_hashtags", {
  id: serial("id").primaryKey(),
  niche: text("niche").notNull().unique(),
  hashtags: text("hashtags").array().notNull(),
  emojis: text("emojis").array().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enhanced Content generation history for tracking and analytics
export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional user reference
  sessionId: text("session_id"), // For preventing duplicates within sessions
  niche: text("niche").notNull(),
  contentType: text("content_type").notNull(), // Maps to templateType
  tone: text("tone").notNull(),
  productName: text("product_name").notNull(),
  promptText: text("prompt_text").notNull(),
  outputText: text("output_text").notNull(),
  platformsSelected: jsonb("platforms_selected"), // array of platforms like ["TikTok", "Instagram"]
  generatedOutput: jsonb("generated_output"), // full JSON response from content generation
  affiliateLink: text("affiliate_link"), // generated affiliate link if any
  viralInspo: jsonb("viral_inspo"), // viral inspiration data if fetched
  modelUsed: text("model_used").notNull(),
  tokenCount: integer("token_count").notNull(),
  fallbackLevel: text("fallback_level"), // For tracking AI fallbacks
  // New fields for enhanced filtering
  aiModel: text("ai_model"), // AI model used (ChatGPT, Claude, etc.)
  contentFormat: text("content_format"), // Regular Format, Spartan Format, etc.
  topRatedStyleUsed: boolean("top_rated_style_used").default(false), // Whether smart style was used
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Click tracking for redirect links
export const clickLogs = pgTable("click_logs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  affiliateUrl: text("affiliate_url").notNull(),
  product: text("product").notNull(),
  niche: text("niche").notNull(),
  platform: text("platform"), // instagram, tiktok, youtube, twitter, etc.
  contentType: text("content_type"), // viral_hook, product_review, etc.
  source: text("source"), // organic, paid, etc.
  clicks: integer("clicks").notNull().default(0),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  comments: integer("comments").default(0),
  clickThrough: decimal("click_through").default("0"),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue").default("0"),
  network: text("network"),
  estimatedCommission: decimal("estimated_commission").default("0"),
  contentId: text("content_id"),
  lastClickAt: timestamp("last_click_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual click events for detailed tracking
export const clickEvents = pgTable("click_events", {
  id: serial("id").primaryKey(),
  slugId: integer("slug_id").notNull().references(() => clickLogs.id, { onDelete: 'cascade' }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

// Scheduled posts for cross-platform automation
export const scheduledPosts = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  platforms: text("platforms").array().notNull(), // ["tiktok", "instagram", "youtube"]
  scheduledTime: timestamp("scheduled_time").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  bulkJobId: text("bulk_job_id"), // For grouping bulk operations
  makeWebhookUrl: text("make_webhook_url"), // Make.com webhook for automation
  platformResults: jsonb("platform_results"), // Results from each platform
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced Bulk content generation jobs with auto-trending product selection
export const bulkContentJobs = pgTable("bulk_content_jobs", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id", { length: 255 }).notNull().unique(),
  productName: varchar("product_name", { length: 255 }), // Product name for single-product jobs
  niche: varchar("niche", { length: 100 }), // Niche for single-product jobs
  totalVariations: integer("total_variations").notNull().default(0),
  completedVariations: integer("completed_variations").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
  platforms: text("platforms").array().notNull(),
  tones: text("tones").array().notNull(),
  templates: text("templates").array().notNull(),
  scheduleAfterGeneration: boolean("schedule_after_generation").default(false),
  scheduledTime: timestamp("scheduled_time"),
  makeWebhookUrl: text("make_webhook_url"),
  autoSelectedProducts: jsonb("auto_selected_products"), // Array of selected products per niche
  selectedNiches: text("selected_niches").array().notNull(), // Which niches to generate for
  viralInspiration: jsonb("viral_inspiration"), // Perplexity viral data for each product
  progressLog: jsonb("progress_log"), // Detailed progress tracking
  errorLog: jsonb("error_log"), // Error details if any
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id"), // Optional user reference
  progressPercentage: integer("progress_percentage"), // Progress as percentage
  generatedContentCount: integer("generated_content_count"), // Count of generated content
});

// Generated content from bulk jobs
export const bulkGeneratedContent = pgTable("bulk_generated_content", {
  id: serial("id").primaryKey(),
  bulkJobId: varchar("bulk_job_id", { length: 255 }).notNull().references(() => bulkContentJobs.jobId, { onDelete: 'cascade' }),
  productName: varchar("product_name", { length: 255 }).notNull(),
  niche: varchar("niche", { length: 100 }).notNull(),
  tone: varchar("tone", { length: 100 }).notNull(),
  template: varchar("template", { length: 100 }).notNull(),
  platforms: text("platforms").array().notNull(),
  generatedContent: jsonb("generated_content").notNull(), // Full content with hooks, scripts, captions
  viralInspiration: jsonb("viral_inspiration"), // Product-specific viral data
  affiliateLink: text("affiliate_link"),
  modelUsed: varchar("model_used", { length: 50 }).notNull(),
  tokenCount: integer("token_count").notNull(),
  generationTime: integer("generation_time"), // Time taken in ms
  status: text("status").notNull().default("completed"), // completed, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CookAIng Content Blueprints - Templates for recipe-based content generation
export const contentBlueprints = pgTable("content_blueprints", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  kind: varchar("kind", { length: 100 }).notNull(), // e.g., "video_script_short", "blog_recipe", etc.
  description: text("description").notNull(),
  inputSchemaJson: jsonb("input_schema_json").notNull(), // JSON schema for inputs
  outputSchemaJson: jsonb("output_schema_json").notNull(), // JSON schema for outputs  
  defaultsJson: jsonb("defaults_json").notNull(), // Default values for inputs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CookAIng Content Jobs - Individual content generation jobs
export const contentJobs = pgTable("content_jobs", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id"), // Optional reference to recipe
  sourceType: varchar("source_type", { length: 50 }).notNull().default("recipe"), // "recipe" or "freeform"
  blueprintId: integer("blueprint_id").notNull().references(() => contentBlueprints.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // "draft", "queued", "generated", "failed"
  inputsJson: jsonb("inputs_json").notNull(), // User inputs for generation
  outputsJson: jsonb("outputs_json"), // Generated outputs
  errorsJson: jsonb("errors_json"), // Any errors that occurred
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ROI Analytics and Performance Tracking
export const performanceAnalytics = pgTable("performance_analytics", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => contentGenerations.id),
  scheduledPostId: integer("scheduled_post_id").references(() => scheduledPosts.id),
  platform: text("platform").notNull(),
  // Engagement metrics
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  // Traffic metrics  
  clicks: integer("clicks").default(0),
  clickThroughRate: decimal("click_through_rate").default("0"),
  // Revenue metrics
  conversions: integer("conversions").default(0),
  conversionRate: decimal("conversion_rate").default("0"),
  revenue: decimal("revenue").default("0"),
  commission: decimal("commission").default("0"),
  roi: decimal("roi").default("0"),
  // Cost metrics
  adSpend: decimal("ad_spend").default("0"),
  cpc: decimal("cpc").default("0"), // cost per click
  cpm: decimal("cpm").default("0"), // cost per mille
  // Time tracking
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  dateRange: text("date_range"), // "2025-01-01_2025-01-07" for weekly reports
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Post metrics for performance tracking
export const postMetrics = pgTable("post_metrics", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => contentGenerations.id),
  slugId: integer("slug_id").references(() => clickLogs.id),
  platform: text("platform").notNull(),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  clicks: integer("clicks").default(0),
  purchases: integer("purchases").default(0),
  ctr: decimal("ctr"), // click-through rate
  conversionRate: decimal("conversion_rate"),
  aiScore: decimal("ai_score"), // AI-generated quality score
  gptAnalysis: text("gpt_analysis"), // GPT feedback and suggestions
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Hook variations for A/B testing
export const contentHooks = pgTable("content_hooks", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  hookText: text("hook_text").notNull(),
  viralityScore: decimal("virality_score"), // 0-1 GPT score for viral potential
  clarityScore: decimal("clarity_score"), // 0-1 GPT score for clarity
  emotionalScore: decimal("emotional_score"), // 0-1 GPT score for emotional impact
  overallScore: decimal("overall_score"), // Combined weighted score
  isSelected: boolean("is_selected").default(false), // Which hook was chosen
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Platform-specific content formatting
export const platformContent = pgTable("platform_content", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  platform: text("platform").notNull(), // instagram, tiktok, youtube, twitter, threads
  formattedContent: text("formatted_content").notNull(),
  hashtags: text("hashtags").array(),
  title: text("title"), // For YouTube
  tags: text("tags").array(), // For YouTube
  scheduledTime: timestamp("scheduled_time"),
  publishedAt: timestamp("published_at"),
  publishStatus: text("publish_status").default("draft"), // draft, scheduled, published, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily scraper cache for storing all scraper results
export const dailyScraperCache = pgTable("daily_scraper_cache", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // "amazon", "reddit", "tiktok", "youtube", etc.
  date: text("date").notNull(), // YYYY-MM-DD format
  data: text("data").notNull(), // Stringified JSON result from the scraper
  success: boolean("success"), // Success status
  lastUpdated: timestamp("last_updated"), // Last update timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.source, table.date),
  };
});

// ===============================================================================
// CookAIng Content History & Rating System
// ===============================================================================

// Content versions for immutable content snapshots and rating
export const cookaingContentVersions = pgTable("cookaing_content_versions", {
  id: serial("id").primaryKey(),
  
  // CookAIng-specific fields
  campaignId: integer("campaign_id"), // Optional reference to campaign
  recipeId: integer("recipe_id"), // Optional reference to recipe
  sourceJobId: integer("source_job_id").references(() => contentJobs.id, { onDelete: 'set null' }), // Link to Unified Content Generator job if applicable
  channel: text("channel").notNull(), // 'video_script'|'social'|'blog'|'email'|'push'|'affiliate'|...
  platform: text("platform"), // 'tiktok'|'instagram'|'yt-long'|'carousel'|...
  title: text("title"),
  summary: text("summary"),
  template: text("template"), // blueprint/template name
  metadataJson: jsonb("metadata_json").notNull(), // persona/tone/duration/options
  payloadJson: jsonb("payload_json").notNull(), // immutable snapshot of the content
  createdBy: text("created_by"),
  version: integer("version").notNull().default(1),
  
  // GlowBot parity fields for exact compatibility
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }), // Optional user reference
  sessionId: text("session_id"), // For preventing duplicates within sessions
  niche: text("niche"), // e.g., pantry hacks, vegan, etc.
  contentType: text("content_type"), // Maps to template/objective field
  tone: text("tone").notNull(), // Content tone (friendly, expert, playful, urgent)
  productName: text("product_name").notNull(), // Product/service being promoted
  promptText: text("prompt_text").notNull(), // Original prompt used for generation
  outputText: text("output_text").notNull(), // Final generated content text
  platformsSelected: jsonb("platforms_selected"), // array of platforms like ["TikTok", "Instagram"]
  generatedOutput: jsonb("generated_output"), // full JSON response from content generation
  affiliateLink: text("affiliate_link"), // generated affiliate link if any
  viralInspo: jsonb("viral_inspo"), // viral inspiration data if fetched
  model: text("model"), // ai model identifier used (mock/openai/claude)
  modelUsed: text("model_used").notNull(), // Duplicate for compatibility
  tokenCount: integer("token_count").notNull(), // Token usage tracking
  fallbackLevel: text("fallback_level"), // For tracking AI fallbacks
  aiModel: text("ai_model"), // AI model used (ChatGPT, Claude, etc.)
  contentFormat: text("content_format"), // Regular Format, Spartan Format, etc.
  topRatedStyleUsed: boolean("top_rated_style_used").default(false), // Whether smart style was used
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unqCampaignVersion: unique().on(table.campaignId, table.channel, table.platform, table.version),
    idxCampaignChannelPlatform: index().on(table.campaignId, table.channel, table.platform, table.createdAt),
  };
});

// Content ratings for user and AI evaluations
export const cookaingContentRatings = pgTable("cookaing_content_ratings", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").notNull().references(() => cookaingContentVersions.id, { onDelete: 'cascade' }),
  
  // CookAIng-specific advanced rating fields
  userScore: integer("user_score"), // 1–100 manual rating
  aiVirality: integer("ai_virality"), // 1–10
  aiClarity: integer("ai_clarity"), // 1–10
  aiPersuasiveness: integer("ai_persuasiveness"), // 1–10
  aiCreativity: integer("ai_creativity"), // 1–10
  thumb: text("thumb"), // 'up'|'down'|null (optional)
  reasons: text("reasons").array(), // ['catchy','clear','on-brand','too-long',...]
  isWinner: boolean("is_winner").notNull().default(false),
  createdBy: text("created_by"),
  
  // GlowBot parity fields for exact compatibility
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }), // User who rated
  overallRating: integer("overall_rating"), // General content quality (1-100)
  instagramRating: integer("instagram_rating"), // Instagram caption quality (1-100)
  tiktokRating: integer("tiktok_rating"), // TikTok caption quality (1-100)
  youtubeRating: integer("youtube_rating"), // YouTube Shorts caption quality (1-100)
  twitterRating: integer("twitter_rating"), // X (Twitter) caption quality (1-100)
  
  // Notes and timestamps
  notes: text("notes"), // User notes about the rating
  ratedAt: timestamp("rated_at").defaultNow().notNull(), // GlowBot compatibility
  createdAt: timestamp("created_at").defaultNow().notNull(), // CookAIng compatibility
}, (table) => {
  return {
    idxVersionCreated: index().on(table.versionId, table.createdAt),
    idxIsWinner: index().on(table.isWinner),
    unqVersionUser: unique().on(table.versionId, table.userId), // Prevent duplicate ratings per user
  };
});

// Content links for connecting versions to artifacts and jobs
export const contentLinks = pgTable("content_links", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").notNull().references(() => cookaingContentVersions.id, { onDelete: 'cascade' }),
  artifactId: integer("artifact_id"), // link campaign_artifacts if attached
  jobId: integer("job_id"), // link content_jobs if generated
  type: text("type").notNull(), // 'artifact'|'job'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content exports for tracking export history
export const contentExports = pgTable("content_exports", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").notNull().references(() => cookaingContentVersions.id, { onDelete: 'cascade' }),
  format: text("format").notNull(), // 'json'|'csv'|'markdown'
  payload: text("payload").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  profileImage: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  description: true,
});

// Claude AI Suggestions schemas
export const insertClaudeAiSuggestionSchema = createInsertSchema(claudeAiSuggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSuggestionApplicationSchema = createInsertSchema(suggestionApplications).omit({
  id: true,
  appliedAt: true,
});

export const insertNicheInsightSchema = createInsertSchema(nicheInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for Claude AI Suggestions
export type ClaudeAiSuggestion = typeof claudeAiSuggestions.$inferSelect;
export type InsertClaudeAiSuggestion = typeof insertClaudeAiSuggestionSchema._input;
export type SuggestionApplication = typeof suggestionApplications.$inferSelect;
export type InsertSuggestionApplication = typeof insertSuggestionApplicationSchema._input;
export type NicheInsight = typeof nicheInsights.$inferSelect;
export type InsertNicheInsight = typeof insertNicheInsightSchema._input;

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  teamId: true,
  userId: true,
  role: true,
});

export const insertAiModelConfigSchema = createInsertSchema(aiModelConfigs).pick({
  niche: true,
  templateType: true,
  tone: true,
  temperature: true,
  frequencyPenalty: true,
  presencePenalty: true,
  modelName: true,
  createdBy: true,
});

export const insertContentGenerationSchema = createInsertSchema(contentGenerations).pick({
  product: true,
  niche: true,
  templateType: true,
  tone: true,
  content: true,
});

export const insertTrendingProductSchema = createInsertSchema(trendingProducts).pick({
  title: true,
  source: true,
  mentions: true,
  sourceUrl: true,
  niche: true,
});

export const insertScraperStatusSchema = createInsertSchema(scraperStatus).pick({
  name: true,
  status: true,
  errorMessage: true,
});

export const insertApiUsageSchema = createInsertSchema(apiUsage).pick({
  date: true,
  count: true,
  niche: true,
  templateType: true,
  tone: true,
  userId: true,
});

export const insertContentOptimizationSchema = createInsertSchema(contentOptimizations).pick({
  contentId: true,
  readabilityScore: true,
  keywordDensity: true,
  seoScore: true,
  uniquenessScore: true,
  suggestions: true,
});

export const insertContentPerformanceSchema = createInsertSchema(contentPerformance).pick({
  contentId: true,
  platform: true,
  views: true,
  likes: true,
  comments: true,
  shares: true,
  clickthroughRate: true,
  conversionRate: true,
  revenue: true,
});

export const insertContentVersionSchema = createInsertSchema(contentVersions).pick({
  contentId: true,
  content: true,
  changedBy: true,
  version: true,
});

export const insertApiIntegrationSchema = createInsertSchema(apiIntegrations).pick({
  name: true,
  provider: true,
  apiKey: true,
  apiSecret: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiresAt: true,
  userId: true,
});

// Insert schemas for roles and permissions
export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
  isCustom: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).pick({
  name: true,
  description: true,
  category: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).pick({
  roleId: true,
  permissionId: true,
});

export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs).pick({
  userId: true,
  action: true,
  metadata: true,
  ipAddress: true,
  userAgent: true,
});

// Insert schemas for advanced content optimization
export const insertAdvancedContentOptimizationSchema = createInsertSchema(advancedContentOptimizations).pick({
  contentId: true,
  keywordRelevance: true,
  titleOptimization: true,
  metaDescriptionScore: true,
  headingStructureScore: true,
  fleschKincaidScore: true,
  sentenceLengthVariation: true,
  passiveVoicePercentage: true,
  adverbDensity: true,
  emotionalToneAnalysis: true,
  engagementPrediction: true,
  targetAudienceRelevance: true,
  uniquenessVsCompetitors: true,
  topPerformingPhrases: true,
  competitorKeyGaps: true,
  grammarIssuesCount: true,
  spellingIssuesCount: true,
  brandVoiceConsistency: true,
  citationNeeds: true,
  optimizationSuggestions: true,
  abTestingSuggestions: true,
});

// Insert schemas for social media platforms
export const insertSocialMediaPlatformSchema = createInsertSchema(socialMediaPlatforms).pick({
  platformName: true,
  description: true,
  apiDocsUrl: true,
  logoUrl: true,
  supportedFeatures: true,
  postLengthLimit: true,
  mediaTypeSupport: true,
  isActive: true,
});

export const insertPublishedContentSchema = createInsertSchema(publishedContent).pick({
  contentId: true,
  platformId: true,
  integrationId: true,
  userId: true,
  publishedUrl: true,
  platformContentId: true,
  publishStatus: true,
  statusMessage: true,
  scheduledPublishTime: true,
  metadata: true,
});

export const insertApiRateLimitSchema = createInsertSchema(apiRateLimits).pick({
  platformId: true,
  integrationId: true,
  requestsSent: true,
  limitPerHour: true,
  limitPerDay: true,
  resetTime: true,
});

export const insertIntegrationWebhookSchema = createInsertSchema(integrationWebhooks).pick({
  integrationId: true,
  userId: true,
  name: true,
  url: true,
  events: true,
  secretKey: true,
  isActive: true,
});

export const insertScheduledBulkJobSchema = createInsertSchema(scheduledBulkJobs).pick({
  userId: true,
  name: true,
  scheduleTime: true,
  timezone: true,
  isActive: true,
  selectedNiches: true,
  tones: true,
  templates: true,
  platforms: true,
  useExistingProducts: true,
  generateAffiliateLinks: true,
  useSpartanFormat: true,
  topRatedStyleUsed: true,
  aiModel: true,
  affiliateId: true,
  webhookUrl: true,
  sendToMakeWebhook: true,
});

export const insertMarketingAutomationSchema = createInsertSchema(marketingAutomations).pick({
  userId: true,
  name: true,
  triggerEvent: true,
  triggerConditions: true,
  actions: true,
  integrationIds: true,
  isActive: true,
});

export const insertTrendingEmojisHashtagsSchema = createInsertSchema(trendingEmojisHashtags).pick({
  niche: true,
  hashtags: true,
  emojis: true,
});

// Content evaluation schema for AI self-assessment
export const contentEvaluations = pgTable("content_evaluations", {
  id: serial("id").primaryKey(),
  contentHistoryId: integer("content_history_id").notNull().references(() => contentHistory.id, { onDelete: 'cascade' }),
  evaluatorModel: varchar("evaluator_model", { length: 20 }).notNull(), // 'chatgpt' or 'claude'
  viralityScore: integer("virality_score").notNull(),
  clarityScore: integer("clarity_score").notNull(),
  persuasivenessScore: integer("persuasiveness_score").notNull(),
  creativityScore: integer("creativity_score").notNull(),
  viralityJustification: text("virality_justification").notNull(),
  clarityJustification: text("clarity_justification").notNull(),
  persuasivenessJustification: text("persuasiveness_justification").notNull(),
  creativityJustification: text("creativity_justification").notNull(),
  needsRevision: boolean("needs_revision").notNull().default(false),
  improvementSuggestions: text("improvement_suggestions"),
  overallScore: varchar("overall_score", { length: 10 }), // Calculated average (kept as varchar to match DB)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Insert schema for content evaluations
export const insertContentEvaluationSchema = createInsertSchema(contentEvaluations).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type AiModelConfig = typeof aiModelConfigs.$inferSelect;
export type InsertAiModelConfig = z.infer<typeof insertAiModelConfigSchema>;

export type ContentGeneration = typeof contentGenerations.$inferSelect;
export type InsertContentGeneration = z.infer<typeof insertContentGenerationSchema>;

export type TrendingProduct = typeof trendingProducts.$inferSelect;
export type InsertTrendingProduct = z.infer<typeof insertTrendingProductSchema>;

export type ScraperStatus = typeof scraperStatus.$inferSelect;
export type InsertScraperStatus = z.infer<typeof insertScraperStatusSchema>;

export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;

export type ContentOptimization = typeof contentOptimizations.$inferSelect;
export type InsertContentOptimization = z.infer<typeof insertContentOptimizationSchema>;

export type AdvancedContentOptimization = typeof advancedContentOptimizations.$inferSelect;
export type InsertAdvancedContentOptimization = z.infer<typeof insertAdvancedContentOptimizationSchema>;

export type ContentPerformance = typeof contentPerformance.$inferSelect;
export type InsertContentPerformance = z.infer<typeof insertContentPerformanceSchema>;

export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = z.infer<typeof insertContentVersionSchema>;

export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type InsertApiIntegration = z.infer<typeof insertApiIntegrationSchema>;

export type SocialMediaPlatform = typeof socialMediaPlatforms.$inferSelect;
export type InsertSocialMediaPlatform = z.infer<typeof insertSocialMediaPlatformSchema>;

export type PublishedContent = typeof publishedContent.$inferSelect;
export type InsertPublishedContent = z.infer<typeof insertPublishedContentSchema>;

export type ApiRateLimit = typeof apiRateLimits.$inferSelect;
export type InsertApiRateLimit = z.infer<typeof insertApiRateLimitSchema>;

export type IntegrationWebhook = typeof integrationWebhooks.$inferSelect;
export type InsertIntegrationWebhook = z.infer<typeof insertIntegrationWebhookSchema>;

export type ScheduledBulkJob = typeof scheduledBulkJobs.$inferSelect;
export type InsertScheduledBulkJob = z.infer<typeof insertScheduledBulkJobSchema>;

export type MarketingAutomation = typeof marketingAutomations.$inferSelect;
export type InsertMarketingAutomation = z.infer<typeof insertMarketingAutomationSchema>;

export type TrendingEmojisHashtags = typeof trendingEmojisHashtags.$inferSelect;
export type InsertTrendingEmojisHashtags = z.infer<typeof insertTrendingEmojisHashtagsSchema>;

export const insertContentHistorySchema = createInsertSchema(contentHistory).pick({
  userId: true,
  niche: true,
  contentType: true,
  tone: true,
  productName: true,
  promptText: true,
  outputText: true,
  modelUsed: true,
  tokenCount: true,
});

export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = z.infer<typeof insertContentHistorySchema>;

export const insertBulkContentJobSchema = createInsertSchema(bulkContentJobs).pick({
  jobId: true,
  userId: true,
  autoSelectedProducts: true,
  selectedNiches: true,
  tones: true,
  templates: true,
  platforms: true,
  scheduleAfterGeneration: true,
  scheduledTime: true,
  makeWebhookUrl: true,
});

export const insertBulkGeneratedContentSchema = createInsertSchema(bulkGeneratedContent).pick({
  bulkJobId: true,
  productName: true,
  niche: true,
  tone: true,
  template: true,
  platforms: true,
  generatedContent: true,
  viralInspiration: true,
  affiliateLink: true,
  modelUsed: true,
  tokenCount: true,
  generationTime: true,
});

export type BulkContentJob = typeof bulkContentJobs.$inferSelect;
export type InsertBulkContentJob = z.infer<typeof insertBulkContentJobSchema>;

export type BulkGeneratedContent = typeof bulkGeneratedContent.$inferSelect;
export type InsertBulkGeneratedContent = z.infer<typeof insertBulkGeneratedContentSchema>;

// Insert schemas for rating system
export const insertContentRatingSchema = createInsertSchema(contentRatings).pick({
  contentHistoryId: true,
  userId: true,
  overallRating: true,
  instagramRating: true,
  tiktokRating: true,
  youtubeRating: true,
  twitterRating: true,
  notes: true,
});

export const insertContentPatternSchema = createInsertSchema(contentPatterns).pick({
  patternName: true,
  description: true,
  niche: true,
  templateType: true,
  tone: true,
  platform: true,
  averageRating: true,
  sampleCount: true,
  confidence: true,
  averageWordCount: true,
  commonPhrases: true,
  sentenceStructures: true,
  emotionalTone: true,
  callToActionStyle: true,
  hookType: true,
  bestPerformingElements: true,
  avoidancePatterns: true,
  minimumSamples: true,
});

export const insertUserContentPreferencesSchema = createInsertSchema(userContentPreferences).pick({
  userId: true,
  useSmartLearning: true,
  learningIntensity: true,
  minOverallRating: true,
  minPlatformRating: true,
  personalizedWeights: true,
});

export const insertPatternApplicationSchema = createInsertSchema(patternApplications).pick({
  contentHistoryId: true,
  patternId: true,
  applicationStrength: true,
  modifiedAttributes: true,
  resultingRating: true,
  patternEffectiveness: true,
});

// Type exports for rating system
export type ContentRating = typeof contentRatings.$inferSelect;
export type InsertContentRating = z.infer<typeof insertContentRatingSchema>;

export type ContentPattern = typeof contentPatterns.$inferSelect;
export type InsertContentPattern = z.infer<typeof insertContentPatternSchema>;

export type UserContentPreferences = typeof userContentPreferences.$inferSelect;
export type InsertUserContentPreferences = z.infer<typeof insertUserContentPreferencesSchema>;

export type PatternApplication = typeof patternApplications.$inferSelect;
export type InsertPatternApplication = z.infer<typeof insertPatternApplicationSchema>;

// Insert schemas for new tracking tables
export const insertClickLogSchema = createInsertSchema(clickLogs).pick({
  slug: true,
  affiliateUrl: true,
  product: true,
  niche: true,
  platform: true,
  contentType: true,
  source: true,
});

export const insertClickEventSchema = createInsertSchema(clickEvents).pick({
  slugId: true,
  ipAddress: true,
  userAgent: true,
  referrer: true,
});

export const insertPostMetricSchema = createInsertSchema(postMetrics).pick({
  contentId: true,
  slugId: true,
  platform: true,
  views: true,
  likes: true,
  comments: true,
  shares: true,
  clicks: true,
  purchases: true,
  ctr: true,
  conversionRate: true,
  aiScore: true,
  gptAnalysis: true,
});

export const insertContentHookSchema = createInsertSchema(contentHooks).pick({
  contentId: true,
  hookText: true,
  viralityScore: true,
  clarityScore: true,
  emotionalScore: true,
  overallScore: true,
  isSelected: true,
});

export const insertPlatformContentSchema = createInsertSchema(platformContent).pick({
  contentId: true,
  platform: true,
  formattedContent: true,
  hashtags: true,
  title: true,
  tags: true,
  scheduledTime: true,
  publishedAt: true,
  publishStatus: true,
});

// Type exports for new tables
export type ClickLog = typeof clickLogs.$inferSelect;
export type InsertClickLog = z.infer<typeof insertClickLogSchema>;

export type ClickEvent = typeof clickEvents.$inferSelect;
export type InsertClickEvent = z.infer<typeof insertClickEventSchema>;

export type ContentEvaluation = typeof contentEvaluations.$inferSelect;
export type InsertContentEvaluation = z.infer<typeof insertContentEvaluationSchema>;

export type PostMetric = typeof postMetrics.$inferSelect;
export type InsertPostMetric = z.infer<typeof insertPostMetricSchema>;

export type ContentHook = typeof contentHooks.$inferSelect;
export type InsertContentHook = z.infer<typeof insertContentHookSchema>;

export type PlatformContent = typeof platformContent.$inferSelect;
export type InsertPlatformContent = z.infer<typeof insertPlatformContentSchema>;

// Insert schemas for new feature tables
export const insertScheduledPostSchema = createInsertSchema(scheduledPosts).pick({
  contentId: true,
  platforms: true,
  scheduledTime: true,
  status: true,
  bulkJobId: true,
  makeWebhookUrl: true,
  platformResults: true,
  errorMessage: true,
});

export const insertPerformanceAnalyticsSchema = createInsertSchema(performanceAnalytics).pick({
  contentId: true,
  scheduledPostId: true,
  platform: true,
  views: true,
  likes: true,
  comments: true,
  shares: true,
  saves: true,
  clicks: true,
  clickThroughRate: true,
  conversions: true,
  conversionRate: true,
  revenue: true,
  commission: true,
  roi: true,
  adSpend: true,
  cpc: true,
  cpm: true,
  dateRange: true,
});

// Type exports for new feature tables
export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;

export type PerformanceAnalytics = typeof performanceAnalytics.$inferSelect;
export type InsertPerformanceAnalytics = z.infer<typeof insertPerformanceAnalyticsSchema>;

// Favorite products insert schema and types
export const insertFavoriteProductSchema = createInsertSchema(favoriteProducts).pick({
  userId: true,
  productId: true,
});

export type FavoriteProduct = typeof favoriteProducts.$inferSelect;
export type InsertFavoriteProduct = z.infer<typeof insertFavoriteProductSchema>;

// ==========================================================================
// COOKAING MARKETING ENGINE SCHEMA
// ==========================================================================

// Organization schema - single organization setup by default
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("starter"), // starter, pro, enterprise
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Segments for dynamic audience targeting
export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  rulesJson: jsonb("rules_json").notNull(), // dynamic audience rules
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact schema with pantry and preferences
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: text("email").notNull().unique(),
  name: text("name"),
  prefsJson: jsonb("prefs_json"), // user preferences
  pantryJson: jsonb("pantry_json"), // pantry contents
  segmentIds: text("segment_ids").array().default([]), // array of segment IDs
  // Attribution tracking
  firstTouchUtmSource: text("first_touch_utm_source"),
  firstTouchUtmMedium: text("first_touch_utm_medium"),
  firstTouchUtmCampaign: text("first_touch_utm_campaign"),
  firstTouchUtmTerm: text("first_touch_utm_term"),
  firstTouchUtmContent: text("first_touch_utm_content"),
  firstTouchGclid: text("first_touch_gclid"), // Google Ads click ID
  firstTouchFbclid: text("first_touch_fbclid"), // Facebook click ID
  firstTouchAt: timestamp("first_touch_at"),
  lastTouchUtmSource: text("last_touch_utm_source"),
  lastTouchUtmMedium: text("last_touch_utm_medium"),
  lastTouchUtmCampaign: text("last_touch_utm_campaign"),
  lastTouchUtmTerm: text("last_touch_utm_term"),
  lastTouchUtmContent: text("last_touch_utm_content"),
  lastTouchGclid: text("last_touch_gclid"),
  lastTouchFbclid: text("last_touch_fbclid"),
  lastTouchAt: timestamp("last_touch_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content brief for campaign creation
export const contentBriefs = pgTable("content_briefs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  goal: text("goal").notNull(),
  audience: text("audience").notNull(),
  inputsJson: jsonb("inputs_json"), // additional inputs
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Campaign schema
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // email, blog, social, push, multi
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"), // draft, scheduled, sent
  scheduledAt: timestamp("scheduled_at"),
  metaJson: jsonb("meta_json"), // additional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Campaign artifacts - stores generated JSON for each channel
export const campaignArtifacts = pgTable("campaign_artifacts", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  channel: text("channel").notNull(), // email, blog, social, push
  payloadJson: jsonb("payload_json").notNull(), // generated content
  variant: text("variant").default("A"), // A/B testing variants
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("campaign_artifacts_campaign_id_idx").on(table.campaignId),
}));

// Campaign recipients tracking
export const campaignRecipients = pgTable("campaign_recipients", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  variant: text("variant").default("A"),
  sentAt: timestamp("sent_at"),
  openAt: timestamp("open_at"),
  clickAt: timestamp("click_at"),
  bounceAt: timestamp("bounce_at"),
  unsubscribeAt: timestamp("unsubscribe_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  campaignContactIdx: index("campaign_recipients_campaign_contact_idx").on(table.campaignId, table.contactId),
  campaignIdIdx: index("campaign_recipients_campaign_id_idx").on(table.campaignId),
}));

// Workflow definitions
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  definitionJson: jsonb("definition_json").notNull(), // workflow steps
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact workflow state tracking
export const contactWorkflowStates = pgTable("contact_workflow_states", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  stepIndex: integer("step_index").notNull().default(0),
  lastAt: timestamp("last_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.contactId, table.workflowId),
  };
});

// Forms for lead generation
export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  slug: text("slug").notNull().unique(),
  schemaJson: jsonb("schema_json").notNull(), // form field definitions
  rulesJson: jsonb("rules_json"), // segment assignment rules
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Form submissions
export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id, { onDelete: 'cascade' }),
  contactId: integer("contact_id").references(() => contacts.id),
  dataJson: jsonb("data_json").notNull(), // submitted form data
  utmJson: jsonb("utm_json"), // UTM parameters
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  formCreatedIdx: index("form_submissions_form_created_idx").on(table.formId, table.createdAt),
  formIdIdx: index("form_submissions_form_id_idx").on(table.formId),
}));

// Lead scoring system
export const leadScores = pgTable("lead_scores", {
  contactId: integer("contact_id").primaryKey().references(() => contacts.id, { onDelete: 'cascade' }),
  score: integer("score").notNull().default(0),
  reasonsJson: jsonb("reasons_json"), // scoring breakdown
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Page events for analytics
export const pageEvents = pgTable("page_events", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  contactId: integer("contact_id").references(() => contacts.id),
  anonId: text("anon_id"), // anonymous visitor ID
  event: text("event").notNull(),
  propsJson: jsonb("props_json"), // event properties
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Affiliate products management
export const affiliateProducts = pgTable("affiliate_products", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  source: text("source").notNull(), // amazon, instacart, manual
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  price: decimal("price"),
  imageUrl: text("image_url"),
  attributesJson: jsonb("attributes_json"), // additional product attributes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email event types enum
export const emailEventTypeEnum = pgEnum("email_event_type", [
  "sent",
  "delivered", 
  "open",
  "click",
  "bounce",
  "unsubscribe",
  "complaint"
]);

// Analytics events for marketing activities
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'campaign', 'workflow', 'form', etc.
  entityId: integer("entity_id").notNull(),
  contactId: integer("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  emailEventType: emailEventTypeEnum("email_event_type"), // For email-specific events
  metaJson: jsonb("meta_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  kind: text("kind").notNull(), // recipe_card, pantry_tip, meal_plan, viral_script, comparison, email_layout, carousel
  name: text("name").notNull(),
  schemaJson: jsonb("schema_json").notNull(), // template schema
  renderFnRef: text("render_fn_ref"), // reference to render function
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// A/B testing system
export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  entity: text("entity").notNull(), // headline, cta, subject
  contextJson: jsonb("context_json").notNull(), // test context
  variantAJson: jsonb("variant_a_json").notNull(),
  variantBJson: jsonb("variant_b_json").notNull(),
  status: text("status").notNull().default("running"), // running, completed, paused
  winner: text("winner"), // A, B, or null
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// A/B test assignments
export const abAssignments = pgTable("ab_assignments", {
  id: serial("id").primaryKey(),
  abTestId: integer("ab_test_id").notNull().references(() => abTests.id, { onDelete: 'cascade' }),
  contactId: integer("contact_id").references(() => contacts.id, { onDelete: 'set null' }),
  anonId: text("anon_id"), // for anonymous users
  variant: text("variant").notNull(), // A or B
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// A/B test conversions
export const abConversions = pgTable("ab_conversions", {
  id: serial("id").primaryKey(),
  abTestId: integer("ab_test_id").notNull().references(() => abTests.id, { onDelete: 'cascade' }),
  assignmentId: integer("assignment_id").references(() => abAssignments.id, { onDelete: 'set null' }),
  variant: text("variant").notNull(), // A or B
  conversionType: text("conversion_type").notNull(), // signup, purchase, etc.
  value: decimal("value"), // conversion value if applicable
  metadata: jsonb("metadata"), // additional conversion data
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate conversions for same assignment and conversion type
  assignmentConversionUnique: uniqueIndex("ab_conversions_assignment_conversion_unique")
    .on(table.assignmentId, table.conversionType),
  // Add performance indexes
  abTestIdIdx: index("ab_conversions_ab_test_id_idx").on(table.abTestId),
  abTestVariantIdx: index("ab_conversions_ab_test_variant_idx").on(table.abTestId, table.variant),
}));

// Cost tracking for ROAS analysis
export const costs = pgTable("costs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  campaignPlatform: text("campaign_platform").notNull(), // facebook, google, tiktok, etc.
  campaignName: text("campaign_name").notNull(),
  cost: decimal("cost").notNull(),
  currency: text("currency").notNull().default("USD"),
  metaJson: jsonb("meta_json"), // additional cost data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("costs_date_idx").on(table.date),
  campaignPlatformIdx: index("costs_campaign_platform_idx").on(table.campaignPlatform),
  orgIdDateIdx: index("costs_org_id_date_idx").on(table.orgId, table.date),
}));

// Audit logging for compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  actorId: integer("actor_id").references(() => users.id),
  entity: text("entity").notNull(), // table/resource name
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(), // create, update, delete, view
  beforeJson: jsonb("before_json"), // state before change
  afterJson: jsonb("after_json"), // state after change
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================================================
// COOKAING MARKETING ENGINE INSERT SCHEMAS & TYPES
// ==========================================================================

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSegmentSchema = createInsertSchema(segments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContentBriefSchema = createInsertSchema(contentBriefs).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCampaignArtifactSchema = createInsertSchema(campaignArtifacts).omit({ id: true, createdAt: true });
export const insertCampaignRecipientSchema = createInsertSchema(campaignRecipients).omit({ id: true, createdAt: true });
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactWorkflowStateSchema = createInsertSchema(contactWorkflowStates).omit({ id: true, createdAt: true });
export const insertFormSchema = createInsertSchema(forms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({ id: true, createdAt: true });
export const insertLeadScoreSchema = createInsertSchema(leadScores).omit({ updatedAt: true });
export const insertPageEventSchema = createInsertSchema(pageEvents).omit({ id: true, createdAt: true });
export const insertAffiliateProductSchema = createInsertSchema(affiliateProducts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true, createdAt: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertABTestSchema = createInsertSchema(abTests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertABAssignmentSchema = createInsertSchema(abAssignments).omit({ id: true, createdAt: true });
export const insertABConversionSchema = createInsertSchema(abConversions).omit({ id: true, createdAt: true });
export const insertCostSchema = createInsertSchema(costs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertContentBlueprintSchema = createInsertSchema(contentBlueprints).omit({ id: true, createdAt: true });
export const insertContentJobSchema = createInsertSchema(contentJobs).omit({ id: true, createdAt: true, updatedAt: true });

// CookAIng Content History & Rating insert schemas
export const insertCookaingContentVersionSchema = createInsertSchema(cookaingContentVersions).omit({ 
  id: true, 
  createdAt: true,
  version: true  // Auto-incremented within scope
});
export const insertCookaingContentRatingSchema = createInsertSchema(cookaingContentRatings).omit({ 
  id: true, 
  createdAt: true,
  ratedAt: true  // Auto-generated timestamp
});
export const insertContentLinkSchema = createInsertSchema(contentLinks).omit({ 
  id: true, 
  createdAt: true 
});
export const insertContentExportSchema = createInsertSchema(contentExports).omit({ 
  id: true, 
  createdAt: true 
});

// Type exports
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = z.infer<typeof insertSegmentSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type ContentBrief = typeof contentBriefs.$inferSelect;
export type InsertContentBrief = z.infer<typeof insertContentBriefSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CampaignArtifact = typeof campaignArtifacts.$inferSelect;
export type InsertCampaignArtifact = z.infer<typeof insertCampaignArtifactSchema>;

export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = z.infer<typeof insertCampaignRecipientSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type ContactWorkflowState = typeof contactWorkflowStates.$inferSelect;
export type InsertContactWorkflowState = z.infer<typeof insertContactWorkflowStateSchema>;

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;

export type LeadScore = typeof leadScores.$inferSelect;
export type InsertLeadScore = z.infer<typeof insertLeadScoreSchema>;

export type PageEvent = typeof pageEvents.$inferSelect;
export type InsertPageEvent = z.infer<typeof insertPageEventSchema>;

export type AffiliateProduct = typeof affiliateProducts.$inferSelect;
export type InsertAffiliateProduct = z.infer<typeof insertAffiliateProductSchema>;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type ABTest = typeof abTests.$inferSelect;
export type InsertABTest = z.infer<typeof insertABTestSchema>;

export type ABAssignment = typeof abAssignments.$inferSelect;
export type InsertABAssignment = z.infer<typeof insertABAssignmentSchema>;

export type ABConversion = typeof abConversions.$inferSelect;
export type InsertABConversion = z.infer<typeof insertABConversionSchema>;

export type Cost = typeof costs.$inferSelect;
export type InsertCost = z.infer<typeof insertCostSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type ContentBlueprint = typeof contentBlueprints.$inferSelect;
export type InsertContentBlueprint = z.infer<typeof insertContentBlueprintSchema>;

export type ContentJob = typeof contentJobs.$inferSelect;
export type InsertContentJob = z.infer<typeof insertContentJobSchema>;

// CookAIng Content History & Rating types
export type CookaingContentVersion = typeof cookaingContentVersions.$inferSelect;
export type InsertCookaingContentVersion = z.infer<typeof insertCookaingContentVersionSchema>;

export type CookaingContentRating = typeof cookaingContentRatings.$inferSelect;
export type InsertCookaingContentRating = z.infer<typeof insertCookaingContentRatingSchema>;

export type ContentLink = typeof contentLinks.$inferSelect;
export type InsertContentLink = z.infer<typeof insertContentLinkSchema>;

export type ContentExport = typeof contentExports.$inferSelect;
export type InsertContentExport = z.infer<typeof insertContentExportSchema>;

// ================================================================
// CookAIng Marketing Engine Extension Tables (Phase 1)
// ================================================================

// Media assets for content enhancements
export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'image' | 'video' | 'audio'
  source: text("source").notNull().default("upload"), // 'gen' | 'upload'
  url: text("url").notNull(),
  thumbUrl: text("thumb_url"),
  metadataJson: jsonb("metadata_json"),
  status: text("status").notNull().default("active"), // 'active' | 'processing' | 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    typeIdx: index("media_assets_type_idx").on(table.type),
    statusIdx: index("media_assets_status_idx").on(table.status),
    createdIdx: index("media_assets_created_idx").on(table.createdAt),
  };
});

// Content enhancements (AI-generated variations)
export const contentEnhancements = pgTable("content_enhancements", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id"), // FK to existing content versions
  enhancement: text("enhancement").notNull(), // 'rewrite' | 'spin' | 'tts' | 'image' | 'video'
  inputsJson: jsonb("inputs_json").notNull(),
  outputsJson: jsonb("outputs_json"),
  provider: text("provider").notNull(), // 'openai' | 'anthropic' | 'elevenlabs' | etc
  status: text("status").notNull().default("pending"), // 'pending' | 'completed' | 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    versionIdx: index("content_enhancements_version_idx").on(table.versionId),
    enhancementIdx: index("content_enhancements_enhancement_idx").on(table.enhancement),
    statusIdx: index("content_enhancements_status_idx").on(table.status),
  };
});

// Competitor posts for analysis
export const competitorPosts = pgTable("competitor_posts", {
  id: serial("id").primaryKey(),
  sourcePlatform: text("source_platform").notNull(),
  author: text("author").notNull(),
  url: text("url").notNull(),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
  text: text("text"),
  metricsJson: jsonb("metrics_json"), // likes, shares, comments, etc
  tags: text("tags").array(), // array of tags
}, (table) => {
  return {
    platformIdx: index("competitor_posts_platform_idx").on(table.sourcePlatform),
    capturedIdx: index("competitor_posts_captured_idx").on(table.capturedAt),
    authorIdx: index("competitor_posts_author_idx").on(table.author),
  };
});

// Sentiment analysis snapshots
export const sentimentSnapshots = pgTable("sentiment_snapshots", {
  id: serial("id").primaryKey(),
  scope: text("scope").notNull(), // 'campaign' | 'post' | 'brand'
  refId: integer("ref_id").notNull(),
  score: decimal("score", { precision: 3, scale: 2 }).notNull(), // -1.00 to 1.00
  magnitude: decimal("magnitude", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  labelsJson: jsonb("labels_json"), // detailed sentiment breakdown
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    scopeRefIdx: index("sentiment_snapshots_scope_ref_idx").on(table.scope, table.refId),
    createdIdx: index("sentiment_snapshots_created_idx").on(table.createdAt),
  };
});

// Viral potential scores
export const viralScores = pgTable("viral_scores", {
  id: serial("id").primaryKey(),
  contentVersionId: integer("content_version_id").notNull(),
  featuresJson: jsonb("features_json").notNull(), // engagement, trend, emotion, etc scores
  score: decimal("score", { precision: 5, scale: 2 }).notNull(), // 0.00 to 100.00
  model: text("model").notNull().default("baseline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    versionIdx: index("viral_scores_version_idx").on(table.contentVersionId),
    scoreIdx: index("viral_scores_score_idx").on(table.score),
    createdIdx: index("viral_scores_created_idx").on(table.createdAt),
  };
});

// Content fatigue signals
export const fatigueSignals = pgTable("fatigue_signals", {
  id: serial("id").primaryKey(),
  segmentId: integer("segment_id"), // optional segment ID
  topic: text("topic").notNull(),
  slope: decimal("slope", { precision: 5, scale: 4 }).notNull(), // engagement trend slope
  lastSeenAt: timestamp("last_seen_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    topicIdx: index("fatigue_signals_topic_idx").on(table.topic),
    segmentIdx: index("fatigue_signals_segment_idx").on(table.segmentId),
    lastSeenIdx: index("fatigue_signals_last_seen_idx").on(table.lastSeenAt),
  };
});

// Social media publishing queue
export const socialQueue = pgTable("social_queue", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook'
  accountId: text("account_id").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  payloadJson: jsonb("payload_json").notNull(), // post content, media, hashtags, etc
  status: text("status").notNull().default("queued"), // 'queued' | 'published' | 'failed' | 'cancelled'
  resultJson: jsonb("result_json"), // API response, error details, etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    platformIdx: index("social_queue_platform_idx").on(table.platform),
    statusIdx: index("social_queue_status_idx").on(table.status),
    scheduledIdx: index("social_queue_scheduled_idx").on(table.scheduledAt),
    createdIdx: index("social_queue_created_idx").on(table.createdAt),
  };
});

// Hashtag suggestions for topics/platforms
export const hashtagSuggestions = pgTable("hashtag_suggestions", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  platform: text("platform").notNull(),
  tags: text("tags").array().notNull(), // array of hashtag strings
  metricsJson: jsonb("metrics_json"), // popularity, competition, relevance scores
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    topicPlatformIdx: index("hashtag_suggestions_topic_platform_idx").on(table.topic, table.platform),
    createdIdx: index("hashtag_suggestions_created_idx").on(table.createdAt),
  };
});

// Optimal posting times analysis
export const optimalTimes = pgTable("optimal_times", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  segmentId: integer("segment_id"), // optional audience segment
  timesJson: jsonb("times_json").notNull(), // {monday: ['09:00', '12:00'], ...}
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    platformIdx: index("optimal_times_platform_idx").on(table.platform),
    segmentIdx: index("optimal_times_segment_idx").on(table.segmentId),
    createdIdx: index("optimal_times_created_idx").on(table.createdAt),
  };
});

// Brand voice profiles for consistency
export const brandVoiceProfiles = pgTable("brand_voice_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  corpusJson: jsonb("corpus_json").notNull(), // samples, characteristics, tone markers
  embeddingVector: text("embedding_vector"), // serialized vector for similarity
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index("brand_voice_profiles_name_idx").on(table.name),
    createdIdx: index("brand_voice_profiles_created_idx").on(table.createdAt),
  };
});

// Approval workflows
export const approvals = pgTable("approvals", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // 'campaign' | 'artifact' | 'version'
  entityId: integer("entity_id").notNull(),
  status: text("status").notNull().default("draft"), // 'draft' | 'review' | 'approved' | 'rejected'
  assignee: text("assignee"), // user email or ID
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    entityIdx: index("approvals_entity_idx").on(table.entityType, table.entityId),
    statusIdx: index("approvals_status_idx").on(table.status),
    assigneeIdx: index("approvals_assignee_idx").on(table.assignee),
    createdIdx: index("approvals_created_idx").on(table.createdAt),
  };
});

// Collaboration roles and permissions
export const collaborationRoles = pgTable("collaboration_roles", {
  id: serial("id").primaryKey(),
  user: text("user").notNull(), // email or user ID
  role: text("role").notNull(), // 'admin' | 'editor' | 'viewer' | 'client'
  scopesJson: jsonb("scopes_json").notNull(), // permissions object
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index("collaboration_roles_user_idx").on(table.user),
    roleIdx: index("collaboration_roles_role_idx").on(table.role),
    createdIdx: index("collaboration_roles_created_idx").on(table.createdAt),
  };
});

// Content calendar for scheduling
export const contentCalendar = pgTable("content_calendar", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  channel: text("channel").notNull(), // platform or channel type
  refId: integer("ref_id"), // reference to campaign, content, etc
  status: text("status").notNull().default("scheduled"), // 'scheduled' | 'published' | 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    channelIdx: index("content_calendar_channel_idx").on(table.channel),
    statusIdx: index("content_calendar_status_idx").on(table.status),
    startIdx: index("content_calendar_start_idx").on(table.startAt),
    refIdx: index("content_calendar_ref_idx").on(table.refId),
  };
});

// E-commerce product catalog
export const ecommerceProducts = pgTable("ecommerce_products", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // 'shopify' | 'woocommerce' | 'manual'
  externalId: text("external_id").notNull(),
  title: text("title").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  url: text("url").notNull(),
  image: text("image"),
  inventoryJson: jsonb("inventory_json"), // stock, variants, etc
  tags: text("tags").array(), // product tags
}, (table) => {
  return {
    sourceIdx: index("ecommerce_products_source_idx").on(table.source),
    externalIdIdx: index("ecommerce_products_external_id_idx").on(table.externalId),
    titleIdx: index("ecommerce_products_title_idx").on(table.title),
    priceIdx: index("ecommerce_products_price_idx").on(table.price),
  };
});

// Advanced messaging sequences
export const messagingSequences = pgTable("messaging_sequences", {
  id: serial("id").primaryKey(),
  channel: text("channel").notNull(), // 'email' | 'sms' | 'whatsapp'
  name: text("name").notNull(),
  stepsJson: jsonb("steps_json").notNull(), // array of sequence steps
  triggersJson: jsonb("triggers_json").notNull(), // trigger conditions
  status: text("status").notNull().default("draft"), // 'active' | 'paused' | 'draft'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    channelIdx: index("messaging_sequences_channel_idx").on(table.channel),
    statusIdx: index("messaging_sequences_status_idx").on(table.status),
    nameIdx: index("messaging_sequences_name_idx").on(table.name),
    createdIdx: index("messaging_sequences_created_idx").on(table.createdAt),
  };
});

// Content moderation reports
export const moderationReports = pgTable("moderation_reports", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").notNull(),
  checksJson: jsonb("checks_json").notNull(), // toxicity, spam, inappropriate, etc
  decisionsJson: jsonb("decisions_json").notNull(), // approved, blocked, manual_review
  status: text("status").notNull().default("pending"), // 'passed' | 'flagged' | 'blocked'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    versionIdx: index("moderation_reports_version_idx").on(table.versionId),
    statusIdx: index("moderation_reports_status_idx").on(table.status),
    createdIdx: index("moderation_reports_created_idx").on(table.createdAt),
  };
});

// Plagiarism detection reports
export const plagiarismReports = pgTable("plagiarism_reports", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(), // 0.00 to 100.00
  matchesJson: jsonb("matches_json").notNull(), // array of match objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    versionIdx: index("plagiarism_reports_version_idx").on(table.versionId),
    scoreIdx: index("plagiarism_reports_score_idx").on(table.score),
    createdIdx: index("plagiarism_reports_created_idx").on(table.createdAt),
  };
});

// Unified content records table for both GlowBot and CookAIng
export const contentRecords = pgTable("content_records", {
  id: varchar("id").primaryKey(), // Unified ID from both apps
  sourceApp: text("source_app").notNull(), // 'glowbot' or 'cookAIng'
  contentType: text("content_type").notNull(), // Type specific to each app
  title: text("title"),
  body: text("body"), // Main content text
  blocks: jsonb("blocks"), // Flexible content structure as JSON
  metadata: jsonb("metadata").notNull(), // App-specific metadata
  rating: integer("rating"), // 1-5 user rating
  isFavorite: boolean("is_favorite").default(false),
  dedupeHash: varchar("dedupe_hash", { length: 32 }), // For content deduplication
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    sourceIdx: index("content_records_source_idx").on(table.sourceApp),
    typeIdx: index("content_records_type_idx").on(table.contentType),
    createdIdx: index("content_records_created_idx").on(table.createdAt),
    ratingIdx: index("content_records_rating_idx").on(table.rating),
    favoriteIdx: index("content_records_favorite_idx").on(table.isFavorite),
    dedupeIdx: index("content_records_dedupe_idx").on(table.dedupeHash),
    // Composite indexes for common queries
    appTypeIdx: index("content_records_app_type_idx").on(table.sourceApp, table.contentType),
    appCreatedIdx: index("content_records_app_created_idx").on(table.sourceApp, table.createdAt),
  };
});

// ================================================================
// Zod schemas for the new tables
// ================================================================

export const insertContentRecordSchema = createInsertSchema(contentRecords);
export const insertMediaAssetSchema = createInsertSchema(mediaAssets);
export const insertContentEnhancementSchema = createInsertSchema(contentEnhancements);
export const insertCompetitorPostSchema = createInsertSchema(competitorPosts);
export const insertSentimentSnapshotSchema = createInsertSchema(sentimentSnapshots);
export const insertViralScoreSchema = createInsertSchema(viralScores);
export const insertFatigueSignalSchema = createInsertSchema(fatigueSignals);
export const insertSocialQueueSchema = createInsertSchema(socialQueue);
export const insertHashtagSuggestionSchema = createInsertSchema(hashtagSuggestions);
export const insertOptimalTimesSchema = createInsertSchema(optimalTimes);
export const insertBrandVoiceProfileSchema = createInsertSchema(brandVoiceProfiles);
export const insertApprovalSchema = createInsertSchema(approvals);
export const insertCollaborationRoleSchema = createInsertSchema(collaborationRoles);
export const insertContentCalendarSchema = createInsertSchema(contentCalendar);
export const insertEcommerceProductSchema = createInsertSchema(ecommerceProducts);
export const insertMessagingSequenceSchema = createInsertSchema(messagingSequences);
export const insertModerationReportSchema = createInsertSchema(moderationReports);
export const insertPlagiarismReportSchema = createInsertSchema(plagiarismReports);

// ================================================================
// Type exports for the new tables
// ================================================================

export type ContentRecord = typeof contentRecords.$inferSelect;
export type InsertContentRecord = z.infer<typeof insertContentRecordSchema>;

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;

export type ContentEnhancement = typeof contentEnhancements.$inferSelect;
export type InsertContentEnhancement = z.infer<typeof insertContentEnhancementSchema>;

export type CompetitorPost = typeof competitorPosts.$inferSelect;
export type InsertCompetitorPost = z.infer<typeof insertCompetitorPostSchema>;

export type SentimentSnapshot = typeof sentimentSnapshots.$inferSelect;
export type InsertSentimentSnapshot = z.infer<typeof insertSentimentSnapshotSchema>;

export type ViralScore = typeof viralScores.$inferSelect;
export type InsertViralScore = z.infer<typeof insertViralScoreSchema>;

export type FatigueSignal = typeof fatigueSignals.$inferSelect;
export type InsertFatigueSignal = z.infer<typeof insertFatigueSignalSchema>;

export type SocialQueue = typeof socialQueue.$inferSelect;
export type InsertSocialQueue = z.infer<typeof insertSocialQueueSchema>;

export type HashtagSuggestion = typeof hashtagSuggestions.$inferSelect;
export type InsertHashtagSuggestion = z.infer<typeof insertHashtagSuggestionSchema>;

export type OptimalTimes = typeof optimalTimes.$inferSelect;
export type InsertOptimalTimes = z.infer<typeof insertOptimalTimesSchema>;

export type BrandVoiceProfile = typeof brandVoiceProfiles.$inferSelect;
export type InsertBrandVoiceProfile = z.infer<typeof insertBrandVoiceProfileSchema>;

export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;

export type CollaborationRole = typeof collaborationRoles.$inferSelect;
export type InsertCollaborationRole = z.infer<typeof insertCollaborationRoleSchema>;

export type ContentCalendarItem = typeof contentCalendar.$inferSelect;
export type InsertContentCalendar = z.infer<typeof insertContentCalendarSchema>;

export type EcommerceProduct = typeof ecommerceProducts.$inferSelect;
export type InsertEcommerceProduct = z.infer<typeof insertEcommerceProductSchema>;

export type MessagingSequence = typeof messagingSequences.$inferSelect;
export type InsertMessagingSequence = z.infer<typeof insertMessagingSequenceSchema>;

export type ModerationReport = typeof moderationReports.$inferSelect;
export type InsertModerationReport = z.infer<typeof insertModerationReportSchema>;

export type PlagiarismReport = typeof plagiarismReports.$inferSelect;
export type InsertPlagiarismReport = z.infer<typeof insertPlagiarismReportSchema>;
