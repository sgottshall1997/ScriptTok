import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, varchar, decimal, unique, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===============================================================================
// ESSENTIAL TABLES FOR TIKTOK VIRAL PRODUCT GENERATOR
// ===============================================================================

// Basic user schema (simplified)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  role: text("role").notNull().default("creator"), // creator, admin
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  status: text("status").notNull().default("active"), // active, suspended
  lastLogin: timestamp("last_login"),
  preferences: jsonb("preferences"), // User-specific preferences
  subscriptionTier: text("subscription_tier").notNull().default("free"), // 'free' or 'pro'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions table for auth
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// AI Model Configuration schema for content generation
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

// Content generated schema - Core content generation
export const contentGenerations = pgTable("content_generations", {
  id: serial("id").primaryKey(),
  product: text("product").notNull(),
  niche: text("niche").notNull().default("skincare"),
  templateType: text("template_type").notNull(),
  tone: text("tone").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Trending products schema - Core trending product discovery
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
  
  // Enhanced trend categorization fields
  trendCategory: text("trend_category"), // 'hot', 'rising', 'upcoming', 'declining'
  videoCount: text("video_count"), // "52K videos this week" - string format for display
  growthPercentage: text("growth_percentage"), // "+350%" - string format for display
  trendMomentum: text("trend_momentum"), // Additional momentum description
  
  // Pricing and Amazon data fields
  price: text("price"), // "$12" or "$10/mo" - formatted price string for display
  priceNumeric: decimal("price_numeric"), // 12.00 - numeric value for sorting/filtering
  priceCurrency: text("price_currency").default("USD"), // Currency code
  priceType: text("price_type").default("one-time"), // 'one-time', 'subscription', 'estimated'
  asin: text("asin"), // Amazon Standard Identification Number for linking
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scraper health schema - Monitor API health
export const scraperStatus = pgTable("scraper_status", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: text("status").notNull(), // "active", "gpt-fallback", "degraded", "error", "rate-limited"
  lastCheck: timestamp("last_check").defaultNow().notNull(),
  errorMessage: text("error_message"),
});

// API usage schema - Basic usage tracking
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  count: integer("count").notNull().default(0),
  niche: text("niche"),
  templateType: text("template_type"),
  tone: text("tone"),
  userId: integer("user_id").references(() => users.id),
});

// Content generation history for tracking
export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Optional user reference
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
  aiModel: text("ai_model"), // AI model used (ChatGPT, Claude, etc.)
  contentFormat: text("content_format"), // Regular Format, Spartan Format, etc.
  topRatedStyleUsed: boolean("top_rated_style_used").default(false), // Whether smart style was used
  // User Rating and Comments System
  userOverallRating: integer("user_overall_rating"), // 1-5 star rating from user
  userTiktokRating: integer("user_tiktok_rating"), // Platform-specific user rating (1-5)
  userInstagramRating: integer("user_instagram_rating"), // Platform-specific user rating (1-5)
  userYoutubeRating: integer("user_youtube_rating"), // Platform-specific user rating (1-5)
  userComments: text("user_comments"), // User feedback and comments
  // Viral Score System
  viralScore: jsonb("viral_score"), // Full viral score breakdown from calculateViralScore
  viralScoreOverall: integer("viral_score_overall"), // Overall viral score (0-100) for easy querying
  viralAnalysis: jsonb("viral_analysis"), // AI analysis of viral score with improvement suggestions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily scraper cache for trending products
export const dailyScraperCache = pgTable("daily_scraper_cache", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // 'all_trending', etc.
  date: text("date").notNull(), // YYYY-MM-DD format
  data: jsonb("data"), // Cached trending products array
  success: boolean("success").notNull().default(false),
  error: text("error"), // Error message if cache failed
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    sourceDate: unique().on(table.source, table.date), // Unique per source per day
  };
});

// Trend history for tracking historical trend data
export const trendHistory = pgTable("trend_history", {
  id: serial("id").primaryKey(),
  // Source metadata
  sourceType: text("source_type").notNull(), // 'trend_forecaster' or 'ai_trending_picks'
  niche: text("niche").notNull(), // beauty, tech, fashion, etc.
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  
  // Trend Forecaster specific fields
  trendCategory: text("trend_category"), // 'hot', 'rising', 'upcoming', 'declining' (for forecaster only)
  trendName: text("trend_name"), // Name of the trend (for forecaster)
  trendDescription: text("trend_description"), // Why it's trending description
  trendVolume: text("trend_volume"), // "42,000 videos this week" format
  trendGrowth: text("trend_growth"), // "+28%" format
  trendWhen: text("trend_when"), // When it will peak (for upcoming)
  trendOpportunity: text("trend_opportunity"), // Why creators should jump on this
  trendReason: text("trend_reason"), // Why it's declining (for declining trends)
  
  // AI Trending Picks specific fields
  productTitle: text("product_title"), // Product title (for AI picks)
  productMentions: integer("product_mentions"), // Mention count
  productEngagement: integer("product_engagement"), // Engagement score
  productSource: text("product_source"), // Perplexity, etc.
  productReason: text("product_reason"), // Why this product is trending
  productDescription: text("product_description"), // Product description
  viralKeywords: text("viral_keywords").array(), // Viral keywords
  
  // Shared product information
  productData: jsonb("product_data"), // Array of associated products with pricing info
  
  // Raw data preservation
  rawData: jsonb("raw_data"), // Complete original data for reference
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Amazon products for affiliate monetization
export const amazonProducts = pgTable("amazon_products", {
  id: serial("id").primaryKey(),
  asin: text("asin").notNull().unique(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  price: decimal("price"),
  currency: text("currency").default("USD"),
  imageUrl: text("image_url"),
  category: text("category"),
  rating: decimal("rating"),
  reviewCount: integer("review_count"),
  availability: text("availability"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Affiliate links for monetization tracking
export const affiliateLinks = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => contentGenerations.id),
  productName: text("product_name").notNull(),
  affiliateUrl: text("affiliate_url").notNull(),
  network: text("network").notNull().default("amazon"), // amazon, other networks
  commission: decimal("commission").default("0"),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User identities for authentication providers
export const userIdentities = pgTable("user_identities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), // "replit", "dev", etc.
  providerUserId: text("provider_user_id").notNull(),
  emailAtSignup: text("email_at_signup").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    providerUserUnique: unique().on(table.provider, table.providerUserId),
  };
});

// Subscriptions for user subscription management
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  tier: text("tier").notNull().default("free"),
  status: text("status").notNull().default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Monthly usage for tracking user generation limits
export const monthlyUsage = pgTable("monthly_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  periodMonth: text("period_month").notNull(), // YYYY-MM format like "2025-10"
  gptGenerationsUsed: integer("gpt_generations_used").notNull().default(0),
  claudeGenerationsUsed: integer("claude_generations_used").notNull().default(0),
  trendAnalysesUsed: integer("trend_analyses_used").notNull().default(0),
  userTier: text("user_tier"), // stores tier at time of usage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userPeriodUnique: unique().on(table.userId, table.periodMonth),
  };
});

// ===============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ===============================================================================

// Insert schemas using createInsertSchema from drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentGenerationSchema = createInsertSchema(contentGenerations).omit({
  id: true,
  createdAt: true,
});

export const insertTrendingProductSchema = createInsertSchema(trendingProducts).omit({
  id: true,
  createdAt: true,
  fetchedAt: true,
});

export const insertContentHistorySchema = createInsertSchema(contentHistory).omit({
  id: true,
  createdAt: true,
});

export const insertAmazonProductSchema = createInsertSchema(amazonProducts).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrendHistorySchema = createInsertSchema(trendHistory).omit({
  id: true,
  createdAt: true,
  fetchedAt: true,
});

export const insertUserIdentitySchema = createInsertSchema(userIdentities).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonthlyUsageSchema = createInsertSchema(monthlyUsage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ContentGeneration = typeof contentGenerations.$inferSelect;
export type InsertContentGeneration = z.infer<typeof insertContentGenerationSchema>;

export type TrendingProduct = typeof trendingProducts.$inferSelect;
export type InsertTrendingProduct = z.infer<typeof insertTrendingProductSchema>;

export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = z.infer<typeof insertContentHistorySchema>;

export type AmazonProduct = typeof amazonProducts.$inferSelect;
export type InsertAmazonProduct = z.infer<typeof insertAmazonProductSchema>;

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = z.infer<typeof insertAffiliateLinkSchema>;

export type TrendHistory = typeof trendHistory.$inferSelect;
export type InsertTrendHistory = z.infer<typeof insertTrendHistorySchema>;

export type UserIdentity = typeof userIdentities.$inferSelect;
export type InsertUserIdentity = z.infer<typeof insertUserIdentitySchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type MonthlyUsage = typeof monthlyUsage.$inferSelect;
export type InsertMonthlyUsage = z.infer<typeof insertMonthlyUsageSchema>;

// ===============================================================================
// COMMENTED OUT - NON-ESSENTIAL TABLES FOR TIKTOK VIRAL PRODUCT GENERATOR
// ===============================================================================
// The following tables have been commented out to streamline the application
// for focused TikTok Viral Product Generator functionality. They can be restored
// if advanced features are needed in the future.

/*
// Complex role management system
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isCustom: boolean("is_custom").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(), // content, user, analytics, system, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// Advanced logging and team features
export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.teamId, table.userId),
  };
});

// Advanced analytics and optimization features
export const contentOptimizations = pgTable("content_optimizations", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentGenerations.id, { onDelete: 'cascade' }),
  readabilityScore: decimal("readability_score"),
  keywordDensity: jsonb("keyword_density"),
  seoScore: integer("seo_score"),
  uniquenessScore: decimal("uniqueness_score"),
  suggestions: text("suggestions").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bulk generation and automation features
export const scheduledBulkJobs = pgTable("scheduled_bulk_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  scheduleTime: text("schedule_time").notNull(),
  timezone: text("timezone").notNull().default("America/New_York"),
  isActive: boolean("is_active").notNull().default(true),
  selectedNiches: text("selected_niches").array().notNull(),
  tones: text("tones").array().notNull(),
  templates: text("templates").array().notNull(),
  platforms: text("platforms").array().notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CookAIng marketing features
export const contentBlueprints = pgTable("content_blueprints", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  kind: varchar("kind", { length: 100 }).notNull(),
  description: text("description").notNull(),
  inputSchemaJson: jsonb("input_schema_json").notNull(),
  outputSchemaJson: jsonb("output_schema_json").notNull(),
  defaultsJson: jsonb("defaults_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Webhook and integration features
export const integrationWebhooks = pgTable("integration_webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: text("events").array(),
  secretKey: text("secret_key"),
  isActive: boolean("is_active").notNull().default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Publishing and social media features
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Content Evaluation System
export const contentEvaluations = pgTable("content_evaluations", {
  id: serial("id").primaryKey(),
  contentHistoryId: integer("content_history_id").notNull().references(() => contentHistory.id, { onDelete: 'cascade' }),
  evaluatorModel: varchar("evaluator_model", { length: 50 }).notNull(), // 'chatgpt', 'claude', etc.
  overallScore: varchar("overall_score", { length: 10 }), // Store as string for precision
  viralityScore: integer("virality_score").notNull().default(0),
  clarityScore: integer("clarity_score").notNull().default(0),
  persuasivenessScore: integer("persuasiveness_score").notNull().default(0),
  creativityScore: integer("creativity_score").notNull().default(0),
  strengths: text("strengths"),
  improvements: text("improvements"),
  needsRevision: boolean("needs_revision").notNull().default(false),
  evaluationSummary: text("evaluation_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Advanced content rating and learning features
export const contentRatings = pgTable("content_ratings", {
  id: serial("id").primaryKey(),
  contentHistoryId: integer("content_history_id").notNull().references(() => contentHistory.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  overallRating: integer("overall_rating"),
  instagramRating: integer("instagram_rating"),
  tiktokRating: integer("tiktok_rating"),
  youtubeRating: integer("youtube_rating"),
  twitterRating: integer("twitter_rating"),
  notes: text("notes"),
  ratedAt: timestamp("rated_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.contentHistoryId, table.userId),
  };
});

// ... and many more complex tables have been commented out for focus
*/