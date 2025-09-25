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