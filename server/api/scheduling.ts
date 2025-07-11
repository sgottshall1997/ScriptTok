import { Router, Request, Response } from 'express';
import { db } from '../db';
import { platformContent } from '@shared/schema';
import { eq } from 'drizzle-orm';
import cron from 'node-cron';

const router = Router();

// Schedule content for platforms
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { contentId, platforms, scheduleTime } = req.body;
    
    if (!contentId || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Content ID and platforms array required' });
    }

    const scheduledContent = await Promise.all(
      platforms.map(async (platform: any) => {
        const [content] = await db.insert(platformContent).values({
          contentId,
          platform: platform.name,
          optimizedContent: platform.content,
          hashtags: platform.hashtags,
          scheduledFor: scheduleTime ? new Date(scheduleTime) : new Date(),
          status: 'scheduled'
        }).returning();
        return content;
      })
    );

    res.json({
      success: true,
      scheduledContent
    });

  } catch (error) {
    console.error('Error scheduling content:', error);
    res.status(500).json({ error: 'Failed to schedule content' });
  }
});

// Get scheduled content
router.get('/scheduled', async (req: Request, res: Response) => {
  try {
    const scheduled = await db
      .select()
      .from(platformContent)
      .where(eq(platformContent.status, 'scheduled'));

    res.json(scheduled);
  } catch (error) {
    console.error('Error fetching scheduled content:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled content' });
  }
});

// Update schedule status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updated] = await db
      .update(platformContent)
      .set({ status, publishedAt: status === 'published' ? new Date() : null })
      .where(eq(platformContent.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Cron job for 5 AM daily trigger - DISABLED FOR PRODUCTION
// cron.schedule('0 5 * * *', async () => {
//   console.log('🕐 5 AM Daily trigger - Processing scheduled content...');
//   
//   try {
//     // Get content scheduled for today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const scheduledToday = await db
//       .select()
//       .from(platformContent)
//       .where(eq(platformContent.status, 'scheduled'));

//     console.log(`📋 Found ${scheduledToday.length} pieces of content to process`);

//     // Process each scheduled content
//     for (const content of scheduledToday) {
//       try {
//         // Send to Make.com webhook
//         await sendToMakeWebhook(content);
//         
//         // Update status
//         await db
//           .update(platformContent)
//           .set({ status: 'sent_to_webhook', publishedAt: new Date() })
//           .where(eq(platformContent.id, content.id));

//         console.log(`✅ Processed content ${content.id} for ${content.platform}`);
//       } catch (error) {
//         console.error(`❌ Failed to process content ${content.id}:`, error);
//       }
//     }

//   } catch (error) {
//     console.error('❌ Daily cron job failed:', error);
//   }
// });

async function sendToMakeWebhook(content: any) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('MAKE_WEBHOOK_URL not configured');
  }

  const payload = {
    platform: content.platform,
    content: content.optimizedContent,
    hashtags: content.hashtags,
    scheduledFor: content.scheduledFor,
    contentId: content.contentId
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.statusText}`);
  }

  return response.json();
}

export default router;