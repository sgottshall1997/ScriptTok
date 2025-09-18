import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertOrganizationSchema } from '@shared/schema';

export const organizationsRouter = Router();

/**
 * GET /api/organizations
 * Get all organizations
 */
organizationsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const organizations = await storage.getOrganizations();
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

/**
 * GET /api/organizations/:id
 * Get a specific organization
 */
organizationsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = parseInt(req.params.id);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }
    
    const organization = await storage.getOrganization(organizationId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

/**
 * POST /api/organizations
 * Create a new organization
 */
organizationsRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const organizationInput = insertOrganizationSchema.parse({
      name: req.body.name,
      plan: req.body.plan || 'free'
    });
    
    const organization = await storage.createOrganization(organizationInput);
    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

/**
 * PUT /api/organizations/:id
 * Update an organization
 */
organizationsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = parseInt(req.params.id);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }
    
    // Parse and validate input (partial update)
    const updateSchema = insertOrganizationSchema.partial();
    const updates = updateSchema.parse(req.body);
    
    const organization = await storage.updateOrganization(organizationId, updates);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

/**
 * DELETE /api/organizations/:id
 * Delete an organization
 */
organizationsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = parseInt(req.params.id);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }
    
    const success = await storage.deleteOrganization(organizationId);
    
    if (!success) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

export default organizationsRouter;