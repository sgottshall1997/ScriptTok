import { describe, it, expect } from 'vitest';
import { normalizeSpartanText } from '../../packages/cookaing-promo/utils/normalize';
import { buildChannelPrompt } from '../../packages/cookaing-promo/promptFactory';
import { PromoInputType } from '../../packages/cookaing-promo/schemas';

describe('Spartan Format Parity with GlowBot', () => {
  /**
   * Test that CookAIng Spartan format matches GlowBot's exact standards
   * This ensures consistency across both applications
   */
  
  describe('Banned Words Enforcement', () => {
    const spartanBannedWords = [
      'can', 'may', 'just', 'that', 'very', 'really', 'literally', 'actually',
      'certainly', 'probably', 'basically', 'could', 'maybe', 'delve', 'embark',
      'enlightening', 'esteemed', 'imagine', 'game-changer', 'unlock', 'discover',
      'skyrocket', 'revolutionize', 'disruptive', 'utilize', 'tapestry', 'illuminate',
      'unveil', 'pivotal', 'enrich', 'intricate', 'elucidate', 'hence', 'furthermore',
      'however', 'harness', 'exciting', 'groundbreaking', 'remarkable', 'navigating',
      'powerful', 'inquiries', 'ever-evolving'
    ];

    it('should remove all banned Spartan words (matching GlowBot)', () => {
      spartanBannedWords.forEach(bannedWord => {
        const testText = `CookAIng ${bannedWord} helps families cook better meals`;
        const result = normalizeSpartanText(testText);
        
        expect(result.toLowerCase()).not.toContain(bannedWord.toLowerCase());
      });
    });

    it('should handle banned words in different cases', () => {
      const testCases = [
        'CookAIng Can help you',
        'CookAIng CAN help you', 
        'CookAIng REALLY works',
        'This BASICALLY works',
        'UNLOCK amazing results'
      ];

      testCases.forEach(testText => {
        const result = normalizeSpartanText(testText);
        
        spartanBannedWords.forEach(bannedWord => {
          expect(result.toLowerCase()).not.toContain(bannedWord.toLowerCase());
        });
      });
    });

    it('should not remove partial word matches', () => {
      // "can" should be removed but "cantaloupe" should remain
      const text = 'CookAIng can suggest cantaloupe recipes';
      const result = normalizeSpartanText(text);
      
      expect(result.toLowerCase()).not.toContain(' can ');
      expect(result.toLowerCase()).toContain('cantaloupe');
    });
  });

  describe('Format Rules Enforcement', () => {
    it('should remove emojis (matching GlowBot standard)', () => {
      const textWithEmojis = 'CookAIng helps families 🍽️ prepare meals 🚀 quickly 💪';
      const result = normalizeSpartanText(textWithEmojis);
      
      expect(result).not.toContain('🍽️');
      expect(result).not.toContain('🚀'); 
      expect(result).not.toContain('💪');
      expect(result).toContain('CookAIng helps families');
      expect(result).toContain('prepare meals');
      expect(result).toContain('quickly');
    });

    it('should remove asterisks and formatting (matching GlowBot)', () => {
      const textWithFormatting = 'CookAIng helps *families* prepare **amazing** meals ***quickly***';
      const result = normalizeSpartanText(textWithFormatting);
      
      expect(result).not.toContain('*');
      expect(result).toContain('CookAIng helps families prepare meals');
    });

    it('should remove setup phrases (matching GlowBot)', () => {
      const setupPhrases = [
        'in summary',
        'in conclusion', 
        'to summarize',
        'in other words',
        'that said',
        'with that being said'
      ];

      setupPhrases.forEach(phrase => {
        const text = `${phrase}, CookAIng helps families cook better`;
        const result = normalizeSpartanText(text);
        
        expect(result.toLowerCase()).not.toContain(phrase.toLowerCase());
        expect(result).toContain('CookAIng helps families cook better');
      });
    });

    it('should clean up extra whitespace consistently', () => {
      const messyText = 'CookAIng   helps    families     prepare meals';
      const result = normalizeSpartanText(messyText);
      
      expect(result).toBe('CookAIng helps families prepare meals');
      expect(result).not.toMatch(/\s{2,}/); // No double spaces
    });
  });

  describe('Prompt Generation Parity', () => {
    const mockInput: PromoInputType = {
      appName: 'CookAIng',
      audiencePersona: 'busy working parents',
      keyBenefits: ['save time on meal planning', 'healthier family meals'],
      features: ['AI meal suggestions', 'grocery list automation'],
      channels: ['tiktok_reel'],
      objective: 'feature_highlight',
      ctaUrl: 'https://cookaing.com/signup',
      campaign: 'summer-launch'
    };

    it('should generate prompts with Spartan system instructions (matching GlowBot)', () => {
      const prompt = buildChannelPrompt(mockInput, 'tiktok_reel');
      
      // Should contain Spartan format instructions
      expect(prompt.toLowerCase()).toContain('spartan');
      
      // Should mention banned words
      expect(prompt.toLowerCase()).toContain('banned');
      expect(prompt.toLowerCase()).toContain('forbidden');
      
      // Should emphasize direct language
      expect(prompt.toLowerCase()).toContain('direct');
      expect(prompt.toLowerCase()).toContain('simple');
      expect(prompt.toLowerCase()).toContain('active voice');
      
      // Should prohibit emojis
      expect(prompt.toLowerCase()).toContain('no emojis');
    });

    it('should include word count constraints in prompts', () => {
      const channels = ['tiktok_reel', 'instagram_reel', 'x_thread', 'email'] as const;
      
      channels.forEach(channel => {
        const prompt = buildChannelPrompt(mockInput, channel);
        
        // Should contain word count guidance
        expect(prompt).toMatch(/\d+\s*words?/i);
        expect(prompt.toLowerCase()).toContain('word');
      });
    });

    it('should enforce brand consistency in prompts', () => {
      const prompt = buildChannelPrompt(mockInput, 'email');
      
      // Should always reference CookAIng correctly
      expect(prompt).toContain('CookAIng');
      expect(prompt).not.toContain('cookaing');
      expect(prompt).not.toContain('CookAing');
      expect(prompt).not.toContain('Cook AIng');
    });
  });

  describe('Output Format Consistency', () => {
    it('should produce clean, direct sentences', () => {
      const fluffyInput = 'CookAIng is absolutely the most amazing cooking app that will totally revolutionize your kitchen experience and unlock incredible meal planning capabilities!';
      const result = normalizeSpartanText(fluffyInput);
      
      // Should be significantly shorter
      expect(result.length).toBeLessThan(fluffyInput.length * 0.7);
      
      // Should maintain core message
      expect(result.toLowerCase()).toContain('cookaing');
      expect(result.toLowerCase()).toContain('cooking');
      expect(result.toLowerCase()).toContain('meal planning');
      
      // Should remove fluff
      expect(result.toLowerCase()).not.toContain('absolutely');
      expect(result.toLowerCase()).not.toContain('most amazing');
      expect(result.toLowerCase()).not.toContain('totally');
      expect(result.toLowerCase()).not.toContain('revolutionize');
      expect(result.toLowerCase()).not.toContain('unlock');
      expect(result.toLowerCase()).not.toContain('incredible');
    });

    it('should preserve factual information while removing fluff', () => {
      const factsWithFluff = 'CookAIng is an absolutely incredible app that basically saves users 2.5 hours per week and really costs just $9.99/month';
      const result = normalizeSpartanText(factsWithFluff);
      
      // Should preserve specific facts
      expect(result).toContain('2.5 hours');
      expect(result).toContain('$9.99');
      expect(result).toContain('per week');
      expect(result).toContain('per month');
      expect(result).toContain('CookAIng');
      
      // Should remove fluff words
      expect(result.toLowerCase()).not.toContain('absolutely');
      expect(result.toLowerCase()).not.toContain('incredible');
      expect(result.toLowerCase()).not.toContain('basically');
      expect(result.toLowerCase()).not.toContain('really');
      expect(result.toLowerCase()).not.toContain('just');
    });

    it('should handle active voice conversion', () => {
      const passiveText = 'Meals are planned by CookAIng. Recipes are suggested automatically. Shopping lists are generated by the AI.';
      const result = normalizeSpartanText(passiveText);
      
      // Should be converted to active voice patterns
      // Note: This is a complex transformation, so we check for active patterns
      expect(result.toLowerCase()).toContain('cookaing');
      
      // Should avoid passive voice indicators
      expect(result.split('are planned').length).toBe(1); // Should not contain "are planned"
      expect(result.split('are suggested').length).toBe(1); // Should not contain "are suggested"
      expect(result.split('are generated').length).toBe(1); // Should not contain "are generated"
    });
  });

  describe('Cross-Channel Consistency', () => {
    const testInput: PromoInputType = {
      appName: 'CookAIng',
      audiencePersona: 'home cooks',
      keyBenefits: ['quick meal planning'],
      features: ['recipe suggestions'],
      channels: ['tiktok_reel'],
      objective: 'feature_highlight',
      ctaUrl: 'https://cookaing.com',
      campaign: 'test'
    };

    it('should apply same Spartan rules across all channels', () => {
      const channels = ['tiktok_reel', 'instagram_reel', 'x_thread', 'email', 'blog'] as const;
      
      channels.forEach(channel => {
        const prompt = buildChannelPrompt(testInput, channel);
        
        // All should contain Spartan instructions
        expect(prompt.toLowerCase()).toContain('spartan');
        expect(prompt.toLowerCase()).toContain('active voice');
        expect(prompt.toLowerCase()).toContain('no emojis');
        
        // All should ban same words
        expect(prompt.toLowerCase()).toContain('banned');
        expect(prompt.toLowerCase()).toContain('can');
        expect(prompt.toLowerCase()).toContain('revolutionize');
      });
    });

    it('should maintain word count discipline per channel', () => {
      const channels = [
        { channel: 'tiktok_reel' as const, maxWords: 50 },
        { channel: 'instagram_reel' as const, maxWords: 50 },
        { channel: 'x_thread' as const, maxWords: 1680 },
        { channel: 'email' as const, maxWords: 200 },
        { channel: 'blog' as const, maxWords: 1000 }
      ];
      
      channels.forEach(({ channel, maxWords }) => {
        const prompt = buildChannelPrompt(testInput, channel);
        
        // Should contain word count constraint
        const wordCountMatch = prompt.match(/(\d+)\s*words?/i);
        expect(wordCountMatch).toBeTruthy();
        
        if (wordCountMatch) {
          const promptWordLimit = parseInt(wordCountMatch[1]);
          expect(promptWordLimit).toBeLessThanOrEqual(maxWords);
        }
      });
    });
  });

  describe('GlowBot-CookAIng Spartan Compliance', () => {
    it('should match GlowBot banned word list exactly', () => {
      // Test that we're using the same banned words as GlowBot
      const glowBotBannedWords = [
        'can', 'may', 'just', 'that', 'very', 'really', 'literally', 'actually',
        'certainly', 'probably', 'basically', 'could', 'maybe', 'delve', 'embark',
        'enlightening', 'esteemed', 'imagine', 'game-changer', 'unlock', 'discover',
        'skyrocket', 'revolutionize', 'disruptive', 'utilize', 'tapestry', 'illuminate',
        'unveil', 'pivotal', 'enrich', 'intricate', 'elucidate', 'hence', 'furthermore',
        'however', 'harness', 'exciting', 'groundbreaking', 'remarkable', 'navigating',
        'powerful', 'inquiries', 'ever-evolving'
      ];
      
      const testSentence = glowBotBannedWords.join(' ') + ' CookAIng helps families cook';
      const result = normalizeSpartanText(testSentence);
      
      // Should remove all GlowBot banned words
      glowBotBannedWords.forEach(word => {
        expect(result.toLowerCase()).not.toContain(word);
      });
      
      // Should preserve core content
      expect(result.toLowerCase()).toContain('cookaing helps families cook');
    });

    it('should produce output matching GlowBot Spartan quality standards', () => {
      const testCases = [
        {
          input: 'CookAIng is basically an amazing app that can really help you unlock incredible cooking potential!',
          expectedCharacteristics: ['short', 'direct', 'factual', 'no superlatives']
        },
        {
          input: 'Furthermore, CookAIng utilizes cutting-edge AI technology that will revolutionize your meal planning experience.',
          expectedCharacteristics: ['active voice', 'simple language', 'no setup phrases']
        },
        {
          input: '🚀 This groundbreaking app is absolutely game-changing for busy families! ⭐',
          expectedCharacteristics: ['no emojis', 'no exaggeration', 'factual only']
        }
      ];
      
      testCases.forEach(({ input, expectedCharacteristics }) => {
        const result = normalizeSpartanText(input);
        
        // Should be significantly cleaned up
        expect(result.length).toBeLessThan(input.length);
        
        // Should maintain core brand message
        expect(result.toLowerCase()).toContain('cookaing');
        
        // Should be free of problematic elements
        expect(result).not.toMatch(/[🚀⭐🍽️💪]/);
        expect(result).not.toContain('*');
        expect(result.toLowerCase()).not.toMatch(/\b(basically|really|amazing|incredible|furthermore|utilize|revolutionize|groundbreaking|absolutely|game-changing)\b/);
      });
    });
  });
});