import { storage } from "../storage";
import type { AmazonProduct, AffiliateLink, InsertAffiliateLink } from "@shared/schema";
import { db } from "../db";
import { sql } from "drizzle-orm";

export interface LinkInjectionResult {
  originalContent: string;
  processedContent: string;
  linksInjected: number;
  productMatches: Array<{
    productName: string;
    amazonProduct: AmazonProduct;
    affiliateLink: AffiliateLink;
    position: number;
  }>;
  warnings: string[];
}

export class AffiliateLinkInjector {
  private readonly PRODUCT_PATTERNS = [
    // Brand + Product patterns
    /\b([A-Z][a-z]+)\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:in|with|for|on|at|by))?\b/g,
    // Product titles with common words
    /\b(?:the\s+)?([A-Z][a-zA-Z\s]+"[^"]*"[a-zA-Z\s]*)\b/g,
    // Specific product mentions
    /\b([A-Z][a-zA-Z]*\s+(?:Pro|Max|Plus|Ultra|Mini|Air|Studio|Series)[a-zA-Z0-9\s]*)\b/g,
    // Model numbers and SKUs
    /\b([A-Z]{2,}[-\s]?\d{2,}[A-Za-z0-9\-]*)\b/g
  ];

  async injectAffiliateLinksSmart(
    content: string,
    contentId: number,
    contentType: string,
    userId: number,
    options: {
      niche?: string;
      maxLinksPerContent?: number;
      onlyFirstMention?: boolean;
      skipIfExists?: boolean;
    } = {}
  ): Promise<LinkInjectionResult> {
    const result: LinkInjectionResult = {
      originalContent: content,
      processedContent: content,
      linksInjected: 0,
      productMatches: [],
      warnings: []
    };

    try {
      // Check if content already has affiliate links to avoid double-processing
      if (options.skipIfExists) {
        const existingLinks = await storage.getAffiliateLinksByContent(contentId, contentType);
        if (existingLinks.length > 0) {
          result.warnings.push(`Content already has ${existingLinks.length} affiliate links`);
          return result;
        }
      }

      // Extract potential product mentions using multiple patterns
      const productMentions = this.extractProductMentions(content);
      
      if (productMentions.length === 0) {
        result.warnings.push('No product mentions detected in content');
        return result;
      }

      // Find matching Amazon products in database
      const productMatches = await this.findMatchingProducts(productMentions, options.niche);
      
      if (productMatches.length === 0) {
        result.warnings.push(`No Amazon products found for ${productMentions.length} mentions`);
        return result;
      }

      // Apply max links limit
      const maxLinks = options.maxLinksPerContent || 5;
      const limitedMatches = productMatches.slice(0, maxLinks);

      // Process each match and inject affiliate links
      let processedContent = content;
      const trackingPrefix = `${userId}_${contentType}_${contentId}`;
      
      for (const match of limitedMatches) {
        const trackingResult = await this.injectSingleProductLink(
          processedContent,
          match,
          trackingPrefix,
          userId,
          contentId,
          contentType,
          options.onlyFirstMention || false
        );
        
        if (trackingResult.success) {
          processedContent = trackingResult.content;
          result.linksInjected++;
          result.productMatches.push({
            productName: match.mention,
            amazonProduct: match.product,
            affiliateLink: trackingResult.affiliateLink!,
            position: trackingResult.position!
          });
        } else {
          result.warnings.push(`Failed to inject link for "${match.mention}": ${trackingResult.error}`);
        }
      }

      result.processedContent = processedContent;
      
      // Log injection statistics
      console.log(`🔗 Affiliate injection stats: ${result.linksInjected}/${productMentions.length} successful`);
      
    } catch (error) {
      result.warnings.push(`Injection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private extractProductMentions(content: string): Array<{
    mention: string;
    position: number;
    confidence: number;
  }> {
    const mentions: Array<{ mention: string; position: number; confidence: number }> = [];
    
    for (const pattern of this.PRODUCT_PATTERNS) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const mention = match[1]?.trim() || match[0]?.trim();
        if (mention && mention.length > 3 && mention.length < 100) {
          // Calculate confidence based on pattern type and context
          const confidence = this.calculateMentionConfidence(mention, content, match.index);
          
          mentions.push({
            mention,
            position: match.index,
            confidence
          });
        }
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueMentions = mentions
      .filter((item, index, self) => 
        index === self.findIndex(t => t.mention.toLowerCase() === item.mention.toLowerCase())
      )
      .sort((a, b) => b.confidence - a.confidence);

    return uniqueMentions.slice(0, 20); // Limit to top 20 mentions
  }

  private calculateMentionConfidence(mention: string, content: string, position: number): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence for brand names and specific models
    if (/^[A-Z][a-z]+\s+[A-Z]/.test(mention)) confidence += 0.2;
    if (/\b(?:Pro|Max|Plus|Ultra|Mini|Air|Studio|Series)\b/i.test(mention)) confidence += 0.2;
    if (/\d+/.test(mention)) confidence += 0.1;
    
    // Context clues
    const contextBefore = content.substring(Math.max(0, position - 50), position);
    const contextAfter = content.substring(position + mention.length, position + mention.length + 50);
    
    if (/\b(?:buy|purchase|get|order|shop|price|deal|discount)\b/i.test(contextBefore + contextAfter)) {
      confidence += 0.3;
    }
    
    if (/\$\d+|\d+\.\d+|free\s+shipping|amazon|review/i.test(contextBefore + contextAfter)) {
      confidence += 0.2;
    }

    return Math.min(1.0, confidence);
  }

  private async findMatchingProducts(
    mentions: Array<{ mention: string; position: number; confidence: number }>,
    niche?: string
  ): Promise<Array<{ mention: string; product: AmazonProduct; score: number }>> {
    const matches: Array<{ mention: string; product: AmazonProduct; score: number }> = [];

    for (const mention of mentions) {
      try {
        // Search for products using keywords from the mention
        const keywords = this.extractKeywords(mention.mention);
        const products = await storage.searchAmazonProductsByKeywords(keywords);
        
        // Filter by niche if specified
        const filteredProducts = niche 
          ? products.filter(p => p.niche.toLowerCase() === niche.toLowerCase())
          : products;

        // Score and rank products based on relevance
        for (const product of filteredProducts.slice(0, 3)) {
          const relevanceScore = this.calculateProductRelevance(mention.mention, product);
          const finalScore = mention.confidence * relevanceScore;
          
          if (finalScore > 0.3) { // Minimum threshold for inclusion
            matches.push({
              mention: mention.mention,
              product,
              score: finalScore
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error searching for products matching "${mention.mention}":`, error);
      }
    }

    // Sort by score and remove duplicate products
    return matches
      .sort((a, b) => b.score - a.score)
      .filter((item, index, self) => 
        index === self.findIndex(t => t.product.id === item.product.id)
      );
  }

  private extractKeywords(mention: string): string[] {
    // Remove common stop words and extract meaningful terms
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return mention
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Limit keywords for better performance
  }

  private calculateProductRelevance(mention: string, product: AmazonProduct): number {
    let score = 0;
    
    const mentionLower = mention.toLowerCase();
    const titleLower = product.title.toLowerCase();
    const brandLower = product.brand?.toLowerCase() || '';
    
    // Exact title match
    if (titleLower.includes(mentionLower)) score += 0.8;
    if (mentionLower.includes(titleLower)) score += 0.6;
    
    // Brand match
    if (brandLower && mentionLower.includes(brandLower)) score += 0.4;
    
    // Keyword overlap
    const mentionWords = this.extractKeywords(mention);
    const titleWords = this.extractKeywords(product.title);
    const overlap = mentionWords.filter(word => titleWords.includes(word)).length;
    score += (overlap / Math.max(mentionWords.length, titleWords.length)) * 0.5;
    
    // Product quality factors
    if (product.rating && product.rating > 4.0) score += 0.1;
    if (product.reviewCount && product.reviewCount > 100) score += 0.1;
    
    return Math.min(1.0, score);
  }

  private async injectSingleProductLink(
    content: string,
    match: { mention: string; product: AmazonProduct; score: number },
    trackingPrefix: string,
    userId: number,
    contentId: number,
    contentType: string,
    onlyFirstMention: boolean
  ): Promise<{
    success: boolean;
    content: string;
    affiliateLink?: AffiliateLink;
    position?: number;
    error?: string;
  }> {
    try {
      // Generate unique tracking ID
      const trackingId = `${trackingPrefix}_${match.product.id}_${Date.now()}`;
      
      // Create affiliate link record
      const affiliateLinkData: InsertAffiliateLink = {
        userId,
        amazonProductId: match.product.id,
        originalUrl: match.product.productUrl,
        affiliateUrl: this.generateAffiliateUrl(match.product.productUrl, trackingId),
        trackingId,
        platform: 'amazon',
        contentId,
        contentType,
        isActive: true,
        clickCount: 0,
        conversionCount: 0,
        totalEarnings: 0
      };

      const affiliateLink = await storage.createAffiliateLink(affiliateLinkData);
      
      // Replace first (or all) mentions with affiliate link
      const mentionPattern = new RegExp(
        this.escapeRegExp(match.mention), 
        onlyFirstMention ? 'i' : 'gi'
      );
      
      const replacement = `[${match.mention}](${affiliateLink.affiliateUrl})`;
      const newContent = content.replace(mentionPattern, replacement);
      
      if (newContent === content) {
        return {
          success: false,
          content,
          error: 'No text replacements made'
        };
      }

      return {
        success: true,
        content: newContent,
        affiliateLink,
        position: content.indexOf(match.mention)
      };
      
    } catch (error) {
      return {
        success: false,
        content,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateAffiliateUrl(originalUrl: string, trackingId: string): string {
    try {
      const url = new URL(originalUrl);
      
      // Add affiliate parameters
      url.searchParams.set('tag', process.env.AMAZON_PARTNER_TAG || 'yourpartnertag-20');
      url.searchParams.set('linkCode', 'osi');
      url.searchParams.set('th', '1');
      url.searchParams.set('psc', '1');
      url.searchParams.set('ref_', `aff_${trackingId}`);
      
      return url.toString();
    } catch (error) {
      console.warn('⚠️ Error generating affiliate URL:', error);
      return originalUrl;
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Bulk processing method for existing content
  async processBulkContent(
    contentItems: Array<{
      id: number;
      content: string;
      type: string;
      userId: number;
      niche?: string;
    }>,
    options: {
      maxLinksPerContent?: number;
      onlyFirstMention?: boolean;
      skipIfExists?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    processed: number;
    successful: number;
    totalLinks: number;
    errors: string[];
  }> {
    const batchSize = options.batchSize || 10;
    const results = {
      processed: 0,
      successful: 0,
      totalLinks: 0,
      errors: []
    };

    // Process content in batches to avoid overwhelming the system
    for (let i = 0; i < contentItems.length; i += batchSize) {
      const batch = contentItems.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const result = await this.injectAffiliateLinksSmart(
            item.content,
            item.id,
            item.type,
            item.userId,
            {
              niche: item.niche,
              ...options
            }
          );
          
          return {
            success: result.linksInjected > 0,
            linksInjected: result.linksInjected,
            warnings: result.warnings
          };
        } catch (error) {
          return {
            success: false,
            linksInjected: 0,
            warnings: [error instanceof Error ? error.message : 'Unknown error']
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        results.processed++;
        if (result.success) {
          results.successful++;
          results.totalLinks += result.linksInjected;
        }
        results.errors.push(...result.warnings);
      }
      
      // Small delay between batches
      if (i + batchSize < contentItems.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`📈 Bulk affiliate processing complete: ${results.successful}/${results.processed} successful, ${results.totalLinks} total links`);
    
    return results;
  }
}

// Export singleton instance
export const affiliateLinkInjector = new AffiliateLinkInjector();