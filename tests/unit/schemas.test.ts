import { describe, it, expect } from 'vitest';
import {
  PromoInputSchema,
  PromoOutputSchema,
  BulkPromoInputSchema,
  CHANNEL_LABELS,
  OBJECTIVE_LABELS,
  TONE_LABELS,
  PromoInputType,
  PromoOutputType
} from '../../packages/cookaing-promo/schemas';

describe('CookAIng Promo Schemas', () => {
  describe('PromoInputSchema', () => {
    const validInput: PromoInputType = {
      appName: 'CookAIng',
      audiencePersona: 'busy parents',
      keyBenefits: ['save time', 'healthy meals'],
      features: ['meal planning', 'recipe suggestions'],
      channels: ['tiktok_reel'],
      objective: 'feature_highlight',
      ctaUrl: 'https://cookaing.com',
      campaign: 'summer-launch'
    };

    it('should validate valid input', () => {
      const result = PromoInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid appName', () => {
      const invalidInput = { ...validInput, appName: 'WrongApp' };
      const result = PromoInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should require audiencePersona', () => {
      const invalidInput = { ...validInput, audiencePersona: '' };
      const result = PromoInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should require at least one keyBenefits', () => {
      const invalidInput = { ...validInput, keyBenefits: [] };
      const result = PromoInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should require at least one features', () => {
      const invalidInput = { ...validInput, features: [] };
      const result = PromoInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should require at least one channels', () => {
      const invalidInput = { ...validInput, channels: [] };
      const result = PromoInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should validate valid channel values', () => {
      const validChannels = ['tiktok_reel', 'instagram_reel', 'x_thread', 'linkedin_post', 'email', 'blog', 'ads_google', 'ads_meta', 'ads_tiktok'];
      for (const channel of validChannels) {
        const input = { ...validInput, channels: [channel] };
        const result = PromoInputSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid channel values', () => {
      const invalidInput = { ...validInput, channels: ['invalid_channel'] };
      const result = PromoInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should validate valid objective values', () => {
      const validObjectives = [
        'feature_highlight', 'how_to_demo', 'user_scenario', 'before_after',
        'launch_announcement', 'new_feature_alert', 'newsletter', 'winback',
        'seo_article', 'deep_dive', 'comparison', 'testimonial_script',
        'explainer_script', 'ad_copy', 'challenge', 'quiz_poll', 'ugc_prompt'
      ];
      for (const objective of validObjectives) {
        const input = { ...validInput, objective };
        const result = PromoInputSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it('should validate valid tone values', () => {
      const validTones = ['friendly', 'expert', 'punchy', 'playful', 'urgent'];
      for (const tone of validTones) {
        const input = { ...validInput, tone };
        const result = PromoInputSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it('should require valid URL for ctaUrl', () => {
      const invalidInput = { ...validInput, ctaUrl: 'not-a-url' };
      const result = PromoInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should require campaign name', () => {
      const invalidInput = { ...validInput, campaign: '' };
      const result = PromoInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const inputWithOptionals = {
        ...validInput,
        offer: '50% off',
        proofPoints: ['tested by 1000+ families'],
        seedTopic: 'meal prep automation',
        source: 'social',
        medium: 'organic',
        brandGuidelines: 'Use warm colors',
        wordCountHint: 100
      };
      const result = PromoInputSchema.safeParse(inputWithOptionals);
      expect(result.success).toBe(true);
    });
  });

  describe('PromoOutputSchema', () => {
    const validOutput: PromoOutputType = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      timestamp: '2024-01-01T00:00:00.000Z',
      appName: 'CookAIng',
      objective: 'feature_highlight',
      channel: 'tiktok_reel',
      body: 'CookAIng helps parents plan healthy meals fast.',
      cta: {
        text: 'Try CookAIng',
        url: 'https://cookaing.com',
        utmUrl: 'https://cookaing.com?utm_source=tiktok&utm_medium=social&utm_campaign=launch'
      },
      metadata: {
        persona: 'busy parents',
        tone: 'friendly',
        featuresUsed: ['meal planning'],
        benefitsUsed: ['save time']
      }
    };

    it('should validate valid output', () => {
      const result = PromoOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it('should require valid CTA URLs', () => {
      const invalidOutput = {
        ...validOutput,
        cta: {
          ...validOutput.cta,
          url: 'not-a-url',
          utmUrl: 'also-not-a-url'
        }
      };
      const result = PromoOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const outputWithOptionals = {
        ...validOutput,
        title: 'Amazing CookAIng Feature',
        hook: 'New feature changes everything',
        captions: ['Caption 1', 'Caption 2'],
        hashtags: ['cooking', 'mealprep'],
        variants: [{ label: 'Short', body: 'Short version' }]
      };
      const result = PromoOutputSchema.safeParse(outputWithOptionals);
      expect(result.success).toBe(true);
    });
  });

  describe('BulkPromoInputSchema', () => {
    const validInput: PromoInputType = {
      appName: 'CookAIng',
      audiencePersona: 'busy parents',
      keyBenefits: ['save time'],
      features: ['meal planning'],
      channels: ['tiktok_reel'],
      objective: 'feature_highlight',
      ctaUrl: 'https://cookaing.com',
      campaign: 'summer-launch'
    };

    it('should validate bulk input with now schedule', () => {
      const bulkInput = {
        inputs: [validInput],
        scheduleType: 'now' as const
      };
      const result = BulkPromoInputSchema.safeParse(bulkInput);
      expect(result.success).toBe(true);
    });

    it('should validate bulk input with scheduled type', () => {
      const bulkInput = {
        inputs: [validInput],
        scheduleType: 'scheduled' as const,
        cronExpression: '0 9 * * *',
        scheduledAt: '2024-01-01T09:00:00.000Z'
      };
      const result = BulkPromoInputSchema.safeParse(bulkInput);
      expect(result.success).toBe(true);
    });
  });

  describe('Label Constants', () => {
    it('should have all channel labels', () => {
      const expectedChannels = [
        'tiktok_reel', 'instagram_reel', 'x_thread', 'linkedin_post',
        'email', 'blog', 'ads_google', 'ads_meta', 'ads_tiktok'
      ];
      
      for (const channel of expectedChannels) {
        expect(CHANNEL_LABELS[channel]).toBeDefined();
        expect(typeof CHANNEL_LABELS[channel]).toBe('string');
      }
    });

    it('should have all objective labels', () => {
      const expectedObjectives = [
        'feature_highlight', 'how_to_demo', 'user_scenario', 'before_after',
        'launch_announcement', 'new_feature_alert', 'newsletter', 'winback',
        'seo_article', 'deep_dive', 'comparison', 'testimonial_script',
        'explainer_script', 'ad_copy', 'challenge', 'quiz_poll', 'ugc_prompt'
      ];
      
      for (const objective of expectedObjectives) {
        expect(OBJECTIVE_LABELS[objective]).toBeDefined();
        expect(typeof OBJECTIVE_LABELS[objective]).toBe('string');
      }
    });

    it('should have all tone labels', () => {
      const expectedTones = ['friendly', 'expert', 'punchy', 'playful', 'urgent'];
      
      for (const tone of expectedTones) {
        expect(TONE_LABELS[tone]).toBeDefined();
        expect(typeof TONE_LABELS[tone]).toBe('string');
      }
    });
  });
});