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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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

export type ContentPerformance = typeof contentPerformance.$inferSelect;
export type InsertContentPerformance = z.infer<typeof insertContentPerformanceSchema>;

export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = z.infer<typeof insertContentVersionSchema>;

export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type InsertApiIntegration = z.infer<typeof insertApiIntegrationSchema>;
