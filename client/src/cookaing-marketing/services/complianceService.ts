/**
 * Compliance Service - Orchestrates moderation and safety providers
 */
import { ProviderFactory } from './providers';
import type { 
  ModerationReport,
  PlagiarismReport,
  ApiResponse 
} from '../types/ext';

export class ComplianceService {
  private providers = ProviderFactory.getProviders();

  // Content Moderation
  async moderateContent(versionId: number, text: string): Promise<ApiResponse<ModerationReport>> {
    try {
      const result = await this.providers.moderation.moderateContent(versionId, text);
      return {
        success: true,
        data: result,
        mode: 'mock', // May be real if OpenAI configured
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content moderation failed',
        mode: 'mock',
      };
    }
  }

  async batchModerate(items: Array<{ versionId: number; text: string }>): Promise<ApiResponse<ModerationReport[]>> {
    try {
      const results = await this.providers.moderation.batchModerate(items);
      return {
        success: true,
        data: results,
        mode: 'mock', // May be real if OpenAI configured
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch moderation failed',
        mode: 'mock',
      };
    }
  }

  // Plagiarism Detection (Mock implementation)
  async checkPlagiarism(versionId: number, text: string): Promise<ApiResponse<PlagiarismReport>> {
    try {
      // Simulate plagiarism detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const score = this.calculateMockPlagiarismScore(text);
      const matches = this.generateMockMatches(text, score);
      
      const report: PlagiarismReport = {
        versionId,
        score,
        matches,
        createdAt: new Date(),
      };

      return {
        success: true,
        data: report,
        mode: 'mock',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Plagiarism check failed',
        mode: 'mock',
      };
    }
  }

  // Brand Safety Scanning (Mock implementation)
  async scanBrandSafety(content: string, brandGuidelines?: object): Promise<ApiResponse<any>> {
    try {
      // Simulate brand safety scanning
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const risks = this.identifyBrandRisks(content);
      const compliance = this.checkBrandCompliance(content, brandGuidelines);
      
      return {
        success: true,
        data: {
          content_preview: content.substring(0, 100) + '...',
          risks,
          compliance,
          overall_score: Math.max(0, 100 - (risks.length * 15)), // Deduct points for risks
          recommendations: this.generateBrandRecommendations(risks),
          scanned_at: new Date(),
        },
        mode: 'mock',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Brand safety scan failed',
        mode: 'mock',
      };
    }
  }

  // Compliance Audit (Mock implementation)
  async auditCompliance(contentIds: number[]): Promise<ApiResponse<any>> {
    try {
      // Simulate compliance audit
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const auditResults = contentIds.map(contentId => ({
        contentId,
        moderation_status: Math.random() > 0.1 ? 'passed' : 'flagged',
        plagiarism_score: Math.random() * 30, // 0-30% similarity
        brand_safety_score: Math.random() * 40 + 60, // 60-100%
        overall_compliance: Math.random() > 0.15 ? 'compliant' : 'requires_review',
        last_checked: new Date(),
      }));
      
      const summary = {
        total_content: contentIds.length,
        compliant: auditResults.filter(r => r.overall_compliance === 'compliant').length,
        requires_review: auditResults.filter(r => r.overall_compliance === 'requires_review').length,
        avg_brand_safety: auditResults.reduce((sum, r) => sum + r.brand_safety_score, 0) / auditResults.length,
        avg_plagiarism: auditResults.reduce((sum, r) => sum + r.plagiarism_score, 0) / auditResults.length,
      };

      return {
        success: true,
        data: {
          summary,
          results: auditResults,
          audit_completed_at: new Date(),
        },
        mode: 'mock',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Compliance audit failed',
        mode: 'mock',
      };
    }
  }

  private calculateMockPlagiarismScore(text: string): number {
    // Simple mock calculation based on text characteristics
    const commonPhrases = [
      'according to research',
      'studies have shown',
      'it is important to note',
      'in conclusion',
      'furthermore',
    ];
    
    let score = 0;
    const lowerText = text.toLowerCase();
    
    commonPhrases.forEach(phrase => {
      if (lowerText.includes(phrase)) {
        score += 5; // Each common phrase adds 5% similarity
      }
    });
    
    // Add base randomness
    score += Math.random() * 20;
    
    return Math.min(100, Math.max(0, score));
  }

  private generateMockMatches(text: string, score: number) {
    if (score < 15) return []; // Low score = no matches
    
    const mockSources = [
      'https://example-blog.com/article-123',
      'https://wikipedia.org/wiki/Example_Topic',
      'https://research-journal.org/paper-456',
      'https://news-website.com/story-789',
    ];
    
    const matchCount = Math.ceil(score / 25); // More matches for higher scores
    const matches = [];
    
    for (let i = 0; i < matchCount; i++) {
      matches.push({
        source: mockSources[i % mockSources.length],
        similarity: Math.random() * score,
        text_fragment: text.substring(i * 50, (i + 1) * 50) + '...',
      });
    }
    
    return matches;
  }

  private identifyBrandRisks(content: string): Array<{ type: string; severity: string; description: string }> {
    const risks: Array<{ type: string; severity: string; description: string }> = [];
    const lowerContent = content.toLowerCase();
    
    // Check for potential brand risks
    const riskKeywords = {
      'controversial_topics': ['politics', 'religion', 'controversy'],
      'competitor_mentions': ['competitor', 'alternative', 'versus'],
      'negative_sentiment': ['terrible', 'awful', 'disappointing', 'worst'],
      'inappropriate_language': ['damn', 'hell', 'stupid'],
    };
    
    Object.entries(riskKeywords).forEach(([riskType, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        risks.push({
          type: riskType,
          severity: Math.random() > 0.5 ? 'medium' : 'low',
          description: `Potential ${riskType.replace('_', ' ')} detected`,
        });
      }
    });
    
    return risks;
  }

  private checkBrandCompliance(content: string, guidelines?: object) {
    // Mock brand compliance check
    return {
      tone_compliance: Math.random() > 0.2 ? 'compliant' : 'needs_review',
      messaging_alignment: Math.random() > 0.15 ? 'aligned' : 'misaligned',
      visual_guidelines: Math.random() > 0.1 ? 'compliant' : 'not_applicable',
      legal_compliance: Math.random() > 0.05 ? 'compliant' : 'requires_legal_review',
    };
  }

  private generateBrandRecommendations(risks: Array<{ type: string; severity: string; description: string }>) {
    if (risks.length === 0) {
      return ['Content appears brand-safe and compliant'];
    }
    
    const recommendations = [
      'Review tone to ensure brand alignment',
      'Consider softening language in sensitive areas',
      'Verify compliance with brand guidelines',
      'Consider legal review for controversial topics',
    ];
    
    return recommendations.slice(0, risks.length);
  }

  // Health check for compliance services
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      const moderationStatus = await this.providers.moderation.getStatus();

      return {
        success: true,
        data: {
          content_moderation: moderationStatus,
          plagiarism_detection: { status: 'mock_mode' as const, message: 'Using mock plagiarism detection' },
          brand_safety: { status: 'mock_mode' as const, message: 'Using mock brand safety scanning' },
          compliance_audit: { status: 'mock_mode' as const, message: 'Using mock compliance auditing' },
        },
        mode: 'mock',
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