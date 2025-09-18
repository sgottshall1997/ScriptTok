import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertFormSchema, insertFormSubmissionSchema } from '@shared/schema';

export const formsRouter = Router();

/**
 * GET /api/forms
 * Get all forms with optional filtering by organization
 */
formsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    let forms;
    if (organizationId && !isNaN(organizationId)) {
      forms = await storage.getFormsByOrganization(organizationId);
    } else {
      forms = await storage.getForms(limit);
    }
    
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

/**
 * GET /api/forms/:id
 * Get a specific form
 */
formsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const formId = parseInt(req.params.id);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    const form = await storage.getForm(formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

/**
 * GET /api/forms/:id/submissions
 * Get all submissions for a specific form
 */
formsRouter.get('/:id/submissions', async (req: Request, res: Response) => {
  try {
    const formId = parseInt(req.params.id);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    const submissions = await storage.getFormSubmissionsByForm(formId);
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

/**
 * POST /api/forms
 * Create a new form
 */
formsRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const formInput = insertFormSchema.parse({
      orgId: req.body.orgId,
      slug: req.body.slug,
      schemaJson: req.body.schemaJson || {},
      rulesJson: req.body.rulesJson || {}
    });
    
    const form = await storage.createForm(formInput);
    res.status(201).json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create form' });
  }
});

/**
 * POST /api/forms/:id/submit
 * Submit data to a form
 */
formsRouter.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const formId = parseInt(req.params.id);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    // Verify form exists
    const form = await storage.getForm(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Parse and validate submission
    const submissionInput = insertFormSubmissionSchema.parse({
      formId: formId,
      contactId: req.body.contactId || null,
      dataJson: req.body.dataJson || {},
      utmJson: req.body.utmJson || {}
    });
    
    const submission = await storage.createFormSubmission(submissionInput);
    res.status(201).json(submission);
  } catch (error) {
    console.error('Error creating form submission:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

/**
 * PUT /api/forms/:id
 * Update a form
 */
formsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const formId = parseInt(req.params.id);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    // Parse and validate input (partial update)
    const updateSchema = insertFormSchema.partial();
    const updates = updateSchema.parse(req.body);
    
    const form = await storage.updateForm(formId, updates);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update form' });
  }
});

/**
 * DELETE /api/forms/:id
 * Delete a form
 */
formsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const formId = parseInt(req.params.id);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    const success = await storage.deleteForm(formId);
    
    if (!success) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

export default formsRouter;