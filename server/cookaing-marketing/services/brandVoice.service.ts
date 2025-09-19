/**
 * Brand Voice Service - Manage brand voice profiles and application
 */

import { db } from '../../db';
import { brandVoiceProfiles, cookaingContentVersions, contentEnhancements, analyticsEvents } from '../../../shared/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { brandVoiceProvider } from './providers/brandVoice.provider.ts';

interface BrandVoiceProfile {
  id: number;
  name: string;
  summary: string;
  examplePhrases: string[];
  styleDescriptors: string[];
  createdAt: Date;
}

interface CorpusIngestionRequest {
  name: string;
  corpusText?: string;
  docs?: string[];
}

class BrandVoiceService {
  /**
   * Ingest corpus and create brand voice profile
   */
  async ingestCorpus(request: CorpusIngestionRequest): Promise<BrandVoiceProfile> {
    const { name, corpusText, docs } = request;
    
    // Combine corpus text from multiple sources
    let fullCorpus = corpusText || '';
    if (docs && docs.length > 0) {
      fullCorpus = fullCorpus + '\n\n' + docs.join('\n\n');
    }

    if (!fullCorpus.trim()) {
      throw new Error('No corpus content provided');
    }

    // Analyze corpus using provider
    const analysis = await brandVoiceProvider.analyzeCorpus(fullCorpus, name);

    // Store profile in database
    const [profile] = await db.insert(brandVoiceProfiles).values({
      name,
      corpusJson: {
        corpus: fullCorpus,
        analysis: analysis.profile,
        summary: analysis.summary,
        confidence: analysis.confidence,
        mode: analysis.mode
      },
      embeddingVector: null // Would be generated in live mode
    }).returning();

    // Log analytics event
    await this.logAnalyticsEvent('brand_voice_learn', 'brand_voice_profile', profile.id, {
      name,
      mode: analysis.mode,
      confidence: analysis.confidence,
      corpusLength: fullCorpus.length
    });

    return {
      id: profile.id,
      name: profile.name,
      summary: analysis.summary,
      examplePhrases: analysis.profile.examplePhrases,
      styleDescriptors: analysis.profile.styleDescriptors,
      createdAt: profile.createdAt
    };
  }

  /**
   * List all brand voice profiles
   */
  async listProfiles(): Promise<BrandVoiceProfile[]> {
    const profiles = await db
      .select()
      .from(brandVoiceProfiles)
      .orderBy(desc(brandVoiceProfiles.createdAt));

    return profiles.map(profile => {
      const corpus = profile.corpusJson as any;
      return {
        id: profile.id,
        name: profile.name,
        summary: corpus?.summary || 'No summary available',
        examplePhrases: corpus?.analysis?.examplePhrases || [],
        styleDescriptors: corpus?.analysis?.styleDescriptors || [],
        createdAt: profile.createdAt
      };
    });
  }

  /**
   * Get specific brand voice profile
   */
  async getProfile(profileId: number): Promise<BrandVoiceProfile | null> {
    const [profile] = await db
      .select()
      .from(brandVoiceProfiles)
      .where(eq(brandVoiceProfiles.id, profileId));

    if (!profile) return null;

    const corpus = profile.corpusJson as any;
    return {
      id: profile.id,
      name: profile.name,
      summary: corpus?.summary || 'No summary available',
      examplePhrases: corpus?.analysis?.examplePhrases || [],
      styleDescriptors: corpus?.analysis?.styleDescriptors || [],
      createdAt: profile.createdAt
    };
  }

  /**
   * Apply brand voice to a content version
   */
  async applyVoice({ versionId, profileId, persist = true }: { versionId: number; profileId: number; persist?: boolean }) {
    // Get the content version
    const [version] = await db
      .select()
      .from(cookaingContentVersions)
      .where(eq(cookaingContentVersions.id, versionId));

    if (!version) {
      throw new Error('Content version not found');
    }

    // Get the brand voice profile
    const profile = await this.getProfile(profileId);
    if (!profile) {
      throw new Error('Brand voice profile not found');
    }

    // Get the original content from payload
    const payload = version.payloadJson as any;
    const originalContent = payload?.mainContent || payload?.content || JSON.stringify(payload);

    // Get the full brand voice profile for application
    const [fullProfile] = await db
      .select()
      .from(brandVoiceProfiles)
      .where(eq(brandVoiceProfiles.id, profileId));

    const brandVoiceProfile = (fullProfile!.corpusJson as any)?.analysis;
    
    // Apply brand voice using provider
    const result = await brandVoiceProvider.applyVoice(originalContent, brandVoiceProfile);

    // Create adapted payload
    const adaptedPayload = {
      ...payload,
      mainContent: result.adaptedContent,
      brandVoiceApplied: {
        profileId,
        profileName: profile.name,
        appliedAt: new Date().toISOString(),
        mode: result.mode
      }
    };

    if (persist) {
      // Create content enhancement record
      await db.insert(contentEnhancements).values({
        versionId,
        enhancement: 'voice_adapt',
        inputsJson: {
          profileId,
          profileName: profile.name,
          originalLength: originalContent.length
        },
        outputsJson: {
          adaptedContent: result.adaptedContent,
          adaptedLength: result.adaptedContent.length,
          mode: result.mode
        },
        provider: 'brandVoice',
        status: 'completed'
      });

      // Update content version with brand voice profile reference
      // Note: This would require adding brand_voice_profile_id field to content_versions
      // For now, store in metadata
      const updatedMetadata = {
        ...version.metadataJson,
        brandVoiceProfileId: profileId
      };

      await db
        .update(cookaingContentVersions)
        .set({ 
          metadataJson: updatedMetadata,
          payloadJson: adaptedPayload 
        })
        .where(eq(cookaingContentVersions.id, versionId));

      // Log analytics event
      await this.logAnalyticsEvent('brand_voice_apply', 'content_version', versionId, {
        profileId,
        profileName: profile.name,
        mode: result.mode,
        originalLength: originalContent.length,
        adaptedLength: result.adaptedContent.length
      });
    }

    return {
      adaptedPayload,
      originalContent,
      adaptedContent: result.adaptedContent,
      mode: result.mode,
      profileUsed: profile
    };
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

export const brandVoiceService = new BrandVoiceService();
export default brandVoiceService;