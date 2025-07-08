import { Request, Response } from 'express';
import { db } from '../db.js';
import { scheduledPosts, contentGenerations, platformContent, insertScheduledPostSchema } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const scheduleContentSchema = z.object({
  contentId: z.number(),
  platforms: z.array(z.string()),
  scheduledTime: z.string().datetime(),
  makeWebhookUrl: z.string().url().optional(),
  bulkJobId: z.string().optional(),
});

// Schedule content for cross-platform distribution
export async function scheduleContent(req: Request, res: Response) {
  try {
    const validatedData = scheduleContentSchema.parse(req.body);
    
    // Verify content exists
    const content = await db.select()
      .from(contentGenerations)
      .where(eq(contentGenerations.id, validatedData.contentId))
      .limit(1);
    
    if (content.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Create scheduled post
    const [scheduledPost] = await db.insert(scheduledPosts).values({
      contentId: validatedData.contentId,
      platforms: validatedData.platforms,
      scheduledTime: new Date(validatedData.scheduledTime),
      makeWebhookUrl: validatedData.makeWebhookUrl,
      bulkJobId: validatedData.bulkJobId,
      status: 'pending',
    }).returning();

    // Generate platform-specific content for each platform
    const platformContentRecords = [];
    for (const platform of validatedData.platforms) {
      const formattedContent = await formatContentForPlatform(content[0], platform);
      
      const [platformRecord] = await db.insert(platformContent).values({
        contentId: validatedData.contentId,
        platform,
        formattedContent: formattedContent.content,
        hashtags: formattedContent.hashtags,
        title: formattedContent.title,
        tags: formattedContent.tags,
        scheduledTime: new Date(validatedData.scheduledTime),
        publishStatus: 'scheduled',
      }).returning();
      
      platformContentRecords.push(platformRecord);
    }

    res.json({
      success: true,
      scheduledPost,
      platformContent: platformContentRecords,
      message: `Content scheduled for ${validatedData.platforms.length} platforms`,
    });

  } catch (error) {
    console.error('Schedule content error:', error);
    res.status(500).json({ 
      error: 'Failed to schedule content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get scheduled posts with status and platform results
export async function getScheduledPosts(req: Request, res: Response) {
  try {
    const { status, platform, limit = 50 } = req.query;
    
    let query = db.select({
      id: scheduledPosts.id,
      contentId: scheduledPosts.contentId,
      platforms: scheduledPosts.platforms,
      scheduledTime: scheduledPosts.scheduledTime,
      status: scheduledPosts.status,
      bulkJobId: scheduledPosts.bulkJobId,
      platformResults: scheduledPosts.platformResults,
      errorMessage: scheduledPosts.errorMessage,
      createdAt: scheduledPosts.createdAt,
      content: {
        product: contentGenerations.product,
        niche: contentGenerations.niche,
        content: contentGenerations.content,
      }
    })
    .from(scheduledPosts)
    .leftJoin(contentGenerations, eq(scheduledPosts.contentId, contentGenerations.id))
    .orderBy(scheduledPosts.scheduledTime)
    .limit(Number(limit));

    // Apply filters
    if (status) {
      query = query.where(eq(scheduledPosts.status, status as string));
    }

    const posts = await query;

    // Filter by platform if specified
    const filteredPosts = platform 
      ? posts.filter(post => post.platforms?.includes(platform as string))
      : posts;

    res.json({
      success: true,
      posts: filteredPosts,
      total: filteredPosts.length,
    });

  } catch (error) {
    console.error('Get scheduled posts error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch scheduled posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Process scheduled posts (typically called by cron job)
export async function processScheduledPosts(req: Request, res: Response) {
  try {
    const now = new Date();
    
    // Get posts that are due for publishing
    const duePosts = await db.select()
      .from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.status, 'pending'),
          // scheduledTime <= now
        )
      );

    const results = [];
    
    for (const post of duePosts) {
      try {
        // Update status to processing
        await db.update(scheduledPosts)
          .set({ 
            status: 'processing',
            updatedAt: new Date(),
          })
          .where(eq(scheduledPosts.id, post.id));

        // Send to Make.com webhook if configured
        let webhookResult = null;
        if (post.makeWebhookUrl) {
          webhookResult = await sendToMakeWebhook(post);
        }

        // Update with results
        await db.update(scheduledPosts)
          .set({ 
            status: 'completed',
            platformResults: webhookResult,
            updatedAt: new Date(),
          })
          .where(eq(scheduledPosts.id, post.id));

        results.push({
          postId: post.id,
          status: 'completed',
          platforms: post.platforms,
          webhookResult,
        });

      } catch (error) {
        // Update with error
        await db.update(scheduledPosts)
          .set({ 
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            updatedAt: new Date(),
          })
          .where(eq(scheduledPosts.id, post.id));

        results.push({
          postId: post.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    res.json({
      success: true,
      processedPosts: results.length,
      results,
    });

  } catch (error) {
    console.error('Process scheduled posts error:', error);
    res.status(500).json({ 
      error: 'Failed to process scheduled posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to format content for specific platforms
async function formatContentForPlatform(content: any, platform: string) {
  const baseContent = content.content;
  
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return {
        content: baseContent + '\n\n#TikTokMadeMeBuyIt #MustHave #ProductReview',
        hashtags: ['TikTokMadeMeBuyIt', 'MustHave', 'ProductReview', content.niche],
        title: `${content.product} Review`,
        tags: [content.niche, 'product-review', 'trending'],
      };
      
    case 'instagram':
      return {
        content: baseContent + '\n\n#InstagramFinds #ProductReview #MustHave',
        hashtags: ['InstagramFinds', 'ProductReview', 'MustHave', content.niche],
        title: `${content.product} - Instagram Review`,
        tags: [content.niche, 'instagram', 'review'],
      };
      
    case 'youtube':
      return {
        content: `${content.product} Review - Is it worth it?\n\n${baseContent}\n\nCheck the description for links!`,
        hashtags: ['ProductReview', 'YouTubeFinds', content.niche],
        title: `${content.product} Review - Honest Opinion`,
        tags: [content.niche, 'product-review', 'honest-review', 'trending'],
      };
      
    case 'twitter':
      const shortContent = baseContent.substring(0, 240) + '... 🧵';
      return {
        content: shortContent,
        hashtags: ['ProductReview', content.niche],
        title: `${content.product} Review Thread`,
        tags: [content.niche, 'twitter-thread'],
      };
      
    default:
      return {
        content: baseContent,
        hashtags: [content.niche, 'ProductReview'],
        title: `${content.product} Review`,
        tags: [content.niche],
      };
  }
}

// Helper function to send data to Make.com webhook
async function sendToMakeWebhook(post: any) {
  if (!post.makeWebhookUrl) return null;
  
  try {
    const webhookData = {
      scheduledPostId: post.id,
      contentId: post.contentId,
      platforms: post.platforms,
      scheduledTime: post.scheduledTime,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(post.makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Make.com webhook error:', error);
    throw error;
  }
}