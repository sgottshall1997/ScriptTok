/**
 * Intelligence Service - Orchestrates competitor analysis and sentiment providers
 */
import { ProviderFactory } from './providers';
import type { 
  CompetitorPost,
  SentimentSnapshot,
  ApiResponse 
} from '../types/ext';

export class IntelligenceService {
  private providers = ProviderFactory.getProviders();

  // Competitor Analysis
  async fetchCompetitorPosts(platform: string, competitor: string, limit = 10): Promise<ApiResponse<CompetitorPost[]>> {
    try {
      const posts = await this.providers.competitor.fetchPosts(platform, competitor, limit);
      return {
        success: true,
        data: posts,
        mode: 'mock', // Currently mock only
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Competitor analysis failed',
        mode: 'mock',
      };
    }
  }

  async analyzeCompetitorTrends(posts: CompetitorPost[]): Promise<ApiResponse<any>> {
    try {
      const trends = await this.providers.competitor.analyzeTrends(posts);
      return {
        success: true,
        data: trends,
        mode: 'mock', // Currently mock only
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Trend analysis failed',
        mode: 'mock',
      };
    }
  }

  // Sentiment Analysis
  async analyzeSentiment(text: string, scope: string, refId: number): Promise<ApiResponse<SentimentSnapshot>> {
    try {
      const result = await this.providers.sentiment.analyzeSentiment(text, scope, refId);
      return {
        success: true,
        data: result,
        mode: 'mock', // May be real if Google Cloud configured
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sentiment analysis failed',
        mode: 'mock',
      };
    }
  }

  async batchAnalyzeSentiment(
    texts: Array<{ text: string; scope: string; refId: number }>
  ): Promise<ApiResponse<SentimentSnapshot[]>> {
    try {
      const results = await this.providers.sentiment.batchAnalyze(texts);
      return {
        success: true,
        data: results,
        mode: 'mock', // May be real if Google Cloud configured
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch sentiment analysis failed',
        mode: 'mock',
      };
    }
  }

  // Viral Prediction (Mock implementation for now)
  async predictViralPotential(contentVersionId: number, text: string): Promise<ApiResponse<any>> {
    try {
      // Simulate viral prediction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const features = {
        engagement_potential: Math.random() * 10,
        trend_alignment: Math.random() * 10,
        emotional_impact: Math.random() * 10,
        shareability: Math.random() * 10,
        timing_score: Math.random() * 10,
      };
      
      const score = Object.values(features).reduce((sum, val) => sum + val, 0) / 5 * 10;
      
      return {
        success: true,
        data: {
          contentVersionId,
          features,
          score: Math.round(score * 100) / 100,
          model: 'mock-viral-predictor',
          confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
        },
        mode: 'mock',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Viral prediction failed',
        mode: 'mock',
      };
    }
  }

  // Content Fatigue Detection (Mock implementation)
  async detectContentFatigue(topic: string, segmentId?: number): Promise<ApiResponse<any>> {
    try {
      // Simulate fatigue detection
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const slope = (Math.random() - 0.5) * 2; // -1 to 1, negative indicates fatigue
      const severity = slope < -0.5 ? 'high' : (slope < -0.2 ? 'medium' : 'low');
      
      return {
        success: true,
        data: {
          topic,
          segmentId,
          slope,
          severity,
          lastSeenAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
          recommendation: slope < -0.3 ? 'Consider changing topic or angle' : 'Content performance is stable',
        },
        mode: 'mock',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fatigue detection failed',
        mode: 'mock',
      };
    }
  }

  // Health check for all intelligence providers
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      const [competitorStatus, sentimentStatus] = await Promise.all([
        this.providers.competitor.getStatus(),
        this.providers.sentiment.getStatus(),
      ]);

      return {
        success: true,
        data: {
          competitor_analysis: competitorStatus,
          sentiment_analysis: sentimentStatus,
          viral_prediction: { status: 'mock_mode', message: 'Using mock viral prediction' },
          fatigue_detection: { status: 'mock_mode', message: 'Using mock fatigue detection' },
        },
        mode: 'live',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        mode: 'mock',
      };
    }
  }
}