import { db } from '../db';
import { contentHistory } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export interface ContentAnalysis {
  wordCount: number;
  sentences: string[];
  phrases: string[];
  emotionalTone: string;
  hookType: string;
  callToActionStyle: string;
}

// Simple content rating interface for in-memory usage
export interface SimpleContentRating {
  contentHistoryId: number;
  userId?: number;
  overallRating: number;
  notes?: string;
  createdAt: Date;
}

// In-memory storage for ratings (simplified for TikTok Viral Product Generator)
const inMemoryRatings: SimpleContentRating[] = [];

// Simplified rating function for essential functionality
export async function saveContentRating(ratingData: {
  contentHistoryId: number;
  userId?: number;
  overallRating?: number;
  notes?: string;
}) {
  try {
    // For streamlined functionality, store in memory
    const rating: SimpleContentRating = {
      contentHistoryId: ratingData.contentHistoryId,
      userId: ratingData.userId,
      overallRating: ratingData.overallRating || 3,
      notes: ratingData.notes,
      createdAt: new Date()
    };
    
    // Remove existing rating for this content/user combo
    const index = inMemoryRatings.findIndex(r => 
      r.contentHistoryId === rating.contentHistoryId && 
      r.userId === rating.userId
    );
    
    if (index >= 0) {
      inMemoryRatings[index] = rating;
    } else {
      inMemoryRatings.push(rating);
    }
    
    return rating;
  } catch (error) {
    console.error('Error saving content rating:', error);
    throw error;
  }
}

// Get rating for specific content (simplified)
export async function getContentRating(contentHistoryId: number, userId?: number) {
  try {
    const rating = inMemoryRatings.find(r => 
      r.contentHistoryId === contentHistoryId && 
      r.userId === userId
    );
    return rating || null;
  } catch (error) {
    console.error('Error getting content rating:', error);
    return null;
  }
}

// Analyze content to extract patterns - core functionality for TikTok Viral Product Generator
export function analyzeContent(content: string, hook?: string): ContentAnalysis {
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Extract phrases (3-5 word sequences)
  const words = content.toLowerCase().split(/\s+/);
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 2; i++) {
    phrases.push(words.slice(i, i + 3).join(' '));
  }
  
  // Enhanced emotional tone detection for viral content
  const excitedWords = ['amazing', 'incredible', 'wow', 'fantastic', '!', 'insane', 'viral', 'trending'];
  const calmWords = ['gentle', 'peaceful', 'smooth', 'subtle', 'quiet'];
  const urgentWords = ['now', 'today', 'hurry', 'limited', 'urgent', 'only', 'last chance'];
  const funWords = ['funny', 'hilarious', 'lol', 'crazy', 'wild', 'epic'];
  
  let emotionalTone = 'neutral';
  if (excitedWords.some(word => content.toLowerCase().includes(word))) {
    emotionalTone = 'excited';
  } else if (urgentWords.some(word => content.toLowerCase().includes(word))) {
    emotionalTone = 'urgent';
  } else if (funWords.some(word => content.toLowerCase().includes(word))) {
    emotionalTone = 'fun';
  } else if (calmWords.some(word => content.toLowerCase().includes(word))) {
    emotionalTone = 'calm';
  }
  
  // Hook type detection for viral content
  let hookType = 'statement';
  if (hook) {
    if (hook.includes('?')) hookType = 'question';
    else if (hook.match(/\d+/)) hookType = 'stat';
    else if (hook.toLowerCase().includes('story') || hook.toLowerCase().includes('when')) hookType = 'story';
    else if (hook.toLowerCase().includes('you won\'t believe') || hook.toLowerCase().includes('this will shock')) hookType = 'shock';
    else if (hook.toLowerCase().includes('secret') || hook.toLowerCase().includes('trick')) hookType = 'reveal';
  }
  
  // Call to action style detection
  let callToActionStyle = 'direct';
  const softCTA = ['consider', 'try', 'maybe', 'perhaps'];
  const urgentCTA = ['now', 'today', 'immediately', 'asap'];
  const socialCTA = ['share', 'tag', 'follow', 'comment', 'like'];
  
  if (softCTA.some(word => content.toLowerCase().includes(word))) {
    callToActionStyle = 'soft';
  } else if (urgentCTA.some(word => content.toLowerCase().includes(word))) {
    callToActionStyle = 'urgent';
  } else if (socialCTA.some(word => content.toLowerCase().includes(word))) {
    callToActionStyle = 'social';
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

// Get viral score based on content analysis - useful for TikTok content optimization
export function calculateViralScore(analysis: ContentAnalysis): number {
  let score = 50; // Base score
  
  // Word count optimization (TikTok favors concise content)
  if (analysis.wordCount >= 15 && analysis.wordCount <= 50) {
    score += 15;
  } else if (analysis.wordCount > 50 && analysis.wordCount <= 100) {
    score += 10;
  } else if (analysis.wordCount > 100) {
    score -= 5;
  }
  
  // Emotional tone scoring for viral potential
  switch (analysis.emotionalTone) {
    case 'excited':
      score += 20;
      break;
    case 'fun':
      score += 15;
      break;
    case 'urgent':
      score += 10;
      break;
    case 'neutral':
      score += 5;
      break;
    default:
      break;
  }
  
  // Hook type scoring
  switch (analysis.hookType) {
    case 'question':
      score += 15;
      break;
    case 'shock':
    case 'reveal':
      score += 20;
      break;
    case 'story':
      score += 10;
      break;
    case 'stat':
      score += 8;
      break;
    default:
      break;
  }
  
  // Call to action scoring
  switch (analysis.callToActionStyle) {
    case 'social':
      score += 15;
      break;
    case 'urgent':
      score += 10;
      break;
    case 'direct':
      score += 8;
      break;
    case 'soft':
      score += 5;
      break;
    default:
      break;
  }
  
  return Math.min(100, Math.max(0, score));
}

// Log feedback to content history for improvement (simplified)
export async function logFeedback(
  product: string,
  templateType: string,
  tone: string,
  content: string
): Promise<number> {
  try {
    // Create feedback entry in content history
    const analysis = analyzeContent(content);
    const viralScore = calculateViralScore(analysis);
    
    // For simplified logging, we'll just return a mock ID
    // In a real implementation, this would save to contentHistory table
    console.log(`📊 Feedback logged: ${product} (${templateType}, ${tone}) - Viral Score: ${viralScore}`);
    
    return Math.floor(Math.random() * 1000); // Mock feedback ID
  } catch (error) {
    console.error('Error logging feedback:', error);
    throw error;
  }
}

// Get content performance insights (simplified for essential functionality)
export async function getContentPerformanceInsights(limit = 10) {
  try {
    // For simplified version, return recent content history with basic analysis
    const recentContent = await db
      .select()
      .from(contentHistory)
      .orderBy(desc(contentHistory.createdAt))
      .limit(limit);
    
    return recentContent.map(content => {
      const analysis = analyzeContent(content.outputText);
      const viralScore = calculateViralScore(analysis);
      
      return {
        ...content,
        analysis,
        viralScore
      };
    });
  } catch (error) {
    console.error('Error getting content insights:', error);
    return [];
  }
}

// Simplified style learning function for TikTok Viral Product Generator
export async function getTopRatedContentForStyle(
  userId?: number,
  niche?: string,
  platform?: string,
  tone?: string,
  template?: string
) {
  try {
    // For streamlined functionality, return optimized defaults for viral TikTok content
    const defaultStyles = {
      'fitness': {
        toneSummary: 'energetic, motivational, results-focused',
        structureHint: 'Hook → Transformation → Benefits → Call to Action',
        topHashtags: ['#fitness', '#transformation', '#workoutmotivation', '#healthy', '#viral'],
        highRatedCaptionExample: 'This 5-minute workout changed everything! 💪 Results in just 30 days!'
      },
      'tech': {
        toneSummary: 'informative, cutting-edge, accessible',
        structureHint: 'Problem → Solution → Benefits → Try Now',
        topHashtags: ['#tech', '#innovation', '#viral', '#trending', '#techreview'],
        highRatedCaptionExample: 'This AI tool saves me 10 hours a week! You need to try this 🤯'
      },
      'fashion': {
        toneSummary: 'trendy, confident, style-focused',
        structureHint: 'Style Problem → Solution → Transformation → Shop Now',
        topHashtags: ['#fashion', '#style', '#outfit', '#trending', '#viral'],
        highRatedCaptionExample: 'This outfit hack will change your wardrobe game forever! ✨'
      },
      'food': {
        toneSummary: 'appetizing, easy, crave-worthy',
        structureHint: 'Craving → Recipe → Taste Test → Try It',
        topHashtags: ['#food', '#recipe', '#foodie', '#viral', '#delicious'],
        highRatedCaptionExample: 'This 3-ingredient recipe broke the internet! So easy and delicious 🤤'
      },
      'beauty': {
        toneSummary: 'glowing, confident, transformation-focused',
        structureHint: 'Before → Product → After → Get Yours',
        topHashtags: ['#beauty', '#skincare', '#makeup', '#transformation', '#viral'],
        highRatedCaptionExample: 'This skincare product gave me glass skin in 7 days! ✨'
      }
    };

    // Return style based on niche, or default viral style
    const nicheStyle = defaultStyles[niche?.toLowerCase()] || {
      toneSummary: 'engaging, authentic, compelling',
      structureHint: 'Hook → Value → Benefits → Action',
      topHashtags: ['#viral', '#trending', '#fyp', '#musthave', '#viral'],
      highRatedCaptionExample: 'You won\'t believe what happened when I tried this! 🔥'
    };

    return nicheStyle;
  } catch (error) {
    console.error('Error getting top rated content style:', error);
    return {
      toneSummary: 'engaging, authentic',
      structureHint: 'Hook → Value → Action',
      topHashtags: ['#viral', '#trending'],
      highRatedCaptionExample: 'This will blow your mind! 🤯'
    };
  }
}