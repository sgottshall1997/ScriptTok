import { db } from '../db';
import { contentRatings, contentPatterns, userContentPreferences, patternApplications, contentHistory } from '@shared/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';

export interface ContentAnalysis {
  wordCount: number;
  sentences: string[];
  phrases: string[];
  emotionalTone: string;
  hookType: string;
  callToActionStyle: string;
}

// Save user rating for content
export async function saveContentRating(ratingData: {
  contentHistoryId: number;
  userId?: number;
  overallRating?: number;
  instagramRating?: number;
  tiktokRating?: number;
  youtubeRating?: number;
  twitterRating?: number;
  notes?: string;
}) {
  try {
    const existingRating = await db
      .select()
      .from(contentRatings)
      .where(
        and(
          eq(contentRatings.contentHistoryId, ratingData.contentHistoryId),
          ratingData.userId ? eq(contentRatings.userId, ratingData.userId) : sql`user_id IS NULL`
        )
      )
      .limit(1);

    if (existingRating.length > 0) {
      // Update existing rating
      const [updated] = await db
        .update(contentRatings)
        .set({
          overallRating: ratingData.overallRating,
          instagramRating: ratingData.instagramRating,
          tiktokRating: ratingData.tiktokRating,
          youtubeRating: ratingData.youtubeRating,
          twitterRating: ratingData.twitterRating,
          notes: ratingData.notes,
          ratedAt: new Date(),
        })
        .where(eq(contentRatings.id, existingRating[0].id))
        .returning();
      
      return updated;
    } else {
      // Create new rating
      const [newRating] = await db
        .insert(contentRatings)
        .values(ratingData)
        .returning();
      
      return newRating;
    }
  } catch (error) {
    console.error('Error saving content rating:', error);
    throw error;
  }
}

// Get rating for specific content
export async function getContentRating(contentHistoryId: number, userId?: number) {
  try {
    const rating = await db
      .select()
      .from(contentRatings)
      .where(
        and(
          eq(contentRatings.contentHistoryId, contentHistoryId),
          userId ? eq(contentRatings.userId, userId) : sql`user_id IS NULL`
        )
      )
      .limit(1);

    return rating[0] || null;
  } catch (error) {
    console.error('Error getting content rating:', error);
    return null;
  }
}

// Analyze content to extract patterns
export function analyzeContent(content: string, hook?: string): ContentAnalysis {
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Extract phrases (3-5 word sequences)
  const words = content.toLowerCase().split(/\s+/);
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 2; i++) {
    phrases.push(words.slice(i, i + 3).join(' '));
  }
  
  // Simple emotional tone detection
  const excitedWords = ['amazing', 'incredible', 'wow', 'fantastic', '!'];
  const calmWords = ['gentle', 'peaceful', 'smooth', 'subtle'];
  const urgentWords = ['now', 'today', 'hurry', 'limited', 'urgent'];
  
  let emotionalTone = 'neutral';
  if (excitedWords.some(word => content.toLowerCase().includes(word))) {
    emotionalTone = 'excited';
  } else if (urgentWords.some(word => content.toLowerCase().includes(word))) {
    emotionalTone = 'urgent';
  } else if (calmWords.some(word => content.toLowerCase().includes(word))) {
    emotionalTone = 'calm';
  }
  
  // Hook type detection
  let hookType = 'statement';
  if (hook) {
    if (hook.includes('?')) hookType = 'question';
    else if (hook.match(/\d+/)) hookType = 'stat';
    else if (hook.toLowerCase().includes('story') || hook.toLowerCase().includes('when')) hookType = 'story';
  }
  
  // Call to action style
  let callToActionStyle = 'direct';
  if (content.includes('?')) callToActionStyle = 'question';
  else if (content.toLowerCase().includes('maybe') || content.toLowerCase().includes('consider')) {
    callToActionStyle = 'subtle';
  }
  
  return {
    wordCount,
    sentences,
    phrases,
    emotionalTone,
    hookType,
    callToActionStyle
  };
}

// Extract patterns from high-rated content
export async function extractContentPatterns(minRating = 70) {
  try {
    const highRatedContent = await db
      .select({
        contentHistory: contentHistory,
        rating: contentRatings,
      })
      .from(contentRatings)
      .innerJoin(contentHistory, eq(contentRatings.contentHistoryId, contentHistory.id))
      .where(gte(contentRatings.overallRating, minRating))
      .orderBy(desc(contentRatings.overallRating));

    const patternGroups = new Map<string, any[]>();
    
    for (const item of highRatedContent) {
      const key = `${item.contentHistory.niche}-${item.contentHistory.tone}-${item.contentHistory.contentType}`;
      if (!patternGroups.has(key)) {
        patternGroups.set(key, []);
      }
      patternGroups.get(key)!.push(item);
    }
    
    const patterns: any[] = [];
    
    for (const [key, group] of patternGroups) {
      if (group.length >= 3) { // Minimum 3 samples for pattern
        const [niche, tone, templateType] = key.split('-');
        
        const analyses = group.map(item => 
          analyzeContent(item.contentHistory.outputText || '', item.contentHistory.promptText)
        );
        
        const avgRating = group.reduce((sum, item) => sum + (item.rating.overallRating || 0), 0) / group.length;
        const avgWordCount = analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length;
        
        const commonPhrases = analyses
          .flatMap(a => a.phrases)
          .reduce((acc, phrase) => {
            acc[phrase] = (acc[phrase] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        
        const topPhrases = Object.entries(commonPhrases)
          .filter(([_, count]) => count >= 2)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([phrase]) => phrase);
        
        const pattern = {
          patternName: `high_rated_${niche}_${tone}`,
          description: `High-performing ${niche} content with ${tone} tone`,
          niche,
          templateType,
          tone,
          platform: 'all',
          averageRating: avgRating.toString(),
          sampleCount: group.length,
          confidence: Math.min(group.length / 10, 1).toString(),
          averageWordCount: Math.round(avgWordCount),
          commonPhrases: topPhrases,
          sentenceStructures: [],
          emotionalTone: analyses[0]?.emotionalTone || 'neutral',
          callToActionStyle: analyses[0]?.callToActionStyle || 'direct',
          hookType: analyses[0]?.hookType || 'statement',
          bestPerformingElements: {
            avgRating,
            topPhrases,
            sampleIds: group.map(item => item.contentHistory.id),
          },
          avoidancePatterns: {},
        };
        
        patterns.push(pattern);
      }
    }
    
    return patterns;
  } catch (error) {
    console.error('Error extracting content patterns:', error);
    return [];
  }
}

// Get user preferences for learning system
export async function getUserPreferences(userId: number) {
  try {
    const prefs = await db
      .select()
      .from(userContentPreferences)
      .where(eq(userContentPreferences.userId, userId))
      .limit(1);

    if (prefs.length === 0) {
      // Create default preferences
      const [newPrefs] = await db
        .insert(userContentPreferences)
        .values({
          userId,
          useSmartLearning: true,
          learningIntensity: 'moderate',
          minOverallRating: 70,
          minPlatformRating: 65,
        })
        .returning();
      
      return newPrefs;
    }
    
    return prefs[0];
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

// Update user preferences
export async function updateUserPreferences(userId: number, preferences: {
  useSmartLearning?: boolean;
  learningIntensity?: string;
  minOverallRating?: number;
  minPlatformRating?: number;
  personalizedWeights?: any;
}) {
  try {
    const [updated] = await db
      .update(userContentPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(userContentPreferences.userId, userId))
      .returning();
    
    return updated;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

// Get content generation suggestions based on patterns
export async function getContentSuggestions(niche: string, tone: string, templateType: string) {
  try {
    const relevantPatterns = await db
      .select()
      .from(contentPatterns)
      .where(
        and(
          eq(contentPatterns.niche, niche),
          eq(contentPatterns.tone, tone),
          eq(contentPatterns.isActive, true),
          gte(contentPatterns.confidence, 0.6)
        )
      )
      .orderBy(desc(contentPatterns.averageRating))
      .limit(3);

    return relevantPatterns.map(pattern => ({
      patternId: pattern.id,
      suggestion: `Based on your ${pattern.sampleCount} high-rated pieces, try using phrases like: ${pattern.commonPhrases?.slice(0, 3).join(', ')}.`,
      confidence: pattern.confidence,
      elements: pattern.bestPerformingElements,
    }));
  } catch (error) {
    console.error('Error getting content suggestions:', error);
    return [];
  }
}

// Track pattern application for A/B testing
export async function trackPatternApplication(data: {
  contentHistoryId: number;
  patternId?: number;
  applicationStrength?: number;
  modifiedAttributes?: string[];
}) {
  try {
    const [application] = await db
      .insert(patternApplications)
      .values(data)
      .returning();
    
    return application;
  } catch (error) {
    console.error('Error tracking pattern application:', error);
    return null;
  }
}

// Get smart style recommendations based on user's best-rated content
export async function getSmartStyleRecommendations(
  userId: number,
  niche: string,
  templateType?: string,
  tone?: string,
  platform?: string
) {
  try {
    // Get high-rated content from user ratings (69+ on 1-100 scale)
    const userRatedContent = await db
      .select({
        contentHistory: contentHistory,
        rating: contentRatings,
        source: sql<string>`'user'`.as('source'),
        normalizedRating: sql<number>`${contentRatings.overallRating}`.as('normalizedRating')
      })
      .from(contentRatings)
      .innerJoin(contentHistory, eq(contentRatings.contentHistoryId, contentHistory.id))
      .where(and(
        eq(contentRatings.userId, userId),
        gte(contentRatings.overallRating, 69),
        niche ? eq(contentHistory.niche, niche) : sql`true`
      ))
      .orderBy(desc(contentRatings.overallRating))
      .limit(15);

    // Get high-rated content from AI evaluations (6.9+ on 1-10 scale = 69+ equivalent)
    const { contentEvaluations } = await import('@shared/schema');
    const aiEvaluatedContent = await db
      .select({
        contentHistory: contentHistory,
        evaluation: contentEvaluations,
        source: sql<string>`'ai'`.as('source'),
        normalizedRating: sql<number>`(${contentEvaluations.overallScore}::numeric * 10)`.as('normalizedRating')
      })
      .from(contentEvaluations)
      .innerJoin(contentHistory, eq(contentEvaluations.contentHistoryId, contentHistory.id))
      .where(and(
        sql`${contentEvaluations.overallScore}::numeric >= 6.9`, // 6.9+ on 1-10 scale
        niche ? eq(contentHistory.niche, niche) : sql`true`
      ))
      .orderBy(desc(contentEvaluations.overallScore))
      .limit(15);

    // Combine both sources
    const allHighRatedContent = [
      ...userRatedContent.map(item => ({
        contentHistory: item.contentHistory,
        rating: item.rating || null,
        evaluation: null,
        source: item.source,
        normalizedRating: item.normalizedRating
      })),
      ...aiEvaluatedContent.map(item => ({
        contentHistory: item.contentHistory,
        rating: null,
        evaluation: item.evaluation,
        source: item.source,
        normalizedRating: item.normalizedRating
      }))
    ];

    // Sort by normalized rating and remove duplicates
    const uniqueContent = new Map();
    allHighRatedContent.forEach(item => {
      const key = item.contentHistory.id;
      if (!uniqueContent.has(key) || uniqueContent.get(key).normalizedRating < item.normalizedRating) {
        uniqueContent.set(key, item);
      }
    });

    const highRatedContent = Array.from(uniqueContent.values())
      .sort((a, b) => b.normalizedRating - a.normalizedRating)
      .slice(0, 10);

    if (highRatedContent.length === 0) {
      return null;
    }

    // Extract patterns from the best content
    const patterns = {
      commonTones: [] as string[],
      successfulTemplates: [] as string[],
      averageRating: 0,
      topPerformingStructures: [] as string[],
      platformSpecificInsights: {} as Record<string, any>,
      bestContent: [] as string[],
      ratingSource: 'combined' as string
    };

    // Analyze tone patterns
    const tones = highRatedContent.map(item => item.contentHistory.tone).filter(Boolean);
    patterns.commonTones = [...new Set(tones)];

    // Analyze template patterns  
    const templates = highRatedContent.map(item => item.contentHistory.contentType).filter(Boolean);
    patterns.successfulTemplates = [...new Set(templates)];

    // Calculate average rating (using normalized ratings)
    patterns.averageRating = Math.round(
      highRatedContent.reduce((sum, item) => sum + item.normalizedRating, 0) / 
      highRatedContent.length
    );

    // Get top content examples
    patterns.bestContent = highRatedContent
      .slice(0, 3)
      .map(item => item.contentHistory.outputText || '')
      .filter(Boolean);

    // Analyze platform-specific performance
    if (platform) {
      const userRatedItems = highRatedContent.filter(item => item.rating);
      const platformKey = `${platform.toLowerCase()}Rating` as keyof typeof contentRatings.$inferSelect;
      
      if (userRatedItems.length > 0) {
        const platformRatings = userRatedItems
          .map(item => item.rating?.[platformKey])
          .filter(Boolean) as number[];
        
        if (platformRatings.length > 0) {
          patterns.platformSpecificInsights[platform] = {
            averageRating: Math.round(platformRatings.reduce((sum, rating) => sum + rating, 0) / platformRatings.length),
            sampleCount: platformRatings.length,
            source: 'user_ratings'
          };
        }
      }
      
      // Also check AI evaluations for platform insights
      const aiEvaluatedItems = highRatedContent.filter(item => item.evaluation);
      if (aiEvaluatedItems.length > 0) {
        const aiRatings = aiEvaluatedItems.map(item => item.normalizedRating);
        patterns.platformSpecificInsights[`${platform}_ai`] = {
          averageRating: Math.round(aiRatings.reduce((sum, rating) => sum + rating, 0) / aiRatings.length),
          sampleCount: aiRatings.length,
          source: 'ai_evaluations'
        };
      }
    }

    // Extract structural patterns from content
    const contentAnalyses = highRatedContent.map(item => {
      const content = item.contentHistory.outputText || '';
      return analyzeContent(content);
    });

    // Find common structural elements
    const structures = contentAnalyses.map(analysis => 
      `${analysis.sentences.length} sentences, ${analysis.hookType} hook, ${analysis.callToActionStyle} CTA`
    );
    patterns.topPerformingStructures = [...new Set(structures)].slice(0, 3);

    const userRatedCount = highRatedContent.filter(item => item.source === 'user').length;
    const aiEvaluatedCount = highRatedContent.filter(item => item.source === 'ai').length;

    return {
      patterns,
      sampleCount: highRatedContent.length,
      averageRating: patterns.averageRating,
      userRatedCount,
      aiEvaluatedCount,
      recommendation: generateStyleRecommendation(patterns, niche, templateType, tone, platform, userRatedCount, aiEvaluatedCount)
    };

  } catch (error) {
    console.error('Error getting smart style recommendations:', error);
    return null;
  }
}

// Generate style recommendation text
function generateStyleRecommendation(
  patterns: any,
  niche: string,
  templateType?: string,
  tone?: string,
  platform?: string,
  userRatedCount?: number,
  aiEvaluatedCount?: number
): string {
  const recommendations = [];

  // Add source information
  const sourceInfo = [];
  if (userRatedCount && userRatedCount > 0) {
    sourceInfo.push(`${userRatedCount} user-rated`);
  }
  if (aiEvaluatedCount && aiEvaluatedCount > 0) {
    sourceInfo.push(`${aiEvaluatedCount} AI-evaluated`);
  }
  const sourceText = sourceInfo.length > 0 ? ` (from ${sourceInfo.join(', ')} samples)` : '';

  if (patterns.commonTones.length > 0) {
    recommendations.push(`Your highest-rated content uses ${patterns.commonTones.join(' and ')} tones${sourceText}`);
  }

  if (patterns.successfulTemplates.length > 0) {
    recommendations.push(`${patterns.successfulTemplates.join(' and ')} templates perform best for you`);
  }

  if (patterns.topPerformingStructures.length > 0) {
    recommendations.push(`Successful structure: ${patterns.topPerformingStructures[0]}`);
  }

  if (platform && patterns.platformSpecificInsights[platform]) {
    const insight = patterns.platformSpecificInsights[platform];
    const source = insight.source ? ` (${insight.source})` : '';
    recommendations.push(`Your ${platform} content averages ${insight.averageRating}/100${source}`);
  }

  return recommendations.length > 0 
    ? recommendations.join('. ') + '.'
    : 'Generate more content and rate it to build personalized recommendations.';
}

// Get top-rated content for style learning (for promptFactory)
export async function getTopRatedContentForStyle(
  userId: number,
  niche: string,
  platform?: string,
  tone?: string,
  templateType?: string
): Promise<{
  toneSummary: string;
  structureHint: string;
  topHashtags: string[];
  highRatedCaptionExample?: string;
} | null> {
  try {
    // Fetch highly rated content from user ratings (85+) for the user in this niche
    const userRatedContent = await db
      .select({
        rating: contentRatings,
        contentHistory: contentHistory,
        normalizedRating: sql<number>`${contentRatings.overallRating}`.as('normalizedRating')
      })
      .from(contentRatings)
      .innerJoin(contentHistory, eq(contentRatings.contentHistoryId, contentHistory.id))
      .where(
        and(
          eq(contentRatings.userId, userId),
          gte(contentRatings.overallRating, 85),
          eq(contentHistory.niche, niche)
        )
      )
      .orderBy(desc(contentRatings.overallRating))
      .limit(15);

    // Fetch highly rated content from AI evaluations (8.5+ on 1-10 scale = 85+ equivalent)
    const { contentEvaluations } = await import('@shared/schema');
    const aiEvaluatedContent = await db
      .select({
        evaluation: contentEvaluations,
        contentHistory: contentHistory,
        normalizedRating: sql<number>`(${contentEvaluations.overallScore}::numeric * 10)`.as('normalizedRating')
      })
      .from(contentEvaluations)
      .innerJoin(contentHistory, eq(contentEvaluations.contentHistoryId, contentHistory.id))
      .where(
        and(
          sql`${contentEvaluations.overallScore}::numeric >= 8.5`, // 8.5+ on 1-10 scale
          eq(contentHistory.niche, niche)
        )
      )
      .orderBy(desc(contentEvaluations.overallScore))
      .limit(15);

    // Combine both sources
    const allHighRatedContent = [
      ...userRatedContent.map(item => ({
        contentHistory: item.contentHistory,
        rating: item.rating || null,
        evaluation: null,
        normalizedRating: item.normalizedRating
      })),
      ...aiEvaluatedContent.map(item => ({
        contentHistory: item.contentHistory,
        rating: null,
        evaluation: item.evaluation,
        normalizedRating: item.normalizedRating
      }))
    ];

    // Remove duplicates and sort by rating
    const uniqueContent = new Map();
    allHighRatedContent.forEach(item => {
      const key = item.contentHistory.id;
      if (!uniqueContent.has(key) || uniqueContent.get(key).normalizedRating < item.normalizedRating) {
        uniqueContent.set(key, item);
      }
    });

    const highRatedContent = Array.from(uniqueContent.values())
      .sort((a, b) => b.normalizedRating - a.normalizedRating)
      .slice(0, 10);

    if (highRatedContent.length === 0) {
      return null;
    }

    // Analyze the content to extract patterns
    const contentAnalyses = highRatedContent.map(item => {
      const content = item.contentHistory.outputText || '';
      return {
        content,
        analysis: analyzeContent(content),
        rating: item.normalizedRating || 0
      };
    });

    // Extract tone patterns from highest-rated content
    const tonePatterns = contentAnalyses.map(item => item.analysis.emotionalTone);
    const mostCommonTone = getMostFrequent(tonePatterns);
    
    // Extract structure patterns
    const structurePatterns = contentAnalyses.map(item => {
      const sentences = item.analysis.sentences.length;
      const hookType = item.analysis.hookType;
      const ctaStyle = item.analysis.callToActionStyle;
      return `${hookType} → ${sentences} key points → ${ctaStyle}`;
    });
    const mostCommonStructure = getMostFrequent(structurePatterns);

    // Extract hashtags from content
    const allHashtags: string[] = [];
    contentAnalyses.forEach(item => {
      const hashtagMatches = item.content.match(/#\w+/g);
      if (hashtagMatches) {
        allHashtags.push(...hashtagMatches);
      }
    });
    
    // Get top 5 most frequently used hashtags
    const hashtagFrequency = getFrequencyMap(allHashtags);
    const topHashtags = Object.entries(hashtagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hashtag]) => hashtag);

    // Get the highest-rated caption as an example
    const bestExample = contentAnalyses
      .sort((a, b) => b.rating - a.rating)[0]?.content;

    return {
      toneSummary: mostCommonTone || 'engaging, authentic',
      structureHint: mostCommonStructure || 'Hook → Key Benefits → Call to Action',
      topHashtags: topHashtags.length > 0 ? topHashtags : ['#trending', '#viral'],
      highRatedCaptionExample: bestExample?.slice(0, 200) // Truncate for brevity
    };

  } catch (error) {
    console.error('Error getting top-rated content for style:', error);
    return null;
  }
}

// Helper function to get most frequent item in array
function getMostFrequent(arr: string[]): string {
  const frequency = getFrequencyMap(arr);
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

// Helper function to create frequency map
function getFrequencyMap(arr: string[]): Record<string, number> {
  return arr.reduce((freq, item) => {
    freq[item] = (freq[item] || 0) + 1;
    return freq;
  }, {} as Record<string, number>);
}

// Comprehensive rating storage function with validation
export async function storeContentRating(data: {
  contentHistoryId: number;
  userId: number;
  overallRating: number;
  tiktokRating?: number;
  instagramRating?: number;
  youtubeRating?: number;
  twitterRating?: number;
  facebookRating?: number;
  notes?: string;
  timestamp?: Date;
}) {
  try {
    // Validate rating ranges (1-100)
    if (data.overallRating < 1 || data.overallRating > 100) {
      throw new Error('Overall rating must be between 1 and 100');
    }

    // Check if rating already exists
    const existingRating = await db
      .select()
      .from(contentRatings)
      .where(
        and(
          eq(contentRatings.contentHistoryId, data.contentHistoryId),
          eq(contentRatings.userId, data.userId)
        )
      )
      .limit(1);

    if (existingRating.length > 0) {
      // Update existing rating
      await db
        .update(contentRatings)
        .set({
          overallRating: data.overallRating,
          tiktokRating: data.tiktokRating,
          instagramRating: data.instagramRating,
          youtubeRating: data.youtubeRating,
          twitterRating: data.twitterRating,
          facebookRating: data.facebookRating,
          notes: data.notes,
          ratedAt: data.timestamp || new Date()
        })
        .where(
          and(
            eq(contentRatings.contentHistoryId, data.contentHistoryId),
            eq(contentRatings.userId, data.userId)
          )
        );
    } else {
      // Insert new rating
      await db.insert(contentRatings).values({
        contentHistoryId: data.contentHistoryId,
        userId: data.userId,
        overallRating: data.overallRating,
        tiktokRating: data.tiktokRating,
        instagramRating: data.instagramRating,
        youtubeRating: data.youtubeRating,
        twitterRating: data.twitterRating,
        facebookRating: data.facebookRating,
        notes: data.notes,
        ratedAt: data.timestamp || new Date()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error storing content rating:', error);
    return { success: false, error: error.message };
  }
}

// AI evaluation storage function with comprehensive validation
export async function storeAIEvaluation(data: {
  contentHistoryId: number;
  evaluatorModel: string;
  viralityScore: number;
  clarityScore: number;
  persuasivenessScore: number;
  creativityScore: number;
  viralityJustification: string;
  clarityJustification: string;
  persuasivenessJustification: string;
  creativityJustification: string;
  needsRevision: boolean;
  improvementSuggestions?: string;
}) {
  try {
    // Validate AI evaluation scores (1-10)
    const scores = [data.viralityScore, data.clarityScore, data.persuasivenessScore, data.creativityScore];
    for (const score of scores) {
      if (score < 1 || score > 10) {
        throw new Error('AI evaluation scores must be between 1 and 10');
      }
    }

    // Calculate overall score (average of all scores)
    const overallScore = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);

    // Import contentEvaluations table
    const { contentEvaluations } = await import('@shared/schema');

    // Check if evaluation already exists
    const existingEvaluation = await db
      .select()
      .from(contentEvaluations)
      .where(
        and(
          eq(contentEvaluations.contentHistoryId, data.contentHistoryId),
          eq(contentEvaluations.evaluatorModel, data.evaluatorModel)
        )
      )
      .limit(1);

    if (existingEvaluation.length > 0) {
      // Update existing evaluation
      await db
        .update(contentEvaluations)
        .set({
          viralityScore: data.viralityScore,
          clarityScore: data.clarityScore,
          persuasivenessScore: data.persuasivenessScore,
          creativityScore: data.creativityScore,
          viralityJustification: data.viralityJustification,
          clarityJustification: data.clarityJustification,
          persuasivenessJustification: data.persuasivenessJustification,
          creativityJustification: data.creativityJustification,
          needsRevision: data.needsRevision,
          improvementSuggestions: data.improvementSuggestions,
          overallScore: overallScore,
          createdAt: new Date()
        })
        .where(
          and(
            eq(contentEvaluations.contentHistoryId, data.contentHistoryId),
            eq(contentEvaluations.evaluatorModel, data.evaluatorModel)
          )
        );
    } else {
      // Insert new evaluation
      await db.insert(contentEvaluations).values({
        contentHistoryId: data.contentHistoryId,
        evaluatorModel: data.evaluatorModel,
        viralityScore: data.viralityScore,
        clarityScore: data.clarityScore,
        persuasivenessScore: data.persuasivenessScore,
        creativityScore: data.creativityScore,
        viralityJustification: data.viralityJustification,
        clarityJustification: data.clarityJustification,
        persuasivenessJustification: data.persuasivenessJustification,
        creativityJustification: data.creativityJustification,
        needsRevision: data.needsRevision,
        improvementSuggestions: data.improvementSuggestions,
        overallScore: overallScore,
        createdAt: new Date()
      });
    }

    return { success: true, overallScore: parseFloat(overallScore) };
  } catch (error) {
    console.error('Error storing AI evaluation:', error);
    return { success: false, error: error.message };
  }
}

// Get comprehensive rating statistics for a user
export async function getUserRatingStats(userId: number) {
  try {
    const { contentEvaluations } = await import('@shared/schema');
    
    // Get user ratings statistics
    const userRatingsStats = await db
      .select({
        totalRatings: sql<number>`COUNT(*)`,
        avgRating: sql<number>`AVG(${contentRatings.overallRating})`,
        highRatedCount: sql<number>`COUNT(CASE WHEN ${contentRatings.overallRating} >= 69 THEN 1 END)`,
        excellentRatedCount: sql<number>`COUNT(CASE WHEN ${contentRatings.overallRating} >= 85 THEN 1 END)`,
        latestRating: sql<Date>`MAX(${contentRatings.ratedAt})`
      })
      .from(contentRatings)
      .where(eq(contentRatings.userId, userId))
      .groupBy(contentRatings.userId);

    // Get AI evaluation statistics
    const aiEvaluationStats = await db
      .select({
        totalEvaluations: sql<number>`COUNT(*)`,
        avgScore: sql<number>`AVG(${contentEvaluations.overallScore}::numeric)`,
        highScoreCount: sql<number>`COUNT(CASE WHEN ${contentEvaluations.overallScore}::numeric >= 6.9 THEN 1 END)`,
        excellentScoreCount: sql<number>`COUNT(CASE WHEN ${contentEvaluations.overallScore}::numeric >= 8.5 THEN 1 END)`,
        latestEvaluation: sql<Date>`MAX(${contentEvaluations.createdAt})`
      })
      .from(contentEvaluations)
      .innerJoin(contentHistory, eq(contentEvaluations.contentHistoryId, contentHistory.id))
      .where(eq(contentHistory.userId, userId))
      .groupBy(contentHistory.userId);

    return {
      userRatings: userRatingsStats[0] || {
        totalRatings: 0,
        avgRating: 0,
        highRatedCount: 0,
        excellentRatedCount: 0,
        latestRating: null
      },
      aiEvaluations: aiEvaluationStats[0] || {
        totalEvaluations: 0,
        avgScore: 0,
        highScoreCount: 0,
        excellentScoreCount: 0,
        latestEvaluation: null
      }
    };
  } catch (error) {
    console.error('Error getting user rating stats:', error);
    return null;
  }
}