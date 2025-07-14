/**
 * Claude AI Suggestions Service
 * Manages storage and retrieval of Claude's AI analysis suggestions for content improvement
 */

import { db } from '../db';
import { claudeAiSuggestions, suggestionApplications, nicheInsights, contentHistory } from '../../shared/schema';
import type { 
  ClaudeAiSuggestion, 
  InsertClaudeAiSuggestion, 
  SuggestionApplication,
  InsertSuggestionApplication,
  NicheInsight,
  InsertNicheInsight 
} from '../../shared/schema';
import { eq, and, desc, sql, gte, lte, avg, count } from 'drizzle-orm';

export interface SuggestionQuery {
  niche: string;
  templateType?: string;
  platform?: string;
  tone?: string;
  limit?: number;
}

export interface SuggestionWithEffectiveness extends ClaudeAiSuggestion {
  effectiveness: number;
  recentSuccess: boolean;
}

/**
 * Store a new Claude AI suggestion in the database
 */
export async function storeSuggestion(suggestion: InsertClaudeAiSuggestion): Promise<ClaudeAiSuggestion> {
  const [stored] = await db
    .insert(claudeAiSuggestions)
    .values(suggestion)
    .returning();
  
  console.log(`📝 Stored Claude AI suggestion for ${suggestion.niche} niche: ${suggestion.suggestionType}`);
  return stored;
}

/**
 * Get relevant suggestions for content generation based on niche and parameters
 */
export async function getSuggestionsForContent(query: SuggestionQuery): Promise<SuggestionWithEffectiveness[]> {
  const { niche, templateType, platform, tone, limit = 10 } = query;
  console.log(`🔍 CLAUDE AI SERVICE: Querying suggestions with niche=${niche}, templateType=${templateType}, platform=${platform}, tone=${tone}, limit=${limit}`);
  
  let dbQuery = db
    .select({
      suggestion: claudeAiSuggestions,
      effectiveness: sql<number>`
        CASE 
          WHEN ${claudeAiSuggestions.timesUsed} = 0 THEN ${claudeAiSuggestions.confidence}
          ELSE (${claudeAiSuggestions.successRate} * 0.7 + ${claudeAiSuggestions.confidence} * 0.3)
        END
      `,
      recentSuccess: sql<boolean>`
        ${claudeAiSuggestions.lastApplied} > NOW() - INTERVAL '7 days' 
        AND ${claudeAiSuggestions.successRate} > 70
      `
    })
    .from(claudeAiSuggestions)
    .where(
      and(
        eq(claudeAiSuggestions.niche, niche),
        eq(claudeAiSuggestions.isActive, true)
      )
    );

  // Apply additional filters if provided
  if (templateType) {
    dbQuery = dbQuery.where(
      and(
        eq(claudeAiSuggestions.niche, niche),
        sql`${claudeAiSuggestions.templateTypes} @> ARRAY[${templateType}]::text[]`
      )
    );
  }

  if (platform) {
    dbQuery = dbQuery.where(
      and(
        eq(claudeAiSuggestions.niche, niche),
        sql`${claudeAiSuggestions.platforms} @> ARRAY[${platform}]::text[]`
      )
    );
  }

  if (tone) {
    dbQuery = dbQuery.where(
      and(
        eq(claudeAiSuggestions.niche, niche),
        sql`${claudeAiSuggestions.tones} @> ARRAY[${tone}]::text[]`
      )
    );
  }

  const results = await dbQuery
    .orderBy(desc(sql`effectiveness`), desc(claudeAiSuggestions.priority))
    .limit(limit);

  console.log(`📊 CLAUDE AI SERVICE: Found ${results.length} suggestions for niche: ${niche}, template: ${templateType}, tone: ${tone}`);

  return results.map(row => ({
    ...row.suggestion,
    effectiveness: row.effectiveness,
    recentSuccess: row.recentSuccess
  }));
}

/**
 * Apply suggestions to content and track the application
 */
export async function applySuggestionToContent(
  suggestionId: number,
  contentHistoryId: number,
  applicationData: Partial<InsertSuggestionApplication>
): Promise<void> {
  // Record the application
  await db.insert(suggestionApplications).values({
    suggestionId,
    contentHistoryId,
    applicationMethod: 'automatic',
    ...applicationData
  });

  // Update suggestion usage statistics
  await db
    .update(claudeAiSuggestions)
    .set({
      timesUsed: sql`${claudeAiSuggestions.timesUsed} + 1`,
      lastApplied: new Date(),
      appliedToContent: sql`${claudeAiSuggestions.appliedToContent} + 1`
    })
    .where(eq(claudeAiSuggestions.id, suggestionId));

  console.log(`✅ Applied suggestion ${suggestionId} to content ${contentHistoryId}`);
}

/**
 * Update suggestion effectiveness based on content performance
 */
export async function updateSuggestionEffectiveness(
  suggestionId: number,
  beforeRating: number,
  afterRating: number
): Promise<void> {
  const improvement = afterRating - beforeRating;
  const isSuccess = improvement > 0;

  // Calculate new success rate
  const suggestion = await db
    .select()
    .from(claudeAiSuggestions)
    .where(eq(claudeAiSuggestions.id, suggestionId))
    .limit(1);

  if (suggestion.length === 0) return;

  const current = suggestion[0];
  const newSuccessRate = current.timesUsed === 0 
    ? (isSuccess ? 100 : 0)
    : ((current.successRate || 0) * (current.timesUsed - 1) + (isSuccess ? 100 : 0)) / current.timesUsed;

  const newAvgIncrease = current.timesUsed === 0
    ? improvement
    : ((current.avgRatingIncrease || 0) * (current.timesUsed - 1) + improvement) / current.timesUsed;

  await db
    .update(claudeAiSuggestions)
    .set({
      successRate: newSuccessRate.toString(),
      avgRatingIncrease: newAvgIncrease.toString(),
      isValidated: true
    })
    .where(eq(claudeAiSuggestions.id, suggestionId));

  console.log(`📊 Updated suggestion ${suggestionId} effectiveness: ${newSuccessRate.toFixed(1)}% success rate`);
}

/**
 * Generate and store Claude AI suggestions based on content analysis
 */
export async function generateAndStoreSuggestions(
  niche: string,
  contentSample: string,
  performanceData: any
): Promise<ClaudeAiSuggestion[]> {
  try {
    // Import Claude AI service
    const { anthropic } = await import('../services/aiModelRouter');

    const analysisPrompt = `Analyze this ${niche} content and provide specific improvement suggestions:

CONTENT SAMPLE:
${contentSample}

PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

Provide 3-5 specific, actionable suggestions for improving content in the ${niche} niche. For each suggestion, include:

1. The specific improvement recommendation
2. When/where it applies (context)
3. A concrete example of implementation
4. Your confidence level (0-100)
5. Which content types it works best with
6. Which platforms it's most effective on

Format as JSON array with this structure:
{
  "suggestions": [
    {
      "suggestionType": "style_improvement|hook_optimization|engagement_boost|cta_enhancement",
      "category": "writing_style|structure|tone|format|platform_optimization", 
      "suggestion": "specific recommendation",
      "context": "when this applies",
      "example": "concrete example",
      "confidence": 85,
      "templateTypes": ["short_video", "influencer_caption"],
      "platforms": ["tiktok", "instagram"],
      "tones": ["casual", "professional"]
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(analysisText);

    const storedSuggestions: ClaudeAiSuggestion[] = [];

    for (const suggestion of analysis.suggestions) {
      const stored = await storeSuggestion({
        niche,
        suggestionType: suggestion.suggestionType,
        category: suggestion.category,
        suggestion: suggestion.suggestion,
        context: suggestion.context,
        example: suggestion.example,
        confidence: suggestion.confidence.toString(),
        source: 'automated_analysis',
        templateTypes: suggestion.templateTypes,
        platforms: suggestion.platforms,
        tones: suggestion.tones,
        timesUsed: 0,
        appliedToContent: 0,
        isActive: true,
        priority: Math.round(suggestion.confidence)
      });

      storedSuggestions.push(stored);
    }

    console.log(`🧠 Generated and stored ${storedSuggestions.length} Claude AI suggestions for ${niche} niche`);
    return storedSuggestions;

  } catch (error) {
    console.error('Error generating Claude AI suggestions:', error);
    return [];
  }
}

/**
 * Get top-performing suggestions for a specific niche
 */
export async function getTopSuggestionsForNiche(niche: string, limit: number = 5): Promise<SuggestionWithEffectiveness[]> {
  const results = await db
    .select({
      suggestion: claudeAiSuggestions,
      effectiveness: sql<number>`
        CASE 
          WHEN ${claudeAiSuggestions.timesUsed} = 0 THEN ${claudeAiSuggestions.confidence}
          ELSE (${claudeAiSuggestions.successRate} * 0.8 + ${claudeAiSuggestions.avgRatingIncrease} * 0.2)
        END
      `,
      recentSuccess: sql<boolean>`
        ${claudeAiSuggestions.lastApplied} > NOW() - INTERVAL '7 days' 
        AND ${claudeAiSuggestions.successRate} > 70
      `
    })
    .from(claudeAiSuggestions)
    .where(
      and(
        eq(claudeAiSuggestions.niche, niche),
        eq(claudeAiSuggestions.isActive, true),
        gte(claudeAiSuggestions.timesUsed, 1) // Only suggestions that have been tested
      )
    )
    .orderBy(desc(sql`effectiveness`))
    .limit(limit);

  return results.map(row => ({
    ...row.suggestion,
    effectiveness: row.effectiveness,
    recentSuccess: row.recentSuccess
  }));
}

/**
 * Store or update niche insights based on content analysis
 */
export async function updateNicheInsights(
  niche: string,
  insights: Partial<InsertNicheInsight>
): Promise<NicheInsight> {
  const existing = await db
    .select()
    .from(nicheInsights)
    .where(eq(nicheInsights.niche, niche))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(nicheInsights)
      .set({
        ...insights,
        lastAnalyzed: new Date(),
        updatedAt: new Date()
      })
      .where(eq(nicheInsights.niche, niche))
      .returning();
    
    return updated;
  } else {
    const [created] = await db
      .insert(nicheInsights)
      .values({
        niche,
        ...insights,
        totalContent: 0,
        lastAnalyzed: new Date()
      })
      .returning();
    
    return created;
  }
}

/**
 * Get comprehensive niche insights for content optimization
 */
export async function getNicheInsights(niche: string): Promise<NicheInsight | null> {
  const [insight] = await db
    .select()
    .from(nicheInsights)
    .where(eq(nicheInsights.niche, niche))
    .limit(1);

  return insight || null;
}

/**
 * Analyze recent content performance and generate insights
 */
export async function analyzeNichePerformance(niche: string): Promise<void> {
  try {
    // Get recent content for this niche
    const recentContent = await db
      .select()
      .from(contentHistory)
      .where(
        and(
          eq(contentHistory.niche, niche),
          gte(contentHistory.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        )
      )
      .orderBy(desc(contentHistory.createdAt))
      .limit(100);

    if (recentContent.length === 0) {
      console.log(`📊 No recent content found for ${niche} niche analysis`);
      return;
    }

    // Analyze patterns
    const templatePerformance = recentContent.reduce((acc, content) => {
      const template = content.contentType;
      if (!acc[template]) acc[template] = { count: 0, ratings: [] };
      acc[template].count++;
      return acc;
    }, {} as Record<string, { count: number; ratings: number[] }>);

    const tonePerformance = recentContent.reduce((acc, content) => {
      const tone = content.tone;
      if (!acc[tone]) acc[tone] = { count: 0, ratings: [] };
      acc[tone].count++;
      return acc;
    }, {} as Record<string, { count: number; ratings: number[] }>);

    // Get top performing templates and tones
    const bestTemplates = Object.entries(templatePerformance)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5)
      .map(([template]) => template);

    const bestTones = Object.entries(tonePerformance)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 3)
      .map(([tone]) => tone);

    // Update insights
    await updateNicheInsights(niche, {
      bestPerformingTemplates: bestTemplates,
      topTones: bestTones,
      totalContent: recentContent.length,
      dataQuality: Math.min(100, (recentContent.length / 50) * 100), // Quality based on sample size
      sampleSize: recentContent.length
    });

    console.log(`📈 Updated niche insights for ${niche}: ${bestTemplates.length} templates, ${bestTones.length} tones`);

  } catch (error) {
    console.error(`Error analyzing niche performance for ${niche}:`, error);
  }
}