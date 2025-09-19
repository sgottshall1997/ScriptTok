/**
 * Unit Tests - Test Fixtures
 * Validates the integrity and consistency of test fixtures
 */

import { describe, it, expect } from 'vitest';
import { testFixtures } from '../../client/src/cookaing-marketing/fixtures';

describe('Test Fixtures Validation', () => {
  describe('Data Structure Integrity', () => {
    it('should have all required fixture categories', () => {
      const requiredCategories = [
        'organizations',
        'contacts', 
        'campaigns',
        'contentVersions',
        'cookaingContentVersions'
      ];
      
      requiredCategories.forEach(category => {
        expect(testFixtures).toHaveProperty(category);
        expect(Array.isArray(testFixtures[category as keyof typeof testFixtures])).toBe(true);
      });
    });

    it('should have valid organization fixtures', () => {
      expect(testFixtures.organizations.length).toBeGreaterThan(0);
      
      testFixtures.organizations.forEach(org => {
        expect(org.name).toBeDefined();
        expect(org.email).toBeDefined();
        expect(org.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Basic email validation
        expect(org.industry).toBeDefined();
        expect(org.size).toBeDefined();
      });
    });

    it('should have valid contact fixtures', () => {
      expect(testFixtures.contacts.length).toBeGreaterThan(0);
      
      testFixtures.contacts.forEach(contact => {
        expect(contact.email).toBeDefined();
        expect(contact.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(contact.firstName).toBeDefined();
        expect(contact.lastName).toBeDefined();
        expect(contact.preferences).toBeDefined();
        
        // Validate preferences JSON
        expect(() => JSON.parse(contact.preferences)).not.toThrow();
      });
    });

    it('should have valid campaign fixtures', () => {
      expect(testFixtures.campaigns.length).toBeGreaterThan(0);
      
      testFixtures.campaigns.forEach(campaign => {
        expect(campaign.name).toBeDefined();
        expect(campaign.type).toBeDefined();
        expect(campaign.status).toBeDefined();
        expect(['active', 'paused', 'completed', 'draft']).toContain(campaign.status);
        expect(campaign.configJson).toBeDefined();
        
        // Validate config JSON
        expect(() => JSON.parse(campaign.configJson)).not.toThrow();
      });
    });

    it('should have valid content version fixtures', () => {
      expect(testFixtures.contentVersions.length).toBeGreaterThan(0);
      
      testFixtures.contentVersions.forEach(content => {
        expect(content.title).toBeDefined();
        expect(content.mainContent).toBeDefined();
        expect(content.mainContent.length).toBeGreaterThan(10); // Reasonable content length
        expect(content.channel).toBeDefined();
        expect(['instagram', 'tiktok', 'youtube', 'twitter', 'facebook']).toContain(content.channel);
      });
    });

    it('should have valid CookAIng content version fixtures', () => {
      expect(testFixtures.cookaingContentVersions.length).toBeGreaterThan(0);
      
      testFixtures.cookaingContentVersions.forEach(content => {
        expect(content.title).toBeDefined();
        expect(content.mainContent).toBeDefined();
        expect(content.channel).toBeDefined();
        expect(content.metadataJson).toBeDefined();
        expect(content.payloadJson).toBeDefined();
        
        // Validate JSON fields
        expect(() => JSON.parse(content.metadataJson)).not.toThrow();
        expect(() => JSON.parse(content.payloadJson)).not.toThrow();
        
        // Validate metadata structure
        const metadata = JSON.parse(content.metadataJson);
        expect(metadata.niche).toBeDefined();
        expect(metadata.platform).toBeDefined();
        expect(metadata.tone).toBeDefined();
        
        // Validate payload structure
        const payload = JSON.parse(content.payloadJson);
        expect(payload.platformCaptions).toBeDefined();
        expect(typeof payload.platformCaptions).toBe('object');
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have unique email addresses across organizations', () => {
      const emails = testFixtures.organizations.map(org => org.email);
      const uniqueEmails = [...new Set(emails)];
      expect(emails.length).toBe(uniqueEmails.length);
    });

    it('should have unique email addresses across contacts', () => {
      const emails = testFixtures.contacts.map(contact => contact.email);
      const uniqueEmails = [...new Set(emails)];
      expect(emails.length).toBe(uniqueEmails.length);
    });

    it('should have campaign names that are descriptive', () => {
      testFixtures.campaigns.forEach(campaign => {
        expect(campaign.name.length).toBeGreaterThan(5);
        expect(campaign.name).not.toMatch(/^test\d*$/i); // Avoid generic test names
      });
    });

    it('should have content with appropriate metadata', () => {
      testFixtures.cookaingContentVersions.forEach(content => {
        const metadata = JSON.parse(content.metadataJson);
        
        // Niche should be relevant to content
        const niches = ['food', 'tech', 'beauty', 'fitness', 'travel', 'fashion', 'pets'];
        expect(niches).toContain(metadata.niche);
        
        // Platform should match channel
        expect(metadata.platform).toBe(content.channel);
        
        // Tone should be appropriate
        const tones = ['friendly', 'professional', 'casual', 'excited', 'informative'];
        expect(tones).toContain(metadata.tone);
      });
    });

    it('should have realistic AI evaluation scores', () => {
      testFixtures.cookaingContentVersions.forEach(content => {
        if (content.aiEvaluationScore !== null) {
          expect(content.aiEvaluationScore).toBeGreaterThanOrEqual(0);
          expect(content.aiEvaluationScore).toBeLessThanOrEqual(100);
        }
        
        if (content.userRating !== null) {
          expect(content.userRating).toBeGreaterThanOrEqual(1);
          expect(content.userRating).toBeLessThanOrEqual(5);
        }
      });
    });
  });

  describe('Platform-Specific Validations', () => {
    it('should have platform-appropriate content lengths', () => {
      testFixtures.cookaingContentVersions.forEach(content => {
        const payload = JSON.parse(content.payloadJson);
        
        Object.entries(payload.platformCaptions || {}).forEach(([platform, caption]) => {
          const captionText = caption as string;
          
          switch (platform) {
            case 'twitter':
              expect(captionText.length).toBeLessThanOrEqual(280);
              break;
            case 'instagram':
              expect(captionText.length).toBeLessThanOrEqual(2200);
              break;
            case 'tiktok':
              expect(captionText.length).toBeLessThanOrEqual(150);
              break;
            case 'youtube':
              expect(captionText.length).toBeLessThanOrEqual(5000);
              break;
          }
        });
      });
    });

    it('should include appropriate hashtags for social platforms', () => {
      testFixtures.cookaingContentVersions.forEach(content => {
        const payload = JSON.parse(content.payloadJson);
        
        ['instagram', 'twitter', 'tiktok'].forEach(platform => {
          if (payload.platformCaptions?.[platform]) {
            const caption = payload.platformCaptions[platform];
            
            // Should include at least one hashtag for social platforms
            expect(caption).toMatch(/#\w+/);
          }
        });
      });
    });
  });

  describe('Test Data Relationships', () => {
    it('should have contact preferences that make sense', () => {
      testFixtures.contacts.forEach(contact => {
        const preferences = JSON.parse(contact.preferences);
        
        if (preferences.diet) {
          expect(Array.isArray(preferences.diet)).toBe(true);
          const validDiets = ['vegan', 'vegetarian', 'keto', 'paleo', 'gluten-free', 'none'];
          preferences.diet.forEach((diet: string) => {
            expect(validDiets).toContain(diet);
          });
        }
        
        if (preferences.skill) {
          expect(['beginner', 'intermediate', 'advanced']).toContain(preferences.skill);
        }
        
        if (preferences.time) {
          expect(['quick', 'moderate', 'long']).toContain(preferences.time);
        }
      });
    });

    it('should have campaign configs with valid audience and objectives', () => {
      testFixtures.campaigns.forEach(campaign => {
        const config = JSON.parse(campaign.configJson);
        
        if (config.audience) {
          const validAudiences = ['general', 'millennials', 'gen-z', 'parents', 'professionals'];
          expect(validAudiences).toContain(config.audience);
        }
        
        if (config.objective) {
          const validObjectives = ['engagement', 'reach', 'conversions', 'brand-awareness'];
          expect(validObjectives).toContain(config.objective);
        }
      });
    });
  });
});