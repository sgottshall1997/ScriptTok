import { Request, Response } from 'express';

// In-memory storage for redirects (in production, use Redis or database)
const redirectStorage = new Map<string, {
  productUrl: string;
  affiliateId: string;
  affiliateNetwork: string;
  productName: string;
  niche: string;
  clicks: number;
  createdAt: Date;
}>();

export const createRedirect = async (req: Request, res: Response) => {
  try {
    const { productUrl, affiliateId, affiliateNetwork, productName, niche } = req.body;

    if (!productUrl || !affiliateId) {
      return res.status(400).json({
        success: false,
        error: 'Product URL and Affiliate ID are required'
      });
    }

    // Generate a unique redirect ID
    const redirectId = Math.random().toString(36).substr(2, 9);
    
    // Generate the final affiliate URL based on network
    let finalUrl = productUrl;
    
    if (affiliateNetwork === 'amazon' && productUrl.includes('amazon.')) {
      // For Amazon, append tag parameter
      const separator = productUrl.includes('?') ? '&' : '?';
      finalUrl = `${productUrl}${separator}tag=${affiliateId}`;
    } else if (affiliateNetwork === 'shareasale') {
      // For ShareASale, create tracking link
      finalUrl = `https://www.shareasale.com/r.cfm?b=${productUrl}&u=${affiliateId}&m=12345`;
    } else if (affiliateNetwork === 'cj') {
      // For CJ (Commission Junction), create tracking link
      finalUrl = `https://www.tkqlhce.com/click-${affiliateId}-${productUrl}`;
    }

    // Store the redirect mapping
    redirectStorage.set(redirectId, {
      productUrl: finalUrl,
      affiliateId,
      affiliateNetwork,
      productName: productName || 'Unknown Product',
      niche: niche || 'general',
      clicks: 0,
      createdAt: new Date()
    });

    const baseUrl = req.get('Host') || 'localhost:5000';
    const protocol = req.get('X-Forwarded-Proto') || 'http';
    const redirectUrl = `${protocol}://${baseUrl}/r/${redirectId}`;

    res.json({
      success: true,
      redirectUrl,
      redirectId,
      finalUrl
    });
  } catch (error) {
    console.error('Error creating redirect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create redirect'
    });
  }
};

export const handleRedirect = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const redirect = redirectStorage.get(id);
    
    if (!redirect) {
      return res.status(404).json({
        success: false,
        error: 'Redirect not found'
      });
    }

    // Increment click count
    redirect.clicks++;
    redirectStorage.set(id, redirect);

    // Log the click for analytics
    console.log(`🔗 Redirect click: ${redirect.productName} (${redirect.niche}) - ${redirect.clicks} total clicks`);

    // Redirect to the final URL
    res.redirect(302, redirect.productUrl);
  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).json({
      success: false,
      error: 'Redirect failed'
    });
  }
};

export const getRedirectStats = async (req: Request, res: Response) => {
  try {
    const stats = Array.from(redirectStorage.entries()).map(([id, data]) => ({
      id,
      ...data
    }));

    res.json({
      success: true,
      stats,
      totalRedirects: stats.length,
      totalClicks: stats.reduce((sum, stat) => sum + stat.clicks, 0)
    });
  } catch (error) {
    console.error('Error getting redirect stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
};