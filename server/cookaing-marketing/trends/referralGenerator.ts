import { ReferralTemplate, ReferralGeneratorConfig } from './types.js';
import { storage } from '../../storage.js';

export class ReferralGeneratorService {
  private config: ReferralGeneratorConfig;
  private templates: Map<string, ReferralTemplate>;

  constructor() {
    this.config = {
      enabled: false, // Start disabled until toggled in UI
      platforms: ['email', 'social', 'whatsapp', 'sms'],
      defaultTemplate: 'cooking_share',
      trackConversions: true
    };

    this.templates = this.initializeTemplates();
  }

  private initializeTemplates(): Map<string, ReferralTemplate> {
    const templates = new Map<string, ReferralTemplate>();

    // Cooking content sharing templates
    templates.set('cooking_share', {
      id: 'cooking_share',
      name: 'Share Amazing Recipe',
      shareText: "I found this incredible {recipe_name} recipe and had to share it with you! The flavors are absolutely amazing and it's so easy to make. Check it out: {share_url}",
      ctaText: "Try This Recipe",
      platform: 'universal',
      trackingParams: {
        utm_source: 'referral',
        utm_medium: 'social_share',
        utm_campaign: 'recipe_sharing'
      }
    });

    templates.set('meal_prep_tips', {
      id: 'meal_prep_tips',
      name: 'Share Meal Prep Wisdom',
      shareText: "This meal prep guide completely changed my kitchen game! {tip_summary} If you're always struggling with meal planning, you need to see this: {share_url}",
      ctaText: "Get Meal Prep Tips",
      platform: 'universal',
      trackingParams: {
        utm_source: 'referral',
        utm_medium: 'meal_prep_share',
        utm_campaign: 'cooking_tips'
      }
    });

    templates.set('cooking_hack', {
      id: 'cooking_hack',
      name: 'Share Kitchen Hack',
      shareText: "🤯 This cooking hack just blew my mind! {hack_description} Seriously, this will save you so much time in the kitchen: {share_url}",
      ctaText: "Learn This Hack",
      platform: 'social',
      trackingParams: {
        utm_source: 'referral',
        utm_medium: 'kitchen_hack',
        utm_campaign: 'cooking_hacks'
      }
    });

    templates.set('seasonal_recipe', {
      id: 'seasonal_recipe',
      name: 'Share Seasonal Recipe',
      shareText: "Perfect timing for {season}! This {recipe_type} recipe is exactly what your kitchen needs right now. The seasonal flavors are incredible: {share_url}",
      ctaText: "Get Seasonal Recipe",
      platform: 'universal',
      trackingParams: {
        utm_source: 'referral',
        utm_medium: 'seasonal_share',
        utm_campaign: 'seasonal_cooking'
      }
    });

    templates.set('product_recommendation', {
      id: 'product_recommendation',
      name: 'Share Product Find',
      shareText: "Found the perfect {product_category}! {product_name} has been a game-changer in my kitchen. If you've been looking for {product_benefit}, this is it: {share_url}",
      ctaText: "Check This Out",
      platform: 'universal',
      trackingParams: {
        utm_source: 'referral',
        utm_medium: 'product_share',
        utm_campaign: 'product_recommendations'
      }
    });

    return templates;
  }

  async generateReferralContent(templateId: string, contentData: Record<string, any>): Promise<{
    shareLinks: Record<string, string>;
    trackingData: Record<string, any>;
  }> {
    if (!this.config.enabled) {
      throw new Error('Referral Generator is disabled');
    }

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    console.log(`🔗 Generating referral content with template: ${template.name}`);

    try {
      // Generate personalized share text
      const personalizedText = this.personalizeTemplate(template.shareText, contentData);
      
      // Create tracking URLs for different platforms
      const shareLinks = await this.createPlatformShareLinks(personalizedText, template, contentData);
      
      // Generate tracking data
      const trackingData = this.createTrackingData(template, contentData);

      console.log(`✅ Generated referral content for ${Object.keys(shareLinks).length} platforms`);
      
      return { shareLinks, trackingData };
    } catch (error) {
      console.error(`❌ Failed to generate referral content:`, error);
      throw error;
    }
  }

  private personalizeTemplate(template: string, data: Record<string, any>): string {
    let personalizedText = template;
    
    // Replace placeholders with actual data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      personalizedText = personalizedText.replace(new RegExp(placeholder, 'g'), value);
    });

    return personalizedText;
  }

  private async createPlatformShareLinks(shareText: string, template: ReferralTemplate, contentData: Record<string, any>): Promise<Record<string, string>> {
    const baseUrl = contentData.share_url || contentData.url || '';
    const trackingParams = new URLSearchParams(template.trackingParams);
    
    // Add unique referral ID for tracking
    const referralId = this.generateReferralId();
    trackingParams.set('ref', referralId);
    
    const trackingUrl = `${baseUrl}?${trackingParams.toString()}`;
    
    const shareLinks: Record<string, string> = {};

    // Generate platform-specific share links
    if (this.config.platforms.includes('email')) {
      const emailSubject = `Check out this ${contentData.content_type || 'recipe'}!`;
      const emailBody = encodeURIComponent(`${shareText}\n\nBest regards!`);
      shareLinks.email = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`;
    }

    if (this.config.platforms.includes('social')) {
      // Twitter/X
      shareLinks.twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      
      // Facebook
      shareLinks.facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackingUrl)}`;
      
      // LinkedIn
      shareLinks.linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(trackingUrl)}`;
      
      // Pinterest (great for recipes)
      if (contentData.image_url) {
        shareLinks.pinterest = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(trackingUrl)}&media=${encodeURIComponent(contentData.image_url)}&description=${encodeURIComponent(shareText)}`;
      }
    }

    if (this.config.platforms.includes('whatsapp')) {
      shareLinks.whatsapp = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${trackingUrl}`)}`;
    }

    if (this.config.platforms.includes('sms')) {
      shareLinks.sms = `sms:?body=${encodeURIComponent(`${shareText} ${trackingUrl}`)}`;
    }

    // Store tracking data for analytics
    if (this.config.trackConversions) {
      await this.storeReferralTracking(referralId, template, contentData, trackingUrl);
    }

    return shareLinks;
  }

  private createTrackingData(template: ReferralTemplate, contentData: Record<string, any>): Record<string, any> {
    return {
      template_id: template.id,
      template_name: template.name,
      content_type: contentData.content_type || 'unknown',
      generated_at: new Date().toISOString(),
      tracking_params: template.trackingParams,
      platforms_enabled: this.config.platforms,
      conversions_tracked: this.config.trackConversions
    };
  }

  private generateReferralId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ref_${timestamp}_${random}`;
  }

  private async storeReferralTracking(referralId: string, template: ReferralTemplate, contentData: Record<string, any>, trackingUrl: string): Promise<void> {
    try {
      // Store referral tracking data in analytics events
      await storage.createAnalyticsEvent({
        eventType: 'referral_generated',
        eventData: {
          referral_id: referralId,
          template_id: template.id,
          template_name: template.name,
          content_type: contentData.content_type || 'unknown',
          tracking_url: trackingUrl,
          platforms_shared: this.config.platforms
        },
        sessionId: referralId, // Use referral ID as session
        userId: contentData.user_id,
        userAgent: 'referral_generator',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('❌ Failed to store referral tracking:', error);
      // Don't throw - this shouldn't break the referral generation
    }
  }

  async trackReferralConversion(referralId: string, conversionType: string = 'click', conversionData?: Record<string, any>): Promise<void> {
    if (!this.config.trackConversions) {
      return;
    }

    try {
      await storage.createAnalyticsEvent({
        eventType: 'referral_conversion',
        eventData: {
          referral_id: referralId,
          conversion_type: conversionType,
          conversion_data: conversionData || {},
          converted_at: new Date().toISOString()
        },
        sessionId: referralId,
        userId: conversionData?.user_id,
        userAgent: conversionData?.user_agent || 'unknown',
        timestamp: new Date()
      });

      console.log(`📊 Tracked referral conversion: ${referralId} -> ${conversionType}`);
    } catch (error) {
      console.error('❌ Failed to track referral conversion:', error);
    }
  }

  // Template management
  addTemplate(template: ReferralTemplate): void {
    this.templates.set(template.id, template);
    console.log(`✅ Added referral template: ${template.name}`);
  }

  getTemplate(templateId: string): ReferralTemplate | undefined {
    return this.templates.get(templateId);
  }

  listTemplates(): ReferralTemplate[] {
    return Array.from(this.templates.values());
  }

  // Configuration methods
  updateConfig(newConfig: Partial<ReferralGeneratorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Referral Generator config updated:', this.config);
  }

  getConfig(): ReferralGeneratorConfig {
    return { ...this.config };
  }

  enable(): void {
    this.config.enabled = true;
    console.log('✅ Referral Generator enabled');
  }

  disable(): void {
    this.config.enabled = false;
    console.log('🚫 Referral Generator disabled');
  }

  // Analytics and reporting
  async getReferralStats(dateRange?: { start: Date; end: Date }): Promise<{
    totalReferrals: number;
    totalConversions: number;
    conversionRate: number;
    topTemplates: Array<{ template: string; count: number }>;
  }> {
    try {
      // This would query analytics events for referral statistics
      // For now, returning mock data structure
      return {
        totalReferrals: 0,
        totalConversions: 0,
        conversionRate: 0,
        topTemplates: []
      };
    } catch (error) {
      console.error('❌ Failed to get referral stats:', error);
      throw error;
    }
  }
}

export const referralGeneratorService = new ReferralGeneratorService();