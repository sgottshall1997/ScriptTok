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
    // Build query conditions
    const conditions = [
      eq(contentRatings.userId, userId),
      gte(contentRatings.overallRating, 80), // High-rated content (80+)
    ];

    // Add content history filters if provided
    const contentHistoryConditions = [];
    if (niche) {
      contentHistoryConditions.push(eq(contentHistory.niche, niche));
    }

    // Get high-rated content for this user
    let query = db
      .select({
        contentHistory: contentHistory,
        rating: contentRatings,
      })
      .from(contentRatings)
      .innerJoin(contentHistory, eq(contentRatings.contentHistoryId, contentHistory.id))
      .where(and(...conditions));

    if (contentHistoryConditions.length > 0) {
      query = query.where(and(...contentHistoryConditions));
    }

    const highRatedContent = await query
      .orderBy(desc(contentRatings.overallRating))
      .limit(10);

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
      bestContent: [] as string[]
    };

    // Analyze tone patterns
    const tones = highRatedContent.map(item => item.contentHistory.tone).filter(Boolean);
    patterns.commonTones = [...new Set(tones)];

    // Analyze template patterns  
    const templates = highRatedContent.map(item => item.contentHistory.contentType).filter(Boolean);
    patterns.successfulTemplates = [...new Set(templates)];

    // Calculate average rating
    patterns.averageRating = Math.round(
      highRatedContent.reduce((sum, item) => sum + (item.rating.overallRating || 0), 0) / 
      highRatedContent.length
    );

    // Get top content examples
    patterns.bestContent = highRatedContent
      .slice(0, 3)
      .map(item => item.contentHistory.outputText || '')
      .filter(Boolean);

    // Analyze platform-specific performance
    if (platform) {
      const platformKey = `${platform.toLowerCase()}Rating` as keyof typeof contentRatings.$inferSelect;
      const platformRatings = highRatedContent
        .map(item => item.rating[platformKey])
        .filter(Boolean) as number[];
      
      if (platformRatings.length > 0) {
        patterns.platformSpecificInsights[platform] = {
          averageRating: Math.round(platformRatings.reduce((sum, rating) => sum + rating, 0) / platformRatings.length),
          sampleCount: platformRatings.length
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

    return {
      patterns,
      sampleCount: highRatedContent.length,
      averageRating: patterns.averageRating,
      recommendation: generateStyleRecommendation(patterns, niche, templateType, tone, platform)
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
  platform?: string
): string {
  const recommendations = [];

  if (patterns.commonTones.length > 0) {
    recommendations.push(`Your highest-rated content uses ${patterns.commonTones.join(' and ')} tones`);
  }

  if (patterns.successfulTemplates.length > 0) {
    recommendations.push(`${patterns.successfulTemplates.join(' and ')} templates perform best for you`);
  }

  if (patterns.topPerformingStructures.length > 0) {
    recommendations.push(`Successful structure: ${patterns.topPerformingStructures[0]}`);
  }

  if (platform && patterns.platformSpecificInsights[platform]) {
    const insight = patterns.platformSpecificInsights[platform];
    recommendations.push(`Your ${platform} content averages ${insight.averageRating}/100`);
  }

  return recommendations.length > 0 
    ? recommendations.join('. ') + '.'
    : 'Generate more content and rate it to build personalized recommendations.';
}