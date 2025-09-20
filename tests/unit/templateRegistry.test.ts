import { describe, it, expect } from 'vitest';
import { TEMPLATE_REGISTRY, getTemplate, PromoTemplate } from '../../packages/cookaing-promo/templateRegistry';
import { PromoObjective, Channel } from '../../packages/cookaing-promo/schemas';

describe('CookAIng Template Registry', () => {
  describe('TEMPLATE_REGISTRY structure', () => {
    const objectives: PromoObjective[] = [
      'feature_highlight', 'how_to_demo', 'user_scenario', 'before_after',
      'launch_announcement', 'new_feature_alert', 'newsletter', 'winback',
      'seo_article', 'deep_dive', 'comparison', 'testimonial_script',
      'explainer_script', 'ad_copy', 'challenge', 'quiz_poll', 'ugc_prompt'
    ];

    const channels: Channel[] = [
      'tiktok_reel', 'instagram_reel', 'x_thread', 'linkedin_post',
      'email', 'blog', 'ads_google', 'ads_meta', 'ads_tiktok'
    ];

    it('should have all objectives defined', () => {
      for (const objective of objectives) {
        expect(TEMPLATE_REGISTRY[objective]).toBeDefined();
        expect(typeof TEMPLATE_REGISTRY[objective]).toBe('object');
      }
    });

    it('should have all channels for each objective', () => {
      for (const objective of objectives) {
        for (const channel of channels) {
          expect(TEMPLATE_REGISTRY[objective][channel]).toBeDefined();
          expect(typeof TEMPLATE_REGISTRY[objective][channel]).toBe('object');
        }
      }
    });

    it('should have valid template structure', () => {
      const template = TEMPLATE_REGISTRY.feature_highlight.tiktok_reel;
      
      expect(template.hooks).toBeInstanceOf(Array);
      expect(template.hooks.length).toBeGreaterThan(0);
      expect(template.structure).toBeInstanceOf(Array);
      expect(template.structure.length).toBeGreaterThan(0);
      expect(template.ctas).toBeInstanceOf(Array);
      expect(template.ctas.length).toBeGreaterThan(0);
      expect(template.constraints).toBeDefined();
      expect(typeof template.constraints).toBe('object');
    });

    it('should have valid constraints for each template', () => {
      for (const objective of objectives) {
        for (const channel of channels) {
          const template = TEMPLATE_REGISTRY[objective][channel];
          const constraints = template.constraints;
          
          expect(constraints).toBeDefined();
          
          if (constraints.maxWords) {
            expect(typeof constraints.maxWords).toBe('number');
            expect(constraints.maxWords).toBeGreaterThan(0);
          }
          
          if (constraints.maxCharacters) {
            expect(typeof constraints.maxCharacters).toBe('number');
            expect(constraints.maxCharacters).toBeGreaterThan(0);
          }
          
          if (constraints.format) {
            expect(typeof constraints.format).toBe('string');
            expect(constraints.format.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('should have appropriate hooks for CookAIng context', () => {
      const template = TEMPLATE_REGISTRY.feature_highlight.tiktok_reel;
      const hooks = template.hooks;
      
      // Should contain CookAIng branding
      expect(hooks.some(hook => hook.toLowerCase().includes('cookaing'))).toBe(true);
      
      // Should be engaging for TikTok
      expect(hooks.every(hook => hook.length > 10)).toBe(true);
    });

    it('should have logical structure elements', () => {
      const template = TEMPLATE_REGISTRY.feature_highlight.instagram_reel;
      const structure = template.structure;
      
      expect(structure.some(item => item.toLowerCase().includes('hook'))).toBe(true);
      expect(structure.some(item => item.toLowerCase().includes('cta'))).toBe(true);
    });

    it('should have appropriate CTAs', () => {
      const template = TEMPLATE_REGISTRY.feature_highlight.email;
      const ctas = template.ctas;
      
      expect(ctas.every(cta => typeof cta === 'string')).toBe(true);
      expect(ctas.every(cta => cta.length > 0)).toBe(true);
      
      // Should be action-oriented
      const actionWords = ['try', 'get', 'start', 'download', 'learn', 'sign'];
      expect(ctas.some(cta => 
        actionWords.some(word => cta.toLowerCase().includes(word))
      )).toBe(true);
    });
  });

  describe('getTemplate function', () => {
    it('should return template for valid objective and channel', () => {
      const template = getTemplate('feature_highlight', 'tiktok_reel');
      
      expect(template).toBeDefined();
      expect(template.hooks).toBeInstanceOf(Array);
      expect(template.structure).toBeInstanceOf(Array);
      expect(template.ctas).toBeInstanceOf(Array);
      expect(template.constraints).toBeDefined();
    });

    it('should return different templates for different channels', () => {
      const tiktokTemplate = getTemplate('feature_highlight', 'tiktok_reel');
      const emailTemplate = getTemplate('feature_highlight', 'email');
      
      expect(tiktokTemplate).not.toEqual(emailTemplate);
      
      // TikTok should have shorter constraints
      if (tiktokTemplate.constraints.maxWords && emailTemplate.constraints.maxWords) {
        expect(tiktokTemplate.constraints.maxWords).toBeLessThan(emailTemplate.constraints.maxWords);
      }
    });

    it('should return different templates for different objectives', () => {
      const featureTemplate = getTemplate('feature_highlight', 'tiktok_reel');
      const demoTemplate = getTemplate('how_to_demo', 'tiktok_reel');
      
      expect(featureTemplate).not.toEqual(demoTemplate);
    });

    it('should handle all valid combinations', () => {
      const objectives: PromoObjective[] = ['feature_highlight', 'how_to_demo', 'user_scenario'];
      const channels: Channel[] = ['tiktok_reel', 'instagram_reel', 'email'];
      
      for (const objective of objectives) {
        for (const channel of channels) {
          expect(() => getTemplate(objective, channel)).not.toThrow();
          const template = getTemplate(objective, channel);
          expect(template).toBeDefined();
        }
      }
    });
  });

  describe('Channel-specific constraints', () => {
    it('should have appropriate word limits for social media', () => {
      const tiktokTemplate = getTemplate('feature_highlight', 'tiktok_reel');
      const instagramTemplate = getTemplate('feature_highlight', 'instagram_reel');
      const xTemplate = getTemplate('feature_highlight', 'x_thread');
      
      // Social media should have lower word counts
      expect(tiktokTemplate.constraints.maxWords).toBeLessThanOrEqual(50);
      expect(instagramTemplate.constraints.maxWords).toBeLessThanOrEqual(50);
      
      if (xTemplate.constraints.maxWords) {
        expect(xTemplate.constraints.maxWords).toBeGreaterThan(100); // Threads can be longer
      }
    });

    it('should have appropriate formats for each channel', () => {
      const blogTemplate = getTemplate('seo_article', 'blog');
      const emailTemplate = getTemplate('newsletter', 'email');
      const adTemplate = getTemplate('ad_copy', 'ads_meta');
      
      expect(blogTemplate.constraints.format).toMatch(/blog|article/i);
      expect(emailTemplate.constraints.format).toMatch(/email/i);
      expect(adTemplate.constraints.format).toMatch(/ad/i);
    });
  });

  describe('Template content quality', () => {
    it('should avoid banned Spartan words in hooks', () => {
      const bannedWords = [
        'can', 'may', 'just', 'that', 'very', 'really', 'literally', 'actually',
        'certainly', 'probably', 'basically', 'could', 'maybe', 'delve', 'embark',
        'enlightening', 'esteemed', 'imagine', 'game-changer', 'unlock', 'discover',
        'skyrocket', 'revolutionize', 'disruptive', 'utilize', 'tapestry', 'illuminate',
        'unveil', 'pivotal', 'enrich', 'intricate', 'elucidate', 'hence', 'furthermore',
        'however', 'harness', 'exciting', 'groundbreaking', 'remarkable', 'navigating',
        'powerful', 'inquiries', 'ever-evolving'
      ];
      
      const template = getTemplate('feature_highlight', 'tiktok_reel');
      const allHooks = template.hooks.join(' ').toLowerCase();
      
      for (const bannedWord of bannedWords) {
        // Use word boundary matching to avoid false positives like "very" in "everything"
        const wordRegex = new RegExp(`\\b${bannedWord}\\b`, 'i');
        expect(allHooks).not.toMatch(wordRegex);
      }
    });

    it('should use active voice in structure elements', () => {
      const template = getTemplate('how_to_demo', 'instagram_reel');
      const structure = template.structure;
      
      // Check for active voice indicators and avoid passive voice
      const passiveIndicators = ['is shown', 'are displayed', 'will be', 'have been'];
      const allStructure = structure.join(' ').toLowerCase();
      
      for (const passive of passiveIndicators) {
        expect(allStructure).not.toContain(passive);
      }
    });

    it('should be CookAIng-specific, not generic', () => {
      const template = getTemplate('feature_highlight', 'email');
      const content = [...template.hooks, ...template.structure, ...template.ctas].join(' ');
      
      expect(content.toLowerCase()).toContain('cookaing');
      expect(content.toLowerCase()).toMatch(/(cooking|meal|recipe|kitchen|food)/);
    });
  });
});