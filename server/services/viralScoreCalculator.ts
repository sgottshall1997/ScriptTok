export interface ViralScoreBreakdown {
  hookStrength: number;
  engagement: number;
  clarity: number;
  length: number;
  trending: number;
}

export interface ViralScore {
  overall: number;
  breakdown: ViralScoreBreakdown;
  suggestions: string[];
  colorCode: 'green' | 'yellow' | 'red';
}

export function calculateViralScore(content: string, hooks?: string[], trendingData?: any): ViralScore {
  try {
    const breakdown = {
      hookStrength: calculateHookStrength(content, hooks),
      engagement: calculateEngagementPotential(content),
      clarity: calculateClarity(content),
      length: calculateLengthScore(content),
      trending: calculateTrendingScore(content, trendingData)
    };

    const overall = Math.round(
      (breakdown.hookStrength * 0.25) +
      (breakdown.engagement * 0.25) +
      (breakdown.clarity * 0.2) +
      (breakdown.length * 0.15) +
      (breakdown.trending * 0.15)
    );

    const suggestions = generateSuggestions(breakdown, overall);
    const colorCode = getColorCode(overall);

    return {
      overall,
      breakdown,
      suggestions,
      colorCode
    };

  } catch (error) {
    console.error('Error calculating viral score:', error);
    
    // Return fallback score
    return {
      overall: 65,
      breakdown: {
        hookStrength: 70,
        engagement: 65,
        clarity: 75,
        length: 60,
        trending: 55
      },
      suggestions: ["Try starting with a stronger hook", "Add trending hashtags"],
      colorCode: 'yellow'
    };
  }
}

function calculateHookStrength(content: string, hooks?: string[]): number {
  const firstLine = content.split('\n')[0] || '';
  let score = 50;

  // Check for strong opening words
  const strongOpeners = ['stop', 'wait', 'pov:', 'this', 'why', 'how', 'what', 'omg', 'guys'];
  if (strongOpeners.some(opener => firstLine.toLowerCase().includes(opener))) {
    score += 15;
  }

  // Check for emotional words
  const emotionalWords = ['amazing', 'obsessed', 'love', 'hate', 'shocked', 'mind-blown', 'game-changer'];
  if (emotionalWords.some(word => firstLine.toLowerCase().includes(word))) {
    score += 10;
  }

  // Check for numbers
  if (/\d/.test(firstLine)) {
    score += 10;
  }

  // Check if using research-provided hooks
  if (hooks && hooks.some(hook => content.toLowerCase().includes(hook.toLowerCase()))) {
    score += 15;
  }

  // Check for question marks (engagement)
  if (firstLine.includes('?')) {
    score += 5;
  }

  return Math.min(score, 100);
}

function calculateEngagementPotential(content: string): number {
  let score = 50;
  const lowerContent = content.toLowerCase();

  // Call-to-action phrases
  const ctaWords = ['comment', 'like', 'follow', 'share', 'tag', 'try this', 'let me know'];
  const ctaCount = ctaWords.filter(cta => lowerContent.includes(cta)).length;
  score += Math.min(ctaCount * 8, 24);

  // Questions (drive comments)
  const questionCount = (content.match(/\?/g) || []).length;
  score += Math.min(questionCount * 6, 18);

  // Personal pronouns (relatability)
  const personalWords = ['you', 'your', 'i', 'my', 'we', 'us'];
  const personalCount = personalWords.filter(word => lowerContent.includes(word)).length;
  score += Math.min(personalCount * 3, 15);

  return Math.min(score, 100);
}

function calculateClarity(content: string): number {
  let score = 50;

  // Sentence length (shorter = clearer)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  
  if (avgSentenceLength <= 10) score += 20;
  else if (avgSentenceLength <= 15) score += 10;
  else if (avgSentenceLength > 25) score -= 10;

  // Readability indicators
  const complexWords = content.split(' ').filter(word => word.length > 12).length;
  const totalWords = content.split(' ').length;
  const complexityRatio = complexWords / totalWords;
  
  if (complexityRatio < 0.1) score += 15;
  else if (complexityRatio > 0.2) score -= 15;

  // Structure indicators
  if (content.includes('\n\n') || content.includes('•') || content.includes('-')) {
    score += 10; // Well-structured content
  }

  return Math.min(Math.max(score, 0), 100);
}

function calculateLengthScore(content: string): number {
  const charCount = content.length;
  
  // Optimal range for TikTok captions: 100-300 characters
  if (charCount >= 100 && charCount <= 300) return 100;
  if (charCount >= 80 && charCount <= 400) return 85;
  if (charCount >= 60 && charCount <= 500) return 70;
  if (charCount < 50) return 40; // Too short
  if (charCount > 600) return 30; // Too long
  
  return 60;
}

function calculateTrendingScore(content: string, trendingData?: any): number {
  let score = 50;
  const lowerContent = content.toLowerCase();

  // Common trending keywords
  const trendingKeywords = [
    'viral', 'trending', 'fyp', 'for you', 'ootd', 'grwm', 'pov', 'asmr',
    'unboxing', 'review', 'haul', 'tutorial', 'hack', 'tip', 'secret',
    'obsessed', 'aesthetic', 'vibes', 'energy', 'era', 'core'
  ];

  const trendingCount = trendingKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  score += Math.min(trendingCount * 8, 32);

  // Hashtag analysis
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (hashtagCount >= 3 && hashtagCount <= 8) score += 18;
  else if (hashtagCount > 0) score += 8;

  // Use trending data if provided
  if (trendingData && trendingData.hot) {
    const hotTrends = trendingData.hot.map((t: any) => t.name.toLowerCase());
    const matchingTrends = hotTrends.filter((trend: string) => lowerContent.includes(trend)).length;
    score += matchingTrends * 15;
  }

  return Math.min(score, 100);
}

function generateSuggestions(breakdown: ViralScoreBreakdown, overall: number): string[] {
  const suggestions: string[] = [];

  if (overall < 70) {
    if (breakdown.hookStrength < 70) {
      suggestions.push("Try starting with 'POV:', 'Stop doing this', or 'This changed everything'");
    }
    
    if (breakdown.engagement < 70) {
      suggestions.push("Add more questions or call-to-actions like 'Comment if you agree'");
    }
    
    if (breakdown.clarity < 70) {
      suggestions.push("Use shorter sentences and simpler words for better readability");
    }
    
    if (breakdown.length < 70) {
      suggestions.push("Aim for 100-300 characters - add more detail or trim excess");
    }
    
    if (breakdown.trending < 70) {
      suggestions.push("Include trending hashtags and viral keywords like #fyp #viral");
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("Great content! Consider testing different hooks for even better performance");
  }

  return suggestions.slice(0, 3); // Limit to top 3 suggestions
}

function getColorCode(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}