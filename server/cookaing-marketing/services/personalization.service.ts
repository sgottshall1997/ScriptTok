/**
 * Personalization Service - Dynamic content adaptation and audience targeting
 */

import { db } from '../../storage.ts';
import { cookaingContentVersions, contentEnhancements, analyticsEvents, contacts } from '../../../shared/schema.ts';
import { eq } from 'drizzle-orm';
import { personalizationProvider } from './providers/personalization.provider.ts';

interface AudienceRules {
  diet?: string[];
  skill?: string;
  time?: string;
  geo?: string;
  device?: string;
  language?: string;
}

interface PersonalizationResult {
  adaptedPayload: any;
  originalContent: string;
  adaptedContent: string;
  appliedRules: string[];
  confidence: number;
  mode: string;
}

class PersonalizationService {
  /**
   * Build audience rules UI schema
   */
  getAudienceRulesSchema() {
    return {
      diet: {
        type: 'multiselect',
        label: 'Dietary Preferences',
        options: ['vegan', 'vegetarian', 'gluten-free', 'keto', 'paleo', 'dairy-free', 'nut-free']
      },
      skill: {
        type: 'select',
        label: 'Cooking Skill Level',
        options: ['beginner', 'intermediate', 'advanced']
      },
      time: {
        type: 'select',
        label: 'Time Preference',
        options: ['quick', 'moderate', 'extended']
      },
      geo: {
        type: 'select',
        label: 'Geographic Region',
        options: ['US', 'EU', 'APAC', 'LATAM']
      },
      device: {
        type: 'select',
        label: 'Primary Device',
        options: ['mobile', 'desktop', 'tablet']
      },
      language: {
        type: 'select',
        label: 'Language',
        options: ['en', 'es', 'fr', 'de', 'pt']
      }
    };
  }

  /**
   * Preview audience rules adaptation
   */
  async previewAdaptation({ versionId, audienceRules }: { versionId: number; audienceRules: AudienceRules }): Promise<PersonalizationResult> {
    const version = await this.getContentVersion(versionId);
    const originalContent = this.extractContent(version.payloadJson);

    const result = await personalizationProvider.previewAdaptation({
      originalContent,
      audienceRules,
      platform: version.platform || undefined,
      templateType: version.template || undefined
    });

    const adaptedPayload = {
      ...version.payloadJson,
      mainContent: result.adaptedContent,
      personalizationPreview: {
        audienceRules,
        appliedRules: result.appliedRules,
        previewedAt: new Date().toISOString(),
        mode: result.mode
      }
    };

    return {
      adaptedPayload,
      originalContent,
      adaptedContent: result.adaptedContent,
      appliedRules: result.appliedRules,
      confidence: result.confidence,
      mode: result.mode
    };
  }

  /**
   * Apply audience rules to content version
   */
  async adaptForAudience({ versionId, audienceRules, persist = true }: { versionId: number; audienceRules: AudienceRules; persist?: boolean }): Promise<PersonalizationResult> {
    const version = await this.getContentVersion(versionId);
    const originalContent = this.extractContent(version.payloadJson);

    const result = await personalizationProvider.adaptForAudience({
      originalContent,
      audienceRules,
      platform: version.platform || undefined,
      templateType: version.template || undefined
    });

    const adaptedPayload = {
      ...version.payloadJson,
      mainContent: result.adaptedContent,
      personalizationApplied: {
        audienceRules,
        appliedRules: result.appliedRules,
        appliedAt: new Date().toISOString(),
        mode: result.mode
      }
    };

    if (persist) {
      // Create content enhancement record
      await db.insert(contentEnhancements).values({
        versionId,
        enhancement: 'dynamic_adapt',
        inputsJson: {
          audienceRules,
          originalLength: originalContent.length
        },
        outputsJson: {
          adaptedContent: result.adaptedContent,
          appliedRules: result.appliedRules,
          adaptedLength: result.adaptedContent.length,
          mode: result.mode
        },
        provider: 'personalization',
        status: 'completed'
      });

      // Update content version with audience rules
      // Note: This would require adding audience_rules_json field to content_versions
      // For now, store in metadata
      const updatedMetadata = {
        ...version.metadataJson,
        audienceRulesJson: audienceRules
      };

      await db
        .update(cookaingContentVersions)
        .set({ 
          metadataJson: updatedMetadata,
          payloadJson: adaptedPayload 
        })
        .where(eq(cookaingContentVersions.id, versionId));

      // Log analytics event
      await this.logAnalyticsEvent('audience_adapt', 'content_version', versionId, {
        audienceRules,
        appliedRules: result.appliedRules,
        mode: result.mode,
        originalLength: originalContent.length,
        adaptedLength: result.adaptedContent.length
      });
    }

    return {
      adaptedPayload,
      originalContent,
      adaptedContent: result.adaptedContent,
      appliedRules: result.appliedRules,
      confidence: result.confidence,
      mode: result.mode
    };
  }

  /**
   * Preview content as a specific contact
   */
  async previewAsContact({ versionId, contactId }: { versionId: number; contactId: number }) {
    // Get contact preferences and pantry
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId));

    if (!contact) {
      throw new Error('Contact not found');
    }

    const version = await this.getContentVersion(versionId);
    let content = this.extractContent(version.payloadJson);

    // Apply contact-specific personalization
    const prefs = contact.prefsJson as any || {};
    const pantry = contact.pantryJson as any || {};

    // Extract audience rules from contact preferences
    const audienceRules: AudienceRules = {
      diet: prefs.diet || [],
      skill: prefs.cookingSkill || 'intermediate',
      time: prefs.timePreference || 'moderate',
      geo: prefs.region || 'US',
      device: prefs.primaryDevice || 'mobile',
      language: prefs.language || 'en'
    };

    // Apply personalization
    const result = await this.previewAdaptation({ versionId, audienceRules });

    // Apply pantry-aware substitutions
    if (pantry.ingredients && Array.isArray(pantry.ingredients)) {
      content = this.applyPantrySubstitutions(result.adaptedContent, pantry.ingredients);
    }

    // Apply dietary restrictions from contact
    if (prefs.allergies && Array.isArray(prefs.allergies)) {
      content = this.applyAllergySubstitutions(content, prefs.allergies);
    }

    return {
      ...result,
      adaptedContent: content,
      contactPersonalization: {
        contactId,
        contactName: contact.name,
        appliedPreferences: prefs,
        pantryItems: pantry.ingredients?.length || 0,
        allergies: prefs.allergies || []
      }
    };
  }

  /**
   * Apply pantry-aware substitutions
   */
  private applyPantrySubstitutions(content: string, pantryIngredients: string[]): string {
    // Mock implementation - would use more sophisticated ingredient matching
    let adaptedContent = content;

    // Suggest alternatives based on what's in pantry
    pantryIngredients.forEach(ingredient => {
      const lowerIngredient = ingredient.toLowerCase();
      
      // Simple substitution rules
      if (lowerIngredient.includes('chicken') && !adaptedContent.toLowerCase().includes('chicken')) {
        adaptedContent = adaptedContent.replace(/beef/gi, 'chicken (from your pantry)');
      }
      if (lowerIngredient.includes('spinach') && !adaptedContent.toLowerCase().includes('spinach')) {
        adaptedContent = adaptedContent.replace(/lettuce/gi, 'spinach (from your pantry)');
      }
      if (lowerIngredient.includes('quinoa') && !adaptedContent.toLowerCase().includes('quinoa')) {
        adaptedContent = adaptedContent.replace(/rice/gi, 'quinoa (from your pantry)');
      }
    });

    return adaptedContent;
  }

  /**
   * Apply allergy substitutions
   */
  private applyAllergySubstitutions(content: string, allergies: string[]): string {
    let adaptedContent = content;

    allergies.forEach(allergy => {
      const lowerAllergy = allergy.toLowerCase();
      
      switch (lowerAllergy) {
        case 'nuts':
        case 'tree nuts':
          adaptedContent = adaptedContent.replace(/\bnuts?\b/gi, 'seeds');
          adaptedContent = adaptedContent.replace(/\balmonds?\b/gi, 'sunflower seeds');
          break;
        case 'dairy':
          adaptedContent = adaptedContent.replace(/\bmilk\b/gi, 'plant milk');
          adaptedContent = adaptedContent.replace(/\bcheese\b/gi, 'dairy-free cheese');
          break;
        case 'eggs':
          adaptedContent = adaptedContent.replace(/\beggs?\b/gi, 'flax eggs');
          break;
        case 'shellfish':
          adaptedContent = adaptedContent.replace(/\bshrimp\b/gi, 'mushrooms');
          adaptedContent = adaptedContent.replace(/\bcrab\b/gi, 'jackfruit');
          break;
      }
    });

    return adaptedContent;
  }

  /**
   * Get content version by ID
   */
  private async getContentVersion(versionId: number) {
    const [version] = await db
      .select()
      .from(cookaingContentVersions)
      .where(eq(cookaingContentVersions.id, versionId));

    if (!version) {
      throw new Error('Content version not found');
    }

    return version;
  }

  /**
   * Extract main content from payload
   */
  private extractContent(payloadJson: any): string {
    if (typeof payloadJson === 'string') return payloadJson;
    return payloadJson?.mainContent || payloadJson?.content || JSON.stringify(payloadJson);
  }

  /**
   * Log analytics event
   */
  private async logAnalyticsEvent(eventType: string, entityType: string, entityId: number, meta: any) {
    try {
      await db.insert(analyticsEvents).values({
        orgId: 1, // Default org for now
        eventType,
        entityType,
        entityId,
        metaJson: meta
      });
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }
}

export const personalizationService = new PersonalizationService();
export default personalizationService;