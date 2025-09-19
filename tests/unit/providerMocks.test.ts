/**
 * Unit Tests - Provider Mocks
 * Tests for deterministic mock provider behavior
 */

import { describe, it, expect } from 'vitest';
import { providerMocks } from '../../client/src/cookaing-marketing/testing/providerMocks';

describe('Provider Mocks - Deterministic Behavior', () => {
  describe('Content Generation Providers', () => {
    it('should generate consistent content for same inputs', () => {
      const niche = 'food';
      const platform = 'instagram';
      const tone = 'friendly';
      
      // Generate content multiple times with same inputs
      const result1 = providerMocks.contentGeneration.generateContent(niche, platform, tone);
      const result2 = providerMocks.contentGeneration.generateContent(niche, platform, tone);
      
      expect(result1).toEqual(result2);
      expect(result1.content).toContain('food');
      expect(result1.platformCaptions.instagram).toBeDefined();
    });

    it('should generate different content for different inputs', () => {
      const result1 = providerMocks.contentGeneration.generateContent('food', 'instagram', 'friendly');
      const result2 = providerMocks.contentGeneration.generateContent('tech', 'tiktok', 'professional');
      
      expect(result1).not.toEqual(result2);
      expect(result1.content).not.toBe(result2.content);
    });
  });

  describe('Intelligence Providers', () => {
    it('should provide consistent competitor analysis', () => {
      const niche = 'fitness';
      const platform = 'youtube';
      
      const analysis1 = providerMocks.intelligence.competitor.analyzeCompetitors(niche, platform);
      const analysis2 = providerMocks.intelligence.competitor.analyzeCompetitors(niche, platform);
      
      expect(analysis1).toEqual(analysis2);
      expect(analysis1.competitors).toHaveLength(3);
      expect(analysis1.competitors[0].engagementRate).toBeTypeOf('number');
    });

    it('should provide consistent sentiment analysis', () => {
      const niche = 'beauty';
      const platform = 'instagram';
      
      const sentiment1 = providerMocks.intelligence.sentiment.analyzeSentiment(niche, platform);
      const sentiment2 = providerMocks.intelligence.sentiment.analyzeSentiment(niche, platform);
      
      expect(sentiment1).toEqual(sentiment2);
      expect(sentiment1.sentiment).toBe('positive');
      expect(sentiment1.score).toBeGreaterThan(0.75);
      expect(sentiment1.score).toBeLessThan(0.95);
    });

    it('should provide consistent viral scores', () => {
      const contentType = 'reel';
      const platform = 'instagram';
      
      const viral1 = providerMocks.intelligence.viral.calculateViralScore(contentType, platform);
      const viral2 = providerMocks.intelligence.viral.calculateViralScore(contentType, platform);
      
      expect(viral1).toEqual(viral2);
      expect(viral1.score).toBeGreaterThanOrEqual(70);
      expect(viral1.score).toBeLessThanOrEqual(100);
      expect(viral1.factors.timing).toBeTypeOf('number');
    });

    it('should provide consistent fatigue analysis', () => {
      const topics = ['recipe', 'cooking', 'food'];
      
      const fatigue1 = providerMocks.intelligence.fatigue.calculateFatigue(topics);
      const fatigue2 = providerMocks.intelligence.fatigue.calculateFatigue(topics);
      
      expect(fatigue1).toEqual(fatigue2);
      expect(fatigue1.fatigueLevel).toBeGreaterThanOrEqual(0);
      expect(fatigue1.fatigueLevel).toBeLessThanOrEqual(0.3);
    });
  });

  describe('Social Automation Providers', () => {
    it('should provide consistent hashtag suggestions', () => {
      const niche = 'travel';
      const platform = 'instagram';
      
      const hashtags1 = providerMocks.social.hashtags.suggestHashtags(niche, platform);
      const hashtags2 = providerMocks.social.hashtags.suggestHashtags(niche, platform);
      
      expect(hashtags1).toEqual(hashtags2);
      expect(hashtags1.suggestions).toHaveLength(4);
      expect(hashtags1.suggestions[0].tag).toContain('#travel');
    });

    it('should provide consistent timing recommendations', () => {
      const platform = 'tiktok';
      const niche = 'fitness';
      
      const timing1 = providerMocks.social.timing.getOptimalTimes(platform, niche);
      const timing2 = providerMocks.social.timing.getOptimalTimes(platform, niche);
      
      expect(timing1).toEqual(timing2);
      expect(timing1.recommendations).toHaveLength(4);
      expect(timing1.recommendations[0].dayOfWeek).toBeDefined();
    });

    it('should provide consistent publishing automation', () => {
      const platform = 'instagram';
      const niche = 'food';
      const content = 'Delicious pasta recipe!';
      
      const publish1 = providerMocks.social.publishing.schedulePost(platform, niche, content);
      const publish2 = providerMocks.social.publishing.schedulePost(platform, niche, content);
      
      expect(publish1).toEqual(publish2);
      expect(publish1.postId).toContain('mock-instagram');
      expect(publish1.url).toContain('instagram.com');
      expect(publish1.status).toBe('scheduled');
    });
  });

  describe('Personalization Providers', () => {
    it('should provide consistent personalization insights', () => {
      const userId = 'user123';
      const niche = 'tech';
      const platform = 'youtube';
      
      const insights1 = providerMocks.personalization.insights.getPersonalizationInsights(userId, niche, platform);
      const insights2 = providerMocks.personalization.insights.getPersonalizationInsights(userId, niche, platform);
      
      expect(insights1).toEqual(insights2);
      expect(insights1.confidence).toBeGreaterThan(0.8);
      expect(insights1.recommendations).toContain('tech');
    });

    it('should provide consistent A/B test results', () => {
      const metrics = { clicks: 100, impressions: 1000 };
      
      const abTest1 = providerMocks.personalization.abTesting.analyzeResults(metrics);
      const abTest2 = providerMocks.personalization.abTesting.analyzeResults(metrics);
      
      expect(abTest1).toEqual(abTest2);
      expect(abTest1.winner).toBeDefined();
      expect(abTest1.confidence).toBeGreaterThan(0.8);
    });
  });
});

describe('Provider Mocks - Hash Function Behavior', () => {
  it('should produce consistent outputs for same inputs', () => {
    // Test the underlying hash function behavior
    const input = 'test-input-123';
    
    // Since we can't directly access hashInput, test through provider outputs
    const result1 = providerMocks.intelligence.sentiment.analyzeSentiment('food', 'instagram');
    const result2 = providerMocks.intelligence.sentiment.analyzeSentiment('food', 'instagram');
    
    expect(result1.score).toBe(result2.score);
    expect(result1.insights.topEmotions).toEqual(result2.insights.topEmotions);
  });

  it('should produce different outputs for different inputs', () => {
    const result1 = providerMocks.intelligence.sentiment.analyzeSentiment('food', 'instagram');
    const result2 = providerMocks.intelligence.sentiment.analyzeSentiment('tech', 'youtube');
    
    expect(result1.score).not.toBe(result2.score);
    expect(result1.insights.trends).not.toBe(result2.insights.trends);
  });
});