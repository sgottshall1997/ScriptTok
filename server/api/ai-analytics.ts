import { Router } from "express";
import { sql, and, gte, desc, eq, lte, between } from "drizzle-orm";
import { db } from "../db";
import { contentHistory } from "@shared/schema";

const router = Router();

// AI Provider pricing models (per 1K tokens)
const AI_PRICING = {
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'sonar-small': { input: 0.0002, output: 0.0002 },
  'sonar-medium': { input: 0.0006, output: 0.0006 },
  'sonar-large': { input: 0.002, output: 0.002 }
};

// Helper function to calculate costs
function calculateCost(model: string, tokenCount: number): number {
  const pricing = AI_PRICING[model.toLowerCase() as keyof typeof AI_PRICING];
  if (!pricing) return 0;
  
  // Estimate 70% input, 30% output tokens
  const inputTokens = Math.floor(tokenCount * 0.7);
  const outputTokens = Math.floor(tokenCount * 0.3);
  
  return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000;
}

// Helper function to get date range
function getDateRange(timeRange: string) {
  const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : timeRange === '1d' ? 1 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return startDate;
}

// Helper function to categorize AI provider
function getProviderCategory(model: string): string {
  const modelLower = model.toLowerCase();
  if (modelLower.includes('claude')) return 'Claude';
  if (modelLower.includes('gpt')) return 'OpenAI';
  if (modelLower.includes('sonar') || modelLower.includes('perplexity')) return 'Perplexity';
  return 'Other';
}

/**
 * GET /api/ai-analytics/overview
 * Get comprehensive AI model overview with real-time metrics
 */
router.get("/overview", async (req, res) => {
  try {
    const { timeRange = '7d', niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    let whereConditions = [gte(contentHistory.createdAt, startDate)];
    
    if (niche) {
      whereConditions.push(eq(contentHistory.niche, niche as string));
    }
    
    if (contentType) {
      whereConditions.push(eq(contentHistory.contentType, contentType as string));
    }

    // Get real-time AI provider metrics
    const providerMetrics = await db
      .select({
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
            WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
            WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
            ELSE 'Other'
          END
        `,
        totalRequests: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgTokens: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`,
        errorCount: sql<number>`count(${contentHistory.error})`,
        uniqueModels: sql<number>`count(DISTINCT ${contentHistory.aiModel})`,
        lastUsed: sql<string>`max(${contentHistory.createdAt})`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(sql`
        CASE 
          WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
          WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
          WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
          ELSE 'Other'
        END
      `)
      .orderBy(sql`count(*) DESC`);

    // Calculate estimated costs for each provider
    const providerCosts = await db
      .select({
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
            WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
            WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
            ELSE 'Other'
          END
        `,
        model: contentHistory.aiModel,
        tokenCount: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        requestCount: sql<number>`count(*)`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(sql`
        CASE 
          WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
          WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
          WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
          ELSE 'Other'
        END
      `, contentHistory.aiModel);

    // Calculate costs
    const costData = providerCosts.map(item => ({
      provider: item.provider,
      model: item.model,
      estimatedCost: calculateCost(item.model, item.tokenCount),
      tokenCount: item.tokenCount,
      requestCount: item.requestCount
    }));

    // Aggregate costs by provider
    const providerCostSummary = costData.reduce((acc, item) => {
      if (!acc[item.provider]) {
        acc[item.provider] = { totalCost: 0, totalTokens: 0, totalRequests: 0 };
      }
      acc[item.provider].totalCost += item.estimatedCost;
      acc[item.provider].totalTokens += item.tokenCount;
      acc[item.provider].totalRequests += item.requestCount;
      return acc;
    }, {} as Record<string, { totalCost: number; totalTokens: number; totalRequests: number }>);

    res.json({
      success: true,
      timeRange,
      filters: { niche, contentType },
      data: {
        providerMetrics,
        costData,
        providerCostSummary
      }
    });

  } catch (error) {
    console.error("Error fetching AI overview:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch AI overview", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-analytics/claude
 * Get detailed Claude AI analytics
 */
router.get("/claude", async (req, res) => {
  try {
    const { timeRange = '7d', niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    let whereConditions = [
      gte(contentHistory.createdAt, startDate),
      sql`${contentHistory.aiModel} LIKE '%claude%'`
    ];
    
    if (niche) {
      whereConditions.push(eq(contentHistory.niche, niche as string));
    }
    
    if (contentType) {
      whereConditions.push(eq(contentHistory.contentType, contentType as string));
    }

    // Claude model breakdown
    const modelBreakdown = await db
      .select({
        model: contentHistory.aiModel,
        count: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgTokens: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`,
        errorCount: sql<number>`count(${contentHistory.error})`,
        lastUsed: sql<string>`max(${contentHistory.createdAt})`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(contentHistory.aiModel)
      .orderBy(sql`count(*) DESC`);

    // Claude usage trends by day
    const dailyTrends = await db
      .select({
        date: sql<string>`date_trunc('day', ${contentHistory.createdAt})`,
        requests: sql<number>`count(*)`,
        tokens: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        errors: sql<number>`count(${contentHistory.error})`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(sql`date_trunc('day', ${contentHistory.createdAt})`)
      .orderBy(sql`date_trunc('day', ${contentHistory.createdAt})`);

    // Claude usage by niche
    const nicheUsage = await db
      .select({
        niche: contentHistory.niche,
        count: sql<number>`count(*)`,
        avgTokens: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(contentHistory.niche)
      .orderBy(sql`count(*) DESC`);

    // Calculate costs for Claude models
    const claudeCosts = modelBreakdown.map(item => ({
      model: item.model,
      estimatedCost: calculateCost(item.model, item.totalTokens),
      tokenCount: item.totalTokens,
      costPerRequest: calculateCost(item.model, item.totalTokens) / item.count,
      requestCount: item.count
    }));

    res.json({
      success: true,
      timeRange,
      filters: { niche, contentType },
      data: {
        modelBreakdown,
        dailyTrends,
        nicheUsage,
        claudeCosts,
        totalCost: claudeCosts.reduce((sum, item) => sum + item.estimatedCost, 0)
      }
    });

  } catch (error) {
    console.error("Error fetching Claude analytics:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch Claude analytics", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-analytics/openai
 * Get detailed OpenAI analytics
 */
router.get("/openai", async (req, res) => {
  try {
    const { timeRange = '7d', niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    let whereConditions = [
      gte(contentHistory.createdAt, startDate),
      sql`${contentHistory.aiModel} LIKE '%gpt%'`
    ];
    
    if (niche) {
      whereConditions.push(eq(contentHistory.niche, niche as string));
    }
    
    if (contentType) {
      whereConditions.push(eq(contentHistory.contentType, contentType as string));
    }

    // OpenAI model breakdown
    const modelBreakdown = await db
      .select({
        model: contentHistory.aiModel,
        count: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgTokens: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`,
        errorCount: sql<number>`count(${contentHistory.error})`,
        lastUsed: sql<string>`max(${contentHistory.createdAt})`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(contentHistory.aiModel)
      .orderBy(sql`count(*) DESC`);

    // OpenAI usage trends by day
    const dailyTrends = await db
      .select({
        date: sql<string>`date_trunc('day', ${contentHistory.createdAt})`,
        requests: sql<number>`count(*)`,
        tokens: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        errors: sql<number>`count(${contentHistory.error})`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(sql`date_trunc('day', ${contentHistory.createdAt})`)
      .orderBy(sql`date_trunc('day', ${contentHistory.createdAt})`);

    // OpenAI usage by content type
    const contentTypeUsage = await db
      .select({
        contentType: contentHistory.contentType,
        count: sql<number>`count(*)`,
        avgTokens: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(contentHistory.contentType)
      .orderBy(sql`count(*) DESC`);

    // Calculate costs for OpenAI models
    const openAICosts = modelBreakdown.map(item => ({
      model: item.model,
      estimatedCost: calculateCost(item.model, item.totalTokens),
      tokenCount: item.totalTokens,
      costPerRequest: calculateCost(item.model, item.totalTokens) / item.count,
      requestCount: item.count
    }));

    res.json({
      success: true,
      timeRange,
      filters: { niche, contentType },
      data: {
        modelBreakdown,
        dailyTrends,
        contentTypeUsage,
        openAICosts,
        totalCost: openAICosts.reduce((sum, item) => sum + item.estimatedCost, 0)
      }
    });

  } catch (error) {
    console.error("Error fetching OpenAI analytics:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch OpenAI analytics", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-analytics/perplexity
 * Get detailed Perplexity analytics
 */
router.get("/perplexity", async (req, res) => {
  try {
    const { timeRange = '7d', niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    let whereConditions = [
      gte(contentHistory.createdAt, startDate),
      sql`${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%'`
    ];
    
    if (niche) {
      whereConditions.push(eq(contentHistory.niche, niche as string));
    }
    
    if (contentType) {
      whereConditions.push(eq(contentHistory.contentType, contentType as string));
    }

    // Perplexity model breakdown
    const modelBreakdown = await db
      .select({
        model: contentHistory.aiModel,
        count: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgTokens: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`,
        errorCount: sql<number>`count(${contentHistory.error})`,
        lastUsed: sql<string>`max(${contentHistory.createdAt})`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(contentHistory.aiModel)
      .orderBy(sql`count(*) DESC`);

    // Perplexity usage trends by day
    const dailyTrends = await db
      .select({
        date: sql<string>`date_trunc('day', ${contentHistory.createdAt})`,
        requests: sql<number>`count(*)`,
        tokens: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        errors: sql<number>`count(${contentHistory.error})`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(sql`date_trunc('day', ${contentHistory.createdAt})`)
      .orderBy(sql`date_trunc('day', ${contentHistory.createdAt})`);

    // Perplexity usage by template type
    const templateUsage = await db
      .select({
        templateType: contentHistory.templateType,
        count: sql<number>`count(*)`,
        avgTokens: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(contentHistory.templateType)
      .orderBy(sql`count(*) DESC`);

    // Calculate costs for Perplexity models
    const perplexityCosts = modelBreakdown.map(item => ({
      model: item.model,
      estimatedCost: calculateCost(item.model, item.totalTokens),
      tokenCount: item.totalTokens,
      costPerRequest: calculateCost(item.model, item.totalTokens) / item.count,
      requestCount: item.count
    }));

    res.json({
      success: true,
      timeRange,
      filters: { niche, contentType },
      data: {
        modelBreakdown,
        dailyTrends,
        templateUsage,
        perplexityCosts,
        totalCost: perplexityCosts.reduce((sum, item) => sum + item.estimatedCost, 0)
      }
    });

  } catch (error) {
    console.error("Error fetching Perplexity analytics:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch Perplexity analytics", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-analytics/comparison
 * Get comparative analysis between AI providers
 */
router.get("/comparison", async (req, res) => {
  try {
    const { timeRange = '7d', niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    let whereConditions = [gte(contentHistory.createdAt, startDate)];
    
    if (niche) {
      whereConditions.push(eq(contentHistory.niche, niche as string));
    }
    
    if (contentType) {
      whereConditions.push(eq(contentHistory.contentType, contentType as string));
    }

    // Get comparative metrics
    const comparison = await db
      .select({
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
            WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
            WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
            ELSE 'Other'
          END
        `,
        totalRequests: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgTokensPerRequest: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`,
        errorCount: sql<number>`count(${contentHistory.error})`,
        maxTokens: sql<number>`max(COALESCE(${contentHistory.tokenCount}, 0))`,
        minTokens: sql<number>`min(COALESCE(${contentHistory.tokenCount}, 0))`,
        uniqueNiches: sql<number>`count(DISTINCT ${contentHistory.niche})`,
        uniqueContentTypes: sql<number>`count(DISTINCT ${contentHistory.contentType})`,
        lastUsed: sql<string>`max(${contentHistory.createdAt})`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(sql`
        CASE 
          WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
          WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
          WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
          ELSE 'Other'
        END
      `)
      .orderBy(sql`count(*) DESC`);

    // Get performance trends for comparison
    const performanceTrends = await db
      .select({
        date: sql<string>`date_trunc('day', ${contentHistory.createdAt})`,
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
            WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
            WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
            ELSE 'Other'
          END
        `,
        requests: sql<number>`count(*)`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        successRate: sql<number>`(count(*) - count(${contentHistory.error})) * 100.0 / count(*)`,
        avgTokens: sql<number>`avg(COALESCE(${contentHistory.tokenCount}, 0))`
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .groupBy(sql`date_trunc('day', ${contentHistory.createdAt})`, sql`
        CASE 
          WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
          WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
          WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
          ELSE 'Other'
        END
      `)
      .orderBy(sql`date_trunc('day', ${contentHistory.createdAt})`);

    res.json({
      success: true,
      timeRange,
      filters: { niche, contentType },
      data: {
        comparison,
        performanceTrends
      }
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

/**
 * GET /api/ai-analytics/export
 * Export AI analytics data in CSV or JSON format
 */
router.get("/export", async (req, res) => {
  try {
    const { format = 'json', timeRange = '7d', provider, niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    let whereConditions = [gte(contentHistory.createdAt, startDate)];
    
    if (provider) {
      const providerCondition = provider === 'Claude' ? 
        sql`${contentHistory.aiModel} LIKE '%claude%'` :
        provider === 'OpenAI' ?
        sql`${contentHistory.aiModel} LIKE '%gpt%'` :
        provider === 'Perplexity' ?
        sql`${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%'` :
        sql`1 = 1`;
      
      whereConditions.push(providerCondition);
    }
    
    if (niche) {
      whereConditions.push(eq(contentHistory.niche, niche as string));
    }
    
    if (contentType) {
      whereConditions.push(eq(contentHistory.contentType, contentType as string));
    }

    // Get detailed analytics data for export
    const exportData = await db
      .select({
        id: contentHistory.id,
        createdAt: contentHistory.createdAt,
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
            WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
            WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
            ELSE 'Other'
          END
        `,
        aiModel: contentHistory.aiModel,
        niche: contentHistory.niche,
        contentType: contentHistory.contentType,
        templateType: contentHistory.templateType,
        tone: contentHistory.tone,
        tokenCount: contentHistory.tokenCount,
        responseTime: contentHistory.responseTime,
        error: contentHistory.error,
        productName: contentHistory.productName,
        platforms: contentHistory.platforms,
        useSpartanFormat: contentHistory.useSpartanFormat,
        sessionId: contentHistory.sessionId
      })
      .from(contentHistory)
      .where(and(...whereConditions))
      .orderBy(desc(contentHistory.createdAt))
      .limit(10000); // Limit to prevent memory issues

    // Add estimated costs
    const enrichedData = exportData.map(item => ({
      ...item,
      estimatedCost: calculateCost(item.aiModel || 'unknown', item.tokenCount || 0),
      success: !item.error
    }));

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'ID', 'Created At', 'Provider', 'AI Model', 'Niche', 'Content Type',
        'Template Type', 'Tone', 'Token Count', 'Response Time', 'Success',
        'Estimated Cost', 'Product Name', 'Platforms', 'Spartan Format', 'Session ID'
      ];
      
      const csvRows = enrichedData.map(item => [
        item.id,
        item.createdAt,
        item.provider,
        item.aiModel,
        item.niche,
        item.contentType,
        item.templateType,
        item.tone,
        item.tokenCount,
        item.responseTime,
        item.success,
        item.estimatedCost.toFixed(4),
        item.productName,
        Array.isArray(item.platforms) ? item.platforms.join(';') : item.platforms,
        item.useSpartanFormat,
        item.sessionId
      ]);
      
      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ai-analytics-${timeRange}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({
        success: true,
        timeRange,
        filters: { provider, niche, contentType },
        exportedAt: new Date().toISOString(),
        totalRecords: enrichedData.length,
        data: enrichedData
      });
    }

  } catch (error) {
    console.error("Error exporting AI analytics:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to export AI analytics", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-analytics/health
 * Get AI provider health status and error monitoring
 */
router.get("/health", async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const startDate = getDateRange(timeRange as string);

    // Get health metrics for each provider
    const healthMetrics = await db
      .select({
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
            WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
            WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
            ELSE 'Other'
          END
        `,
        totalRequests: sql<number>`count(*)`,
        successCount: sql<number>`count(*) - count(${contentHistory.error})`,
        errorCount: sql<number>`count(${contentHistory.error})`,
        avgResponseTime: sql<number>`avg(COALESCE(${contentHistory.responseTime}, 0))`,
        maxResponseTime: sql<number>`max(COALESCE(${contentHistory.responseTime}, 0))`,
        minResponseTime: sql<number>`min(COALESCE(${contentHistory.responseTime}, 0))`,
        lastRequest: sql<string>`max(${contentHistory.createdAt})`,
        lastError: sql<string>`max(CASE WHEN ${contentHistory.error} IS NOT NULL THEN ${contentHistory.createdAt} END)`
      })
      .from(contentHistory)
      .where(gte(contentHistory.createdAt, startDate))
      .groupBy(sql`
        CASE 
          WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
          WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
          WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
          ELSE 'Other'
        END
      `)
      .orderBy(sql`count(*) DESC`);

    // Get recent errors for monitoring
    const recentErrors = await db
      .select({
        createdAt: contentHistory.createdAt,
        provider: sql<string>`
          CASE 
            WHEN ${contentHistory.aiModel} LIKE '%claude%' THEN 'Claude'
            WHEN ${contentHistory.aiModel} LIKE '%gpt%' THEN 'OpenAI'
            WHEN ${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%' THEN 'Perplexity'
            ELSE 'Other'
          END
        `,
        aiModel: contentHistory.aiModel,
        error: contentHistory.error,
        niche: contentHistory.niche,
        contentType: contentHistory.contentType
      })
      .from(contentHistory)
      .where(and(
        gte(contentHistory.createdAt, startDate),
        sql`${contentHistory.error} IS NOT NULL`
      ))
      .orderBy(desc(contentHistory.createdAt))
      .limit(50);

    // Calculate health status for each provider
    const healthStatus = healthMetrics.map(metric => {
      const successRate = metric.totalRequests > 0 ? 
        (metric.successCount / metric.totalRequests) * 100 : 0;
      
      let status = 'healthy';
      if (successRate < 80) status = 'critical';
      else if (successRate < 95) status = 'warning';
      else if (metric.avgResponseTime > 5000) status = 'warning';

      return {
        provider: metric.provider,
        status,
        successRate,
        avgResponseTime: metric.avgResponseTime,
        totalRequests: metric.totalRequests,
        errorCount: metric.errorCount,
        lastRequest: metric.lastRequest,
        lastError: metric.lastError
      };
    });

    res.json({
      success: true,
      timeRange,
      data: {
        healthStatus,
        recentErrors
      }
    });

  } catch (error) {
    console.error("Error fetching AI health:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch AI health status", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

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