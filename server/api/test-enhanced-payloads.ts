import type { Request, Response } from "express";
import { WebhookService } from "../services/webhookService";

const webhookService = new WebhookService();

export async function testEnhancedPayloads(req: Request, res: Response) {
  try {
    console.log('🧪 Testing enhanced payloads with new categorization...');

    // Create sample video content with enhanced categorization
    const videoPayload = {
      platformContent: {
        "TikTok": {
          platform: "TikTok",
          type: "video",
          label: "Video Content (TikTok)",
          caption: "💫 This skincare routine is about to change your life! Here's why the Glow Recipe Vitamin C serum is trending with 1.4M mentions...",
          script: "Hook: Are you tired of dull skin? [Pause] Let me show you the viral skincare product everyone's talking about. [Hold up product] This Glow Recipe Vitamin C serum has over 1.4 million mentions for a reason. [Apply to skin] It brightens, hydrates, and gives you that glass skin glow instantly. The vitamin C fights dark spots while the hyaluronic acid plumps your skin. [Show before/after] Results speak for themselves! Link in bio to get yours.",
          hashtags: ["#GlowRecipe", "#VitaminC", "#SkincareRoutine", "#GlowUp", "#KBeauty"],
          postInstructions: "Post during peak engagement hours (7-9 PM)",
          contentCategory: "video",
          mediaType: "video_script",
          automationReady: true,
          batchId: `test-${new Date().toISOString().split('T')[0]}`
        }
      },
      platformSchedules: {},
      metadata: {
        product: "Glow Recipe Vitamin C",
        niche: "skincare",
        tone: "enthusiastic",
        templateType: "viral_hook",
        generatedAt: new Date().toISOString(),
        batchGeneration: false,
        contentType: "video",
        mediaType: "video_script",
        automationSource: "test_enhanced",
        mentions: 1456000
      }
    };

    // Create sample photo content with enhanced categorization
    const photoPayload = {
      platformContent: {
        "Instagram": {
          platform: "Instagram",
          type: "photo",
          label: "Photo Content (Instagram)",
          caption: "✨ Morning skincare routine featuring the viral Glow Recipe Vitamin C serum! This little bottle has 1.4M mentions and I can see why. The glow is unreal! 💫\n\n#GlowRecipe #MorningRoutine #SkincareAddict #GlowUp",
          hashtags: ["#GlowRecipe", "#MorningRoutine", "#SkincareAddict", "#GlowUp"],
          postInstructions: "Post with high-quality product photo",
          contentCategory: "photo",
          mediaType: "photo_post",
          automationReady: true,
          batchId: `test-${new Date().toISOString().split('T')[0]}`
        }
      },
      platformSchedules: {},
      metadata: {
        product: "Glow Recipe Vitamin C",
        niche: "skincare",
        tone: "friendly",
        templateType: "product_review",
        generatedAt: new Date().toISOString(),
        batchGeneration: false,
        contentType: "photo",
        mediaType: "photo_post",
        automationSource: "test_enhanced",
        mentions: 1456000
      }
    };

    // Create sample other content with enhanced categorization
    const otherPayload = {
      platformContent: {
        "X (Twitter)": {
          platform: "X (Twitter)",
          type: "other",
          label: "Text Content (X)",
          caption: "🧵 THREAD: Why Glow Recipe Vitamin C has 1.4M mentions (and why you need it)\n\n1/ The formula is genius - vitamin C + hyaluronic acid\n2/ It actually works on all skin types\n3/ Results are visible in days, not weeks\n\nHere's my honest review... 👇",
          hashtags: ["#SkincareThread", "#GlowRecipe", "#VitaminC"],
          postInstructions: "Post as Twitter thread during morning hours",
          contentCategory: "other",
          mediaType: "text_thread",
          automationReady: true,
          batchId: `test-${new Date().toISOString().split('T')[0]}`
        }
      },
      platformSchedules: {},
      metadata: {
        product: "Glow Recipe Vitamin C",
        niche: "skincare",
        tone: "informative",
        templateType: "educational_thread",
        generatedAt: new Date().toISOString(),
        batchGeneration: false,
        contentType: "other",
        mediaType: "text_thread",
        automationSource: "test_enhanced",
        mentions: 1456000
      }
    };

    // Send all three categorized payloads to Make.com
    console.log('📤 Sending VIDEO content with enhanced categorization...');
    await webhookService.sendMultiPlatformContent(videoPayload);
    
    console.log('📤 Sending PHOTO content with enhanced categorization...');
    await webhookService.sendMultiPlatformContent(photoPayload);
    
    console.log('📤 Sending OTHER content with enhanced categorization...');
    await webhookService.sendMultiPlatformContent(otherPayload);

    console.log('✅ All enhanced payloads sent to Make.com successfully!');

    res.json({
      success: true,
      message: "Enhanced payloads sent to Make.com",
      payloadsSent: 3,
      categories: ["video", "photo", "other"],
      features: [
        "contentCategory field for routing",
        "mediaType for specific format identification", 
        "automationReady flag for workflow filtering",
        "batchId for grouping related content",
        "automationSource for tracking generation method",
        "mentions count for prioritization"
      ]
    });

  } catch (error) {
    console.error('❌ Error testing enhanced payloads:', error);
    res.status(500).json({
      success: false,
      error: "Failed to send enhanced payloads",
      details: error.message
    });
  }
}