import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertCampaignSchema } from '@shared/schema';

export const campaignsRouter = Router();

/**
 * GET /api/campaigns
 * Get all campaigns with optional filtering by organization
 */
campaignsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    let campaigns;
    if (organizationId && !isNaN(organizationId)) {
      campaigns = await storage.getCampaignsByOrganization(organizationId);
    } else {
      campaigns = await storage.getCampaigns(limit);
    }
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/campaigns/:id
 * Get a specific campaign
 */
campaignsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }
    
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

/**
 * POST /api/campaigns
 * Create a new campaign
 */
campaignsRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const campaignInput = insertCampaignSchema.parse({
      name: req.body.name,
      status: req.body.status || 'draft',
      type: req.body.type,
      orgId: req.body.orgId,
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
      metaJson: req.body.metaJson || {}
    });
    
    const campaign = await storage.createCampaign(campaignInput);
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

/**
 * PUT /api/campaigns/:id
 * Update a campaign
 */
campaignsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }
    
    // Parse and validate input (partial update)
    const updateSchema = insertCampaignSchema.partial();
    const updates = updateSchema.parse(req.body);
    
    // Handle date fields
    if (updates.scheduledAt) {
      updates.scheduledAt = new Date(updates.scheduledAt);
    }
    
    const campaign = await storage.updateCampaign(campaignId, updates);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

/**
 * DELETE /api/campaigns/:id
 * Delete a campaign
 */
campaignsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }
    
    const success = await storage.deleteCampaign(campaignId);
    
    if (!success) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default campaignsRouter;