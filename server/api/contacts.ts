import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertContactSchema } from '@shared/schema';

export const contactsRouter = Router();

/**
 * GET /api/contacts
 * Get all contacts with optional filtering by organization
 */
contactsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    let contacts;
    if (organizationId && !isNaN(organizationId)) {
      contacts = await storage.getContactsByOrganization(organizationId);
    } else {
      contacts = await storage.getContacts(limit);
    }
    
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

/**
 * GET /api/contacts/:id
 * Get a specific contact
 */
contactsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.id);
    
    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }
    
    const contact = await storage.getContact(contactId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

/**
 * POST /api/contacts
 * Create a new contact
 */
contactsRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const contactInput = insertContactSchema.parse({
      email: req.body.email,
      name: req.body.name || null,
      orgId: req.body.orgId,
      prefsJson: req.body.prefsJson || {},
      pantryJson: req.body.pantryJson || {},
      segmentIds: req.body.segmentIds || null
    });
    
    const contact = await storage.createContact(contactInput);
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

/**
 * PUT /api/contacts/:id
 * Update a contact
 */
contactsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.id);
    
    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }
    
    // Parse and validate input (partial update)
    const updateSchema = insertContactSchema.partial();
    const updates = updateSchema.parse(req.body);
    
    const contact = await storage.updateContact(contactId, updates);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

/**
 * DELETE /api/contacts/:id
 * Delete a contact
 */
contactsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.id);
    
    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }
    
    const success = await storage.deleteContact(contactId);
    
    if (!success) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default contactsRouter;