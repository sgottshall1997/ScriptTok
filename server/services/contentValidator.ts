export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: {
    templateType: string;
    wordCount: number;
    validatedAt: string;
  };
}

export interface ValidationError {
  field: string;
  issue: string;
  expected: string;
  actual: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export const TEMPLATE_VALIDATION_RULES: Record<string, {
  minWords?: number;
  maxWords?: number;
  requiredElements?: string[];
  prohibitedElements?: string[];
  paragraphCount?: number;
  hashtagRange?: { min: number; max: number };
}> = {
  // Affiliate Templates
  'influencer_caption': {
    minWords: 50,
    maxWords: 200,
    requiredElements: ['#ad hashtag'],
    prohibitedElements: ['emojis', 'brackets'],
    paragraphCount: 4,
    hashtagRange: { min: 15, max: 20 }
  },
  'affiliate_email': {
    minWords: 50,
    maxWords: 150,
    prohibitedElements: ['metaphors', 'emojis', 'brackets']
  },
  'seo_blog': {
    minWords: 1050,
    maxWords: 3000,
    requiredElements: ['FAQ section', 'H2 headings', 'H3 headings', 'affiliate disclosure'],
    prohibitedElements: ['emojis', 'brackets']
  },
  'routine_kit': {
    minWords: 200,
    maxWords: 800,
    requiredElements: ['troubleshooting section', 'variants section'],
    prohibitedElements: ['emojis', 'brackets']
  },
  'product_comparison': {
    minWords: 200,
    maxWords: 800,
    requiredElements: ['brand reputation citation'],
    prohibitedElements: ['emojis', 'brackets']
  },
  'short_video': {
    minWords: 70,
    maxWords: 140,
    paragraphCount: 5,
    prohibitedElements: ['emojis', 'brackets']
  },
  
  // Viral Templates
  'viral_hooks': {
    requiredElements: ['numbered list 1-10'],
    prohibitedElements: ['commentary', 'brackets', 'emojis']
  },
  'viral_short_script': {
    minWords: 70,
    maxWords: 120,
    prohibitedElements: ['emojis', 'brackets', 'stage directions']
  },
  'viral_storytime': {
    minWords: 90,
    maxWords: 130,
    paragraphCount: 1,
    prohibitedElements: ['emojis', 'brackets', 'section labels']
  },
  'viral_duet_reaction': {
    requiredElements: ['exactly 6 labeled lines'],
    prohibitedElements: ['commentary', 'brackets', 'emojis']
  },
  'viral_listicle': {
    minWords: 90,
    maxWords: 140,
    prohibitedElements: ['commentary', 'brackets', 'emojis']
  },
  'viral_caption_hashtags': {
    requiredElements: ['3 caption options', '6-8 broad hashtags', '6-8 niche hashtags'],
    prohibitedElements: ['emojis', 'brackets', 'notes']
  }
};

export function validateContent(content: string, templateType: string): ValidationResult {
  const rules = TEMPLATE_VALIDATION_RULES[templateType];
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Word count validation
  const wordCount = content.trim().split(/\s+/).length;
  
  if (rules?.minWords && wordCount < rules.minWords) {
    errors.push({
      field: 'wordCount',
      issue: 'Below minimum word count',
      expected: `≥${rules.minWords} words`,
      actual: `${wordCount} words`
    });
  }
  
  if (rules?.maxWords && wordCount > rules.maxWords) {
    errors.push({
      field: 'wordCount',
      issue: 'Exceeds maximum word count',
      expected: `≤${rules.maxWords} words`,
      actual: `${wordCount} words`
    });
  }
  
  // Emoji detection
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  if (rules?.prohibitedElements?.includes('emojis') && emojiRegex.test(content)) {
    errors.push({
      field: 'emojis',
      issue: 'Contains prohibited emojis',
      expected: 'No emojis',
      actual: 'Emojis found in content'
    });
  }
  
  // Bracketed notes detection
  const bracketRegex = /\[.*?\]/g;
  if (rules?.prohibitedElements?.includes('brackets') && bracketRegex.test(content)) {
    errors.push({
      field: 'brackets',
      issue: 'Contains bracketed notes',
      expected: 'No bracketed notes',
      actual: 'Brackets found in content'
    });
  }
  
  // Hashtag validation for influencer_caption
  if (templateType === 'influencer_caption' && rules?.hashtagRange) {
    const hashtags = content.match(/#\w+/g) || [];
    const hasAdHashtag = hashtags.some(tag => tag.toLowerCase() === '#ad');
    
    if (!hasAdHashtag) {
      errors.push({
        field: 'hashtags',
        issue: 'Missing #ad hashtag',
        expected: 'Must include #ad',
        actual: 'No #ad found'
      });
    }
    
    if (hashtags.length < rules.hashtagRange.min || hashtags.length > rules.hashtagRange.max) {
      errors.push({
        field: 'hashtags',
        issue: 'Hashtag count out of range',
        expected: `${rules.hashtagRange.min}-${rules.hashtagRange.max} hashtags`,
        actual: `${hashtags.length} hashtags`
      });
    }
  }
  
  // Paragraph count validation
  if (rules?.paragraphCount) {
    const paragraphs = content.trim().split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length !== rules.paragraphCount) {
      warnings.push({
        field: 'paragraphCount',
        message: `Expected ${rules.paragraphCount} paragraphs, found ${paragraphs.length}`
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      templateType,
      wordCount,
      validatedAt: new Date().toISOString()
    }
  };
}