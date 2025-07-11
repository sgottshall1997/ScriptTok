import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, varchar, decimal, unique } from "drizzle-orm/pg-core";
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
  
  // Ensure one rating per content piece per user
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
  useSmartStyle: boolean("use_smart_style").notNull().default(false),
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
  jobId: text("job_id").notNull().unique(),
  userId: integer("user_id"), // Optional user reference
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  totalVariations: integer("total_variations").notNull().default(0),
  completedVariations: integer("completed_variations").notNull().default(0),
  autoSelectedProducts: jsonb("auto_selected_products"), // Array of selected products per niche
  selectedNiches: text("selected_niches").array().notNull(), // Which niches to generate for
  tones: text("tones").array().notNull(),
  templates: text("templates").array().notNull(),
  platforms: text("platforms").array().notNull(),
  scheduleAfterGeneration: boolean("schedule_after_generation").default(false),
  scheduledTime: timestamp("scheduled_time"),
  makeWebhookUrl: text("make_webhook_url"),
  viralInspiration: jsonb("viral_inspiration"), // Perplexity viral data for each product
  progressLog: jsonb("progress_log"), // Detailed progress tracking
  errorLog: jsonb("error_log"), // Error details if any
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Generated content from bulk jobs
export const bulkGeneratedContent = pgTable("bulk_generated_content", {
  id: serial("id").primaryKey(),
  bulkJobId: text("bulk_job_id").notNull().references(() => bulkContentJobs.jobId, { onDelete: 'cascade' }),
  productName: text("product_name").notNull(),
  niche: text("niche").notNull(),
  tone: text("tone").notNull(),
  template: text("template").notNull(),
  platforms: text("platforms").array().notNull(),
  generatedContent: jsonb("generated_content").notNull(), // Full content with hooks, scripts, captions
  viralInspiration: jsonb("viral_inspiration"), // Product-specific viral data
  affiliateLink: text("affiliate_link"),
  modelUsed: text("model_used").notNull(),
  tokenCount: integer("token_count").notNull(),
  generationTime: integer("generation_time"), // Time taken in ms
  status: text("status").notNull().default("completed"), // completed, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.source, table.date),
  };
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
  useSmartStyle: true,
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
  evaluatorModel: text("evaluator_model").notNull(), // 'chatgpt' or 'claude'
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
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }), // Calculated average
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export type BulkContentJob = typeof bulkContentJobs.$inferSelect;
export type InsertBulkContentJob = z.infer<typeof insertBulkContentJobSchema>;

export type PerformanceAnalytics = typeof performanceAnalytics.$inferSelect;
export type InsertPerformanceAnalytics = z.infer<typeof insertPerformanceAnalyticsSchema>;

// Favorite products insert schema and types
export const insertFavoriteProductSchema = createInsertSchema(favoriteProducts).pick({
  userId: true,
  productId: true,
});

export type FavoriteProduct = typeof favoriteProducts.$inferSelect;
export type InsertFavoriteProduct = z.infer<typeof insertFavoriteProductSchema>;
