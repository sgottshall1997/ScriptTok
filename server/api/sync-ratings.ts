import { Router } from "express";
import { and, eq, desc } from "drizzle-orm";
import { db } from "../db";
import { contentHistory, contentRatings } from "@shared/schema";
import crypto from 'crypto';
import axios from 'axios';

const router = Router();

interface RatedContentItem {
  contentId: string;
  databaseId: number;
  product: string;
  timestamp: string;
  tone: string;
  template: string;
  script: string;
  overallRating?: number;
  instagramRating?: number;
  tiktokRating?: number;
  youtubeRating?: number;
  twitterRating?: number;
}

interface UnmatchedRatingItem {
  product: string;
  timestamp: string;
  tone: string;
  template: string;
  script: string;
  ratings: {
    overall?: number;
    instagram?: number;
    tiktok?: number;
    youtube?: number;
    twitter?: number;
  };
  reason: string;
}

// Generate content ID hash for matching
function generateContentId(product: string, timestamp: string, tone: string, template: string): string {
  const content = `${product}-${timestamp}-${tone}-${template}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

// POST /api/sync-ratings - Sync ratings to Google Sheet via Make.com webhook
router.post('/', async (req, res) => {
  try {
    console.log('🔄 Starting ratings sync to Google Sheet...');
    
    // Fetch all content history items with their ratings
    const contentWithRatings = await db
      .select({
        id: contentHistory.id,
        productName: contentHistory.productName,
        tone: contentHistory.tone,
        contentType: contentHistory.contentType,
        outputText: contentHistory.outputText,
        createdAt: contentHistory.createdAt,
        // Rating fields
        overallRating: contentRatings.overallRating,
        instagramRating: contentRatings.instagramRating,
        tiktokRating: contentRatings.tiktokRating,
        youtubeRating: contentRatings.youtubeRating,
        twitterRating: contentRatings.twitterRating,
      })
      .from(contentHistory)
      .leftJoin(contentRatings, eq(contentRatings.contentHistoryId, contentHistory.id))
      .orderBy(desc(contentHistory.createdAt));

    console.log(`📊 Found ${contentWithRatings.length} content items`);

    // Filter for items that have been rated
    const ratedItems = contentWithRatings.filter(item => 
      item.overallRating !== null || 
      item.instagramRating !== null || 
      item.tiktokRating !== null || 
      item.youtubeRating !== null || 
      item.twitterRating !== null
    );

    console.log(`⭐ Found ${ratedItems.length} rated content items`);

    if (ratedItems.length === 0) {
      return res.json({
        success: true,
        message: 'No rated content items found to sync',
        syncedCount: 0,
        unmatchedCount: 0,
        unmatchedItems: []
      });
    }

    // Prepare rated content items for sync
    const ratedContentItems: RatedContentItem[] = ratedItems.map(item => {
      const timestamp = item.createdAt.toISOString();
      const contentId = generateContentId(
        item.productName, 
        timestamp, 
        item.tone, 
        item.contentType
      );

      return {
        contentId,
        databaseId: item.id,
        product: item.productName,
        timestamp,
        tone: item.tone,
        template: item.contentType,
        script: item.outputText.substring(0, 100), // First 100 chars for matching
        overallRating: item.overallRating || undefined,
        instagramRating: item.instagramRating || undefined,
        tiktokRating: item.tiktokRating || undefined,
        youtubeRating: item.youtubeRating || undefined,
        twitterRating: item.twitterRating || undefined,
      };
    });

    // Send sync payload to Make.com webhook
    const webhookUrl = 'https://hook.us2.make.com/j404wlveh2s5mii7az1rl6279xjaddnf';
    
    const syncPayload = {
      event_type: 'sync_ratings_to_sheet',
      action: 'batch_update_ratings',
      ratedItems: ratedContentItems,
      totalCount: ratedContentItems.length,
      timestamp: new Date().toISOString(),
      source: 'content_history_sync',
      mode: 'update_only', // Only update existing rows, do not add new ones
      instructions: {
        matchingMethod: 'contentId_or_script_fallback',
        updateColumns: ['TikTok Rating', 'IG Rating', 'YT Rating', 'X Rating', 'Full Output Rating'],
        skipUnmatched: true,
        preventDuplicates: true
      }
    };

    console.log('📤 Sending ratings sync payload to Make.com...');
    console.log(`🔢 Syncing ${ratedContentItems.length} rated items`);

    try {
      const webhookResponse = await axios.post(webhookUrl, syncPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log(`✅ Webhook sent successfully: ${webhookResponse.status}`);
      
      return res.json({
        success: true,
        message: `Successfully synced ${ratedContentItems.length} rated items to Google Sheet`,
        syncedCount: ratedContentItems.length,
        unmatchedCount: 0, // Make.com will handle matching logic
        unmatchedItems: [],
        webhookStatus: webhookResponse.status,
        payload: syncPayload
      });

    } catch (webhookError: any) {
      console.error('❌ Webhook failed:', webhookError.message);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send ratings sync to Make.com',
        message: webhookError.message,
        syncedCount: 0,
        unmatchedCount: ratedContentItems.length,
        unmatchedItems: ratedContentItems.map(item => ({
          product: item.product,
          timestamp: item.timestamp,
          tone: item.tone,
          template: item.template,
          script: item.script,
          ratings: {
            overall: item.overallRating,
            instagram: item.instagramRating,
            tiktok: item.tiktokRating,
            youtube: item.youtubeRating,
            twitter: item.twitterRating,
          },
          reason: 'Webhook delivery failed'
        }))
      });
    }

  } catch (error: any) {
    console.error('❌ Error syncing ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync ratings to Google Sheet',
      message: error.message,
      syncedCount: 0,
      unmatchedCount: 0,
      unmatchedItems: []
    });
  }
});

export default router;