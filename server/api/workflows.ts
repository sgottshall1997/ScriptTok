import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertWorkflowSchema } from '@shared/schema';

export const workflowsRouter = Router();

/**
 * GET /api/workflows
 * Get all workflows with optional filtering by organization
 */
workflowsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    let workflows;
    if (organizationId && !isNaN(organizationId)) {
      workflows = await storage.getWorkflowsByOrganization(organizationId);
    } else {
      workflows = await storage.getWorkflows(limit);
    }
    
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

/**
 * GET /api/workflows/:id
 * Get a specific workflow
 */
workflowsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflowId = parseInt(req.params.id);
    
    if (isNaN(workflowId)) {
      return res.status(400).json({ error: 'Invalid workflow ID' });
    }
    
    const workflow = await storage.getWorkflow(workflowId);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

/**
 * POST /api/workflows
 * Create a new workflow
 */
workflowsRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const workflowInput = insertWorkflowSchema.parse({
      name: req.body.name,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      orgId: req.body.orgId,
      definitionJson: req.body.definitionJson || {}
    });
    
    const workflow = await storage.createWorkflow(workflowInput);
    res.status(201).json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

/**
 * PUT /api/workflows/:id
 * Update a workflow
 */
workflowsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const workflowId = parseInt(req.params.id);
    
    if (isNaN(workflowId)) {
      return res.status(400).json({ error: 'Invalid workflow ID' });
    }
    
    // Parse and validate input (partial update)
    const updateSchema = insertWorkflowSchema.partial();
    const updates = updateSchema.parse(req.body);
    
    const workflow = await storage.updateWorkflow(workflowId, updates);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

/**
 * DELETE /api/workflows/:id
 * Delete a workflow
 */
workflowsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const workflowId = parseInt(req.params.id);
    
    if (isNaN(workflowId)) {
      return res.status(400).json({ error: 'Invalid workflow ID' });
    }
    
    const success = await storage.deleteWorkflow(workflowId);
    
    if (!success) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

export default workflowsRouter;