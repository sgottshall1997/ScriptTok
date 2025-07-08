/**
 * Compliance Enhancement Service
 * Automatically adds FTC-compliant affiliate disclosures to generated content
 */

export interface ComplianceOptions {
  hasAffiliateLinks: boolean;
  platform: string;
  contentType: 'post' | 'story' | 'video' | 'email' | 'blog';
  affiliateProgram?: 'amazon' | 'other';
}

export interface ComplianceResult {
  enhancedContent: string;
  disclosureText: string;
  hashtags: string[];
  complianceNotes: string[];
}

/**
 * Platform-specific FTC compliance requirements
 */
const PLATFORM_REQUIREMENTS = {
  tiktok: {
    hashtagRequired: true,
    disclosureHashtags: ['#ad', '#affiliate', '#amazonpartner'],
    placement: 'beginning',
    maxChars: 2200
  },
  instagram: {
    hashtagRequired: true,
    disclosureHashtags: ['#ad', '#affiliate', '#sponsored'],
    placement: 'beginning',
    maxChars: 2200
  },
  youtube: {
    hashtagRequired: false,
    verbalDisclosureRequired: true,
    writtenDisclosureRequired: true,
    placement: 'beginning',
    maxChars: 5000
  },
  twitter: {
    hashtagRequired: true,
    disclosureHashtags: ['#ad', '#affiliate'],
    placement: 'beginning',
    maxChars: 280
  },
  facebook: {
    hashtagRequired: false,
    labelRequired: true,
    placement: 'beginning',
    maxChars: 63206
  },
  other: {
    hashtagRequired: false,
    writtenDisclosureRequired: true,
    placement: 'beginning',
    maxChars: null
  }
};

/**
 * Amazon Associates specific disclosures
 */
const AMAZON_DISCLOSURES = {
  short: "As an Amazon Associate I earn from qualifying purchases.",
  medium: "As an Amazon Associate, I earn from qualifying purchases. This means if you click on the link and purchase the item, I will receive a small commission at no extra cost to you.",
  long: "As an Amazon Associate, I earn from qualifying purchases. This means if you click on any of the Amazon links in this content and make a purchase, I may receive a small commission at no additional cost to you. This helps support my content creation. I only recommend products I genuinely believe in.",
  hashtag: "#amazonassociate"
};

/**
 * General FTC-compliant disclosure templates
 */
const FTC_DISCLOSURES = {
  affiliate: {
    short: "This post contains affiliate links.",
    medium: "This post contains affiliate links. I may earn a commission if you purchase through these links.",
    long: "This post contains affiliate links, which means I may earn a commission if you click through and make a purchase. This comes at no additional cost to you and helps support my content creation."
  },
  sponsored: {
    short: "Sponsored content.",
    medium: "This is sponsored content.",
    long: "This content is sponsored. All opinions are my own."
  }
};

/**
 * Get appropriate disclosure text based on platform and content type
 */
function getDisclosureText(options: ComplianceOptions): string {
  const platform = options.platform.toLowerCase();
  const requirements = PLATFORM_REQUIREMENTS[platform] || PLATFORM_REQUIREMENTS.other;
  
  if (options.affiliateProgram === 'amazon') {
    // Choose disclosure length based on platform character limits
    if (requirements.maxChars && requirements.maxChars <= 280) {
      return AMAZON_DISCLOSURES.short;
    } else if (requirements.maxChars && requirements.maxChars <= 2200) {
      return AMAZON_DISCLOSURES.medium;
    } else {
      return AMAZON_DISCLOSURES.long;
    }
  }
  
  // For other affiliate programs
  if (requirements.maxChars && requirements.maxChars <= 280) {
    return FTC_DISCLOSURES.affiliate.short;
  } else if (requirements.maxChars && requirements.maxChars <= 2200) {
    return FTC_DISCLOSURES.affiliate.medium;
  } else {
    return FTC_DISCLOSURES.affiliate.long;
  }
}

/**
 * Get required compliance hashtags for the platform
 */
function getComplianceHashtags(options: ComplianceOptions): string[] {
  const platform = options.platform.toLowerCase();
  const requirements = PLATFORM_REQUIREMENTS[platform] || PLATFORM_REQUIREMENTS.other;
  
  const hashtags: string[] = [];
  
  if (requirements.hashtagRequired && requirements.disclosureHashtags) {
    hashtags.push(requirements.disclosureHashtags[0]); // Use primary hashtag
  }
  
  if (options.affiliateProgram === 'amazon' && platform !== 'twitter') {
    hashtags.push(AMAZON_DISCLOSURES.hashtag);
  }
  
  return hashtags;
}

/**
 * Generate platform-specific compliance notes
 */
function getComplianceNotes(options: ComplianceOptions): string[] {
  const platform = options.platform.toLowerCase();
  const requirements = PLATFORM_REQUIREMENTS[platform] || PLATFORM_REQUIREMENTS.other;
  const notes: string[] = [];
  
  if (requirements.verbalDisclosureRequired) {
    notes.push("Include verbal disclosure at the beginning of video content");
  }
  
  if (requirements.writtenDisclosureRequired) {
    notes.push("Include written disclosure in description or caption");
  }
  
  if (requirements.labelRequired) {
    notes.push("Use platform's paid partnership label if available");
  }
  
  if (requirements.placement === 'beginning') {
    notes.push("Place disclosure at the beginning of content where it's easily visible");
  }
  
  notes.push("Disclosure must be clear, conspicuous, and easily understandable");
  
  return notes;
}

/**
 * Enhance content with FTC-compliant disclosures
 */
export function enhanceContentCompliance(
  content: string, 
  options: ComplianceOptions
): ComplianceResult {
  if (!options.hasAffiliateLinks) {
    return {
      enhancedContent: content,
      disclosureText: '',
      hashtags: [],
      complianceNotes: []
    };
  }
  
  const disclosureText = getDisclosureText(options);
  const hashtags = getComplianceHashtags(options);
  const complianceNotes = getComplianceNotes(options);
  
  // Enhance content based on platform requirements
  let enhancedContent = content;
  const platform = options.platform.toLowerCase();
  const requirements = PLATFORM_REQUIREMENTS[platform] || PLATFORM_REQUIREMENTS.other;
  
  if (requirements.placement === 'beginning') {
    // Add disclosure at the beginning
    if (platform === 'youtube' && options.contentType === 'video') {
      // For YouTube, add both verbal cue and written disclosure
      enhancedContent = `[IMPORTANT: Start video with: "${disclosureText}"]\n\n${disclosureText}\n\n${content}`;
    } else {
      enhancedContent = `${disclosureText}\n\n${content}`;
    }
    
    // Add hashtags if required
    if (requirements.hashtagRequired && hashtags.length > 0) {
      enhancedContent += `\n\n${hashtags.join(' ')}`;
    }
  }
  
  return {
    enhancedContent,
    disclosureText,
    hashtags,
    complianceNotes
  };
}

/**
 * Validate content compliance
 */
export function validateContentCompliance(
  content: string, 
  options: ComplianceOptions
): { isCompliant: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!options.hasAffiliateLinks) {
    return { isCompliant: true, issues: [] };
  }
  
  const platform = options.platform.toLowerCase();
  const requirements = PLATFORM_REQUIREMENTS[platform] || PLATFORM_REQUIREMENTS.other;
  
  // Check for required disclosure text
  if (options.affiliateProgram === 'amazon') {
    const hasAmazonDisclosure = content.toLowerCase().includes('amazon associate') || 
                               content.toLowerCase().includes('qualifying purchase');
    if (!hasAmazonDisclosure) {
      issues.push('Missing Amazon Associates disclosure');
    }
  } else {
    const hasAffiliateDisclosure = content.toLowerCase().includes('affiliate') ||
                                  content.toLowerCase().includes('commission');
    if (!hasAffiliateDisclosure) {
      issues.push('Missing affiliate relationship disclosure');
    }
  }
  
  // Check for required hashtags
  if (requirements.hashtagRequired && requirements.disclosureHashtags) {
    const hasRequiredHashtag = requirements.disclosureHashtags.some(tag => 
      content.toLowerCase().includes(tag.toLowerCase())
    );
    if (!hasRequiredHashtag) {
      issues.push(`Missing required disclosure hashtag (${requirements.disclosureHashtags.join(' or ')})`);
    }
  }
  
  // Check character limits
  if (requirements.maxChars && content.length > requirements.maxChars) {
    issues.push(`Content exceeds ${platform} character limit (${content.length}/${requirements.maxChars})`);
  }
  
  return {
    isCompliant: issues.length === 0,
    issues
  };
}

/**
 * Get platform-specific compliance guidelines
 */
export function getComplianceGuidelines(platform: string): {
  requirements: string[];
  bestPractices: string[];
  examples: { good: string; bad: string }[];
} {
  const platformLower = platform.toLowerCase();
  
  const baseRequirements = [
    "Include clear affiliate relationship disclosure",
    "Place disclosure prominently where users will see it",
    "Use simple, understandable language",
    "Ensure disclosure is easily readable (font size, color contrast)"
  ];
  
  const baseBestPractices = [
    "Place disclosures at the beginning of content",
    "Use consistent disclosure language across content",
    "Test disclosure visibility on mobile devices",
    "Keep disclosure close to affiliate links"
  ];
  
  const requirements = [...baseRequirements];
  const bestPractices = [...baseBestPractices];
  
  switch (platformLower) {
    case 'tiktok':
      requirements.push("Include #ad or #affiliate hashtag", "Place disclosure in caption, not just video");
      bestPractices.push("Use popular compliance hashtags for visibility", "Mention disclosure in video if possible");
      break;
    case 'instagram':
      requirements.push("Use paid partnership label when available", "Include #ad hashtag");
      bestPractices.push("Use Instagram's branded content tools", "Place disclosure before 'more' cutoff");
      break;
    case 'youtube':
      requirements.push("Include verbal disclosure in video", "Add written disclosure in description");
      bestPractices.push("Mention disclosure in first 30 seconds", "Pin disclosure comment if needed");
      break;
    case 'twitter':
      requirements.push("Include #ad hashtag", "Keep disclosure within character limit");
      bestPractices.push("Put hashtag at beginning of tweet", "Use Twitter's disclosure features");
      break;
  }
  
  const examples = [
    {
      good: "As an Amazon Associate I earn from qualifying purchases. Here's my honest review of this amazing product! #ad",
      bad: "Check out this product! (affiliate link in bio)"
    },
    {
      good: "#ad This post contains affiliate links. I love this product and think you will too!",
      bad: "Love this product! Link in bio for discount!"
    }
  ];
  
  return { requirements, bestPractices, examples };
}