/**
 * Server Compliance Service - Provides mock responses for API routes
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  mode: 'mock' | 'live';
}

export interface ModerationReport {
  versionId: number;
  status: 'approved' | 'flagged' | 'rejected';
  confidence: number;
  categories: Array<{
    category: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
  }>;
  suggestions?: string[];
  createdAt?: Date;
}

export interface PlagiarismReport {
  versionId: number;
  score: number; // 0-100 percentage similarity
  matches: Array<{
    source: string;
    url?: string;
    similarity: number;
    excerpt: string;
  }>;
  createdAt?: Date;
}

export class ComplianceService {
  // Content Moderation
  async moderateContent(versionId: number, text: string): Promise<ApiResponse<ModerationReport>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const score = this.calculateMockModerationScore(text);
      const report: ModerationReport = {
        versionId,
        status: score > 0.8 ? 'approved' : score > 0.5 ? 'flagged' : 'rejected',
        confidence: score,
        categories: this.generateMockCategories(text),
        suggestions: score < 0.8 ? ['Consider softer language', 'Remove controversial terms'] : [],
        createdAt: new Date()
      };

      return {
        success: true,
        data: report,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content moderation failed',
        mode: 'mock'
      };
    }
  }

  async batchModerate(items: Array<{ versionId: number; text: string }>): Promise<ApiResponse<ModerationReport[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = items.map(item => ({
        versionId: item.versionId,
        status: Math.random() > 0.2 ? 'approved' : 'flagged' as 'approved' | 'flagged' | 'rejected',
        confidence: Math.random(),
        categories: this.generateMockCategories(item.text),
        suggestions: Math.random() > 0.7 ? ['Review content guidelines'] : [],
        createdAt: new Date()
      }));

      return {
        success: true,
        data: results,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch moderation failed',
        mode: 'mock'
      };
    }
  }

  // Plagiarism Detection
  async checkPlagiarism(versionId: number, text: string): Promise<ApiResponse<PlagiarismReport>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const score = this.calculateMockPlagiarismScore(text);
      const matches = this.generateMockMatches(text, score);
      
      const report: PlagiarismReport = {
        versionId,
        score,
        matches,
        createdAt: new Date()
      };

      return {
        success: true,
        data: report,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Plagiarism check failed',
        mode: 'mock'
      };
    }
  }

  private calculateMockModerationScore(text: string): number {
    // Mock scoring based on text characteristics
    const hasProblematicWords = /spam|hate|violence|explicit/i.test(text);
    const baseScore = hasProblematicWords ? 0.3 : 0.85;
    return Math.min(1, baseScore + (Math.random() * 0.15));
  }

  private generateMockCategories(text: string): Array<{ category: string; severity: 'low' | 'medium' | 'high'; confidence: number }> {
    const categories = [];
    
    if (text.length > 500) {
      categories.push({ category: 'lengthy_content', severity: 'low' as const, confidence: 0.8 });
    }
    
    if (/[!@#$%^&*]/.test(text)) {
      categories.push({ category: 'special_characters', severity: 'low' as const, confidence: 0.6 });
    }
    
    return categories;
  }

  private calculateMockPlagiarismScore(text: string): number {
    // Simple mock scoring - longer texts have higher chance of "similarity"
    const lengthFactor = Math.min(text.length / 1000, 1);
    return Math.floor((lengthFactor * 0.3 + Math.random() * 0.2) * 100);
  }

  private generateMockMatches(text: string, score: number): Array<{ source: string; url?: string; similarity: number; excerpt: string }> {
    if (score < 20) return [];
    
    const numMatches = Math.ceil(score / 30);
    return Array.from({ length: numMatches }, (_, i) => ({
      source: `Academic Source ${i + 1}`,
      url: `https://example-journal.com/article-${i + 1}`,
      similarity: Math.floor((score * 0.8 + Math.random() * 20)),
      excerpt: `Sample excerpt ${i + 1} from ${text.substring(0, 50)}...`
    }));
  }

  // Health check
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      return {
        success: true,
        data: {
          content_moderation: { status: 'mock_mode', message: 'Using mock content moderation' },
          plagiarism_detection: { status: 'mock_mode', message: 'Using mock plagiarism detection' },
          brand_safety: { status: 'mock_mode', message: 'Using mock brand safety scanning' },
          compliance_audit: { status: 'mock_mode', message: 'Using mock compliance auditing' }
        },
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        mode: 'mock'
      };
    }
  }
}