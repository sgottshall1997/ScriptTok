import { Router } from "express";
import { storage } from "../storage";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { contentHistory } from "@shared/schema";

const router = Router();

// GET /api/usage-summary
router.get("/", async (req, res) => {
  try {
    // Get current date and date 7 days ago for weekly stats
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Format dates as ISO strings for the database queries
    const todayStr = today.toISOString();
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    // Get total generations
    const totalGenerationsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contentHistory);
    
    const totalGenerations = totalGenerationsResult[0]?.count || 0;

    // Get total tokens used
    const totalTokensResult = await db
      .select({ sum: sql<number>`sum(${contentHistory.tokenCount})` })
      .from(contentHistory);
    
    const totalTokens = totalTokensResult[0]?.sum || 0;

    // Get usage by model
    const modelUsageResult = await db
      .select({
        model: contentHistory.modelUsed,
        count: sql<number>`count(*)`,
        tokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .groupBy(contentHistory.modelUsed);

    // Get usage for the last 7 days
    const last7DaysResult = await db
      .select({
        date: sql<string>`date_trunc('day', ${contentHistory.createdAt})`,
        count: sql<number>`count(*)`,
        tokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(sql`${contentHistory.createdAt} >= ${sevenDaysAgoStr} AND ${contentHistory.createdAt} <= ${todayStr}`)
      .groupBy(sql`date_trunc('day', ${contentHistory.createdAt})`)
      .orderBy(sql`date_trunc('day', ${contentHistory.createdAt})`);

    res.json({
      success: true,
      summary: {
        totalGenerations,
        totalTokens,
        byModel: modelUsageResult.map(item => ({
          model: item.model,
          generations: item.count,
          tokens: item.tokens || 0
        })),
        last7Days: last7DaysResult.map(item => ({
          date: item.date,
          generations: item.count,
          tokens: item.tokens || 0
        }))
      }
    });
  } catch (error) {
    console.error("Error getting usage summary:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get usage summary", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as usageSummaryRouter };