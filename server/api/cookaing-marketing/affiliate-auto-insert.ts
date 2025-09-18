import { Router } from 'express';
import { z } from 'zod';
import { affiliateLookupService } from '../../cookaing-marketing/affiliates/lookup.service.js';
import { affiliateEnrichmentService } from '../../cookaing-marketing/affiliates/enrichment.hook.js';
import { storage } from '../../storage.js';

const router = Router();

// Validation schemas
const lookupSchema = z.object({
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  contactId: z.number().optional(),
  limit: z.number().min(1).max(50).optional().default(3)
});

const autoInsertSchema = z.object({
  contactId: z.number().optional()
});

const enrichSchema = z.object({
  contactId: z.number().optional()
});

// Test affiliate product lookup
router.post('/lookup', async (req, res) => {
  try {
    const validatedBody = lookupSchema.parse(req.body);
    const { tags, category, priceRange, contactId, limit } = validatedBody;
    
    // Get contact preferences if contactId provided
    let contactPreferences = {};
    if (contactId) {
      try {
        const contact = await storage.getContact(contactId);
        if (contact && contact.prefsJson) {
          contactPreferences = contact.prefsJson as any;
        }
      } catch (error) {
        console.error('Error loading contact preferences:', error);
      }
    }

    const products = await affiliateLookupService.lookupProducts({
      tags: tags || [],
      category,
      priceRange,
      contactPreferences,
      limit
    });

    res.json({
      success: true,
      count: products.length,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        url: product.url,
        price: product.price,
        imageUrl: product.imageUrl,
        source: product.source,
        attributes: product.attributesJson
      }))
    });

  } catch (error) {
    console.error('❌ Affiliate lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup affiliate products'
    });
  }
});

// Auto-insert affiliate products into campaign
router.post('/campaigns/:campaignId/auto-insert', async (req, res) => {
  try {
    const campaignIdNum = parseInt(req.params.campaignId);
    if (isNaN(campaignIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID'
      });
    }

    const validatedBody = autoInsertSchema.parse(req.body);
    const { contactId } = validatedBody;

    console.log(`🔄 Auto-inserting affiliate products for campaign ${campaignIdNum}...`);

    const result = await affiliateEnrichmentService.autoInsertAffiliateProducts(
      campaignIdNum,
      contactId
    );

    res.json({
      success: true,
      message: `Auto-insert completed: ${result.added} artifacts enriched, ${result.skipped} skipped`,
      result
    });

  } catch (error) {
    console.error('❌ Auto-insert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to auto-insert affiliate products'
    });
  }
});

// Enrich specific campaign artifact
router.post('/artifacts/:artifactId/enrich', async (req, res) => {
  try {
    const artifactIdNum = parseInt(req.params.artifactId);
    if (isNaN(artifactIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid artifact ID'
      });
    }

    const validatedBody = enrichSchema.parse(req.body);
    const { contactId } = validatedBody;

    await affiliateEnrichmentService.enrichCampaignArtifact(
      artifactIdNum,
      contactId
    );

    res.json({
      success: true,
      message: `Campaign artifact ${artifactIdNum} enriched with affiliate products`
    });

  } catch (error) {
    console.error('❌ Artifact enrichment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enrich campaign artifact'
    });
  }
});

// Enrich all recipe card artifacts in a campaign
router.post('/campaigns/:campaignId/enrich-recipe-cards', async (req, res) => {
  try {
    const campaignIdNum = parseInt(req.params.campaignId);
    if (isNaN(campaignIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID'
      });
    }

    const validatedBody = enrichSchema.parse(req.body);
    const { contactId } = validatedBody;

    await affiliateEnrichmentService.enrichRecipeCardArtifacts(
      campaignIdNum,
      contactId
    );

    res.json({
      success: true,
      message: `Recipe card artifacts in campaign ${campaignIdNum} enriched with affiliate products`
    });

  } catch (error) {
    console.error('❌ Recipe card enrichment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enrich recipe card artifacts'
    });
  }
});

// Get affiliate products for preview
router.get('/products/preview', async (req, res) => {
  try {
    const { tags, category, contactId, limit = 6 } = req.query;
    
    const tagsArray = typeof tags === 'string' ? tags.split(',') : [];
    
    // Get contact preferences if contactId provided
    let contactPreferences = {};
    if (contactId && typeof contactId === 'string') {
      try {
        const contact = await storage.getContact(parseInt(contactId));
        if (contact && contact.prefsJson) {
          contactPreferences = contact.prefsJson as any;
        }
      } catch (error) {
        console.error('Error loading contact preferences:', error);
      }
    }

    const products = await affiliateLookupService.lookupProducts({
      tags: tagsArray,
      category: typeof category === 'string' ? category : undefined,
      contactPreferences,
      limit: typeof limit === 'string' ? parseInt(limit) : 6
    });

    res.json({
      success: true,
      count: products.length,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        url: product.url,
        price: product.price ? `$${product.price}` : 'Price not available',
        imageUrl: product.imageUrl,
        source: product.source.charAt(0).toUpperCase() + product.source.slice(1),
        rating: (product.attributesJson as any)?.rating
      }))
    });

  } catch (error) {
    console.error('❌ Products preview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get products preview'
    });
  }
});

// Test endpoint to check Amazon credentials
router.get('/amazon/status', async (req, res) => {
  try {
    const hasAccessKey = !!process.env.AMAZON_ACCESS_KEY;
    const hasSecretKey = !!process.env.AMAZON_SECRET_KEY;
    const hasAssociateTag = !!process.env.AMAZON_ASSOCIATE_TAG;

    res.json({
      success: true,
      amazonCredentials: {
        accessKey: hasAccessKey,
        secretKey: hasSecretKey,
        associateTag: hasAssociateTag,
        configured: hasAccessKey && hasSecretKey && hasAssociateTag
      }
    });

  } catch (error) {
    console.error('❌ Amazon status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Amazon credentials status'
    });
  }
});

export default router;