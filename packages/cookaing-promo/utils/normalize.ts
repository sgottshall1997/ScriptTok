import { PromoInput, PromoInputType, Channel } from '../schemas';

/**
 * Normalize and validate promo input data
 */
export function normalizePromoInput(input: Partial<PromoInput>): PromoInputType {
  // Ensure required fields have defaults
  const normalized: PromoInputType = {
    appName: "CookAIng",
    audiencePersona: input.audiencePersona || "home cooks",
    keyBenefits: input.keyBenefits || ["Save time cooking", "Plan meals easier", "Reduce food waste"],
    features: input.features || ["AI meal planning", "Recipe suggestions", "Shopping lists"],
    channels: input.channels || ["tiktok_reel"],
    objective: input.objective || "feature_highlight",
    ctaUrl: input.ctaUrl || "https://cookaing.com",
    campaign: input.campaign || "promo-campaign",
    // Optional fields
    ...(input.offer && { offer: input.offer }),
    ...(input.proofPoints && { proofPoints: input.proofPoints }),
    ...(input.seedTopic && { seedTopic: input.seedTopic }),
    ...(input.tone && { tone: input.tone }),
    ...(input.source && { source: input.source }),
    ...(input.medium && { medium: input.medium }),
    ...(input.brandGuidelines && { brandGuidelines: input.brandGuidelines }),
    ...(input.wordCountHint && { wordCountHint: input.wordCountHint })
  };

  return normalized;
}

/**
 * Normalize text for Spartan format (remove banned words and clean up)
 */
export function normalizeSpartanText(text: string): string {
  // Spartan banned words (matching GlowBot's exact list)
  const bannedWords = [
    'can', 'may', 'just', 'that', 'very', 'really', 'literally', 'actually',
    'certainly', 'probably', 'basically', 'could', 'maybe', 'delve', 'embark',
    'enlightening', 'esteemed', 'imagine', 'game-changer', 'unlock', 'discover',
    'skyrocket', 'revolutionize', 'disruptive', 'utilize', 'tapestry', 'illuminate',
    'unveil', 'pivotal', 'enrich', 'intricate', 'elucidate', 'hence', 'furthermore',
    'however', 'harness', 'exciting', 'groundbreaking', 'remarkable', 'navigating',
    'powerful', 'inquiries', 'ever-evolving'
  ];

  let normalized = text;

  // Remove banned words (case insensitive)
  bannedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    normalized = normalized.replace(regex, '');
  });

  // Clean up extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Remove emojis
  normalized = normalized.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

  // Remove asterisks and other formatting
  normalized = normalized.replace(/\*/g, '');

  // Remove setup phrases
  const setupPhrases = ['in summary', 'in conclusion', 'to summarize', 'in other words', 'that said', 'with that being said'];
  setupPhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    normalized = normalized.replace(regex, '');
  });

  return normalized.trim();
}

/**
 * Normalize channel names to match schema
 */
export function normalizeChannel(channel: string): Channel {
  const channelMap: Record<string, Channel> = {
    'tiktok': 'tiktok_reel',
    'instagram': 'instagram_reel', 
    'twitter': 'x_thread',
    'x': 'x_thread',
    'linkedin': 'linkedin_post',
    'email': 'email',
    'blog': 'blog',
    'google_ads': 'ads_google',
    'google': 'ads_google',
    'facebook_ads': 'ads_meta',
    'facebook': 'ads_meta',
    'meta_ads': 'ads_meta',
    'meta': 'ads_meta',
    'tiktok_ads': 'ads_tiktok'
  };

  const normalized = channel.toLowerCase().replace(/[^a-z_]/g, '');
  return channelMap[normalized] || 'tiktok_reel'; // Default fallback
}

/**
 * Clean and validate array inputs
 */
export function normalizeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  
  return arr
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Normalize tone to valid options
 */
export function normalizeTone(tone: string): "friendly" | "expert" | "punchy" | "playful" | "urgent" {
  const toneMap: Record<string, "friendly" | "expert" | "punchy" | "playful" | "urgent"> = {
    'casual': 'friendly',
    'professional': 'expert',
    'authoritative': 'expert',
    'fun': 'playful',
    'energetic': 'punchy',
    'serious': 'urgent'
  };

  const normalized = tone.toLowerCase();
  return toneMap[normalized] || 'friendly';
}

/**
 * Validate URL format
 */
export function normalizeUrl(url: string): string {
  try {
    // Add https if no protocol specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Validate URL format
    new URL(url);
    return url;
  } catch (error) {
    // Return default CookAIng URL if invalid
    return 'https://cookaing.com';
  }
}

/**
 * Sanitize campaign name for UTM parameters
 */
export function normalizeCampaignName(campaign: string): string {
  return campaign
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-') // Replace invalid characters with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
}