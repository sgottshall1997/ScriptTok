/**
 * Claude AI Suggestions API Routes
 * Manage AI analysis suggestions for content improvement by niche
 */

import { Router } from 'express';
import { 
  getSuggestionsForContent,
  getTopSuggestionsForNiche,
  generateAndStoreSuggestions,
  updateSuggestionEffectiveness,
  applySuggestionToContent,
  getNicheInsights,
  analyzeNichePerformance,
  storeSuggestion
} from '../services/claudeAiSuggestionsService';
import { insertClaudeAiSuggestionSchema } from '../../shared/schema';

const router = Router();

/**
 * GET /api/claude-suggestions/:niche
 * Get relevant Claude AI suggestions for a specific niche
 */
router.get('/:niche', async (req, res) => {
  try {
    const { niche } = req.params;
    const { templateType, platform, tone, limit = 10 } = req.query;

    const suggestions = await getSuggestionsForContent({
      niche,
      templateType: templateType as string,
      platform: platform as string,
      tone: tone as string,
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      niche,
      suggestions,
      count: suggestions.length
    });

  } catch (error) {
    console.error('Error fetching Claude AI suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/claude-suggestions/:niche/top
 * Get top-performing Claude AI suggestions for a niche
 */
router.get('/:niche/top', async (req, res) => {
  try {
    const { niche } = req.params;
    const { limit = 5 } = req.query;

    const topSuggestions = await getTopSuggestionsForNiche(niche, parseInt(limit as string));

    res.json({
      success: true,
      niche,
      topSuggestions,
      count: topSuggestions.length
    });

  } catch (error) {
    console.error('Error fetching top Claude AI suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/claude-suggestions/:niche/generate
 * Generate new Claude AI suggestions for a niche based on content analysis
 */
router.post('/:niche/generate', async (req, res) => {
  try {
    const { niche } = req.params;
    const { contentSample, performanceData } = req.body;

    if (!contentSample) {
      return res.status(400).json({
        success: false,
        error: 'contentSample is required'
      });
    }

    const newSuggestions = await generateAndStoreSuggestions(
      niche,
      contentSample,
      performanceData || {}
    );

    res.json({
      success: true,
      niche,
      generatedSuggestions: newSuggestions,
      count: newSuggestions.length
    });

  } catch (error) {
    console.error('Error generating Claude AI suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/claude-suggestions
 * Create a new Claude AI suggestion manually
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = insertClaudeAiSuggestionSchema.parse(req.body);
    
    const newSuggestion = await storeSuggestion(validatedData);

    res.json({
      success: true,
      suggestion: newSuggestion
    });

  } catch (error) {
    console.error('Error creating Claude AI suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create suggestion',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/claude-suggestions/:suggestionId/effectiveness
 * Update suggestion effectiveness based on performance data
 */
router.put('/:suggestionId/effectiveness', async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { beforeRating, afterRating } = req.body;

    if (typeof beforeRating !== 'number' || typeof afterRating !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'beforeRating and afterRating must be numbers'
      });
    }

    await updateSuggestionEffectiveness(
      parseInt(suggestionId),
      beforeRating,
      afterRating
    );

    res.json({
      success: true,
      message: 'Suggestion effectiveness updated',
      improvement: afterRating - beforeRating
    });

  } catch (error) {
    console.error('Error updating suggestion effectiveness:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update effectiveness',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/claude-suggestions/:niche/insights
 * Get comprehensive niche insights for content optimization
 */
router.get('/:niche/insights', async (req, res) => {
  try {
    const { niche } = req.params;

    const insights = await getNicheInsights(niche);

    if (!insights) {
      return res.status(404).json({
        success: false,
        error: 'No insights found for this niche'
      });
    }

    res.json({
      success: true,
      niche,
      insights
    });

  } catch (error) {
    console.error('Error fetching niche insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/claude-suggestions/:niche/analyze
 * Analyze niche performance and update insights
 */
router.post('/:niche/analyze', async (req, res) => {
  try {
    const { niche } = req.params;

    await analyzeNichePerformance(niche);

    res.json({
      success: true,
      message: `Analysis completed for ${niche} niche`,
      niche
    });

  } catch (error) {
    console.error('Error analyzing niche performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze niche',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/claude-suggestions/:suggestionId/apply
 * Apply a suggestion to content and track the application
 */
router.post('/:suggestionId/apply', async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { contentHistoryId, applicationData } = req.body;

    if (!contentHistoryId) {
      return res.status(400).json({
        success: false,
        error: 'contentHistoryId is required'
      });
    }

    await applySuggestionToContent(
      parseInt(suggestionId),
      contentHistoryId,
      applicationData || {}
    );

    res.json({
      success: true,
      message: 'Suggestion applied successfully',
      suggestionId: parseInt(suggestionId),
      contentHistoryId
    });

  } catch (error) {
    console.error('Error applying Claude AI suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply suggestion',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/claude-suggestions/summary
 * Get a summary of all Claude AI suggestions across niches
 */
router.get('/summary', async (req, res) => {
  try {
    const niches = ['beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'];
    const summary = [];

    for (const niche of niches) {
      const suggestions = await getSuggestionsForContent({
        niche,
        limit: 1
      });

      const insights = await getNicheInsights(niche);

      summary.push({
        niche,
        suggestionCount: suggestions.length,
        hasInsights: !!insights,
        lastAnalyzed: insights?.lastAnalyzed || null
      });
    }

    res.json({
      success: true,
      summary,
      totalNiches: niches.length
    });

  } catch (error) {
    console.error('Error generating Claude AI suggestions summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/claude-suggestions/retroactive/analyze
 * Retroactively analyze content history and generate targeted suggestions
 */
router.post('/retroactive/analyze', async (req, res) => {
  try {
    const { generateRetroactiveClaudeSuggestions } = await import('../services/retroactiveClaudeSuggestionGenerator');
    
    const result = await generateRetroactiveClaudeSuggestions();

    res.json({
      success: true,
      message: `Retroactive analysis completed: ${result.generated} suggestions generated from ${result.analyzed} content groups`,
      ...result
    });

  } catch (error) {
    console.error('Error in retroactive Claude AI suggestions analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate retroactive suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/claude-suggestions/retroactive/report
 * Get content distribution report by niche and template
 */
router.get('/retroactive/report', async (req, res) => {
  try {
    const { getContentDistributionReport } = await import('../services/retroactiveClaudeSuggestionGenerator');
    
    const report = await getContentDistributionReport();

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error generating content distribution report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/claude-suggestions/targeted/:niche/:templateType
 * Get targeted suggestions for specific niche-template combination
 */
router.get('/targeted/:niche/:templateType', async (req, res) => {
  try {
    const { niche, templateType } = req.params;
    const { tone = 'professional' } = req.query;
    
    const { getTargetedSuggestions } = await import('../services/retroactiveClaudeSuggestionGenerator');
    
    const suggestions = await getTargetedSuggestions(niche, templateType, tone as string);

    res.json({
      success: true,
      niche,
      templateType,
      tone,
      suggestions,
      count: suggestions.length
    });

  } catch (error) {
    console.error('Error fetching targeted suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch targeted suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/claude-suggestions/populate
 * Populate database with niche-specific suggestions
 */
router.post('/populate', async (req, res) => {
  try {
    const { populateNicheSpecificSuggestions } = await import('../services/nicheSpecificSuggestions');
    
    const result = await populateNicheSpecificSuggestions();

    res.json({
      success: true,
      message: `Populated ${result.populated} suggestions, skipped ${result.skipped} existing ones`,
      ...result
    });

  } catch (error) {
    console.error('Error populating niche-specific suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to populate suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;