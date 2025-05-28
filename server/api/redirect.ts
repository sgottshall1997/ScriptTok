import { Request, Response } from 'express';
import { getRedirectLink, recordClick, getRedirectAnalytics } from '../utils/redirectDb';

/**
 * Handle redirect requests
 * GET /api/redirect/:id?platform=instagram&niche=skincare
 */
export async function handleRedirect(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { platform, niche } = req.query;

    // Get the redirect link from database
    const redirectLink = await getRedirectLink(id);
    
    if (!redirectLink) {
      return res.status(404).json({
        success: false,
        message: 'Redirect link not found'
      });
    }

    // Extract metadata from request
    const userAgent = req.get('User-Agent') || '';
    const referrer = req.get('Referrer') || req.get('Referer') || '';
    const timestamp = new Date().toISOString();

    // Use platform/niche from query params or fallback to stored values
    const clickPlatform = (platform as string) || redirectLink.platform;
    const clickNiche = (niche as string) || redirectLink.niche;

    // Record the click asynchronously
    recordClick({
      redirectId: id,
      timestamp,
      platform: clickPlatform,
      niche: clickNiche,
      userAgent,
      referrer
    }).catch(error => {
      console.error('❌ Failed to record click:', error);
    });

    console.log(`🔗 Redirecting ${id}: ${clickPlatform}/${clickNiche} -> ${redirectLink.originalUrl}`);

    // Redirect to the original URL
    res.redirect(302, redirectLink.originalUrl);

  } catch (error) {
    console.error('❌ Redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during redirect'
    });
  }
}

/**
 * Get analytics for a redirect link
 * GET /api/redirect/:id/analytics
 */
export async function getRedirectLinkAnalytics(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if redirect link exists
    const redirectLink = await getRedirectLink(id);
    if (!redirectLink) {
      return res.status(404).json({
        success: false,
        message: 'Redirect link not found'
      });
    }

    // Get analytics data
    const analytics = await getRedirectAnalytics(id);

    res.json({
      success: true,
      redirectLink,
      analytics
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
}