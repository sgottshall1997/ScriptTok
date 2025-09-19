import { eq, and, desc, asc, sql, like, gte, lte, or } from 'drizzle-orm';
import { contentRecords } from '../schema';
import { ContentRecord, ContentListParams, PaginatedContentResponse, ContentActionResponse, ContentStats, SourceApp } from '../types/content';
import { ContentAdapterFactory } from '../adapters/contentAdapters';

// =============================================================================
// Unified Content Service
// =============================================================================

export class UnifiedContentService {
  constructor(private db: any) {} // Accept any drizzle db instance

  // =============================================================================
  // CREATE Operations
  // =============================================================================

  /**
   * Save content from either GlowBot or CookAIng formats
   */
  async saveContent(
    sourceData: any, 
    sourceApp: SourceApp,
    options: { 
      checkDuplicate?: boolean;
      skipIfExists?: boolean;
    } = {}
  ): Promise<ContentActionResponse> {
    try {
      // Convert to unified format using adapters
      const unifiedContent = ContentAdapterFactory.convertToUnified(sourceData, sourceApp);
      
      // Check for duplicates if requested
      if (options.checkDuplicate && unifiedContent.dedupe_hash) {
        const existing = await this.db
          .select({ id: contentRecords.id })
          .from(contentRecords)
          .where(eq(contentRecords.dedupeHash, unifiedContent.dedupe_hash))
          .limit(1);
          
        if (existing.length > 0) {
          if (options.skipIfExists) {
            return {
              success: true,
              message: 'Content already exists, skipped',
              data: { id: existing[0].id, skipped: true }
            };
          } else {
            return {
              success: false,
              error: 'Duplicate content detected',
              data: { existingId: existing[0].id }
            };
          }
        }
      }

      // Insert the unified content
      const insertResult = await this.db
        .insert(contentRecords)
        .values({
          id: unifiedContent.id,
          sourceApp: unifiedContent.source_app,
          contentType: unifiedContent.content_type,
          title: unifiedContent.title,
          body: unifiedContent.body,
          blocks: unifiedContent.blocks,
          metadata: unifiedContent.metadata,
          rating: unifiedContent.rating,
          isFavorite: unifiedContent.is_favorite || false,
          dedupeHash: unifiedContent.dedupe_hash,
          createdAt: new Date(unifiedContent.created_at),
          updatedAt: new Date(unifiedContent.updated_at),
        })
        .returning({ id: contentRecords.id });

      return {
        success: true,
        message: 'Content saved successfully',
        data: { id: insertResult[0].id }
      };
    } catch (error) {
      console.error('Error saving content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save content'
      };
    }
  }

  // =============================================================================
  // READ Operations  
  // =============================================================================

  /**
   * List content with filtering, pagination, and sorting
   */
  async listContent(params: ContentListParams = {}): Promise<PaginatedContentResponse> {
    try {
      const {
        source_app,
        content_types = [],
        q = '',
        dateFrom,
        dateTo,
        page = 1,
        pageSize = 20,
        favoritesOnly = false,
        rating,
        niche,
        sortBy = 'newest'
      } = params;

      // Build WHERE conditions
      const conditions = [];

      if (source_app) {
        conditions.push(eq(contentRecords.sourceApp, source_app));
      }

      if (content_types.length > 0) {
        conditions.push(
          or(...content_types.map(type => eq(contentRecords.contentType, type)))
        );
      }

      if (q) {
        conditions.push(
          or(
            like(contentRecords.title, `%${q}%`),
            like(contentRecords.body, `%${q}%`)
          )
        );
      }

      if (dateFrom) {
        conditions.push(gte(contentRecords.createdAt, new Date(dateFrom)));
      }

      if (dateTo) {
        conditions.push(lte(contentRecords.createdAt, new Date(dateTo)));
      }

      if (favoritesOnly) {
        conditions.push(eq(contentRecords.isFavorite, true));
      }

      if (rating) {
        conditions.push(gte(contentRecords.rating, rating));
      }

      if (niche) {
        // Search in metadata JSON for niche
        conditions.push(sql`${contentRecords.metadata}->>'niche' = ${niche}`);
      }

      // Build ORDER BY clause
      let orderBy;
      switch (sortBy) {
        case 'oldest':
          orderBy = asc(contentRecords.createdAt);
          break;
        case 'rating_high':
          orderBy = desc(contentRecords.rating);
          break;
        case 'rating_low':
          orderBy = asc(contentRecords.rating);
          break;
        case 'title_asc':
          orderBy = asc(contentRecords.title);
          break;
        case 'title_desc':
          orderBy = desc(contentRecords.title);
          break;
        case 'newest':
        default:
          orderBy = desc(contentRecords.createdAt);
          break;
      }

      // Calculate pagination
      const offset = (page - 1) * pageSize;

      // Get total count
      const countResult = await this.db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(contentRecords)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = countResult[0]?.count || 0;
      const totalPages = Math.ceil(total / pageSize);

      // Get paginated results
      const results = await this.db
        .select()
        .from(contentRecords)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset);

      // Convert to unified format
      const unifiedResults: ContentRecord[] = results.map((row: any) => ({
        id: row.id,
        source_app: row.sourceApp as SourceApp,
        content_type: row.contentType,
        title: row.title || undefined,
        body: row.body || undefined,
        blocks: row.blocks as any,
        metadata: row.metadata as any,
        rating: row.rating || undefined,
        is_favorite: row.isFavorite || false,
        dedupe_hash: row.dedupeHash || undefined,
        created_at: row.createdAt.toISOString(),
        updated_at: row.updatedAt.toISOString(),
      }));

      return {
        success: true,
        data: unifiedResults,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      };
    } catch (error) {
      console.error('Error listing content:', error);
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        error: error instanceof Error ? error.message : 'Failed to list content'
      };
    }
  }

  /**
   * Get content by ID
   */
  async getContent(id: string): Promise<ContentActionResponse> {
    try {
      const result = await this.db
        .select()
        .from(contentRecords)
        .where(eq(contentRecords.id, id))
        .limit(1);

      if (result.length === 0) {
        return {
          success: false,
          error: 'Content not found'
        };
      }

      const row = result[0];
      const unifiedContent: ContentRecord = {
        id: row.id,
        source_app: row.sourceApp as SourceApp,
        content_type: row.contentType,
        title: row.title || undefined,
        body: row.body || undefined,
        blocks: row.blocks as any,
        metadata: row.metadata as any,
        rating: row.rating || undefined,
        is_favorite: row.isFavorite || false,
        dedupe_hash: row.dedupeHash || undefined,
        created_at: row.createdAt.toISOString(),
        updated_at: row.updatedAt.toISOString(),
      };

      return {
        success: true,
        data: unifiedContent
      };
    } catch (error) {
      console.error('Error getting content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get content'
      };
    }
  }

  // =============================================================================
  // UPDATE Operations
  // =============================================================================

  /**
   * Update content rating
   */
  async rateContent(id: string, rating: number): Promise<ContentActionResponse> {
    try {
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'Rating must be between 1 and 5'
        };
      }

      const result = await this.db
        .update(contentRecords)
        .set({ 
          rating, 
          updatedAt: new Date() 
        })
        .where(eq(contentRecords.id, id))
        .returning({ id: contentRecords.id });

      if (result.length === 0) {
        return {
          success: false,
          error: 'Content not found'
        };
      }

      return {
        success: true,
        message: 'Content rated successfully',
        data: { id: result[0].id, rating }
      };
    } catch (error) {
      console.error('Error rating content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rate content'
      };
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<ContentActionResponse> {
    try {
      // First get current favorite status
      const current = await this.db
        .select({ isFavorite: contentRecords.isFavorite })
        .from(contentRecords)
        .where(eq(contentRecords.id, id))
        .limit(1);

      if (current.length === 0) {
        return {
          success: false,
          error: 'Content not found'
        };
      }

      const newFavoriteStatus = !current[0].isFavorite;

      const result = await this.db
        .update(contentRecords)
        .set({ 
          isFavorite: newFavoriteStatus,
          updatedAt: new Date() 
        })
        .where(eq(contentRecords.id, id))
        .returning({ id: contentRecords.id });

      return {
        success: true,
        message: `Content ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`,
        data: { id: result[0].id, isFavorite: newFavoriteStatus }
      };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle favorite'
      };
    }
  }

  // =============================================================================
  // DELETE Operations
  // =============================================================================

  /**
   * Delete content by ID
   */
  async deleteContent(id: string): Promise<ContentActionResponse> {
    try {
      const result = await this.db
        .delete(contentRecords)
        .where(eq(contentRecords.id, id))
        .returning({ id: contentRecords.id });

      if (result.length === 0) {
        return {
          success: false,
          error: 'Content not found'
        };
      }

      return {
        success: true,
        message: 'Content deleted successfully',
        data: { id: result[0].id }
      };
    } catch (error) {
      console.error('Error deleting content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete content'
      };
    }
  }

  /**
   * Bulk delete content by IDs
   */
  async bulkDeleteContent(ids: string[]): Promise<ContentActionResponse> {
    try {
      if (ids.length === 0) {
        return {
          success: false,
          error: 'No IDs provided'
        };
      }

      const result = await this.db
        .delete(contentRecords)
        .where(
          or(...ids.map(id => eq(contentRecords.id, id)))
        )
        .returning({ id: contentRecords.id });

      return {
        success: true,
        message: `Deleted ${result.length} content items`,
        data: { deletedIds: result.map((r: any) => r.id), count: result.length }
      };
    } catch (error) {
      console.error('Error bulk deleting content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk delete content'
      };
    }
  }

  // =============================================================================
  // ANALYTICS Operations
  // =============================================================================

  /**
   * Get content statistics
   */
  async getContentStats(sourceApp?: SourceApp): Promise<ContentStats> {
    try {
      // Base query conditions
      const conditions = sourceApp ? [eq(contentRecords.sourceApp, sourceApp)] : [];

      // Total count
      const totalResult = await this.db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(contentRecords)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult[0]?.count || 0;

      // Count by source app
      const bySourceResult = await this.db
        .select({ 
          sourceApp: contentRecords.sourceApp,
          count: sql<number>`cast(count(*) as int)` 
        })
        .from(contentRecords)
        .groupBy(contentRecords.sourceApp);

      const by_source: Record<SourceApp, number> = {
        glowbot: 0,
        cookAIng: 0
      };

      bySourceResult.forEach((row: any) => {
        by_source[row.sourceApp as SourceApp] = row.count;
      });

      // Count by content type
      const byTypeResult = await this.db
        .select({ 
          contentType: contentRecords.contentType,
          count: sql<number>`cast(count(*) as int)` 
        })
        .from(contentRecords)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(contentRecords.contentType);

      const by_type: Record<string, number> = {};
      byTypeResult.forEach((row: any) => {
        by_type[row.contentType] = row.count;
      });

      // Recent count (last 7 days)
      const recentResult = await this.db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(contentRecords)
        .where(
          and(
            gte(contentRecords.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            ...(conditions.length > 0 ? conditions : [])
          )
        );

      const recent_count = recentResult[0]?.count || 0;

      // Favorites count
      const favoritesResult = await this.db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(contentRecords)
        .where(
          and(
            eq(contentRecords.isFavorite, true),
            ...(conditions.length > 0 ? conditions : [])
          )
        );

      const favorites_count = favoritesResult[0]?.count || 0;

      // Average rating
      const avgRatingResult = await this.db
        .select({ avgRating: sql<number>`cast(avg(${contentRecords.rating}) as float)` })
        .from(contentRecords)
        .where(
          and(
            sql`${contentRecords.rating} IS NOT NULL`,
            ...(conditions.length > 0 ? conditions : [])
          )
        );

      const avg_rating = avgRatingResult[0]?.avgRating || undefined;

      return {
        total,
        by_source,
        by_type,
        recent_count,
        favorites_count,
        avg_rating
      };
    } catch (error) {
      console.error('Error getting content stats:', error);
      return {
        total: 0,
        by_source: { glowbot: 0, cookAIng: 0 },
        by_type: {},
        recent_count: 0,
        favorites_count: 0
      };
    }
  }
}