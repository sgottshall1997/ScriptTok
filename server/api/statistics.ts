import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// GET /api/statistics - Get usage statistics
router.get('/', async (req, res) => {
  try {
    // Get all content history for comprehensive statistics
    const allHistory = await storage.getAllContentHistory();
    
    if (!allHistory || allHistory.length === 0) {
      return res.json({
        success: true,
        data: {
          totalGenerations: 0,
          monthlyGenerations: 0,
          dailyGenerations: 0,
          mostPopularTemplate: null,
          mostPopularNiche: null,
          currentStreak: 0
        }
      });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate statistics
    const totalGenerations = allHistory.length;
    
    // Daily generations (today)
    const dailyGenerations = allHistory.filter(entry => 
      new Date(entry.createdAt) >= startOfDay
    ).length;
    
    // Monthly generations (this month)
    const monthlyGenerations = allHistory.filter(entry => 
      new Date(entry.createdAt) >= startOfMonth
    ).length;

    // Most popular template (using contentType as templateType)
    const templateCounts: Record<string, number> = {};
    allHistory.forEach(entry => {
      templateCounts[entry.contentType] = (templateCounts[entry.contentType] || 0) + 1;
    });
    const mostPopularTemplate = Object.keys(templateCounts).length > 0 
      ? Object.entries(templateCounts).reduce((a, b) => templateCounts[a[0]] > templateCounts[b[0]] ? a : b)[0]
      : null;

    // Most popular niche
    const nicheCounts: Record<string, number> = {};
    allHistory.forEach(entry => {
      nicheCounts[entry.niche] = (nicheCounts[entry.niche] || 0) + 1;
    });
    const mostPopularNiche = Object.keys(nicheCounts).length > 0
      ? Object.entries(nicheCounts).reduce((a, b) => nicheCounts[a[0]] > nicheCounts[b[0]] ? a : b)[0]
      : null;

    // Calculate current streak (consecutive days with at least 1 generation)
    let currentStreak = 0;
    const sortedDates = allHistory
      .map(entry => new Date(entry.createdAt))
      .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

    if (sortedDates.length > 0) {
      const uniqueDays = Array.from(new Set(sortedDates.map(date => 
        new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      ))).sort((a, b) => b - a); // Most recent first

      let checkDate = new Date(startOfDay);
      for (const dayTimestamp of uniqueDays) {
        const day = new Date(dayTimestamp);
        if (day.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalGenerations,
        monthlyGenerations,
        dailyGenerations,
        mostPopularTemplate,
        mostPopularNiche,
        currentStreak,
        templateCounts,
        nicheCounts
      }
    });

  } catch (error: any) {
    console.error('Error fetching usage statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics',
      message: error.message
    });
  }
});

export default router;