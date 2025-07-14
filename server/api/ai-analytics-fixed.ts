import { Router } from "express";
import { db, pool } from "../db";
import { contentHistory } from "../../shared/schema";
import { eq, gte, and, sql, desc } from 'drizzle-orm';

const router = Router();

// Helper function to get date range
function getDateRange(timeRange: string): Date {
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

// Helper function to calculate cost
function calculateCost(model: string, tokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet-20241022': { input: 0.000003, output: 0.000015 },
    'claude-3-opus': { input: 0.000015, output: 0.000075 },
    'claude-3-sonnet': { input: 0.000003, output: 0.000015 },
    'gpt-4': { input: 0.00003, output: 0.00006 },
    'gpt-3.5-turbo': { input: 0.000001, output: 0.000002 },
    'sonar': { input: 0.000001, output: 0.000001 },
    'default': { input: 0.00001, output: 0.00003 }
  };
  
  const modelRates = rates[model] || rates['default'];
  const inputTokens = tokens * 0.2;
  const outputTokens = tokens * 0.8;
  
  return (inputTokens * modelRates.input) + (outputTokens * modelRates.output);
}

/**
 * GET /api/ai-analytics/overview
 * Get comprehensive AI model overview with real-time metrics
 */
router.get("/overview", async (req, res) => {
  try {
    const { timeRange = '7d', niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    // Build raw SQL query using only existing columns
    let baseQuery = `
      SELECT 
        COALESCE(ai_model, model_used, 'unknown') as model_name,
        COALESCE(token_count, 0) as token_count,
        created_at,
        niche,
        content_type,
        fallback_level
      FROM content_history 
      WHERE created_at >= $1
    `;
    
    const queryParams: any[] = [startDate];
    let paramIndex = 2;
    
    if (niche) {
      baseQuery += ` AND niche = $${paramIndex}`;
      queryParams.push(niche);
      paramIndex++;
    }
    
    if (contentType) {
      baseQuery += ` AND content_type = $${paramIndex}`;
      queryParams.push(contentType);
      paramIndex++;
    }
    
    baseQuery += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(baseQuery, queryParams);
    
    const records = result.rows;

    // Process provider metrics
    const providerGroups: Record<string, any[]> = {};
    
    records.forEach((record: any) => {
      const modelName = record.model_name || 'unknown';
      const provider = getProviderCategory(modelName);
      if (!providerGroups[provider]) {
        providerGroups[provider] = [];
      }
      providerGroups[provider].push({
        aiModel: modelName,
        tokenCount: Number(record.token_count) || 0,
        niche: record.niche,
        contentType: record.content_type,
        fallbackLevel: record.fallback_level,
        createdAt: record.created_at
      });
    });

    const providerMetrics = Object.entries(providerGroups).map(([provider, records]) => {
      const totalRequests = records.length;
      const totalTokens = records.reduce((sum, r) => sum + (r.tokenCount || 0), 0);
      const avgTokens = totalRequests > 0 ? totalTokens / totalRequests : 0;
      const fallbackCount = records.filter(r => r.fallbackLevel && r.fallbackLevel !== 'none').length;
      const successRate = totalRequests > 0 ? ((totalRequests - fallbackCount) * 100.0 / totalRequests) : 0;
      const uniqueModels = new Set(records.map(r => r.aiModel)).size;
      const lastUsed = records.length > 0 ? records[0].createdAt : null;

      return {
        provider,
        totalRequests,
        totalTokens,
        avgTokens,
        successRate,
        fallbackCount,
        uniqueModels,
        lastUsed
      };
    });

    // Calculate costs
    const costData = records.map((record: any) => {
      const modelName = record.model_name || 'unknown';
      const tokenCount = Number(record.token_count) || 0;
      return {
        provider: getProviderCategory(modelName),
        model: modelName,
        estimatedCost: calculateCost(modelName, tokenCount),
        tokenCount,
        requestCount: 1
      };
    });

    // Aggregate cost data by provider
    const providerCostSummary: Record<string, any> = {};
    costData.forEach(item => {
      if (!providerCostSummary[item.provider]) {
        providerCostSummary[item.provider] = { totalCost: 0, totalTokens: 0, totalRequests: 0 };
      }
      providerCostSummary[item.provider].totalCost += item.estimatedCost;
      providerCostSummary[item.provider].totalTokens += item.tokenCount;
      providerCostSummary[item.provider].totalRequests += item.requestCount;
    });

    res.json({
      success: true,
      data: {
        providerMetrics,
        costData,
        providerCostSummary,
        totalRecords: records.length
      }
    });

  } catch (error) {
    console.error('Error fetching AI overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI analytics overview'
    });
  }
});

/**
 * GET /api/ai-analytics/health
 * Get AI provider health status
 */
router.get("/health", async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    // Use raw SQL with existing columns only
    const result = await pool.query(`
      SELECT 
        COALESCE(ai_model, model_used, 'unknown') as model_name,
        COALESCE(token_count, 0) as token_count,
        fallback_level,
        created_at
      FROM content_history 
      WHERE created_at >= $1
      ORDER BY created_at DESC
    `, [startDate]);
    
    const records = result.rows;

    const providerGroups: Record<string, any[]> = {};
    
    records.forEach((record: any) => {
      const modelName = record.model_name || 'unknown';
      const provider = getProviderCategory(modelName);
      if (!providerGroups[provider]) {
        providerGroups[provider] = [];
      }
      providerGroups[provider].push({
        aiModel: modelName,
        tokenCount: Number(record.token_count) || 0,
        fallbackLevel: record.fallback_level,
        createdAt: record.created_at
      });
    });

    const healthData = Object.entries(providerGroups).map(([provider, records]) => {
      const totalRequests = records.length;
      const fallbackCount = records.filter(r => r.fallbackLevel && r.fallbackLevel !== 'none').length;
      const successRate = totalRequests > 0 ? ((totalRequests - fallbackCount) * 100.0 / totalRequests) : 0;
      const avgTokens = totalRequests > 0 ? records.reduce((sum, r) => sum + (r.tokenCount || 0), 0) / totalRequests : 0;
      const lastRequest = records.length > 0 ? records[0].createdAt : null;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (successRate < 50) {
        status = 'critical';
      } else if (successRate < 80 || fallbackCount > totalRequests * 0.3) {
        status = 'warning';
      }

      return {
        provider,
        status,
        successRate,
        avgTokens,
        totalRequests,
        fallbackCount,
        lastRequest: lastRequest || ''
      };
    });

    res.json({
      success: true,
      data: healthData
    });

  } catch (error) {
    console.error('Error fetching AI health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI health status'
    });
  }
});

/**
 * GET /api/ai-analytics/claude
 * Get Claude-specific analytics
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

    const records = await db
      .select()
      .from(contentHistory)
      .where(and(...whereConditions))
      .orderBy(desc(contentHistory.createdAt));

    // Process model breakdown
    const modelGroups: Record<string, any[]> = {};
    records.forEach(record => {
      const model = record.aiModel || 'unknown';
      if (!modelGroups[model]) {
        modelGroups[model] = [];
      }
      modelGroups[model].push(record);
    });

    const modelBreakdown = Object.entries(modelGroups).map(([model, records]) => {
      const count = records.length;
      const totalTokens = records.reduce((sum, r) => sum + (r.tokenCount || 0), 0);
      const avgTokens = count > 0 ? totalTokens / count : 0;
      const avgResponseTime = records.reduce((sum, r) => sum + (r.responseTime || 0), 0) / count;
      const errorCount = records.filter(r => r.error).length;
      const successRate = count > 0 ? ((count - errorCount) * 100.0 / count) : 0;
      const lastUsed = records[0]?.createdAt || '';

      return {
        model,
        count,
        totalTokens,
        avgTokens,
        avgResponseTime,
        successRate,
        errorCount,
        lastUsed
      };
    });

    // Calculate total cost
    const totalCost = records.reduce((sum, record) => 
      sum + calculateCost(record.aiModel || '', record.tokenCount || 0), 0);

    // Daily trends (simplified)
    const dailyTrends = records.reduce((acc: any[], record) => {
      const date = new Date(record.createdAt || '').toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.requests += 1;
        existing.tokens += record.tokenCount || 0;
        existing.avgResponseTime = (existing.avgResponseTime + (record.responseTime || 0)) / 2;
        if (record.error) existing.errors += 1;
      } else {
        acc.push({
          date,
          requests: 1,
          tokens: record.tokenCount || 0,
          avgResponseTime: record.responseTime || 0,
          errors: record.error ? 1 : 0
        });
      }
      
      return acc;
    }, []);

    res.json({
      success: true,
      data: {
        modelBreakdown,
        dailyTrends,
        totalCost
      }
    });

  } catch (error) {
    console.error('Error fetching Claude analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Claude analytics'
    });
  }
});

/**
 * GET /api/ai-analytics/openai
 * Get OpenAI-specific analytics
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

    const records = await db
      .select()
      .from(contentHistory)
      .where(and(...whereConditions))
      .orderBy(desc(contentHistory.createdAt));

    // Process similar to Claude but for OpenAI
    const modelGroups: Record<string, any[]> = {};
    records.forEach(record => {
      const model = record.aiModel || 'unknown';
      if (!modelGroups[model]) {
        modelGroups[model] = [];
      }
      modelGroups[model].push(record);
    });

    const modelBreakdown = Object.entries(modelGroups).map(([model, records]) => {
      const count = records.length;
      const totalTokens = records.reduce((sum, r) => sum + (r.tokenCount || 0), 0);
      const avgTokens = count > 0 ? totalTokens / count : 0;
      const avgResponseTime = records.reduce((sum, r) => sum + (r.responseTime || 0), 0) / count;
      const errorCount = records.filter(r => r.error).length;
      const successRate = count > 0 ? ((count - errorCount) * 100.0 / count) : 0;
      const lastUsed = records[0]?.createdAt || '';

      return {
        model,
        count,
        totalTokens,
        avgTokens,
        avgResponseTime,
        successRate,
        errorCount,
        lastUsed
      };
    });

    const totalCost = records.reduce((sum, record) => 
      sum + calculateCost(record.aiModel || '', record.tokenCount || 0), 0);

    const dailyTrends = records.reduce((acc: any[], record) => {
      const date = new Date(record.createdAt || '').toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.requests += 1;
        existing.tokens += record.tokenCount || 0;
        existing.avgResponseTime = (existing.avgResponseTime + (record.responseTime || 0)) / 2;
        if (record.error) existing.errors += 1;
      } else {
        acc.push({
          date,
          requests: 1,
          tokens: record.tokenCount || 0,
          avgResponseTime: record.responseTime || 0,
          errors: record.error ? 1 : 0
        });
      }
      
      return acc;
    }, []);

    res.json({
      success: true,
      data: {
        modelBreakdown,
        dailyTrends,
        totalCost
      }
    });

  } catch (error) {
    console.error('Error fetching OpenAI analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch OpenAI analytics'
    });
  }
});

/**
 * GET /api/ai-analytics/perplexity
 * Get Perplexity-specific analytics
 */
router.get("/perplexity", async (req, res) => {
  try {
    const { timeRange = '7d', niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    let whereConditions = [
      gte(contentHistory.createdAt, startDate),
      sql`(${contentHistory.aiModel} LIKE '%sonar%' OR ${contentHistory.aiModel} LIKE '%perplexity%')`
    ];
    
    if (niche) {
      whereConditions.push(eq(contentHistory.niche, niche as string));
    }
    
    if (contentType) {
      whereConditions.push(eq(contentHistory.contentType, contentType as string));
    }

    const records = await db
      .select()
      .from(contentHistory)
      .where(and(...whereConditions))
      .orderBy(desc(contentHistory.createdAt));

    // Process similar to other providers
    const modelGroups: Record<string, any[]> = {};
    records.forEach(record => {
      const model = record.aiModel || 'unknown';
      if (!modelGroups[model]) {
        modelGroups[model] = [];
      }
      modelGroups[model].push(record);
    });

    const modelBreakdown = Object.entries(modelGroups).map(([model, records]) => {
      const count = records.length;
      const totalTokens = records.reduce((sum, r) => sum + (r.tokenCount || 0), 0);
      const avgTokens = count > 0 ? totalTokens / count : 0;
      const avgResponseTime = records.reduce((sum, r) => sum + (r.responseTime || 0), 0) / count;
      const errorCount = records.filter(r => r.error).length;
      const successRate = count > 0 ? ((count - errorCount) * 100.0 / count) : 0;
      const lastUsed = records[0]?.createdAt || '';

      return {
        model,
        count,
        totalTokens,
        avgTokens,
        avgResponseTime,
        successRate,
        errorCount,
        lastUsed
      };
    });

    const totalCost = records.reduce((sum, record) => 
      sum + calculateCost(record.aiModel || '', record.tokenCount || 0), 0);

    const dailyTrends = records.reduce((acc: any[], record) => {
      const date = new Date(record.createdAt || '').toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.requests += 1;
        existing.tokens += record.tokenCount || 0;
        existing.avgResponseTime = (existing.avgResponseTime + (record.responseTime || 0)) / 2;
        if (record.error) existing.errors += 1;
      } else {
        acc.push({
          date,
          requests: 1,
          tokens: record.tokenCount || 0,
          avgResponseTime: record.responseTime || 0,
          errors: record.error ? 1 : 0
        });
      }
      
      return acc;
    }, []);

    res.json({
      success: true,
      data: {
        modelBreakdown,
        dailyTrends,
        totalCost
      }
    });

  } catch (error) {
    console.error('Error fetching Perplexity analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Perplexity analytics'
    });
  }
});

/**
 * GET /api/ai-analytics/export
 * Export AI analytics data
 */
router.get("/export", async (req, res) => {
  try {
    const { format = 'csv', provider, timeRange = '7d', niche, contentType } = req.query;
    const startDate = getDateRange(timeRange as string);
    
    let whereConditions = [gte(contentHistory.createdAt, startDate)];
    
    if (provider && provider !== 'all') {
      const providerLike = provider === 'claude' ? '%claude%' : 
                           provider === 'openai' ? '%gpt%' : 
                           provider === 'perplexity' ? '%sonar%' : '';
      if (providerLike) {
        whereConditions.push(sql`${contentHistory.aiModel} LIKE ${providerLike}`);
      }
    }
    
    if (niche) {
      whereConditions.push(eq(contentHistory.niche, niche as string));
    }
    
    if (contentType) {
      whereConditions.push(eq(contentHistory.contentType, contentType as string));
    }

    const records = await db
      .select()
      .from(contentHistory)
      .where(and(...whereConditions))
      .orderBy(desc(contentHistory.createdAt));

    const exportData = records.map(record => ({
      id: record.id,
      aiModel: record.aiModel,
      provider: getProviderCategory(record.aiModel || ''),
      niche: record.niche,
      contentType: record.contentType,
      tokenCount: record.tokenCount,
      responseTime: record.responseTime,
      estimatedCost: calculateCost(record.aiModel || '', record.tokenCount || 0),
      error: record.error,
      createdAt: record.createdAt
    }));

    if (format === 'json') {
      res.json(exportData);
    } else {
      // CSV format
      const headers = ['ID', 'AI Model', 'Provider', 'Niche', 'Content Type', 'Token Count', 'Response Time', 'Estimated Cost', 'Error', 'Created At'];
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => [
          row.id,
          `"${row.aiModel}"`,
          row.provider,
          row.niche,
          row.contentType,
          row.tokenCount,
          row.responseTime,
          row.estimatedCost,
          `"${row.error || ''}"`,
          row.createdAt
        ].join(','))
      ];
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ai-analytics-${provider || 'all'}-${timeRange}.csv"`);
      res.send(csvRows.join('\n'));
    }

  } catch (error) {
    console.error('Error exporting AI analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export AI analytics data'
    });
  }
});

export default router;