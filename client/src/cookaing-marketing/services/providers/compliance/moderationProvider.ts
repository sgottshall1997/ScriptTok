/**
 * Content Moderation Provider Interface & Mock Implementation
 */
import type { ModerationReport } from '../../../types/ext';

export interface IModerationProvider {
  moderateContent(versionId: number, text: string): Promise<ModerationReport>;
  batchModerate(items: Array<{ versionId: number; text: string }>): Promise<ModerationReport[]>;
  getStatus(): Promise<{ status: 'ok' | 'mock_mode' | 'error'; message?: string }>;
}

export class MockModerationProvider implements IModerationProvider {
  async moderateContent(versionId: number, text: string): Promise<ModerationReport> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const checks = this.performMockChecks(text);
    const decisions = this.makeMockDecisions(checks);
    
    return {
      versionId,
      checks,
      decisions,
      status: decisions.approved ? 'passed' : (decisions.manual_review ? 'flagged' : 'blocked'),
      createdAt: new Date(),
    };
  }

  async batchModerate(items: Array<{ versionId: number; text: string }>): Promise<ModerationReport[]> {
    // Simulate batch processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return Promise.all(items.map(({ versionId, text }) => 
      this.moderateContent(versionId, text)
    ));
  }

  private performMockChecks(text: string) {
    const lowercaseText = text.toLowerCase();
    
    // Simple keyword-based mock checks
    const toxicWords = ['hate', 'stupid', 'idiot', 'awful', 'terrible'];
    const spamWords = ['buy now', 'click here', 'urgent', 'limited time'];
    const inappropriateWords = ['inappropriate', 'offensive', 'explicit'];
    
    const toxic = toxicWords.some(word => lowercaseText.includes(word));
    const spam = spamWords.some(word => lowercaseText.includes(word));
    const inappropriate = inappropriateWords.some(word => lowercaseText.includes(word));
    
    return {
      toxic,
      spam,
      inappropriate,
      hate_speech: toxic && Math.random() < 0.3,
      scores: {
        toxicity: toxic ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3,
        spam_likelihood: spam ? 0.6 + Math.random() * 0.4 : Math.random() * 0.2,
        inappropriate_content: inappropriate ? 0.8 + Math.random() * 0.2 : Math.random() * 0.1,
      },
    };
  }

  private makeMockDecisions(checks: any) {
    const hasIssues = checks.toxic || checks.spam || checks.inappropriate || checks.hate_speech;
    const severity = checks.hate_speech ? 'high' : (checks.toxic ? 'medium' : 'low');
    
    if (!hasIssues) {
      return { approved: true };
    }
    
    if (severity === 'high') {
      return {
        approved: false,
        blocked_reasons: ['hate_speech_detected'],
        manual_review: false,
      };
    }
    
    if (severity === 'medium') {
      return {
        approved: false,
        blocked_reasons: [],
        manual_review: true,
      };
    }
    
    return { approved: true }; // Low severity passes
  }

  async getStatus() {
    return { status: 'mock_mode' as const, message: 'Using mock content moderation' };
  }
}

export class OpenAIModerationProvider implements IModerationProvider {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async moderateContent(versionId: number, text: string): Promise<ModerationReport> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // TODO: Implement real OpenAI Moderation API integration
    throw new Error('OpenAI moderation not yet implemented');
  }

  async batchModerate(items: Array<{ versionId: number; text: string }>): Promise<ModerationReport[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // TODO: Implement batch moderation
    throw new Error('OpenAI batch moderation not yet implemented');
  }

  async getStatus() {
    if (!this.apiKey) {
      return { status: 'error' as const, message: 'API key missing' };
    }
    return { status: 'ok' as const };
  }
}