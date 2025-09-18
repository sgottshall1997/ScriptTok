import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertAffiliateProductSchema } from '@shared/schema';

export const affiliateProductsRouter = Router();

/**
 * GET /api/affiliate-products
 * Get all affiliate products with optional filtering by organization
 */
affiliateProductsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    let products;
    if (organizationId && !isNaN(organizationId)) {
      products = await storage.getAffiliateProductsByOrganization(organizationId);
    } else {
      products = await storage.getAffiliateProducts(limit);
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching affiliate products:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate products' });
  }
});

/**
 * GET /api/affiliate-products/:id
 * Get a specific affiliate product
 */
affiliateProductsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const product = await storage.getAffiliateProduct(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Affiliate product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching affiliate product:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate product' });
  }
});

/**
 * POST /api/affiliate-products
 * Create a new affiliate product
 */
affiliateProductsRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const productInput = insertAffiliateProductSchema.parse({
      name: req.body.name,
      source: req.body.source,
      url: req.body.url,
      orgId: req.body.orgId,
      sku: req.body.sku,
      price: req.body.price || null,
      imageUrl: req.body.imageUrl || null,
      attributesJson: req.body.attributesJson || {}
    });
    
    const product = await storage.createAffiliateProduct(productInput);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating affiliate product:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create affiliate product' });
  }
});

/**
 * PUT /api/affiliate-products/:id
 * Update an affiliate product
 */
affiliateProductsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // Parse and validate input (partial update)
    const updateSchema = insertAffiliateProductSchema.partial();
    const updates = updateSchema.parse(req.body);
    
    const product = await storage.updateAffiliateProduct(productId, updates);
    
    if (!product) {
      return res.status(404).json({ error: 'Affiliate product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating affiliate product:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update affiliate product' });
  }
});

/**
 * DELETE /api/affiliate-products/:id
 * Delete an affiliate product
 */
affiliateProductsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const success = await storage.deleteAffiliateProduct(productId);
    
    if (!success) {
      return res.status(404).json({ error: 'Affiliate product not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting affiliate product:', error);
    res.status(500).json({ error: 'Failed to delete affiliate product' });
  }
});

export default affiliateProductsRouter;