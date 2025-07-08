import { Router, Request, Response } from 'express';
import { db } from '../db';
import { clickLogs, clickEvents } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Create a smart redirect link
router.post('/', async (req: Request, res: Response) => {
  try {
    const { affiliateUrl, product, niche, platform, contentType, source } = req.body;
    
    if (!affiliateUrl || !product || !niche) {
      return res.status(400).json({ 
        error: 'Missing required fields: affiliateUrl, product, niche' 
      });
    }

    // Generate unique slug
    const slug = crypto.randomBytes(8).toString('hex');
    
    // Create click log entry
    const [clickLog] = await db.insert(clickLogs).values({
      slug,
      affiliateUrl,
      product,
      niche,
      platform: platform || 'unknown',
      contentType: contentType || 'unknown',
      source: source || 'organic',
    }).returning();

    const redirectUrl = `${req.protocol}://${req.get('host')}/go/${slug}`;
    
    res.json({
      success: true,
      redirectUrl,
      slug,
      clickLogId: clickLog.id
    });
    
  } catch (error) {
    console.error('Error creating redirect link:', error);
    res.status(500).json({ error: 'Failed to create redirect link' });
  }
});

// Handle redirect and track click
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Find the click log
    const [clickLog] = await db
      .select()
      .from(clickLogs)
      .where(eq(clickLogs.slug, slug));
    
    if (!clickLog) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Update click count and last click time
    await db
      .update(clickLogs)
      .set({ 
        clicks: clickLog.clicks + 1,
        lastClickAt: new Date()
      })
      .where(eq(clickLogs.id, clickLog.id));

    // Track individual click event
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const referrer = req.get('Referer') || 'direct';

    await db.insert(clickEvents).values({
      slugId: clickLog.id,
      ipAddress,
      userAgent,
      referrer,
    });

    console.log(`🔗 Click tracked: ${slug} -> ${clickLog.affiliateUrl} (${clickLog.product})`);
    
    // Redirect to affiliate URL
    res.redirect(302, clickLog.affiliateUrl);
    
  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).json({ error: 'Redirect failed' });
  }
});

// Get click statistics
router.get('/stats/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const [clickLog] = await db
      .select()
      .from(clickLogs)
      .where(eq(clickLogs.slug, slug));
    
    if (!clickLog) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Get recent click events
    const recentClicks = await db
      .select({
        clickedAt: clickEvents.clickedAt,
        referrer: clickEvents.referrer,
      })
      .from(clickEvents)
      .where(eq(clickEvents.slugId, clickLog.id))
      .orderBy(clickEvents.clickedAt)
      .limit(10);

    res.json({
      success: true,
      slug: clickLog.slug,
      product: clickLog.product,
      niche: clickLog.niche,
      platform: clickLog.platform,
      totalClicks: clickLog.clicks,
      lastClickAt: clickLog.lastClickAt,
      createdAt: clickLog.createdAt,
      recentClicks,
    });
    
  } catch (error) {
    console.error('Error fetching click stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all redirect links with stats
router.get('/', async (req: Request, res: Response) => {
  try {
    const links = await db
      .select()
      .from(clickLogs)
      .orderBy(clickLogs.createdAt);

    res.json({
      success: true,
      links: links.map(link => ({
        ...link,
        redirectUrl: `${req.protocol}://${req.get('host')}/go/${link.slug}`
      }))
    });
    
  } catch (error) {
    console.error('Error fetching redirect links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

export default router;