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
      (breakdown.hookStrength * 0.30) +
      (breakdown.engagement * 0.25) +
      (breakdown.clarity * 0.15) +
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
  let score = 65; // Increased base score

  // Check for strong opening words (more comprehensive list)
  const strongOpeners = [
    'stop', 'wait', 'pov:', 'this', 'why', 'how', 'what', 'omg', 'guys',
    'nobody', 'everyone', 'when', 'if you', 'don\'t', 'can\'t', 'won\'t',
    'you need', 'i found', 'i tried', 'watch', 'look'
  ];
  if (strongOpeners.some(opener => firstLine.toLowerCase().includes(opener))) {
    score += 20; // Increased from 15
  }

  // Check for emotional words (expanded list)
  const emotionalWords = [
    'amazing', 'obsessed', 'love', 'hate', 'shocked', 'mind-blown', 'game-changer',
    'insane', 'crazy', 'unbelievable', 'wow', 'finally', 'perfect', 'best', 'worst'
  ];
  if (emotionalWords.some(word => firstLine.toLowerCase().includes(word))) {
    score += 12; // Increased from 10
  }

  // Check for urgency/scarcity words
  const urgencyWords = ['now', 'today', 'finally', 'just', 'new', 'only', 'last chance', 'limited'];
  if (urgencyWords.some(word => firstLine.toLowerCase().includes(word))) {
    score += 8;
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
    score += 8; // Increased from 5
  }

  // Bonus for emojis in hook
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  if (emojiRegex.test(firstLine)) {
    score += 5;
  }

  return Math.min(score, 100);
}

function calculateEngagementPotential(content: string): number {
  let score = 65; // Increased base score
  const lowerContent = content.toLowerCase();

  // Call-to-action phrases (expanded list)
  const ctaWords = [
    'comment', 'like', 'follow', 'share', 'tag', 'try this', 'let me know',
    'tell me', 'drop a', 'which one', 'reply', 'dm me', 'check out',
    'link in bio', 'swipe', 'watch till the end'
  ];
  const ctaCount = ctaWords.filter(cta => lowerContent.includes(cta)).length;
  score += Math.min(ctaCount * 7, 28); // Increased multiplier and cap

  // Questions (drive comments)
  const questionCount = (content.match(/\?/g) || []).length;
  score += Math.min(questionCount * 8, 24); // Increased from 6 and 18

  // Personal pronouns (relatability)
  const personalWords = ['you', 'your', 'i', 'my', 'we', 'us'];
  const personalCount = personalWords.filter(word => lowerContent.includes(word)).length;
  score += Math.min(personalCount * 2, 12);

  // Emoji presence (engagement boost)
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojiCount = (content.match(emojiRegex) || []).length;
  if (emojiCount > 0 && emojiCount <= 6) {
    score += 10;
  } else if (emojiCount > 6) {
    score += 5; // Still bonus but not as much
  }

  return Math.min(score, 100);
}

function calculateClarity(content: string): number {
  let score = 70; // Increased base score (clarity is often decent)

  // Sentence length (shorter = clearer)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

    if (avgSentenceLength <= 12) score += 15; // More forgiving threshold
    else if (avgSentenceLength <= 18) score += 8; // More forgiving threshold
    else if (avgSentenceLength > 30) score -= 8; // Less harsh penalty
  }

  // Readability indicators (more forgiving)
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const complexWords = words.filter(word => word.length > 13).length; // Slightly higher threshold
  const totalWords = words.length;

  if (totalWords > 0) {
    const complexityRatio = complexWords / totalWords;

    if (complexityRatio < 0.15) score += 10; // More forgiving
    else if (complexityRatio > 0.25) score -= 10; // Less harsh
  }

  // Structure indicators
  if (content.includes('\n\n') || content.includes('•') || content.includes('-') || content.includes('\n')) {
    score += 8; // Well-structured content
  }

  // Short content is generally clear
  if (content.length < 200) {
    score += 5;
  }

  return Math.min(Math.max(score, 0), 100);
}

function calculateLengthScore(content: string): number {
  const charCount = content.length;

  // Much more forgiving length ranges
  if (charCount >= 80 && charCount <= 400) return 95; // Sweet spot
  if (charCount >= 50 && charCount <= 500) return 85; // Still very good
  if (charCount >= 30 && charCount <= 600) return 75; // Good
  if (charCount >= 20 && charCount <= 700) return 65; // Acceptable
  if (charCount < 20) return 50; // Too short
  if (charCount > 700) return 55; // Too long but not terrible

  return 70; // Default decent score
}

function calculateTrendingScore(content: string, trendingData?: any): number {
  let score = 60; // Increased base score
  const lowerContent = content.toLowerCase();

  // Common trending keywords (expanded list)
  const trendingKeywords = [
    'viral', 'trending', 'fyp', 'for you', 'ootd', 'grwm', 'pov', 'asmr',
    'unboxing', 'review', 'haul', 'tutorial', 'hack', 'tip', 'secret',
    'obsessed', 'aesthetic', 'vibes', 'energy', 'era', 'core',
    'duet', 'stitch', 'storytime', 'day in the life', 'get ready',
    'must have', 'obsession', 'fav', 'fave', 'rec', 'recommend'
  ];

  const trendingCount = trendingKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  score += Math.min(trendingCount * 10, 40); // Increased multiplier and cap

  // Hashtag analysis (more generous)
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (hashtagCount >= 2 && hashtagCount <= 10) score += 20; // More forgiving range
  else if (hashtagCount === 1) score += 10;
  else if (hashtagCount > 10) score += 8; // Still some bonus

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

  if (overall < 75) {
    if (breakdown.hookStrength < 75) {
      suggestions.push("Try starting with 'POV:', 'Stop doing this', or 'This changed everything'");
    }

    if (breakdown.engagement < 75) {
      suggestions.push("Add more questions or call-to-actions like 'Comment if you agree'");
    }

    if (breakdown.clarity < 75) {
      suggestions.push("Use shorter sentences and simpler words for better readability");
    }

    if (breakdown.length < 75) {
      suggestions.push("Aim for 80-400 characters - add more detail or trim excess");
    }

    if (breakdown.trending < 75) {
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