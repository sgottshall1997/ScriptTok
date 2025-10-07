export const ConversionEvents = {
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  UPGRADE_CLICKED: 'upgrade_clicked',
  UPGRADE_COMPLETED: 'upgrade_completed',
  GENERATION_STARTED: 'generation_started',
  GENERATION_COMPLETED: 'generation_completed',
  CTA_CLICKED: 'cta_clicked',
  LOGIN_STARTED: 'login_started',
  LOGIN_COMPLETED: 'login_completed',
  TREND_VIEWED: 'trend_viewed',
  TEMPLATE_SELECTED: 'template_selected',
  CONTENT_EXPORTED: 'content_exported',
  DEMO_WATCHED: 'demo_watched',
} as const;

export type ConversionEventType = typeof ConversionEvents[keyof typeof ConversionEvents];

export const CTATypes = {
  SIGNUP: 'signup',
  UPGRADE: 'upgrade',
  GENERATE: 'generate',
  NAVIGATE: 'navigate',
  LOGIN: 'login',
  DEMO: 'demo',
  EXPORT: 'export',
} as const;

export type CTAType = typeof CTATypes[keyof typeof CTATypes];

export interface CTAMetadata {
  ctaType?: CTAType;
  ctaLocation?: string;
  ctaText?: string;
  plan?: 'pro' | 'creator' | 'free';
  generationType?: 'viral' | 'affiliate';
  niche?: string;
  [key: string]: any;
}
