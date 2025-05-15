import { db } from '../db';
import { 
  apiIntegrations, 
  socialMediaPlatforms, 
  publishedContent, 
  apiRateLimits,
  integrationWebhooks,
  type ApiIntegration,
  type SocialMediaPlatform,
  type PublishedContent,
  type ApiRateLimit,
  type IntegrationWebhook,
  type ContentGeneration
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import axios from 'axios';

/**
 * Manages social media platform integrations and API connections
 */
export class ApiIntegrationService {
  /**
   * Fetch all available social media platforms
   */
  async getAllPlatforms(): Promise<SocialMediaPlatform[]> {
    return await db.select().from(socialMediaPlatforms).where(eq(socialMediaPlatforms.isActive, true));
  }

  /**
   * Fetch a specific platform by ID
   */
  async getPlatformById(id: number): Promise<SocialMediaPlatform | undefined> {
    const [platform] = await db
      .select()
      .from(socialMediaPlatforms)
      .where(eq(socialMediaPlatforms.id, id));
    return platform;
  }

  /**
   * Get all API integrations for a specific user
   */
  async getUserIntegrations(userId: number): Promise<ApiIntegration[]> {
    return await db
      .select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.userId, userId))
      .orderBy(desc(apiIntegrations.createdAt));
  }

  /**
   * Get a specific integration by ID
   */
  async getIntegrationById(id: number, userId: number): Promise<ApiIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(apiIntegrations)
      .where(
        and(
          eq(apiIntegrations.id, id),
          eq(apiIntegrations.userId, userId)
        )
      );
    return integration;
  }

  /**
   * Create a new API integration
   */
  async createIntegration(integration: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiIntegration> {
    const [newIntegration] = await db
      .insert(apiIntegrations)
      .values({
        ...integration,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return newIntegration;
  }

  /**
   * Update an existing API integration
   */
  async updateIntegration(
    id: number, 
    userId: number, 
    data: Partial<Omit<ApiIntegration, 'id' | 'userId' | 'createdAt'>>
  ): Promise<ApiIntegration | undefined> {
    const [updatedIntegration] = await db
      .update(apiIntegrations)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(apiIntegrations.id, id),
          eq(apiIntegrations.userId, userId)
        )
      )
      .returning();

    return updatedIntegration;
  }

  /**
   * Delete an API integration
   */
  async deleteIntegration(id: number, userId: number): Promise<boolean> {
    const [deleted] = await db
      .delete(apiIntegrations)
      .where(
        and(
          eq(apiIntegrations.id, id),
          eq(apiIntegrations.userId, userId)
        )
      )
      .returning();

    return !!deleted;
  }

  /**
   * Get rate limit information for an integration
   */
  async getRateLimit(integrationId: number, platformId: number): Promise<ApiRateLimit | undefined> {
    const [rateLimit] = await db
      .select()
      .from(apiRateLimits)
      .where(
        and(
          eq(apiRateLimits.integrationId, integrationId),
          eq(apiRateLimits.platformId, platformId)
        )
      );

    return rateLimit;
  }

  /**
   * Update rate limit information
   */
  async updateRateLimit(
    integrationId: number, 
    platformId: number, 
    requestsSent: number
  ): Promise<ApiRateLimit> {
    // Check if rate limit record exists
    const existingRateLimit = await this.getRateLimit(integrationId, platformId);

    if (existingRateLimit) {
      // Update existing record
      const [updatedRateLimit] = await db
        .update(apiRateLimits)
        .set({
          requestsSent: existingRateLimit.requestsSent + requestsSent,
          lastUpdated: new Date()
        })
        .where(
          and(
            eq(apiRateLimits.integrationId, integrationId),
            eq(apiRateLimits.platformId, platformId)
          )
        )
        .returning();

      return updatedRateLimit;
    } else {
      // Create new record
      const [newRateLimit] = await db
        .insert(apiRateLimits)
        .values({
          integrationId,
          platformId,
          requestsSent,
          lastUpdated: new Date()
        })
        .returning();

      return newRateLimit;
    }
  }

  /**
   * Get webhooks for an integration
   */
  async getIntegrationWebhooks(integrationId: number, userId: number): Promise<IntegrationWebhook[]> {
    return await db
      .select()
      .from(integrationWebhooks)
      .where(
        and(
          eq(integrationWebhooks.integrationId, integrationId),
          eq(integrationWebhooks.userId, userId)
        )
      );
  }

  /**
   * Create a new webhook
   */
  async createWebhook(webhook: Omit<IntegrationWebhook, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggered'>): Promise<IntegrationWebhook> {
    const [newWebhook] = await db
      .insert(integrationWebhooks)
      .values({
        ...webhook,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return newWebhook;
  }

  /**
   * Update a webhook
   */
  async updateWebhook(
    id: number, 
    userId: number, 
    data: Partial<Omit<IntegrationWebhook, 'id' | 'userId' | 'createdAt'>>
  ): Promise<IntegrationWebhook | undefined> {
    const [updatedWebhook] = await db
      .update(integrationWebhooks)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(integrationWebhooks.id, id),
          eq(integrationWebhooks.userId, userId)
        )
      )
      .returning();

    return updatedWebhook;
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: number, userId: number): Promise<boolean> {
    const [deleted] = await db
      .delete(integrationWebhooks)
      .where(
        and(
          eq(integrationWebhooks.id, id),
          eq(integrationWebhooks.userId, userId)
        )
      )
      .returning();

    return !!deleted;
  }

  /**
   * Publish content to a platform
   */
  async publishContent(
    contentId: number,
    platformId: number,
    integrationId: number,
    userId: number,
    scheduleTime?: Date,
    metadata?: Record<string, any>
  ): Promise<PublishedContent> {
    // Implementation will connect to the specific platform's API
    // This is a placeholder that records the attempt and marks it as "scheduled" or "pending"
    const status = scheduleTime ? 'scheduled' : 'pending';
    
    const [publishRecord] = await db
      .insert(publishedContent)
      .values({
        contentId,
        platformId,
        integrationId,
        userId,
        publishStatus: status,
        scheduledPublishTime: scheduleTime,
        metadata: metadata || {},
        createdAt: new Date()
      })
      .returning();

    return publishRecord;
  }

  /**
   * Get published content history for a user
   */
  async getUserPublishedContent(userId: number, limit = 50): Promise<PublishedContent[]> {
    return await db
      .select()
      .from(publishedContent)
      .where(eq(publishedContent.userId, userId))
      .orderBy(desc(publishedContent.createdAt))
      .limit(limit);
  }

  /**
   * Update published content status
   */
  async updatePublishStatus(
    id: number,
    status: string,
    platformContentId?: string,
    publishedUrl?: string,
    statusMessage?: string
  ): Promise<PublishedContent | undefined> {
    const [updated] = await db
      .update(publishedContent)
      .set({
        publishStatus: status,
        platformContentId,
        publishedUrl,
        statusMessage,
        publishedAt: status === 'success' ? new Date() : undefined
      })
      .where(eq(publishedContent.id, id))
      .returning();

    return updated;
  }
}

export const apiIntegrationService = new ApiIntegrationService();