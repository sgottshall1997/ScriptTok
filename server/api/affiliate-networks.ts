import { Router, Request, Response } from 'express';

const router = Router();

// Affiliate network configurations
const AFFILIATE_NETWORKS = {
  amazon: {
    name: 'Amazon Associates',
    commission: 0.04, // 4% average
    linkFormat: 'https://amzn.to/{code}?tag={affiliateId}',
    trackingParam: 'tag'
  },
  shareasale: {
    name: 'ShareASale',
    commission: 0.08, // 8% average
    linkFormat: 'https://www.shareasale.com/r.cfm?b={banner}&u={userId}&m={merchantId}&urllink={productUrl}',
    trackingParam: 'u'
  },
  cj: {
    name: 'Commission Junction',
    commission: 0.06, // 6% average
    linkFormat: 'https://www.anrdoezrs.net/click-{publisherId}-{offerId}?url={productUrl}',
    trackingParam: 'click'
  },
  impact: {
    name: 'Impact Radius',
    commission: 0.07, // 7% average
    linkFormat: 'https://imp.i{campaignId}.net/c/{clickId}/{offerId}?u={productUrl}',
    trackingParam: 'c'
  },
  awin: {
    name: 'Awin',
    commission: 0.05, // 5% average
    linkFormat: 'https://www.awin1.com/cread.php?awinmid={merchantId}&awinaffid={affiliateId}&ued={productUrl}',
    trackingParam: 'awinaffid'
  }
};

// Get available networks
router.get('/', async (req: Request, res: Response) => {
  res.json({
    success: true,
    networks: Object.entries(AFFILIATE_NETWORKS).map(([key, network]) => ({
      id: key,
      ...network
    }))
  });
});

// Generate affiliate link for specific network
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { 
      network, 
      productUrl, 
      affiliateId, 
      product, 
      niche,
      customParams = {} 
    } = req.body;

    if (!network || !productUrl || !affiliateId) {
      return res.status(400).json({ 
        error: 'Network, product URL, and affiliate ID required' 
      });
    }

    const networkConfig = AFFILIATE_NETWORKS[network as keyof typeof AFFILIATE_NETWORKS];
    if (!networkConfig) {
      return res.status(400).json({ error: 'Invalid affiliate network' });
    }

    // Generate tracking link based on network format
    let affiliateLink = networkConfig.linkFormat;
    
    // Replace common placeholders
    affiliateLink = affiliateLink.replace('{affiliateId}', affiliateId);
    affiliateLink = affiliateLink.replace('{productUrl}', encodeURIComponent(productUrl));
    
    // Apply custom parameters
    Object.entries(customParams).forEach(([key, value]) => {
      affiliateLink = affiliateLink.replace(`{${key}}`, value as string);
    });

    // Calculate estimated commission
    const estimatedPrice = extractPriceFromUrl(productUrl) || 50; // Default $50
    const estimatedCommission = estimatedPrice * networkConfig.commission;

    // Create redirect link through our system
    const redirectResponse = await fetch(`${req.protocol}://${req.get('host')}/api/redirect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliateUrl: affiliateLink,
        product: product || 'Unknown Product',
        niche: niche || 'general',
        platform: 'affiliate-network',
        contentType: 'affiliate-link',
        source: network,
        network,
        estimatedCommission
      })
    });

    const redirectData = await redirectResponse.json();

    res.json({
      success: true,
      network: networkConfig.name,
      originalUrl: productUrl,
      affiliateLink,
      redirectUrl: redirectData.redirectUrl,
      estimatedCommission,
      commission: networkConfig.commission * 100 + '%'
    });

  } catch (error) {
    console.error('Error generating affiliate link:', error);
    res.status(500).json({ error: 'Failed to generate affiliate link' });
  }
});

// Bulk commission calculation
router.post('/calculate-commission', async (req: Request, res: Response) => {
  try {
    const { network, sales } = req.body;

    if (!network || !Array.isArray(sales)) {
      return res.status(400).json({ error: 'Network and sales array required' });
    }

    const networkConfig = AFFILIATE_NETWORKS[network as keyof typeof AFFILIATE_NETWORKS];
    if (!networkConfig) {
      return res.status(400).json({ error: 'Invalid affiliate network' });
    }

    const calculations = sales.map(sale => ({
      ...sale,
      commission: sale.amount * networkConfig.commission,
      rate: networkConfig.commission
    }));

    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalCommission = totalSales * networkConfig.commission;

    res.json({
      network: networkConfig.name,
      rate: networkConfig.commission * 100 + '%',
      totalSales,
      totalCommission,
      calculations
    });

  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({ error: 'Failed to calculate commission' });
  }
});

function extractPriceFromUrl(url: string): number | null {
  // Simple price extraction from common URL patterns
  const pricePatterns = [
    /price[=:](\d+(?:\.\d{2})?)/i,
    /\$(\d+(?:\.\d{2})?)/,
    /usd[=:](\d+(?:\.\d{2})?)/i
  ];

  for (const pattern of pricePatterns) {
    const match = url.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }

  return null;
}

export default router;