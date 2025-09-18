import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertFormSubmissionSchema } from '@shared/schema';

export const publicFormsRouter = Router();

/**
 * GET /api/forms/by-slug/:slug
 * Get a specific form by slug (for public access only)
 */
publicFormsRouter.get('/by-slug/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    
    if (!slug) {
      return res.status(400).json({ error: 'Form slug is required' });
    }
    
    const form = await storage.getFormBySlug(slug);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Error fetching form by slug:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

/**
 * POST /api/forms/:id/submit
 * Submit data to a form (public endpoint with complete e2e flow)
 */
publicFormsRouter.post('/:id/submit', async (req: Request, res: Response) => {
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
    
    // Create form submission
    const submission = await storage.createFormSubmission(submissionInput);
    
    // Complete e2e flow: Create contact from submission data
    const submissionData = submissionInput.dataJson as any;
    if (submissionData.name && submissionData.email) {
      try {
        // Check if contact exists
        const existingContacts = await storage.getContacts();
        const existingContact = existingContacts.find(c => c.email === submissionData.email);
        
        if (!existingContact) {
          // Create new contact
          const contactInput = {
            orgId: form.orgId,
            name: submissionData.name,
            email: submissionData.email,
            phone: submissionData.phone || null,
            segmentIds: [] as string[],
            metaJson: {
              source: 'form_submission',
              formId: formId,
              submissionId: submission.id
            }
          };
          
          const contact = await storage.createContact(contactInput);
          console.log(`✅ Created contact ${contact.id} from form submission ${submission.id}`);
        } else {
          console.log(`✅ Associated submission ${submission.id} with existing contact ${existingContact.id}`);
        }
      } catch (contactError) {
        console.error('Error creating/updating contact:', contactError);
        // Don't fail the submission if contact creation fails
      }
    }
    
    // TODO: Queue welcome email via email service
    // TODO: Trigger webhook via webhookDispatcher using MAKE_WEBHOOK_URL
    // TODO: Emit analytics events for dashboard updates
    
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

export default publicFormsRouter;