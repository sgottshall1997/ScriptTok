/**
 * Feature flags for CookAIng Marketing Engine extensions
 * All flags default to true in development, can be overridden via env vars
 */

// Content Enhancement Features
export const ENABLE_IMAGE_GEN = import.meta.env.VITE_ENABLE_IMAGE_GEN !== 'false';
export const ENABLE_VIDEO_GEN = import.meta.env.VITE_ENABLE_VIDEO_GEN !== 'false';
export const ENABLE_TTS = import.meta.env.VITE_ENABLE_TTS !== 'false';
export const ENABLE_REWRITE = import.meta.env.VITE_ENABLE_REWRITE !== 'false';

// Advanced Analytics & Intelligence
export const ENABLE_COMPETITOR_ANALYSIS = import.meta.env.VITE_ENABLE_COMPETITOR_ANALYSIS !== 'false';
export const ENABLE_SENTIMENT = import.meta.env.VITE_ENABLE_SENTIMENT !== 'false';
export const ENABLE_VIRAL_PREDICT = import.meta.env.VITE_ENABLE_VIRAL_PREDICT !== 'false';
export const ENABLE_FATIGUE_DETECT = import.meta.env.VITE_ENABLE_FATIGUE_DETECT !== 'false';

// Social Media Automation
export const ENABLE_SOCIAL_PUBLISH = import.meta.env.VITE_ENABLE_SOCIAL_PUBLISH !== 'false';
export const ENABLE_SOCIAL_ENGAGE = import.meta.env.VITE_ENABLE_SOCIAL_ENGAGE !== 'false';
export const ENABLE_HASHTAG_RESEARCH = import.meta.env.VITE_ENABLE_HASHTAG_RESEARCH !== 'false';
export const ENABLE_OPTIMAL_TIMING = import.meta.env.VITE_ENABLE_OPTIMAL_TIMING !== 'false';

// Advanced Personalization
export const ENABLE_DYNAMIC_ADAPT = import.meta.env.VITE_ENABLE_DYNAMIC_ADAPT !== 'false';
export const ENABLE_BRAND_VOICE_LEARN = import.meta.env.VITE_ENABLE_BRAND_VOICE_LEARN !== 'false';

// Collaboration & Workflow
export const ENABLE_COLLAB = import.meta.env.VITE_ENABLE_COLLAB !== 'false';
export const ENABLE_CLIENT_PORTAL = import.meta.env.VITE_ENABLE_CLIENT_PORTAL !== 'false';
export const ENABLE_CALENDAR = import.meta.env.VITE_ENABLE_CALENDAR !== 'false';

// Advanced Integrations
export const ENABLE_CRM_INTEGRATIONS = import.meta.env.VITE_ENABLE_CRM_INTEGRATIONS !== 'false';
export const ENABLE_ECOMMERCE = import.meta.env.VITE_ENABLE_ECOMMERCE !== 'false';
export const ENABLE_ADV_EMAIL_AUTOMATION = import.meta.env.VITE_ENABLE_ADV_EMAIL_AUTOMATION !== 'false';
export const ENABLE_SMS_WHATSAPP = import.meta.env.VITE_ENABLE_SMS_WHATSAPP !== 'false';

// AI Enhancement Features
export const ENABLE_CUSTOM_MODEL_PLACEHOLDERS = import.meta.env.VITE_ENABLE_CUSTOM_MODEL_PLACEHOLDERS !== 'false';
export const ENABLE_MULTIMODAL_PROMPTS = import.meta.env.VITE_ENABLE_MULTIMODAL_PROMPTS !== 'false';
export const ENABLE_REALTIME_OPT = import.meta.env.VITE_ENABLE_REALTIME_OPT !== 'false';

// Compliance & Safety
export const ENABLE_MODERATION = import.meta.env.VITE_ENABLE_MODERATION !== 'false';
export const ENABLE_BRAND_SAFETY = import.meta.env.VITE_ENABLE_BRAND_SAFETY !== 'false';
export const ENABLE_PLAGIARISM = import.meta.env.VITE_ENABLE_PLAGIARISM !== 'false';

/**
 * Get all feature flags as an object
 */
export function getAllFeatureFlags() {
  return {
    // Content Enhancement
    imageGen: ENABLE_IMAGE_GEN,
    videoGen: ENABLE_VIDEO_GEN,
    tts: ENABLE_TTS,
    rewrite: ENABLE_REWRITE,
    
    // Analytics & Intelligence
    competitorAnalysis: ENABLE_COMPETITOR_ANALYSIS,
    sentiment: ENABLE_SENTIMENT,
    viralPredict: ENABLE_VIRAL_PREDICT,
    fatigueDetect: ENABLE_FATIGUE_DETECT,
    
    // Social Automation
    socialPublish: ENABLE_SOCIAL_PUBLISH,
    socialEngage: ENABLE_SOCIAL_ENGAGE,
    hashtagResearch: ENABLE_HASHTAG_RESEARCH,
    optimalTiming: ENABLE_OPTIMAL_TIMING,
    
    // Personalization
    dynamicAdapt: ENABLE_DYNAMIC_ADAPT,
    brandVoiceLearn: ENABLE_BRAND_VOICE_LEARN,
    
    // Collaboration
    collab: ENABLE_COLLAB,
    clientPortal: ENABLE_CLIENT_PORTAL,
    calendar: ENABLE_CALENDAR,
    
    // Integrations
    crmIntegrations: ENABLE_CRM_INTEGRATIONS,
    ecommerce: ENABLE_ECOMMERCE,
    advEmailAutomation: ENABLE_ADV_EMAIL_AUTOMATION,
    smsWhatsapp: ENABLE_SMS_WHATSAPP,
    
    // AI Enhancements
    customModelPlaceholders: ENABLE_CUSTOM_MODEL_PLACEHOLDERS,
    multimodalPrompts: ENABLE_MULTIMODAL_PROMPTS,
    realtimeOpt: ENABLE_REALTIME_OPT,
    
    // Compliance & Safety
    moderation: ENABLE_MODERATION,
    brandSafety: ENABLE_BRAND_SAFETY,
    plagiarism: ENABLE_PLAGIARISM,
  };
}

/**
 * Check if a specific feature category is enabled
 */
export function isCategoryEnabled(category: string): boolean {
  const flags = getAllFeatureFlags();
  switch (category) {
    case 'enhancement':
      return flags.imageGen || flags.videoGen || flags.tts || flags.rewrite;
    case 'intelligence':
      return flags.competitorAnalysis || flags.sentiment || flags.viralPredict || flags.fatigueDetect;
    case 'social':
      return flags.socialPublish || flags.socialEngage || flags.hashtagResearch || flags.optimalTiming;
    case 'personalization':
      return flags.dynamicAdapt || flags.brandVoiceLearn;
    case 'collaboration':
      return flags.collab || flags.clientPortal || flags.calendar;
    case 'integrations':
      return flags.crmIntegrations || flags.ecommerce || flags.advEmailAutomation || flags.smsWhatsapp;
    case 'ai':
      return flags.customModelPlaceholders || flags.multimodalPrompts || flags.realtimeOpt;
    case 'compliance':
      return flags.moderation || flags.brandSafety || flags.plagiarism;
    default:
      return false;
  }
}