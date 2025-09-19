export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

/**
 * Build UTM-tracked URL for CookAIng promo campaigns
 * Following standard UTM parameter conventions
 */
export function buildUtmUrl(baseUrl: string, params: UtmParams): string {
  try {
    const url = new URL(baseUrl);
    
    // Required UTM parameters
    url.searchParams.set('utm_source', params.source);
    url.searchParams.set('utm_medium', params.medium);
    url.searchParams.set('utm_campaign', params.campaign);
    
    // Optional UTM parameters
    if (params.term) {
      url.searchParams.set('utm_term', params.term);
    }
    
    if (params.content) {
      url.searchParams.set('utm_content', params.content);
    }
    
    return url.toString();
  } catch (error) {
    console.error('Error building UTM URL:', error);
    return baseUrl; // Fallback to original URL
  }
}

/**
 * Generate UTM content parameter from channel, objective, and variant
 */
export function generateUtmContent(
  channel: string,
  objective: string,
  variant: string = 'v1'
): string {
  return `${channel}-${objective}-${variant}`;
}

/**
 * Parse UTM parameters from a URL
 */
export function parseUtmParams(url: string): UtmParams | null {
  try {
    const parsedUrl = new URL(url);
    const params = parsedUrl.searchParams;
    
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    
    if (!source || !medium || !campaign) {
      return null; // Missing required parameters
    }
    
    return {
      source,
      medium,
      campaign,
      term: params.get('utm_term') || undefined,
      content: params.get('utm_content') || undefined
    };
  } catch (error) {
    console.error('Error parsing UTM parameters:', error);
    return null;
  }
}

/**
 * Validate UTM parameters for completeness
 */
export function validateUtmParams(params: UtmParams): boolean {
  return Boolean(params.source && params.medium && params.campaign);
}

/**
 * Standard UTM medium values for different channels
 */
export const UTM_MEDIUMS = {
  'tiktok_reel': 'social',
  'instagram_reel': 'social', 
  'x_thread': 'social',
  'linkedin_post': 'social',
  'email': 'email',
  'blog': 'organic',
  'ads_google': 'cpc',
  'ads_meta': 'paid-social',
  'ads_tiktok': 'paid-social'
} as const;

/**
 * Standard UTM sources for different channels  
 */
export const UTM_SOURCES = {
  'tiktok_reel': 'tiktok',
  'instagram_reel': 'instagram',
  'x_thread': 'twitter', 
  'linkedin_post': 'linkedin',
  'email': 'newsletter',
  'blog': 'website',
  'ads_google': 'google',
  'ads_meta': 'facebook',
  'ads_tiktok': 'tiktok'
} as const;

/**
 * Get recommended UTM source and medium for a channel
 */
export function getChannelUtmDefaults(channel: keyof typeof UTM_SOURCES): UtmParams {
  return {
    source: UTM_SOURCES[channel] || 'organic',
    medium: UTM_MEDIUMS[channel] || 'referral',
    campaign: 'cookaing-promo' // Default campaign name
  };
}