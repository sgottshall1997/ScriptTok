import { describe, it, expect } from 'vitest';
import { 
  normalizePromoInput, 
  normalizeSpartanText,
  normalizeChannel,
  normalizeStringArray,
  normalizeTone,
  normalizeUrl,
  normalizeCampaignName
} from '../../packages/cookaing-promo/utils/normalize';
import { PromoInputType, PromoInput } from '../../packages/cookaing-promo/schemas';

describe('CookAIng Normalize Utilities', () => {
  describe('normalizePromoInput', () => {
    const validInput: Partial<PromoInput> = {
      appName: 'CookAIng',
      audiencePersona: 'busy working parents',
      keyBenefits: ['save time on meal planning', 'healthier family meals'],
      features: ['AI meal suggestions', 'grocery list automation'],
      channels: ['tiktok_reel'],
      objective: 'feature_highlight',
      ctaUrl: 'https://cookaing.com/signup',
      campaign: 'summer-launch'
    };

    it('should normalize valid input successfully', () => {
      const result = normalizePromoInput(validInput);
      
      expect(result.appName).toBe('CookAIng');
      expect(result.audiencePersona).toBe('busy working parents');
      expect(result.keyBenefits).toEqual(['save time on meal planning', 'healthier family meals']);
      expect(result.features).toEqual(['AI meal suggestions', 'grocery list automation']);
      expect(result.channels).toEqual(['tiktok_reel']);
      expect(result.objective).toBe('feature_highlight');
      expect(result.ctaUrl).toBe('https://cookaing.com/signup');
      expect(result.campaign).toBe('summer-launch');
    });

    it('should apply default values for optional fields', () => {
      const result = normalizePromoInput(validInput);
      
      // Should have default tone if not provided
      expect(result.tone).toBeDefined();
      expect(['friendly', 'expert', 'punchy', 'playful', 'urgent']).toContain(result.tone);
    });

    it('should trim whitespace from string fields', () => {
      const inputWithWhitespace = {
        ...validInput,
        audiencePersona: '  busy working parents  ',
        campaign: '  summer-launch  '
      };
      
      const result = normalizePromoInput(inputWithWhitespace);
      
      expect(result.audiencePersona).toBe('busy working parents');
      expect(result.campaign).toBe('summer-launch');
    });

    it('should normalize array fields', () => {
      const inputWithArrays = {
        ...validInput,
        keyBenefits: ['  save time  ', '', 'healthier meals', '  '],
        features: ['AI suggestions', '  ', 'grocery automation', '']
      };
      
      const result = normalizePromoInput(inputWithArrays);
      
      expect(result.keyBenefits).toEqual(['save time', 'healthier meals']);
      expect(result.features).toEqual(['AI suggestions', 'grocery automation']);
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalInput = {
        appName: 'CookAIng',
        audiencePersona: 'home cooks',
        keyBenefits: ['easier cooking'],
        features: ['recipe suggestions'],
        channels: ['email'],
        objective: 'feature_highlight',
        ctaUrl: 'https://cookaing.com',
        campaign: 'basic'
      };
      
      expect(() => normalizePromoInput(minimalInput)).not.toThrow();
      
      const result = normalizePromoInput(minimalInput);
      expect(result.appName).toBe('CookAIng');
      expect(result.offer).toBeUndefined();
      expect(result.proofPoints).toBeUndefined();
      expect(result.seedTopic).toBeUndefined();
    });

    it('should validate URL format for ctaUrl', () => {
      const inputWithInvalidUrl = {
        ...validInput,
        ctaUrl: 'not-a-valid-url'
      };
      
      expect(() => normalizePromoInput(inputWithInvalidUrl)).toThrow();
    });

    it('should validate required array fields are not empty', () => {
      const inputWithEmptyArrays = {
        ...validInput,
        keyBenefits: [],
        features: ['AI suggestions']
      };
      
      expect(() => normalizePromoInput(inputWithEmptyArrays)).toThrow();
    });

    it('should normalize case sensitivity for enums', () => {
      const inputWithDifferentCase = {
        ...validInput,
        tone: 'FRIENDLY' as any,
        objective: 'FEATURE_HIGHLIGHT' as any
      };
      
      const result = normalizePromoInput(inputWithDifferentCase);
      
      // Should normalize to lowercase or reject invalid values
      expect(['friendly', 'expert', 'punchy', 'playful', 'urgent']).toContain(result.tone);
    });
  });

  describe('normalizeSpartanText', () => {
    it('should remove banned Spartan words', () => {
      const textWithBannedWords = 'This can really help you unlock amazing results that are very exciting and groundbreaking';
      
      const result = normalizeSpartanText(textWithBannedWords);
      
      // Should not contain banned words
      expect(result.toLowerCase()).not.toContain('can');
      expect(result.toLowerCase()).not.toContain('really');
      expect(result.toLowerCase()).not.toContain('very');
      expect(result.toLowerCase()).not.toContain('unlock');
      expect(result.toLowerCase()).not.toContain('amazing');
      expect(result.toLowerCase()).not.toContain('exciting');
      expect(result.toLowerCase()).not.toContain('groundbreaking');
    });

    it('should remove emojis and asterisks', () => {
      const textWithEmojis = 'CookAIng helps families 🍽️ prepare *amazing* meals **quickly** 🚀';
      
      const result = normalizeSpartanText(textWithEmojis);
      
      expect(result).not.toContain('🍽️');
      expect(result).not.toContain('🚀');
      expect(result).not.toContain('*');
      expect(result).not.toContain('**');
    });

    it('should convert passive voice to active voice', () => {
      const passiveText = 'Meals are prepared by CookAIng. Recipes are suggested automatically.';
      
      const result = normalizeSpartanText(passiveText);
      
      // Should be converted to active voice
      expect(result).toContain('CookAIng prepares meals');
      expect(result).toContain('suggests recipes');
    });

    it('should remove setup phrases and filler words', () => {
      const textWithFillers = 'In conclusion, CookAIng basically helps you. Furthermore, it provides amazing results.';
      
      const result = normalizeSpartanText(textWithFillers);
      
      expect(result.toLowerCase()).not.toContain('in conclusion');
      expect(result.toLowerCase()).not.toContain('basically');
      expect(result.toLowerCase()).not.toContain('furthermore');
    });

    it('should shorten overly long sentences', () => {
      const longSentence = 'CookAIng is an innovative AI-powered meal planning application that revolutionizes the way busy families approach cooking by providing personalized recipe recommendations, automated grocery lists, and intelligent meal scheduling that takes into account dietary preferences, nutritional requirements, and time constraints.';
      
      const result = normalizeSpartanText(longSentence);
      
      // Should be broken into shorter sentences
      const sentences = result.split('.').filter(s => s.trim());
      const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
      expect(avgLength).toBeLessThan(20); // Average sentence should be under 20 words
    });

    it('should maintain factual content while removing fluff', () => {
      const fluffyText = 'CookAIng is absolutely the most incredible cooking app that will totally revolutionize your kitchen experience!';
      
      const result = normalizeSpartanText(fluffyText);
      
      // Should keep the core message
      expect(result.toLowerCase()).toContain('cookaing');
      expect(result.toLowerCase()).toContain('cooking');
      expect(result.toLowerCase()).toContain('app');
      
      // Should remove superlatives
      expect(result.toLowerCase()).not.toContain('absolutely');
      expect(result.toLowerCase()).not.toContain('most incredible');
      expect(result.toLowerCase()).not.toContain('totally');
      expect(result.toLowerCase()).not.toContain('revolutionize');
    });

    it('should preserve numbers and specific facts', () => {
      const textWithFacts = 'CookAIng saves users 2.5 hours per week and costs $9.99/month';
      
      const result = normalizeSpartanText(textWithFacts);
      
      expect(result).toContain('2.5 hours');
      expect(result).toContain('$9.99');
      expect(result).toContain('per week');
      expect(result).toContain('per month');
    });

    it('should handle empty or whitespace-only input', () => {
      expect(normalizeSpartanText('')).toBe('');
      expect(normalizeSpartanText('   ')).toBe('');
      expect(normalizeSpartanText('\n\t\r')).toBe('');
    });
  });

  describe('normalizeChannel', () => {
    it('should normalize common channel variations', () => {
      expect(normalizeChannel('tiktok')).toBe('tiktok_reel');
      expect(normalizeChannel('instagram')).toBe('instagram_reel');
      expect(normalizeChannel('twitter')).toBe('x_thread');
      expect(normalizeChannel('x')).toBe('x_thread');
      expect(normalizeChannel('linkedin')).toBe('linkedin_post');
    });

    it('should handle ad platform variations', () => {
      expect(normalizeChannel('google_ads')).toBe('ads_google');
      expect(normalizeChannel('google')).toBe('ads_google');
      expect(normalizeChannel('facebook_ads')).toBe('ads_meta');
      expect(normalizeChannel('meta')).toBe('ads_meta');
    });

    it('should default to tiktok_reel for unknown channels', () => {
      expect(normalizeChannel('unknown')).toBe('tiktok_reel');
      expect(normalizeChannel('')).toBe('tiktok_reel');
    });
  });

  describe('normalizeStringArray', () => {
    it('should filter and clean string arrays', () => {
      const input = ['  item1  ', '', 'item2', null, 'item3', '  '];
      const result = normalizeStringArray(input);
      expect(result).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle non-array input', () => {
      expect(normalizeStringArray('not an array')).toEqual([]);
      expect(normalizeStringArray(null)).toEqual([]);
      expect(normalizeStringArray(undefined)).toEqual([]);
    });
  });

  describe('normalizeTone', () => {
    it('should map common tone variations', () => {
      expect(normalizeTone('casual')).toBe('friendly');
      expect(normalizeTone('professional')).toBe('expert');
      expect(normalizeTone('fun')).toBe('playful');
      expect(normalizeTone('energetic')).toBe('punchy');
      expect(normalizeTone('serious')).toBe('urgent');
    });

    it('should default to friendly for unknown tones', () => {
      expect(normalizeTone('unknown')).toBe('friendly');
      expect(normalizeTone('')).toBe('friendly');
    });
  });

  describe('Integration with Spartan format rules', () => {
    it('should apply comprehensive Spartan normalization', () => {
      const problematicText = `
        🚀 CookAIng can really revolutionize your cooking experience! 
        This amazing app basically utilizes cutting-edge AI that will totally unlock 
        incredible meal planning capabilities. Furthermore, you'll discover groundbreaking 
        features that are absolutely game-changing. ⭐
      `;
      
      const result = normalizeSpartanText(problematicText);
      
      // Should be much cleaner and shorter
      expect(result.length).toBeLessThan(problematicText.length * 0.7);
      
      // Should contain core facts without fluff
      expect(result.toLowerCase()).toContain('cookaing');
      expect(result.toLowerCase()).toContain('meal planning');
      
      // Should not contain banned elements
      expect(result).not.toContain('🚀');
      expect(result).not.toContain('⭐');
      expect(result.toLowerCase()).not.toContain('can really');
      expect(result.toLowerCase()).not.toContain('revolutionize');
      expect(result.toLowerCase()).not.toContain('amazing');
      expect(result.toLowerCase()).not.toContain('basically');
      expect(result.toLowerCase()).not.toContain('unlock');
      expect(result.toLowerCase()).not.toContain('incredible');
      expect(result.toLowerCase()).not.toContain('furthermore');
      expect(result.toLowerCase()).not.toContain('groundbreaking');
      expect(result.toLowerCase()).not.toContain('game-changing');
    });

    it('should maintain CookAIng brand consistency', () => {
      const inconsistentBranding = 'cookaing, CookAing, COOKAING, Cook AIng';
      
      const result = normalizeSpartanText(inconsistentBranding);
      
      // Should normalize to consistent brand name
      expect(result).toContain('CookAIng');
      expect(result.split('CookAIng').length - 1).toBeGreaterThan(0);
    });
  });
});