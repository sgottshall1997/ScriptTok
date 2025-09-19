import { ContentRecord, SourceApp } from '../types/content';
import { ContentGenerationEntry } from '../contentGenerationHistory';

// =============================================================================
// Content Adapter Interface
// =============================================================================

export interface ContentAdapter<TSource = any> {
  toUnified(source: TSource, app: SourceApp): ContentRecord;
  fromUnified(unified: ContentRecord): TSource;
  calculateDedupeHash(source: TSource): string;
}

// =============================================================================
// GlowBot Content Adapter
// =============================================================================

export class GlowBotContentAdapter implements ContentAdapter<ContentGenerationEntry> {
  toUnified(source: ContentGenerationEntry, app: SourceApp = 'glowbot'): ContentRecord {
    const generatedOutput = source.generatedOutput || {};
    
    // Map GlowBot content to unified structure
    const unified: ContentRecord = {
      id: source.id,
      source_app: app,
      content_type: source.templateUsed || 'social_post',
      title: generatedOutput.hook || source.productName || 'Generated Content',
      body: extractContentText(generatedOutput),
      blocks: this.extractContentBlocks(generatedOutput),
      metadata: {
        topic: source.productName,
        tone: source.tone,
        tags: generatedOutput.hashtags || [],
        product: source.productName,
        niche: source.niche,
        platform: source.platformsSelected?.[0],
        templateType: source.templateUsed,
        affiliateLink: generatedOutput.affiliateLink,
        viralInspo: generatedOutput.viralInspo ? JSON.stringify(generatedOutput.viralInspo) : undefined,
        platformsSelected: source.platformsSelected,
      },
      rating: undefined, // Not available in base ContentGenerationEntry
      is_favorite: undefined, // Not available in base ContentGenerationEntry
      dedupe_hash: this.calculateDedupeHash(source),
      created_at: source.timestamp.toISOString(),
      updated_at: source.timestamp.toISOString(),
    };

    return unified;
  }

  fromUnified(unified: ContentRecord): ContentGenerationEntry {
    const metadata = unified.metadata;
    
    // Parse viralInspo back from JSON string if it exists
    let viralInspo: any = undefined;
    if (metadata.viralInspo) {
      try {
        viralInspo = JSON.parse(metadata.viralInspo);
      } catch {
        // If parsing fails, leave as undefined
      }
    }
    
    // Convert back to GlowBot format
    const glowBotEntry: ContentGenerationEntry = {
      id: unified.id,
      timestamp: new Date(unified.created_at),
      productName: metadata.product || metadata.topic || 'Unknown Product',
      niche: metadata.niche || 'general',
      tone: metadata.tone || 'neutral',
      templateUsed: metadata.templateType || unified.content_type,
      platformsSelected: metadata.platformsSelected || [],
      generatedOutput: {
        content: unified.body || '',
        hook: unified.title || 'Generated content',
        platform: metadata.platform || '',
        niche: metadata.niche || 'general',
        hashtags: metadata.tags || [],
        affiliateLink: metadata.affiliateLink || '',
        viralInspo: viralInspo,
      },
    };

    return glowBotEntry;
  }

  calculateDedupeHash(source: ContentGenerationEntry): string {
    // Create hash based on key content attributes
    const hashInput = [
      source.productName || '',
      source.niche || '',
      source.templateUsed || '',
      source.tone || '',
      source.generatedOutput?.content || '',
      (source.platformsSelected || []).sort().join(',')
    ].join('|');
    
    // Simple hash function (you could use crypto.createHash for better hashing)
    return btoa(hashInput).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private extractContentBlocks(generatedOutput: any): Array<{ kind: string; text: string; [key: string]: any }> {
    const blocks: Array<{ kind: string; text: string; [key: string]: any }> = [];
    
    if (generatedOutput.hook) {
      blocks.push({ kind: 'hook', text: generatedOutput.hook });
    }
    
    if (generatedOutput.content) {
      blocks.push({ kind: 'main_content', text: generatedOutput.content });
    }
    
    if (generatedOutput.hashtags && generatedOutput.hashtags.length > 0) {
      blocks.push({ 
        kind: 'hashtags', 
        text: generatedOutput.hashtags.join(' '),
        hashtags: generatedOutput.hashtags 
      });
    }
    
    if (generatedOutput.affiliateLink) {
      blocks.push({ kind: 'affiliate_link', text: generatedOutput.affiliateLink });
    }
    
    return blocks;
  }
}

// =============================================================================
// CookAIng Content Adapter  
// =============================================================================

export interface CookAIngContentSource {
  id: string;
  content?: string;
  title?: string;
  recipeId?: number;
  blueprintId?: number;
  sourceType?: 'recipe' | 'freeform';
  persona?: string;
  tone?: string;
  platform?: string;
  channel?: string;
  duration?: string;
  cta?: string;
  tags?: string[];
  createdAt?: string;
  [key: string]: any;
}

export class CookAIngContentAdapter implements ContentAdapter<CookAIngContentSource> {
  toUnified(source: CookAIngContentSource, app: SourceApp = 'cookAIng'): ContentRecord {
    const unified: ContentRecord = {
      id: source.id,
      source_app: app,
      content_type: this.inferContentType(source),
      title: source.title || this.generateTitle(source),
      body: source.content || '',
      blocks: this.extractContentBlocks(source),
      metadata: {
        topic: source.title,
        tone: source.tone,
        tags: source.tags || [],
        niche: 'food', // CookAIng is always food-focused
        platform: source.platform,
        channel: source.channel,
        recipeId: source.recipeId,
        blueprintId: source.blueprintId,
        persona: source.persona,
        duration: source.duration,
        cta: source.cta,
        sourceType: source.sourceType,
      },
      rating: source.rating,
      is_favorite: source.isFavorite,
      dedupe_hash: this.calculateDedupeHash(source),
      created_at: source.createdAt || new Date().toISOString(),
      updated_at: source.createdAt || new Date().toISOString(),
    };

    return unified;
  }

  fromUnified(unified: ContentRecord): CookAIngContentSource {
    const metadata = unified.metadata;
    
    const cookAIngContent: CookAIngContentSource = {
      id: unified.id,
      content: unified.body,
      title: unified.title,
      recipeId: metadata.recipeId,
      blueprintId: metadata.blueprintId,
      sourceType: metadata.sourceType || 'recipe',
      persona: metadata.persona,
      tone: metadata.tone,
      platform: metadata.platform,
      channel: metadata.channel,
      duration: metadata.duration,
      cta: metadata.cta,
      tags: metadata.tags,
      rating: unified.rating,
      isFavorite: unified.is_favorite,
      createdAt: unified.created_at,
    };

    return cookAIngContent;
  }

  calculateDedupeHash(source: CookAIngContentSource): string {
    const hashInput = [
      source.recipeId?.toString() || source.title || '',
      source.blueprintId?.toString() || '',
      source.persona || '',
      source.tone || '',
      source.platform || '',
      (source.content || '').substring(0, 100) // First 100 chars of content
    ].join('|');
    
    return btoa(hashInput).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private inferContentType(source: CookAIngContentSource): string {
    // Map blueprint IDs or other indicators to content types
    if (source.blueprintId) {
      // This would be mapped from actual blueprint data in real implementation
      const blueprintMap: Record<number, string> = {
        1: 'blog_post',
        2: 'instagram_post', 
        3: 'youtube_script',
        4: 'email_campaign',
        5: 'blog_recipe',
        6: 'video_script_short',
        7: 'video_script_long',
        8: 'push_notification'
      };
      return blueprintMap[source.blueprintId] || 'blog_post';
    }
    
    // Default based on platform or other indicators
    if (source.platform === 'instagram') return 'instagram_post';
    if (source.platform === 'youtube') return 'youtube_script';
    if (source.channel === 'email') return 'email_campaign';
    
    return 'blog_post'; // Default
  }

  private generateTitle(source: CookAIngContentSource): string {
    if (source.recipeId) {
      return `Recipe Content #${source.recipeId}`;
    }
    if (source.blueprintId) {
      return `Generated Content (Blueprint ${source.blueprintId})`;
    }
    return 'CookAIng Generated Content';
  }

  private extractContentBlocks(source: CookAIngContentSource): Array<{ kind: string; text: string; [key: string]: any }> {
    const blocks: Array<{ kind: string; text: string; [key: string]: any }> = [];
    
    if (source.title) {
      blocks.push({ kind: 'title', text: source.title });
    }
    
    if (source.content) {
      blocks.push({ kind: 'main_content', text: source.content });
    }
    
    if (source.cta) {
      blocks.push({ kind: 'cta', text: source.cta });
    }
    
    if (source.tags && source.tags.length > 0) {
      blocks.push({ 
        kind: 'tags', 
        text: source.tags.join(', '),
        tags: source.tags
      });
    }
    
    return blocks;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function extractContentText(generatedOutput: any): string {
  if (typeof generatedOutput === 'string') {
    return generatedOutput;
  }
  
  if (generatedOutput && typeof generatedOutput === 'object') {
    return generatedOutput.content || 
           generatedOutput.script || 
           generatedOutput.text ||
           JSON.stringify(generatedOutput, null, 2);
  }
  
  return '';
}

// =============================================================================
// Adapter Factory
// =============================================================================

export class ContentAdapterFactory {
  static getAdapter(sourceApp: SourceApp): ContentAdapter {
    switch (sourceApp) {
      case 'glowbot':
        return new GlowBotContentAdapter();
      case 'cookAIng':
        return new CookAIngContentAdapter();
      default:
        throw new Error(`No adapter found for source app: ${sourceApp}`);
    }
  }
  
  static convertToUnified<T>(source: T, sourceApp: SourceApp): ContentRecord {
    const adapter = this.getAdapter(sourceApp);
    return adapter.toUnified(source as any, sourceApp);
  }
  
  static convertFromUnified<T>(unified: ContentRecord): T {
    const adapter = this.getAdapter(unified.source_app);
    return adapter.fromUnified(unified) as T;
  }
}