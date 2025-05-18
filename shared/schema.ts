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
  source: text("source").notNull(),
  mentions: integer("mentions"),
  sourceUrl: text("source_url"),
  niche: text("niche").notNull().default("skincare"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// User preferences for content generation
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  defaultNiche: text("default_niche"),
  defaultContentType: text("default_content_type"),
  defaultTone: text("default_tone"),
  defaultModel: text("default_model"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content generation history for tracking and analytics
export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }), // Now required with foreign key reference
  niche: text("niche").notNull(),
  contentType: text("content_type").notNull(), // Maps to templateType
  tone: text("tone").notNull(),
  productName: text("product_name").notNull(),
  promptText: text("prompt_text").notNull(),
  outputText: text("output_text").notNull(),
  modelUsed: text("model_used").notNull(),
  tokenCount: integer("token_count").notNull(),
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

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  defaultNiche: true,
  defaultContentType: true,
  defaultTone: true,
  defaultModel: true,
});

export const updateUserPreferencesSchema = createInsertSchema(userPreferences)
  .pick({
    defaultNiche: true,
    defaultContentType: true,
    defaultTone: true,
    defaultModel: true,
  })
  .partial();

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

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
