import { describe, it, expect } from 'vitest';
import { buildUtmUrl, parseUtmParams, UtmParams } from '../../packages/cookaing-promo/utils/utm';

describe('CookAIng UTM Utilities', () => {
  describe('buildUtmUrl', () => {
    const baseUrl = 'https://cookaing.com/signup';
    
    it('should build UTM URL with all parameters', () => {
      const utmParams: UtmParams = {
        source: 'tiktok',
        medium: 'social',
        campaign: 'summer-launch',
        content: 'tiktok-reel-feature_highlight-v1',
        term: 'cooking-app'
      };
      
      const result = buildUtmUrl(baseUrl, utmParams);
      
      expect(result).toContain('utm_source=tiktok');
      expect(result).toContain('utm_medium=social');
      expect(result).toContain('utm_campaign=summer-launch');
      expect(result).toContain('utm_content=tiktok-reel-feature_highlight-v1');
      expect(result).toContain('utm_term=cooking-app');
      expect(result.startsWith('https://cookaing.com/signup?')).toBe(true);
    });

    it('should build UTM URL with minimal parameters', () => {
      const utmParams: UtmParams = {
        source: 'instagram',
        medium: 'social',
        campaign: 'launch'
      };
      
      const result = buildUtmUrl(baseUrl, utmParams);
      
      expect(result).toContain('utm_source=instagram');
      expect(result).toContain('utm_medium=social');
      expect(result).toContain('utm_campaign=launch');
      expect(result).not.toContain('utm_content');
      expect(result).not.toContain('utm_term');
    });

    it('should handle URLs that already have query parameters', () => {
      const urlWithParams = 'https://cookaing.com/signup?ref=homepage';
      const utmParams: UtmParams = {
        source: 'email',
        medium: 'newsletter',
        campaign: 'weekly'
      };
      
      const result = buildUtmUrl(urlWithParams, utmParams);
      
      expect(result).toContain('ref=homepage');
      expect(result).toContain('utm_source=email');
      expect(result).toContain('utm_medium=newsletter');
      expect(result).toContain('utm_campaign=weekly');
      expect(result.includes('?ref=homepage&utm_source=')).toBe(true);
    });

    it('should URL encode special characters in parameters', () => {
      const utmParams: UtmParams = {
        source: 'google ads',
        medium: 'cpc',
        campaign: 'summer launch 2024',
        content: 'cooking app/meal planning'
      };
      
      const result = buildUtmUrl(baseUrl, utmParams);
      
      expect(result).toContain('utm_source=google+ads');
      expect(result).toContain('utm_campaign=summer+launch+2024');
      expect(result).toContain('utm_content=cooking+app%2Fmeal+planning');
    });

    it('should handle empty string parameters by skipping them', () => {
      const utmParams: UtmParams = {
        source: 'facebook',
        medium: 'social',
        campaign: 'test',
        content: '',
        term: undefined
      };
      
      const result = buildUtmUrl(baseUrl, utmParams);
      
      expect(result).toContain('utm_source=facebook');
      expect(result).toContain('utm_medium=social');
      expect(result).toContain('utm_campaign=test');
      expect(result).not.toContain('utm_content=');
      expect(result).not.toContain('utm_term=');
    });

    it('should preserve fragment identifiers', () => {
      const urlWithFragment = 'https://cookaing.com/signup#pricing';
      const utmParams: UtmParams = {
        source: 'twitter',
        medium: 'social',
        campaign: 'viral'
      };
      
      const result = buildUtmUrl(urlWithFragment, utmParams);
      
      expect(result.endsWith('#pricing')).toBe(true);
      expect(result).toContain('utm_source=twitter');
      expect(result).toContain('utm_medium=social');
      expect(result).toContain('utm_campaign=viral');
    });

    it('should handle malformed URLs gracefully', () => {
      const malformedUrl = 'not-a-url';
      const utmParams: UtmParams = {
        source: 'test',
        medium: 'test',
        campaign: 'test'
      };
      
      // Should not throw error
      expect(() => buildUtmUrl(malformedUrl, utmParams)).not.toThrow();
    });

    it('should generate consistent URLs for same inputs', () => {
      const utmParams: UtmParams = {
        source: 'linkedin',
        medium: 'social',
        campaign: 'b2b'
      };
      
      const result1 = buildUtmUrl(baseUrl, utmParams);
      const result2 = buildUtmUrl(baseUrl, utmParams);
      
      expect(result1).toEqual(result2);
    });
  });

  describe('parseUtmParams', () => {
    it('should parse UTM parameters from URL', () => {
      const url = 'https://cookaing.com/signup?utm_source=tiktok&utm_medium=social&utm_campaign=summer-launch&utm_content=reel-v1&utm_term=cooking';
      
      const result = parseUtmParams(url);
      
      expect(result).not.toBeNull();
      expect(result).toEqual({
        source: 'tiktok',
        medium: 'social',
        campaign: 'summer-launch',
        content: 'reel-v1',
        term: 'cooking'
      });
    });

    it('should return partial parameters when some are missing', () => {
      const url = 'https://cookaing.com/signup?utm_source=instagram&utm_medium=organic&utm_campaign=launch';
      
      const result = parseUtmParams(url);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.source).toBe('instagram');
        expect(result.medium).toBe('organic');
        expect(result.campaign).toBe('launch');
        expect(result.content).toBeUndefined();
        expect(result.term).toBeUndefined();
      }
    });

    it('should handle URL-encoded parameters', () => {
      const url = 'https://cookaing.com/signup?utm_source=google%20ads&utm_medium=cpc&utm_campaign=summer%20launch';
      
      const result = parseUtmParams(url);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.source).toBe('google ads');
        expect(result.campaign).toBe('summer launch');
      }
    });

    it('should return null for URLs without required UTM parameters', () => {
      const url = 'https://cookaing.com/signup?ref=homepage&track=123';
      
      const result = parseUtmParams(url);
      
      expect(result).toBeNull();
    });

    it('should ignore non-UTM query parameters', () => {
      const url = 'https://cookaing.com/signup?ref=homepage&utm_source=email&utm_medium=newsletter&track=123&utm_campaign=weekly';
      
      const result = parseUtmParams(url);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.source).toBe('email');
        expect(result.medium).toBe('newsletter');  
        expect(result.campaign).toBe('weekly');
        expect(result).not.toHaveProperty('ref');
        expect(result).not.toHaveProperty('track');
      }
    });

    it('should handle malformed URLs gracefully', () => {
      const malformedUrl = 'not-a-url';
      
      expect(() => parseUtmParams(malformedUrl)).not.toThrow();
      const result = parseUtmParams(malformedUrl);
      expect(result).toBeNull();
    });

    it('should handle URLs with fragments', () => {
      const url = 'https://cookaing.com/signup?utm_source=twitter&utm_medium=social&utm_campaign=viral#pricing';
      
      const result = parseUtmParams(url);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.source).toBe('twitter');
        expect(result.medium).toBe('social');
        expect(result.campaign).toBe('viral');
      }
    });
  });

  describe('UTM roundtrip consistency', () => {
    it('should maintain consistency in build -> parse cycle', () => {
      const originalParams: UtmParams = {
        source: 'facebook',
        medium: 'social',
        campaign: 'retargeting',
        content: 'carousel-ad-v2',
        term: 'meal-planning'
      };
      
      const url = buildUtmUrl('https://cookaing.com/signup', originalParams);
      const parsedParams = parseUtmParams(url);
      
      expect(parsedParams).toEqual(originalParams);
    });

    it('should handle special characters in roundtrip', () => {
      const originalParams: UtmParams = {
        source: 'google ads',
        medium: 'cpc',
        campaign: 'cooking & meal planning',
        content: 'ad-group/keyword-match'
      };
      
      const url = buildUtmUrl('https://cookaing.com/signup', originalParams);
      const parsedParams = parseUtmParams(url);
      
      expect(parsedParams).toEqual(originalParams);
    });
  });

  describe('Channel-specific UTM generation', () => {
    it('should generate appropriate UTM for TikTok', () => {
      const utmParams: UtmParams = {
        source: 'tiktok',
        medium: 'social',
        campaign: 'viral-cooking',
        content: 'reel-feature_highlight-v1'
      };
      
      const url = buildUtmUrl('https://cookaing.com/signup', utmParams);
      
      expect(url).toContain('utm_source=tiktok');
      expect(url).toContain('utm_medium=social');
      expect(url).toContain('reel-feature_highlight');
    });

    it('should generate appropriate UTM for email campaigns', () => {
      const utmParams: UtmParams = {
        source: 'mailchimp',
        medium: 'email',
        campaign: 'welcome-series',
        content: 'email-3-onboarding'
      };
      
      const url = buildUtmUrl('https://cookaing.com/features', utmParams);
      
      expect(url).toContain('utm_source=mailchimp');
      expect(url).toContain('utm_medium=email');
      expect(url).toContain('welcome-series');
    });

    it('should generate appropriate UTM for Google Ads', () => {
      const utmParams: UtmParams = {
        source: 'google',
        medium: 'cpc',
        campaign: 'cooking-app-search',
        content: 'ad-group-meal-planning',
        term: 'cooking app'
      };
      
      const url = buildUtmUrl('https://cookaing.com/pricing', utmParams);
      
      expect(url).toContain('utm_source=google');
      expect(url).toContain('utm_medium=cpc');
      expect(url).toContain('utm_term=cooking+app');
    });
  });
});