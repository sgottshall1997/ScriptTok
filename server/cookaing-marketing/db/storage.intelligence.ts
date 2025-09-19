/**
 * Storage helpers for Intelligence & Analytics features
 * Phase 3: Handles competitor analysis, sentiment tracking, viral scoring, and fatigue detection
 */

import { db } from '../../db';
import { eq, and, desc, gte, lte, asc, lt, ilike, or } from 'drizzle-orm';
import {
  competitorPosts,
  sentimentSnapshots,
  viralScores,
  fatigueSignals,
  analyticsEvents,
  type CompetitorPost,
  type SentimentSnapshot,
  type ViralScore,
  type FatigueSignal,
  type AnalyticsEvent
} from '../../../shared/schema';

// ================================================================
// INPUT INTERFACES
// ================================================================

export interface CreateCompetitorPostInput {
  sourcePlatform: string;
  author: string;
  url: string;
  text?: string;
  metricsJson?: Record<string, any>;
  tags?: string[];
  capturedAt?: Date;
}

export interface CreateSentimentSnapshotInput {
  scope: 'campaign' | 'post' | 'brand';
  refId: number;
  score: number; // -1.00 to 1.00
  magnitude: number; // 0.00 to 1.00
  labelsJson?: Record<string, any>;
}

export interface CreateViralScoreInput {
  contentVersionId: number;
  featuresJson: Record<string, any>;
  score: number; // 0.00 to 100.00
  model?: string;
}

export interface CreateFatigueSignalInput {
  segmentId?: number;
  topic: string;
  slope: number;
  lastSeenAt: Date;
}

export interface CompetitorScanFilters {
  platform?: string;
  keywords?: string[];
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface SentimentFilters {
  scope?: 'campaign' | 'post' | 'brand';
  refId?: number;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface ViralScoreFilters {
  contentVersionId?: number;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface FatigueFilters {
  segmentId?: number;
  topic?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

// ================================================================
// COMPETITOR POSTS OPERATIONS
// ================================================================

/**
 * Create a new competitor post record
 */
export async function createCompetitorPost(input: CreateCompetitorPostInput): Promise<CompetitorPost> {
  const [post] = await db.insert(competitorPosts).values({
    sourcePlatform: input.sourcePlatform,
    author: input.author,
    url: input.url,
    text: input.text,
    metricsJson: input.metricsJson || {},
    tags: input.tags || [],
    capturedAt: input.capturedAt || new Date()
  }).returning();

  return post;
}

/**
 * Bulk insert competitor posts
 */
export async function bulkCreateCompetitorPosts(inputs: CreateCompetitorPostInput[]): Promise<CompetitorPost[]> {
  if (inputs.length === 0) return [];
  
  const posts = await db.insert(competitorPosts).values(
    inputs.map(input => ({
      sourcePlatform: input.sourcePlatform,
      author: input.author,
      url: input.url,
      text: input.text,
      metricsJson: input.metricsJson || {},
      tags: input.tags || [],
      capturedAt: input.capturedAt || new Date()
    }))
  ).returning();

  return posts;
}

/**
 * Get competitor posts with filtering
 */
export async function getCompetitorPosts(filters: CompetitorScanFilters = {}): Promise<CompetitorPost[]> {
  const conditions = [];
  
  if (filters.platform) {
    conditions.push(eq(competitorPosts.sourcePlatform, filters.platform));
  }
  
  if (filters.keywords && filters.keywords.length > 0) {
    // Search in text content for any of the keywords
    const keywordConditions = filters.keywords.map(keyword => 
      ilike(competitorPosts.text, `%${keyword}%`)
    );
    
    if (keywordConditions.length > 0) {
      conditions.push(or(...keywordConditions));
    }
  }
  
  if (filters.from) {
    conditions.push(gte(competitorPosts.capturedAt, filters.from));
  }
  
  if (filters.to) {
    conditions.push(lte(competitorPosts.capturedAt, filters.to));
  }

  // Build query without reassignment
  const baseQuery = db.select().from(competitorPosts);
  const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
  const withOrder = withWhere.orderBy(desc(competitorPosts.capturedAt));
  const withLimit = filters.limit ? withOrder.limit(filters.limit) : withOrder;
  const finalQuery = filters.offset ? withLimit.offset(filters.offset) : withLimit;

  return await finalQuery;
}

/**
 * Get competitor post by ID
 */
export async function getCompetitorPostById(id: number): Promise<CompetitorPost | null> {
  const [post] = await db.select()
    .from(competitorPosts)
    .where(eq(competitorPosts.id, id));

  return post || null;
}

// ================================================================
// SENTIMENT SNAPSHOTS OPERATIONS
// ================================================================

/**
 * Create a new sentiment snapshot
 */
export async function createSentimentSnapshot(input: CreateSentimentSnapshotInput): Promise<SentimentSnapshot> {
  const [snapshot] = await db.insert(sentimentSnapshots).values({
    scope: input.scope,
    refId: input.refId,
    score: input.score.toString(), // Convert to decimal string
    magnitude: input.magnitude.toString(), // Convert to decimal string
    labelsJson: input.labelsJson || {},
    createdAt: new Date()
  }).returning();

  return snapshot;
}

/**
 * Get sentiment snapshots with filtering
 */
export async function getSentimentSnapshots(filters: SentimentFilters = {}): Promise<SentimentSnapshot[]> {
  const conditions = [];
  
  if (filters.scope) {
    conditions.push(eq(sentimentSnapshots.scope, filters.scope));
  }
  
  if (filters.refId) {
    conditions.push(eq(sentimentSnapshots.refId, filters.refId));
  }
  
  if (filters.from) {
    conditions.push(gte(sentimentSnapshots.createdAt, filters.from));
  }
  
  if (filters.to) {
    conditions.push(lte(sentimentSnapshots.createdAt, filters.to));
  }

  // Build query without reassignment
  const baseQuery = db.select().from(sentimentSnapshots);
  const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
  const withOrder = withWhere.orderBy(desc(sentimentSnapshots.createdAt));
  const withLimit = filters.limit ? withOrder.limit(filters.limit) : withOrder;
  const finalQuery = filters.offset ? withLimit.offset(filters.offset) : withLimit;

  return await finalQuery;
}

/**
 * Get latest sentiment snapshot for a specific entity
 */
export async function getLatestSentimentSnapshot(scope: SentimentSnapshot['scope'], refId: number): Promise<SentimentSnapshot | null> {
  const [snapshot] = await db.select()
    .from(sentimentSnapshots)
    .where(and(
      eq(sentimentSnapshots.scope, scope),
      eq(sentimentSnapshots.refId, refId)
    ))
    .orderBy(desc(sentimentSnapshots.createdAt))
    .limit(1);

  return snapshot || null;
}

// ================================================================
// VIRAL SCORES OPERATIONS
// ================================================================

/**
 * Create a new viral score
 */
export async function createViralScore(input: CreateViralScoreInput): Promise<ViralScore> {
  const [score] = await db.insert(viralScores).values({
    contentVersionId: input.contentVersionId,
    featuresJson: input.featuresJson,
    score: input.score.toString(), // Convert to decimal string
    model: input.model || 'baseline',
    createdAt: new Date()
  }).returning();

  return score;
}

/**
 * Get viral scores with filtering
 */
export async function getViralScores(filters: ViralScoreFilters = {}): Promise<ViralScore[]> {
  const conditions = [];
  
  if (filters.contentVersionId) {
    conditions.push(eq(viralScores.contentVersionId, filters.contentVersionId));
  }
  
  if (filters.from) {
    conditions.push(gte(viralScores.createdAt, filters.from));
  }
  
  if (filters.to) {
    conditions.push(lte(viralScores.createdAt, filters.to));
  }

  // Build query without reassignment
  const baseQuery = db.select().from(viralScores);
  const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
  const withOrder = withWhere.orderBy(desc(viralScores.createdAt));
  const withLimit = filters.limit ? withOrder.limit(filters.limit) : withOrder;
  const finalQuery = filters.offset ? withLimit.offset(filters.offset) : withLimit;

  return await finalQuery;
}

/**
 * Get latest viral score for a content version
 */
export async function getLatestViralScore(contentVersionId: number): Promise<ViralScore | null> {
  const [score] = await db.select()
    .from(viralScores)
    .where(eq(viralScores.contentVersionId, contentVersionId))
    .orderBy(desc(viralScores.createdAt))
    .limit(1);

  return score || null;
}

/**
 * Get viral score by ID
 */
export async function getViralScoreById(id: number): Promise<ViralScore | null> {
  const [score] = await db.select()
    .from(viralScores)
    .where(eq(viralScores.id, id));

  return score || null;
}

// ================================================================
// FATIGUE SIGNALS OPERATIONS
// ================================================================

/**
 * Create a new fatigue signal
 */
export async function createFatigueSignal(input: CreateFatigueSignalInput): Promise<FatigueSignal> {
  const [signal] = await db.insert(fatigueSignals).values({
    segmentId: input.segmentId,
    topic: input.topic,
    slope: input.slope.toString(), // Convert to decimal string
    lastSeenAt: input.lastSeenAt,
    createdAt: new Date()
  }).returning();

  return signal;
}

/**
 * Get fatigue signals with filtering
 */
export async function getFatigueSignals(filters: FatigueFilters = {}): Promise<FatigueSignal[]> {
  const conditions = [];
  
  if (filters.segmentId) {
    conditions.push(eq(fatigueSignals.segmentId, filters.segmentId));
  }
  
  if (filters.topic) {
    conditions.push(eq(fatigueSignals.topic, filters.topic));
  }
  
  if (filters.from) {
    conditions.push(gte(fatigueSignals.createdAt, filters.from));
  }
  
  if (filters.to) {
    conditions.push(lte(fatigueSignals.createdAt, filters.to));
  }

  // Build query without reassignment
  const baseQuery = db.select().from(fatigueSignals);
  const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
  const withOrder = withWhere.orderBy(desc(fatigueSignals.createdAt));
  const withLimit = filters.limit ? withOrder.limit(filters.limit) : withOrder;
  const finalQuery = filters.offset ? withLimit.offset(filters.offset) : withLimit;

  return await finalQuery;
}

/**
 * Get latest fatigue signal for a topic
 */
export async function getLatestFatigueSignal(topic: string, segmentId?: number): Promise<FatigueSignal | null> {
  const conditions = [eq(fatigueSignals.topic, topic)];
  
  if (segmentId) {
    conditions.push(eq(fatigueSignals.segmentId, segmentId));
  }

  const [signal] = await db.select()
    .from(fatigueSignals)
    .where(and(...conditions))
    .orderBy(desc(fatigueSignals.createdAt))
    .limit(1);

  return signal || null;
}

/**
 * Get topics with negative fatigue slope (declining engagement)
 */
export async function getTopicsWithNegativeSlope(limit = 10): Promise<FatigueSignal[]> {
  return await db.select()
    .from(fatigueSignals)
    .where(lt(fatigueSignals.slope, '0'))
    .orderBy(asc(fatigueSignals.slope)) // Most negative first
    .limit(limit);
}

// ================================================================
// ANALYTICS EVENT LOGGING
// ================================================================

/**
 * Log an intelligence analytics event
 */
export async function logIntelligenceEvent(
  orgId: number,
  eventType: 'competitor_scan' | 'sentiment_snapshot' | 'viral_score' | 'fatigue_compute',
  entityType: string,
  entityId: number,
  metaJson?: Record<string, any>
): Promise<AnalyticsEvent> {
  const [event] = await db.insert(analyticsEvents).values({
    orgId,
    eventType,
    entityType,
    entityId,
    metaJson: metaJson || {},
    createdAt: new Date()
  }).returning();

  return event;
}

// ================================================================
// AGGREGATE & SUMMARY OPERATIONS
// ================================================================

/**
 * Get intelligence summary statistics
 */
export async function getIntelligenceSummary(days = 14): Promise<{
  competitorPostsScanned: number;
  sentimentSnapshots: number;
  viralScoresComputed: number;
  topicsWithFatigue: number;
  avgSentimentScore: number;
  avgViralScore: number;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get counts for recent activity
  const [
    recentCPosts,
    recentSSnapshots,
    recentVScores,
    recentFSignals
  ] = await Promise.all([
    db.select().from(competitorPosts).where(gte(competitorPosts.capturedAt, cutoffDate)),
    db.select().from(sentimentSnapshots).where(gte(sentimentSnapshots.createdAt, cutoffDate)),
    db.select().from(viralScores).where(gte(viralScores.createdAt, cutoffDate)),
    db.select().from(fatigueSignals).where(gte(fatigueSignals.createdAt, cutoffDate))
  ]);

  // Calculate averages
  const avgSentimentScore = recentSSnapshots.length > 0 
    ? recentSSnapshots.reduce((sum, s) => sum + parseFloat(s.score), 0) / recentSSnapshots.length 
    : 0;

  const avgViralScore = recentVScores.length > 0
    ? recentVScores.reduce((sum, v) => sum + parseFloat(v.score), 0) / recentVScores.length
    : 0;

  const topicsWithNegativeSlope = recentFSignals.filter(f => parseFloat(f.slope) < 0).length;

  return {
    competitorPostsScanned: recentCPosts.length,
    sentimentSnapshots: recentSSnapshots.length,
    viralScoresComputed: recentVScores.length,
    topicsWithFatigue: topicsWithNegativeSlope,
    avgSentimentScore: Math.round(avgSentimentScore * 100) / 100,
    avgViralScore: Math.round(avgViralScore * 100) / 100
  };
}