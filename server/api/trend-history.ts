import { Router } from "express";
import { storage } from "../storage";
import { insertTrendHistorySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/trend-history - Get all trend history with optional filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { source, niche, limit = "50", offset = "0" } = req.query;
    
    // Validate and parse pagination parameters
    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);
    const validLimit = isNaN(parsedLimit) || parsedLimit <= 0 ? 50 : Math.min(parsedLimit, 500); // Reduced max for performance
    const validOffset = isNaN(parsedOffset) || parsedOffset < 0 ? 0 : parsedOffset;
    
    let history;
    
    // Apply filtering based on query parameters
    if (source && niche) {
      // Filter by both source and niche
      history = await storage.getTrendHistoryBySourceAndNiche(
        source as string, 
        niche as string, 
        validLimit,
        validOffset
      );
    } else if (source) {
      // Filter by source only
      history = await storage.getTrendHistoryBySource(
        source as string, 
        validLimit,
        validOffset
      );
    } else if (niche) {
      // Filter by niche only
      history = await storage.getTrendHistoryByNiche(
        niche as string, 
        validLimit,
        validOffset
      );
    } else {
      // Get all history
      history = await storage.getTrendHistory(validLimit, validOffset);
    }

    res.json({
      success: true,
      history: history,
      count: history.length,
      filters: {
        source: source || null,
        niche: niche || null,
        limit: validLimit,
        offset: validOffset
      },
      pagination: {
        limit: validLimit,
        offset: validOffset,
        hasMore: history.length === validLimit // Indicates if there might be more data
      }
    });
  } catch (error) {
    console.error("Error fetching trend history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trend history",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/trend-history/stats - Get trend history statistics
router.get("/stats", async (req, res) => {
  try {
    const allHistory = await storage.getTrendHistory(100000, 0); // Get all history with very high limit starting from beginning
    
    // Calculate statistics
    const stats = {
      total: allHistory.length,
      bySource: {
        trend_forecaster: allHistory.filter(h => h.sourceType === 'trend_forecaster').length,
        ai_trending_picks: allHistory.filter(h => h.sourceType === 'ai_trending_picks').length,
      },
      byNiche: {} as Record<string, number>,
      recentCount: {
        last24Hours: 0,
        lastWeek: 0,
        lastMonth: 0
      }
    };

    // Count by niche
    allHistory.forEach(item => {
      const niche = item.niche || 'unknown';
      stats.byNiche[niche] = (stats.byNiche[niche] || 0) + 1;
    });

    // Count recent items
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    allHistory.forEach(item => {
      const itemDate = new Date(item.createdAt);
      if (itemDate >= dayAgo) stats.recentCount.last24Hours++;
      if (itemDate >= weekAgo) stats.recentCount.lastWeek++;
      if (itemDate >= monthAgo) stats.recentCount.lastMonth++;
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error fetching trend history stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trend history statistics",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/trend-history/niches - Get available niches
router.get("/niches", async (req, res) => {
  try {
    const allHistory = await storage.getTrendHistory(100000, 0); // Get all history with very high limit starting from beginning
    
    // Extract unique niches
    const nichesSet = new Set<string>();
    allHistory.forEach(item => {
      if (item.niche) {
        nichesSet.add(item.niche);
      }
    });
    
    const niches = Array.from(nichesSet).sort();

    res.json({
      success: true,
      niches,
      count: niches.length
    });
  } catch (error) {
    console.error("Error fetching available niches:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch available niches",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/trend-history - Save new trend history (for internal use)
router.post("/", async (req, res) => {
  try {
    // Validate request body against schema
    const validationResult = insertTrendHistorySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        validationErrors: validationResult.error.errors
      });
    }

    const historyData = validationResult.data;
    const savedHistory = await storage.saveTrendHistory(historyData);

    res.json({
      success: true,
      history: savedHistory,
      message: "Trend history saved successfully"
    });
  } catch (error) {
    console.error("Error saving trend history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save trend history",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/trend-history/forecaster/:niche - Get latest trend forecast data for a specific niche from database
router.get("/forecaster/:niche", async (req, res) => {
  try {
    const { niche } = req.params;
    
    if (!niche) {
      return res.status(400).json({
        success: false,
        error: "Niche parameter is required"
      });
    }

    // Get the latest trend forecaster data for this niche from database
    const history = await storage.getTrendHistoryBySourceAndNiche(
      'trend_forecaster',
      niche,
      100, // Get more records to ensure we have all categories
      0
    );

    if (!history || history.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: `No trend forecast data found for ${niche}`
      });
    }

    // Find the most recent entry to get the timestamp for filtering
    const mostRecentEntry = history.reduce((latest, current) => 
      new Date(current.fetchedAt) > new Date(latest.fetchedAt) ? current : latest
    );

    // Filter to only include entries from the most recent forecast run
    const latestRunTimestamp = mostRecentEntry.fetchedAt;
    const latestRunEntries = history.filter(item => 
      item.fetchedAt === latestRunTimestamp
    );

    console.log(`📊 TrendForecaster API: Found ${history.length} total entries, filtering to ${latestRunEntries.length} from latest run (${latestRunTimestamp})`);

    // Group trends by category using only the most recent run data
    const trendsByCategory: {
      hot: any[];
      rising: any[];
      upcoming: any[];
      declining: any[];
    } = {
      hot: [],
      rising: [],
      upcoming: [],
      declining: []
    };

    // Extract dataSource metadata from the first entry's rawData
    let dataSourceMetadata = null;
    if (latestRunEntries.length > 0 && latestRunEntries[0].rawData) {
      try {
        const rawData = typeof latestRunEntries[0].rawData === 'string' 
          ? JSON.parse(latestRunEntries[0].rawData) 
          : latestRunEntries[0].rawData;
        dataSourceMetadata = rawData.dataSource || null;
      } catch (parseError) {
        console.warn('Failed to parse rawData for dataSource metadata:', parseError);
      }
    }

    // Group trends by category from the latest run only
    latestRunEntries.forEach(item => {
      if (item.trendCategory && item.trendName) {
        const trendData = {
          name: item.trendName,
          volume: item.trendVolume || undefined,
          growth: item.trendGrowth || undefined,
          why: item.trendDescription || undefined,
          reason: item.trendReason || undefined,
          when: item.trendWhen || undefined,
          opportunity: item.trendOpportunity || undefined,
          products: item.productData ? (Array.isArray(item.productData) ? item.productData : [item.productData]) : []
        };

        if (item.trendCategory === 'hot') {
          trendsByCategory.hot.push(trendData);
        } else if (item.trendCategory === 'rising') {
          trendsByCategory.rising.push(trendData);
        } else if (item.trendCategory === 'upcoming') {
          trendsByCategory.upcoming.push(trendData);
        } else if (item.trendCategory === 'declining') {
          trendsByCategory.declining.push(trendData);
        }
      }
    });

    // Return data in the same format as the original TrendForecaster API with dataSource metadata
    res.json({
      success: true,
      data: {
        trends: trendsByCategory,
        niche: niche,
        lastUpdated: mostRecentEntry.fetchedAt,
        source: "database",
        dataSource: dataSourceMetadata
      }
    });

  } catch (error) {
    console.error(`Error fetching trend forecast data for ${req.params.niche}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trend forecast data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// DELETE /api/trend-history/clear - Clear all trend history (for development)
router.delete("/clear", async (req, res) => {
  try {
    // Clear all trend history from storage
    await storage.clearTrendHistory();
    
    res.json({
      success: true,
      message: "All trend history cleared successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error clearing trend history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear trend history",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as trendHistoryRouter };