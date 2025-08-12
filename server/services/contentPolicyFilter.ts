/**
 * Amazon Associates Content Policy Filter
 * Ensures generated content complies with Amazon Associates Program Policies
 */

export interface ContentPolicyResult {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
  filteredContent?: string;
}

/**
 * Amazon Associates prohibited content categories
 * Based on Amazon Associates Program Policies
 */
const PROHIBITED_CONTENT = {
  // Products Amazon doesn't allow affiliate promotion for
  prohibitedProducts: [
    'gift cards',
    'gift certificates', 
    'amazon coins',
    'kindle unlimited',
    'amazon prime',
    'amazon music',
    'audible',
    'prescription drugs',
    'medical devices requiring prescription',
    'alcohol',
    'tobacco',
    'vaping products',
    'cbd products',
    'firearms',
    'ammunition',
    'weapons',
    'adult content',
    'pornography'
  ],

  // Content that violates Amazon policies
  prohibitedContent: [
    'false claims',
    'misleading information',
    'fake reviews',
    'manipulated reviews',
    'incentivized reviews',
    'review manipulation',
    'price manipulation',
    'stock manipulation',
    'fake urgency',
    'false scarcity',
    'deceptive practices',
    'spam content',
    'illegal activities',
    'hate speech',
    'harassment',
    'violence promotion',
    'discriminatory content'
  ],

  // Marketing practices that are prohibited
  prohibitedPractices: [
    'buy now pay later without disclosure',
    'guaranteed income claims',
    'get rich quick',
    'unrealistic earnings',
    'miracle cures',
    'medical claims without evidence',
    'before and after without disclaimers',
    'celebrity endorsements without permission',
    'fake testimonials',
    'misleading comparisons',
    'hidden affiliate relationships',
    'undisclosed sponsorships'
  ]
};

/**
 * Content quality requirements
 */
const CONTENT_REQUIREMENTS = {
  minWordCount: 25,
  maxWordCount: 5000,
  requiredElements: {
    disclosure: true,
    productContext: true,
    honestOpinion: true
  },
  prohibited: {
    allCaps: false,
    excessiveEmojis: false,
    spamKeywords: false,
    clickbait: false
  }
};

/**
 * Filter content for Amazon Associates policy compliance
 */
export function filterContentForCompliance(
  content: string,
  productName: string,
  niche: string
): ContentPolicyResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  let filteredContent = content;

  // Check for prohibited products
  const lowerContent = content.toLowerCase();
  const lowerProduct = productName.toLowerCase();

  for (const prohibited of PROHIBITED_CONTENT.prohibitedProducts) {
    if (lowerProduct.includes(prohibited) || lowerContent.includes(prohibited)) {
      violations.push(`Prohibited product category detected: ${prohibited}`);
    }
  }

  // Check for prohibited content practices
  for (const prohibited of PROHIBITED_CONTENT.prohibitedContent) {
    if (lowerContent.includes(prohibited)) {
      violations.push(`Prohibited content detected: ${prohibited}`);
    }
  }

  // Check for prohibited marketing practices
  for (const practice of PROHIBITED_CONTENT.prohibitedPractices) {
    if (lowerContent.includes(practice)) {
      violations.push(`Prohibited marketing practice: ${practice}`);
    }
  }

  // Check content quality requirements
  const wordCount = content.split(/\s+/).length;
  if (wordCount < CONTENT_REQUIREMENTS.minWordCount) {
    violations.push(`Content too short (${wordCount} words, minimum ${CONTENT_REQUIREMENTS.minWordCount})`);
  }
  if (wordCount > CONTENT_REQUIREMENTS.maxWordCount) {
    warnings.push(`Content very long (${wordCount} words, consider shortening)`);
  }

  // Check for required disclosure
  if (!hasProperDisclosure(content)) {
    violations.push('Missing required Amazon Associates disclosure');
  }

  // Check for content quality issues
  if (hasExcessiveCapitalization(content)) {
    warnings.push('Excessive capitalization detected - may appear spammy');
    filteredContent = fixCapitalization(filteredContent);
  }

  if (hasExcessiveEmojis(content)) {
    warnings.push('Excessive emoji usage detected');
  }

  if (hasClickbaitLanguage(content)) {
    warnings.push('Potential clickbait language detected');
  }

  // Check for honest opinion indicators
  if (!hasHonestOpinionLanguage(content)) {
    warnings.push('Consider adding personal opinion or experience to make content more authentic');
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
    filteredContent: violations.length === 0 ? filteredContent : undefined
  };
}

/**
 * Check if content has proper Amazon Associates disclosure
 */
function hasProperDisclosure(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return lowerContent.includes('amazon associate') && 
         lowerContent.includes('qualifying purchase');
}

/**
 * Check for excessive capitalization
 */
function hasExcessiveCapitalization(content: string): boolean {
  const words = content.split(/\s+/);
  const capsWords = words.filter(word => word === word.toUpperCase() && word.length > 1);
  return capsWords.length > words.length * 0.3; // More than 30% caps words
}

/**
 * Fix excessive capitalization
 */
function fixCapitalization(content: string): string {
  return content.replace(/\b[A-Z]{2,}\b/g, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
}

/**
 * Check for excessive emoji usage
 */
function hasExcessiveEmojis(content: string): boolean {
  // Count typical emoji symbols and emoticons
  const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
  const wordCount = content.split(/\s+/).length;
  return emojiCount > wordCount * 0.2; // More than 20% emoji to word ratio
}





/**
 * Check for clickbait language patterns
 */
function hasClickbaitLanguage(content: string): boolean {
  const clickbaitPatterns = [
    /you won't believe/i,
    /this will shock you/i,
    /doctors hate this/i,
    /one weird trick/i,
    /this amazing/i,
    /incredible results/i,
    /mind-blowing/i,
    /life-changing secret/i,
    /instant results/i,
    /guaranteed to work/i
  ];
  
  return clickbaitPatterns.some(pattern => pattern.test(content));
}

/**
 * Check for honest opinion language
 */
function hasHonestOpinionLanguage(content: string): boolean {
  const opinionIndicators = [
    /i think/i,
    /in my opinion/i,
    /i believe/i,
    /i found/i,
    /my experience/i,
    /personally/i,
    /i recommend/i,
    /i've used/i,
    /i noticed/i,
    /seems to/i,
    /appears to/i
  ];
  
  return opinionIndicators.some(pattern => pattern.test(content));
}

/**
 * Get content policy suggestions for improvement
 */
export function getContentImprovementSuggestions(
  policyResult: ContentPolicyResult,
  niche: string
): string[] {
  const suggestions: string[] = [];

  if (policyResult.violations.length > 0) {
    suggestions.push('Review and remove all policy violations before publishing');
  }

  if (policyResult.warnings.some(w => w.includes('opinion'))) {
    suggestions.push('Add personal experience or honest opinions to make content more authentic');
  }

  if (policyResult.warnings.some(w => w.includes('capitalization'))) {
    suggestions.push('Use normal capitalization to appear more professional');
  }

  if (policyResult.warnings.some(w => w.includes('emoji'))) {
    suggestions.push('Consider reducing emoji usage for better readability');
  }

  if (policyResult.warnings.some(w => w.includes('clickbait'))) {
    suggestions.push('Use more straightforward, honest language instead of clickbait phrases');
  }

  // Niche-specific suggestions
  switch (niche.toLowerCase()) {
    case 'beauty':
      suggestions.push('Focus on ingredient benefits and personal skin type compatibility');
      break;
    case 'tech':
      suggestions.push('Include specific technical specifications and use cases');
      break;
    case 'fitness':
      suggestions.push('Mention workout context and fitness level recommendations');
      break;
    case 'food':
      suggestions.push('Describe taste, texture, and dietary considerations');
      break;
  }

  return suggestions;
}