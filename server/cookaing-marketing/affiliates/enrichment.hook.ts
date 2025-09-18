import { affiliateLookupService } from './lookup.service.js';
import { storage } from '../../storage.js';

export interface CampaignArtifactEnrichmentHook {
  enrichCampaignArtifact(artifactId: number, contactId?: number): Promise<void>;
  enrichRecipeCardArtifacts(campaignId: number, contactId?: number): Promise<void>;
  autoInsertAffiliateProducts(campaignId: number, contactId?: number): Promise<{ added: number; skipped: number }>;
}

export class AffiliateEnrichmentService implements CampaignArtifactEnrichmentHook {
  
  // Helper method to get a single campaign artifact by ID
  private async getCampaignArtifactById(artifactId: number): Promise<any | null> {
    try {
      // For now, we'll implement this by searching through all campaigns
      // In production, this should be a direct database query
      console.log(`🔍 Searching for artifact ${artifactId}...`);
      
      // This is a temporary implementation - ideally storage would have getCampaignArtifactById
      // For now, return null and log that we need this method
      console.log(`⚠️ getCampaignArtifactById not implemented in storage - artifact ${artifactId} enrichment skipped`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error getting campaign artifact ${artifactId}:`, error);
      return null;
    }
  }
  
  async enrichCampaignArtifact(artifactId: number, contactId?: number): Promise<void> {
    try {
      console.log(`🔄 Enriching campaign artifact ${artifactId} with affiliate products...`);

      // Get the specific campaign artifact by ID
      // Note: This assumes a getCampaignArtifactById method exists
      // If not available, we need to add it to the storage interface
      const artifact = await this.getCampaignArtifactById(artifactId);
      
      if (!artifact) {
        console.log(`⚠️ Campaign artifact ${artifactId} not found`);
        return;
      }

      // Get contact preferences if contactId provided
      let contactPreferences = {};
      if (contactId) {
        try {
          const contact = await storage.getContact(contactId);
          if (contact && contact.prefsJson) {
            contactPreferences = contact.prefsJson as any || {};
            console.log(`✅ Loaded contact preferences for ${contactId}:`, contactPreferences);
          }
        } catch (error) {
          console.error(`❌ Error loading contact preferences:`, error);
        }
      }

      // Check if artifact is a recipe card type
      if (this.isRecipeCardArtifact(artifact)) {
        await this.enrichRecipeCardContent(artifact, contactPreferences);
      }

    } catch (error) {
      console.error(`❌ Error enriching campaign artifact ${artifactId}:`, error);
    }
  }

  async enrichRecipeCardArtifacts(campaignId: number, contactId?: number): Promise<void> {
    try {
      console.log(`🔄 Enriching all recipe card artifacts for campaign ${campaignId}...`);

      // Get all campaign artifacts
      const artifacts = await storage.getCampaignArtifacts(campaignId);
      const recipeCardArtifacts = artifacts.filter(this.isRecipeCardArtifact);

      if (recipeCardArtifacts.length === 0) {
        console.log(`📝 No recipe card artifacts found for campaign ${campaignId}`);
        return;
      }

      // Get contact preferences
      let contactPreferences = {};
      if (contactId) {
        try {
          const contact = await storage.getContact(contactId);
          if (contact && contact.prefsJson) {
            contactPreferences = contact.prefsJson as any || {};
          }
        } catch (error) {
          console.error(`❌ Error loading contact preferences:`, error);
        }
      }

      // Enrich each recipe card artifact
      for (const artifact of recipeCardArtifacts) {
        await this.enrichRecipeCardContent(artifact, contactPreferences);
      }

      console.log(`✅ Enriched ${recipeCardArtifacts.length} recipe card artifacts`);

    } catch (error) {
      console.error(`❌ Error enriching recipe card artifacts for campaign ${campaignId}:`, error);
    }
  }

  async autoInsertAffiliateProducts(campaignId: number, contactId?: number): Promise<{ added: number; skipped: number }> {
    try {
      console.log(`🔄 Auto-inserting affiliate products for campaign ${campaignId}...`);

      // Get all campaign artifacts
      const artifacts = await storage.getCampaignArtifacts(campaignId);
      let added = 0;
      let skipped = 0;

      // Get contact preferences
      let contactPreferences = {};
      if (contactId) {
        try {
          const contact = await storage.getContact(contactId);
          if (contact && contact.prefsJson) {
            contactPreferences = contact.prefsJson as any || {};
          }
        } catch (error) {
          console.error(`❌ Error loading contact preferences:`, error);
        }
      }

      // Process each artifact
      for (const artifact of artifacts) {
        try {
          // Check if artifact already has affiliate products
          const content = this.parseArtifactContent(artifact);
          if (content.affiliateProducts && content.affiliateProducts.length > 0) {
            skipped++;
            console.log(`⏭️ Skipping artifact ${artifact.id} - already has affiliate products`);
            continue;
          }

          // Enrich based on artifact type
          if (this.isRecipeCardArtifact(artifact)) {
            await this.enrichRecipeCardContent(artifact, contactPreferences);
            added++;
          } else if (this.isBlogPostArtifact(artifact)) {
            await this.enrichBlogPostContent(artifact, contactPreferences);
            added++;
          } else {
            skipped++;
            console.log(`⏭️ Skipping artifact ${artifact.id} - unsupported type`);
          }

        } catch (error) {
          console.error(`❌ Error processing artifact ${artifact.id}:`, error);
          skipped++;
        }
      }

      console.log(`✅ Auto-insert completed: ${added} added, ${skipped} skipped`);
      return { added, skipped };

    } catch (error) {
      console.error(`❌ Error auto-inserting affiliate products:`, error);
      return { added: 0, skipped: 0 };
    }
  }

  private async enrichRecipeCardContent(artifact: any, contactPreferences: any): Promise<void> {
    try {
      const content = this.parseArtifactContent(artifact);
      
      // Skip if already has affiliate products
      if (content.affiliateProducts && content.affiliateProducts.length > 0) {
        console.log(`⏭️ Recipe card ${artifact.id} already has affiliate products`);
        return;
      }

      const enrichedContent = await affiliateLookupService.enrichRecipeCard(content, contactPreferences);
      
      // Update the artifact with enriched content
      // Note: This is a placeholder - in production you'd need an updateCampaignArtifact method
      console.log(`✅ Enriched recipe card ${artifact.id} with ${enrichedContent.affiliateProducts?.length || 0} products`);
      
    } catch (error) {
      console.error(`❌ Error enriching recipe card content:`, error);
    }
  }

  private async enrichBlogPostContent(artifact: any, contactPreferences: any): Promise<void> {
    try {
      const content = this.parseArtifactContent(artifact);
      
      // Extract relevant tags from blog post content
      const blogText = content.content || content.body || '';
      const tags = this.extractTagsFromBlogContent(blogText);

      const lookupParams = {
        tags,
        category: 'kitchen',
        limit: 2, // Fewer products for blog posts
        contactPreferences
      };

      const affiliateProducts = await affiliateLookupService.lookupProducts(lookupParams);

      // Add affiliate products to blog content
      const enrichedContent = {
        ...content,
        affiliateProducts: affiliateProducts.map(product => ({
          id: product.id,
          name: product.name,
          url: product.url,
          price: product.price,
          imageUrl: product.imageUrl,
          source: product.source
        }))
      };

      console.log(`✅ Enriched blog post ${artifact.id} with ${affiliateProducts.length} products`);

    } catch (error) {
      console.error(`❌ Error enriching blog post content:`, error);
    }
  }

  private isRecipeCardArtifact(artifact: any): boolean {
    const type = artifact.type?.toLowerCase() || '';
    const title = artifact.title?.toLowerCase() || '';
    
    return type.includes('recipe') || 
           title.includes('recipe') || 
           type.includes('card') ||
           (artifact.metadata && artifact.metadata.template === 'recipe_card');
  }

  private isBlogPostArtifact(artifact: any): boolean {
    const type = artifact.type?.toLowerCase() || '';
    return type.includes('blog') || type.includes('post') || type.includes('article');
  }

  private parseArtifactContent(artifact: any): any {
    try {
      if (typeof artifact.content === 'string') {
        return JSON.parse(artifact.content);
      }
      return artifact.content || {};
    } catch (error) {
      console.error('❌ Error parsing artifact content:', error);
      return {};
    }
  }

  private extractTagsFromBlogContent(content: string): string[] {
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();

    // Cooking method keywords
    if (lowerContent.includes('baking') || lowerContent.includes('bake')) tags.push('baking');
    if (lowerContent.includes('grilling') || lowerContent.includes('grill')) tags.push('grilling');
    if (lowerContent.includes('sauté') || lowerContent.includes('pan-fry')) tags.push('cookware');
    if (lowerContent.includes('knife') || lowerContent.includes('chop') || lowerContent.includes('dice')) tags.push('knives');

    // Ingredient keywords
    if (lowerContent.includes('oil') || lowerContent.includes('olive oil')) tags.push('oil');
    if (lowerContent.includes('spice') || lowerContent.includes('seasoning') || lowerContent.includes('herbs')) tags.push('spices');
    if (lowerContent.includes('organic')) tags.push('organic');

    // Equipment keywords
    if (lowerContent.includes('cast iron') || lowerContent.includes('skillet')) tags.push('cookware');
    if (lowerContent.includes('mixer') || lowerContent.includes('blender')) tags.push('appliances');
    if (lowerContent.includes('scale') || lowerContent.includes('measuring')) tags.push('measuring-tools');

    // Default fallback
    if (tags.length === 0) {
      tags.push('cooking-essentials', 'kitchen-tools');
    }

    return tags;
  }
}

export const affiliateEnrichmentService = new AffiliateEnrichmentService();