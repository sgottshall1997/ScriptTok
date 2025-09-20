import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { PromoInputType } from '../../packages/cookaing-promo/schemas';

// Mock the OpenAI module since we don't want to make real API calls in tests
vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() => Promise.resolve({
          choices: [{
            message: {
              content: 'CookAIng helps families plan meals faster. Save hours each week. Try CookAIng today.'
            }
          }]
        }))
      }
    }
  }))
}));

describe('CookAIng Promo API Integration Tests', () => {
  let app: express.Application;
  let server: any;
  
  const mockValidInput: PromoInputType = {
    appName: 'CookAIng',
    audiencePersona: 'busy working parents',
    keyBenefits: ['save time on meal planning', 'healthier family meals'],
    features: ['AI meal suggestions', 'grocery list automation'],
    channels: ['tiktok_reel'],
    objective: 'feature_highlight',
    ctaUrl: 'https://cookaing.com/signup',
    campaign: 'test-integration'
  };

  beforeAll(async () => {
    // Import and set up the server
    const serverModule = await import('../../server/index');
    app = serverModule.default || serverModule.app;
    
    // Start server if needed
    if (!server) {
      server = app.listen(0); // Use random port for testing
    }
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('POST /api/cookaing-promo/generate', () => {
    it('should generate promo content successfully', async () => {
      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(mockValidInput)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const promoOutput = response.body.data[0];
      expect(promoOutput).toHaveProperty('id');
      expect(promoOutput).toHaveProperty('timestamp');
      expect(promoOutput).toHaveProperty('appName', 'CookAIng');
      expect(promoOutput).toHaveProperty('objective', 'feature_highlight');
      expect(promoOutput).toHaveProperty('channel', 'tiktok_reel');
      expect(promoOutput).toHaveProperty('body');
      expect(promoOutput).toHaveProperty('cta');
      expect(promoOutput).toHaveProperty('metadata');
    });

    it('should validate required fields', async () => {
      const invalidInput = {
        // Missing required fields
        appName: 'CookAIng',
        audiencePersona: 'busy parents'
      };

      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(invalidInput)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/validation|required/i);
    });

    it('should handle invalid channel values', async () => {
      const invalidInput = {
        ...mockValidInput,
        channels: ['invalid_channel']
      };

      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(invalidInput)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid objective values', async () => {
      const invalidInput = {
        ...mockValidInput,
        objective: 'invalid_objective'
      };

      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(invalidInput)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid URL format', async () => {
      const invalidInput = {
        ...mockValidInput,
        ctaUrl: 'not-a-valid-url'
      };

      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(invalidInput)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/url|invalid/i);
    });

    it('should generate content for multiple channels', async () => {
      const multiChannelInput = {
        ...mockValidInput,
        channels: ['tiktok_reel', 'instagram_reel', 'email']
      };

      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(multiChannelInput)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      
      const channels = response.body.data.map((item: any) => item.channel);
      expect(channels).toContain('tiktok_reel');
      expect(channels).toContain('instagram_reel');
      expect(channels).toContain('email');
    });

    it('should include proper UTM tracking', async () => {
      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(mockValidInput)
        .expect(200);

      const promoOutput = response.body.data[0];
      expect(promoOutput.cta.utmUrl).toContain('utm_source=');
      expect(promoOutput.cta.utmUrl).toContain('utm_medium=');
      expect(promoOutput.cta.utmUrl).toContain('utm_campaign=');
      expect(promoOutput.cta.utmUrl).toContain('test-integration');
    });

    it('should handle optional fields correctly', async () => {
      const inputWithOptionals = {
        ...mockValidInput,
        tone: 'expert' as const,
        offer: '30% off premium features',
        proofPoints: ['used by 50,000+ families'],
        seedTopic: 'meal prep automation',
        brandGuidelines: 'Use warm, friendly tone'
      };

      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(inputWithOptionals)
        .expect(200);

      const promoOutput = response.body.data[0];
      expect(promoOutput.metadata.tone).toBe('expert');
    });

    it('should return consistent data structure', async () => {
      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(mockValidInput)
        .expect(200);

      const promoOutput = response.body.data[0];
      
      // Required fields
      expect(typeof promoOutput.id).toBe('string');
      expect(typeof promoOutput.timestamp).toBe('string');
      expect(promoOutput.appName).toBe('CookAIng');
      expect(typeof promoOutput.objective).toBe('string');
      expect(typeof promoOutput.channel).toBe('string');
      expect(typeof promoOutput.body).toBe('string');
      
      // CTA object structure
      expect(promoOutput.cta).toHaveProperty('text');
      expect(promoOutput.cta).toHaveProperty('url');
      expect(promoOutput.cta).toHaveProperty('utmUrl');
      expect(typeof promoOutput.cta.text).toBe('string');
      expect(typeof promoOutput.cta.url).toBe('string');
      expect(typeof promoOutput.cta.utmUrl).toBe('string');
      
      // Metadata structure
      expect(promoOutput.metadata).toHaveProperty('persona');
      expect(promoOutput.metadata).toHaveProperty('tone');
      expect(promoOutput.metadata).toHaveProperty('featuresUsed');
      expect(promoOutput.metadata).toHaveProperty('benefitsUsed');
      expect(Array.isArray(promoOutput.metadata.featuresUsed)).toBe(true);
      expect(Array.isArray(promoOutput.metadata.benefitsUsed)).toBe(true);
    });

    it('should handle rate limiting gracefully', async () => {
      // Make multiple rapid requests
      const requests = Array.from({ length: 10 }, () => 
        request(app)
          .post('/api/cookaing-promo/generate')
          .send(mockValidInput)
      );

      const responses = await Promise.allSettled(requests);
      
      // Should either succeed or rate limit gracefully
      responses.forEach(result => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          expect([200, 429]).toContain(response.status);
        }
      });
    });

    it('should validate appName is exactly "CookAIng"', async () => {
      const invalidAppNames = [
        { ...mockValidInput, appName: 'cookaing' },
        { ...mockValidInput, appName: 'CookAing' },
        { ...mockValidInput, appName: 'Cook AIng' },
        { ...mockValidInput, appName: 'COOKAING' }
      ];

      for (const invalidInput of invalidAppNames) {
        const response = await request(app)
          .post('/api/cookaing-promo/generate')
          .send(invalidInput)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle oversized payloads', async () => {
      const oversizedInput = {
        ...mockValidInput,
        audiencePersona: 'A'.repeat(10000), // Very long string
        keyBenefits: Array.from({ length: 1000 }, () => 'benefit'),
        features: Array.from({ length: 1000 }, () => 'feature')
      };

      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(oversizedInput);

      // Should either process or reject gracefully
      expect([200, 400, 413]).toContain(response.status);
    });

    it('should handle AI service failures gracefully', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = vi.mocked(
        await import('openai')
      ).OpenAI;
      
      mockOpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: vi.fn(() => Promise.reject(new Error('OpenAI API error')))
          }
        }
      }) as any);

      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(mockValidInput);

      // Should handle error gracefully
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 500) {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Content Quality Validation', () => {
    it('should produce Spartan-compliant content', async () => {
      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(mockValidInput)
        .expect(200);

      const promoOutput = response.body.data[0];
      const body = promoOutput.body.toLowerCase();
      
      // Should not contain banned Spartan words
      const bannedWords = ['can', 'really', 'very', 'amazing', 'incredible', 'revolutionize'];
      bannedWords.forEach(word => {
        expect(body).not.toContain(word);
      });
      
      // Should not contain emojis
      expect(promoOutput.body).not.toMatch(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu);
      
      // Should not contain asterisks
      expect(promoOutput.body).not.toContain('*');
    });

    it('should respect word count constraints', async () => {
      const channels = [
        { channel: 'tiktok_reel', maxWords: 50 },
        { channel: 'instagram_reel', maxWords: 50 },
        { channel: 'email', maxWords: 200 }
      ];

      for (const { channel, maxWords } of channels) {
        const input = {
          ...mockValidInput,
          channels: [channel as any]
        };

        const response = await request(app)
          .post('/api/cookaing-promo/generate')
          .send(input)
          .expect(200);

        const promoOutput = response.body.data[0];
        const wordCount = promoOutput.body.split(/\s+/).length;
        
        expect(wordCount).toBeLessThanOrEqual(maxWords + 10); // Allow small buffer
      }
    });

    it('should include CookAIng branding consistently', async () => {
      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(mockValidInput)
        .expect(200);

      const promoOutput = response.body.data[0];
      
      // Should contain correct brand name
      expect(promoOutput.body).toContain('CookAIng');
      
      // Should not contain incorrect variations
      expect(promoOutput.body).not.toContain('cookaing');
      expect(promoOutput.body).not.toContain('CookAing');
      expect(promoOutput.body).not.toContain('Cook AIng');
    });
  });

  describe('Content History Integration', () => {
    it('should store generated content in history', async () => {
      const response = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(mockValidInput)
        .expect(200);

      // Get content history
      const historyResponse = await request(app)
        .get('/api/content-history')
        .expect(200);

      expect(Array.isArray(historyResponse.body.data)).toBe(true);
      
      // Should contain our generated content
      const generatedId = response.body.data[0].id;
      const historyItem = historyResponse.body.data.find(
        (item: any) => item.id === generatedId
      );
      
      expect(historyItem).toBeDefined();
      expect(historyItem.appName).toBe('CookAIng');
      expect(historyItem.objective).toBe('feature_highlight');
    });

    it('should support content retrieval by ID', async () => {
      const generateResponse = await request(app)
        .post('/api/cookaing-promo/generate')
        .send(mockValidInput)
        .expect(200);

      const contentId = generateResponse.body.data[0].id;

      const retrieveResponse = await request(app)
        .get(`/api/content-history/${contentId}`)
        .expect(200);

      expect(retrieveResponse.body.data).toEqual(generateResponse.body.data[0]);
    });
  });
});