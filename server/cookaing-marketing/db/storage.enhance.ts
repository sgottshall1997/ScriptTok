/**
 * Storage helpers for Content Enhancement features
 * Phase 2: Handles content_versions → content_enhancements → media_assets → campaign_artifacts flow
 */

import { db } from '../../db';
import { eq, and, desc } from 'drizzle-orm';
import {
  contentVersions,
  contentEnhancements,
  mediaAssets,
  contentLinks,
  campaignArtifacts,
  campaigns,
  type ContentEnhancement,
  type MediaAsset,
  type CampaignArtifact,
  type ContentLink
} from '../../../shared/schema';

// Types for enhancement operations
export interface CreateEnhancementInput {
  versionId: number;
  enhancement: 'rewrite' | 'tts' | 'image' | 'video';
  inputs: Record<string, any>;
  provider?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface UpsertMediaAssetInput {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbUrl?: string;
  metadata: Record<string, any>;
  status?: 'pending' | 'processing' | 'ready' | 'failed';
}

export interface SnapshotToCampaignInput {
  versionId?: number;
  payloadJson?: Record<string, any>;
  channel: string;
  platform?: string;
  campaignId: number;
  title?: string;
  summary?: string;
}

/**
 * Create a new content enhancement record
 */
export async function createEnhancement(input: CreateEnhancementInput): Promise<ContentEnhancement> {
  const [enhancement] = await db.insert(contentEnhancements).values({
    versionId: input.versionId,
    enhancement: input.enhancement,
    inputsJson: input.inputs,
    outputsJson: {},
    provider: input.provider || 'mock',
    status: input.status || 'pending',
    createdAt: new Date()
  }).returning();

  return enhancement;
}

/**
 * Upsert a media asset (create or update if exists)
 */
export async function upsertMediaAsset(input: UpsertMediaAssetInput): Promise<MediaAsset> {
  const [asset] = await db.insert(mediaAssets).values({
    type: input.type,
    url: input.url,
    thumbUrl: input.thumbUrl,
    metadataJson: input.metadata,
    status: input.status || 'ready',
    createdAt: new Date()
  }).returning();

  return asset;
}

/**
 * Link a content version to a campaign artifact
 */
export async function linkVersionToArtifact(versionId: number, artifactId: number): Promise<ContentLink> {
  const [link] = await db.insert(contentLinks).values({
    sourceType: 'content_version',
    sourceId: versionId,
    targetType: 'campaign_artifact',
    targetId: artifactId,
    linkType: 'enhancement_attachment',
    createdAt: new Date()
  }).returning();

  return link;
}

/**
 * Persist enhancement outputs and optionally link media assets
 */
export async function persistOutputs(
  enhancementId: number,
  outputs: Record<string, any>,
  options?: { mediaAssets?: MediaAsset[] }
): Promise<ContentEnhancement> {
  // Update enhancement with outputs
  const [enhancement] = await db.update(contentEnhancements)
    .set({
      outputsJson: outputs,
      status: 'completed',
      updatedAt: new Date()
    })
    .where(eq(contentEnhancements.id, enhancementId))
    .returning();

  // Link media assets if provided
  if (options?.mediaAssets?.length) {
    for (const asset of options.mediaAssets) {
      await db.insert(contentLinks).values({
        sourceType: 'content_enhancement',
        sourceId: enhancementId,
        targetType: 'media_asset',
        targetId: asset.id!,
        linkType: 'enhancement_media',
        createdAt: new Date()
      });
    }
  }

  return enhancement;
}

/**
 * Create a campaign artifact from enhancement/version snapshot
 */
export async function snapshotToCampaignArtifact(input: SnapshotToCampaignInput): Promise<{
  artifact: CampaignArtifact;
  link?: ContentLink;
}> {
  // Create the campaign artifact
  const [artifact] = await db.insert(campaignArtifacts).values({
    campaignId: input.campaignId,
    channel: input.channel,
    platform: input.platform,
    title: input.title || `Enhanced Content - ${input.channel}`,
    summary: input.summary,
    payloadJson: input.payloadJson || {},
    status: 'draft',
    createdAt: new Date()
  }).returning();

  // Link to version if provided
  let link: ContentLink | undefined;
  if (input.versionId) {
    [link] = await db.insert(contentLinks).values({
      sourceType: 'content_version',
      sourceId: input.versionId,
      targetType: 'campaign_artifact',
      targetId: artifact.id!,
      linkType: 'enhancement_snapshot',
      createdAt: new Date()
    }).returning();
  }

  return { artifact, link };
}

/**
 * Get all enhancements for a content version
 */
export async function getEnhancementsByVersion(versionId: number): Promise<Array<ContentEnhancement & {
  mediaAssets?: MediaAsset[];
}>> {
  // Get enhancements
  const enhancements = await db.select()
    .from(contentEnhancements)
    .where(eq(contentEnhancements.versionId, versionId))
    .orderBy(desc(contentEnhancements.createdAt));

  // Get linked media assets for each enhancement
  const enhancementsWithMedia = await Promise.all(
    enhancements.map(async (enhancement) => {
      const mediaLinks = await db.select()
        .from(contentLinks)
        .innerJoin(mediaAssets, eq(contentLinks.targetId, mediaAssets.id))
        .where(
          and(
            eq(contentLinks.sourceType, 'content_enhancement'),
            eq(contentLinks.sourceId, enhancement.id!),
            eq(contentLinks.targetType, 'media_asset')
          )
        );

      return {
        ...enhancement,
        mediaAssets: mediaLinks.map(link => link.media_assets)
      };
    })
  );

  return enhancementsWithMedia;
}

/**
 * Get enhancement by ID with linked media
 */
export async function getEnhancementById(enhancementId: number): Promise<(ContentEnhancement & {
  mediaAssets?: MediaAsset[];
}) | null> {
  const [enhancement] = await db.select()
    .from(contentEnhancements)
    .where(eq(contentEnhancements.id, enhancementId));

  if (!enhancement) return null;

  // Get linked media assets
  const mediaLinks = await db.select()
    .from(contentLinks)
    .innerJoin(mediaAssets, eq(contentLinks.targetId, mediaAssets.id))
    .where(
      and(
        eq(contentLinks.sourceType, 'content_enhancement'),
        eq(contentLinks.sourceId, enhancementId),
        eq(contentLinks.targetType, 'media_asset')
      )
    );

  return {
    ...enhancement,
    mediaAssets: mediaLinks.map(link => link.media_assets)
  };
}

/**
 * Get enhancements linked to a campaign artifact
 */
export async function getArtifactEnhancements(artifactId: number): Promise<Array<ContentEnhancement & {
  mediaAssets?: MediaAsset[];
}>> {
  // Find content versions linked to this artifact
  const versionLinks = await db.select()
    .from(contentLinks)
    .where(
      and(
        eq(contentLinks.targetType, 'campaign_artifact'),
        eq(contentLinks.targetId, artifactId),
        eq(contentLinks.sourceType, 'content_version')
      )
    );

  if (!versionLinks.length) return [];

  // Get enhancements for those versions
  const allEnhancements = await Promise.all(
    versionLinks.map(link => getEnhancementsByVersion(link.sourceId))
  );

  return allEnhancements.flat();
}