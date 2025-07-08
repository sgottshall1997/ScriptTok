import { Router } from "express";
import { sql, and, gte, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { contentHistory } from "@shared/schema";

const router = Router();

/**
 * GET /api/ai-analytics/model-usage
 * Get comprehensive AI model usage analytics with OpenAI vs Perplexity breakdown
 */
router.get("/model-usage", async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total usage by AI provider
    const providerUsage = await db
      .select({
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' THEN 'OpenAI'
            WHEN ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%' THEN 'Perplexity'
            WHEN ${contentHistory.modelUsed} LIKE '%claude%' THEN 'Anthropic'
            ELSE 'Other'
          END
        `,
        count: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(${contentHistory.tokenCount})`,
        avgTokens: sql<number>`avg(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(gte(contentHistory.createdAt, startDate))
      .groupBy(sql`
        CASE 
          WHEN ${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' THEN 'OpenAI'
          WHEN ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%' THEN 'Perplexity'
          WHEN ${contentHistory.modelUsed} LIKE '%claude%' THEN 'Anthropic'
          ELSE 'Other'
        END
      `)
      .orderBy(sql`count(*) DESC`);

    // Get detailed model breakdown
    const modelBreakdown = await db
      .select({
        model: contentHistory.modelUsed,
        count: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(${contentHistory.tokenCount})`,
        avgTokens: sql<number>`avg(${contentHistory.tokenCount})`,
        lastUsed: sql<string>`max(${contentHistory.createdAt})`
      })
      .from(contentHistory)
      .where(gte(contentHistory.createdAt, startDate))
      .groupBy(contentHistory.modelUsed)
      .orderBy(sql`count(*) DESC`);

    // Get daily usage trends by provider
    const dailyTrends = await db
      .select({
        date: sql<string>`date_trunc('day', ${contentHistory.createdAt})`,
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' THEN 'OpenAI'
            WHEN ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%' THEN 'Perplexity'
            WHEN ${contentHistory.modelUsed} LIKE '%claude%' THEN 'Anthropic'
            ELSE 'Other'
          END
        `,
        count: sql<number>`count(*)`,
        tokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(gte(contentHistory.createdAt, startDate))
      .groupBy(sql`date_trunc('day', ${contentHistory.createdAt})`, sql`
        CASE 
          WHEN ${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' THEN 'OpenAI'
          WHEN ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%' THEN 'Perplexity'
          WHEN ${contentHistory.modelUsed} LIKE '%claude%' THEN 'Anthropic'
          ELSE 'Other'
        END
      `)
      .orderBy(sql`date_trunc('day', ${contentHistory.createdAt})`);

    // Get usage by niche for each provider
    const nicheUsage = await db
      .select({
        niche: contentHistory.niche,
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' THEN 'OpenAI'
            WHEN ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%' THEN 'Perplexity'
            WHEN ${contentHistory.modelUsed} LIKE '%claude%' THEN 'Anthropic'
            ELSE 'Other'
          END
        `,
        count: sql<number>`count(*)`,
        tokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(gte(contentHistory.createdAt, startDate))
      .groupBy(contentHistory.niche, sql`
        CASE 
          WHEN ${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' THEN 'OpenAI'
          WHEN ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%' THEN 'Perplexity'
          WHEN ${contentHistory.modelUsed} LIKE '%claude%' THEN 'Anthropic'
          ELSE 'Other'
        END
      `)
      .orderBy(sql`count(*) DESC`);

    res.json({
      success: true,
      timeRange,
      data: {
        providerUsage,
        modelBreakdown,
        dailyTrends,
        nicheUsage
      }
    });

  } catch (error) {
    console.error("Error fetching AI analytics:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch AI analytics", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-analytics/perplexity-stats
 * Get specific Perplexity usage statistics and trending data quality
 */
router.get("/perplexity-stats", async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get Perplexity-specific usage
    const perplexityUsage = await db
      .select({
        model: contentHistory.modelUsed,
        count: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(${contentHistory.tokenCount})`,
        avgTokens: sql<number>`avg(${contentHistory.tokenCount})`,
        byNiche: sql<string>`string_agg(DISTINCT ${contentHistory.niche}, ', ')`
      })
      .from(contentHistory)
      .where(and(
        gte(contentHistory.createdAt, startDate),
        sql`${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%'`
      ))
      .groupBy(contentHistory.modelUsed)
      .orderBy(sql`count(*) DESC`);

    // Get recent Perplexity generations
    const recentGenerations = await db
      .select({
        id: contentHistory.id,
        niche: contentHistory.niche,
        productName: contentHistory.productName,
        model: contentHistory.modelUsed,
        tokenCount: contentHistory.tokenCount,
        createdAt: contentHistory.createdAt
      })
      .from(contentHistory)
      .where(and(
        gte(contentHistory.createdAt, startDate),
        sql`${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%'`
      ))
      .orderBy(desc(contentHistory.createdAt))
      .limit(10);

    // Get Perplexity usage by content type
    const contentTypeUsage = await db
      .select({
        contentType: contentHistory.contentType,
        count: sql<number>`count(*)`,
        avgTokens: sql<number>`avg(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(and(
        gte(contentHistory.createdAt, startDate),
        sql`${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%'`
      ))
      .groupBy(contentHistory.contentType)
      .orderBy(sql`count(*) DESC`);

    res.json({
      success: true,
      timeRange,
      data: {
        perplexityUsage,
        recentGenerations,
        contentTypeUsage
      }
    });

  } catch (error) {
    console.error("Error fetching Perplexity stats:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch Perplexity statistics", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-analytics/comparison
 * Compare OpenAI vs Perplexity performance metrics
 */
router.get("/comparison", async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get comparative metrics
    const comparison = await db
      .select({
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' THEN 'OpenAI'
            WHEN ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%' THEN 'Perplexity'
            ELSE 'Other'
          END
        `,
        totalGenerations: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(${contentHistory.tokenCount})`,
        avgTokensPerGeneration: sql<number>`avg(${contentHistory.tokenCount})`,
        maxTokens: sql<number>`max(${contentHistory.tokenCount})`,
        minTokens: sql<number>`min(${contentHistory.tokenCount})`,
        uniqueNiches: sql<number>`count(DISTINCT ${contentHistory.niche})`,
        uniqueContentTypes: sql<number>`count(DISTINCT ${contentHistory.contentType})`
      })
      .from(contentHistory)
      .where(and(
        gte(contentHistory.createdAt, startDate),
        sql`${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' OR ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%'`
      ))
      .groupBy(sql`
        CASE 
          WHEN ${contentHistory.modelUsed} LIKE 'gpt%' OR ${contentHistory.modelUsed} LIKE 'GPT%' THEN 'OpenAI'
          WHEN ${contentHistory.modelUsed} LIKE '%sonar%' OR ${contentHistory.modelUsed} LIKE '%perplexity%' THEN 'Perplexity'
          ELSE 'Other'
        END
      `);

    res.json({
      success: true,
      timeRange,
      data: comparison
    });

  } catch (error) {
    console.error("Error fetching AI comparison:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch AI comparison", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;