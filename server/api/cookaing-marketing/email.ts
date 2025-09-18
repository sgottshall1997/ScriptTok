import { Request, Response, Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { emailService } from "../../cookaing-marketing/email/email.service";
import { linkSigningService } from "../../cookaing-marketing/email/link-signing";
import { insertAnalyticsEventSchema } from "../../../shared/schema";

const router = Router();

// Email send request schema
const sendEmailSchema = z.object({
  campaignId: z.number(),
  variant: z.string().optional(),
  segmentIds: z.array(z.number()).optional(),
  dryRun: z.boolean().default(false)
});

// POST /api/cookaing-marketing/email/send
router.post("/send", async (req: Request, res: Response) => {
  try {
    console.log("📧 Email send request received:", req.body);
    
    // Validate request body
    const { campaignId, variant, segmentIds, dryRun } = sendEmailSchema.parse(req.body);

    // Get campaign details
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Get email content from campaign artifacts
    const artifacts = await storage.getCampaignArtifacts(campaignId);
    const emailArtifact = artifacts.find(a => a.channel === "email" && (variant ? a.variant === variant : true));
    
    // Define mock email content for testing
    const mockEmailContent = {
      subject: `${campaign.name} - Email Campaign`,
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to ${campaign.name}</h1>
          <p>This is a sample email content for campaign: <strong>${campaign.name}</strong></p>
          <p>This email was generated for testing purposes.</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            <h2 style="color: #555; margin-top: 0;">Campaign Details:</h2>
            <ul>
              <li>Campaign Name: ${campaign.name}</li>
              <li>Campaign Type: ${campaign.type}</li>
              <li>Status: ${campaign.status}</li>
              <li>Variant: ${variant || 'A'}</li>
            </ul>
          </div>
          <p style="text-align: center; margin-top: 40px;">
            <a href="https://example.com/unsubscribe" style="color: #666; text-decoration: none; font-size: 12px;">
              Unsubscribe from this campaign
            </a>
          </p>
        </body>
        </html>
      `,
      text: `
Welcome to ${campaign.name}

This is a sample email content for campaign: ${campaign.name}
This email was generated for testing purposes.

Campaign Details:
- Campaign Name: ${campaign.name}
- Campaign Type: ${campaign.type}
- Status: ${campaign.status}
- Variant: ${variant || 'A'}

Unsubscribe: https://example.com/unsubscribe
      `
    };
    
    if (!emailArtifact) {
      console.log(`📧 No email content found for campaign ${campaignId} variant ${variant || 'default'}`);
      
      if (!dryRun) {
        // CRITICAL: Never allow live sends without real email content
        console.error(`❌ Attempted live send without email content for campaign ${campaignId}`);
        return res.status(400).json({ 
          error: "Cannot send campaign without email content. Please create email content for this campaign first, or use dry run mode to preview." 
        });
      }
      
      console.log('📧 Using mock email content for dry run testing only');
    }

    // Get recipients from segments or organization
    let recipients: any[] = [];
    
    if (segmentIds && segmentIds.length > 0) {
      // TEMPORARY: Segment implementation not complete - using mock contacts for testing
      console.warn('⚠️ Using mock recipients for segment testing - segments not fully implemented');
      
      // Mock recipients based on segment selection for testing
      const mockRecipients = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1' },
        { id: 2, email: 'test2@example.com', name: 'Test User 2' },
        { id: 3, email: 'test3@example.com', name: 'Test User 3' }
      ];
      
      if (!dryRun) {
        // For live sends, prevent using mock data
        console.error('❌ Cannot perform live send with incomplete segment implementation');
        return res.status(400).json({ 
          error: "Segment targeting is not yet fully implemented. Please use 'All Contacts' or enable dry run mode for testing." 
        });
      }
      
      recipients = mockRecipients;
    } else {
      // Get all contacts for the organization (this should work with existing implementation)
      try {
        recipients = await storage.getContactsByOrganization(campaign.orgId);
        console.log(`📊 Found ${recipients.length} contacts for organization ${campaign.orgId}`);
      } catch (error) {
        console.error('❌ Error fetching contacts:', error);
        return res.status(500).json({ 
          error: "Failed to fetch contacts for this campaign" 
        });
      }
    }

    console.log(`📊 Found ${recipients.length} recipients for campaign ${campaignId}`);

    if (dryRun) {
      return res.json({
        success: true,
        dryRun: true,
        recipients: recipients.length,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          variant: variant || 'default'
        },
        previewRecipients: recipients.slice(0, 5).map(r => ({
          id: r.id,
          email: r.email,
          name: r.name
        }))
      });
    }

    // Process email content
    const emailContent = emailArtifact ? (emailArtifact.contentJson as any) : mockEmailContent;
    const subject = emailContent.subject || campaign.name;
    const htmlContent = emailContent.html || emailContent.content || '';

    let sendResults = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Send emails to all recipients
    for (const recipient of recipients) {
      try {
        // Sign all URLs in the HTML content
        const signedHtmlContent = linkSigningService.signAllUrlsInHtml(htmlContent, {
          contactId: recipient.id,
          campaignId: campaignId,
          variant: variant
        });

        // Send email
        const emailResult = await emailService.sendEmail({
          to: recipient.email,
          from: process.env.DEFAULT_FROM_EMAIL || 'noreply@cookaing.com',
          subject: subject,
          htmlContent: signedHtmlContent,
          textContent: emailContent.text
        });

        if (emailResult.success) {
          sendResults.sent++;

          // Create campaign recipient record
          await storage.createCampaignRecipient({
            campaignId: campaignId,
            contactId: recipient.id,
            status: 'sent',
            variant: variant || null,
            sentAt: new Date(),
            metaJson: {
              messageId: emailResult.messageId,
              provider: emailResult.provider
            }
          });

          // Log analytics event
          await storage.createAnalyticsEvent({
            orgId: campaign.orgId,
            eventType: 'email_sent',
            entityType: 'campaign',
            entityId: campaignId,
            contactId: recipient.id,
            emailEventType: 'sent',
            metaJson: {
              variant: variant || 'default',
              messageId: emailResult.messageId,
              provider: emailResult.provider
            }
          });
        } else {
          sendResults.failed++;
          sendResults.errors.push(`${recipient.email}: ${emailResult.error}`);
        }
      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient.email}:`, error);
        sendResults.failed++;
        sendResults.errors.push(`${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Email sending completed. Sent: ${sendResults.sent}, Failed: ${sendResults.failed}`);

    res.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        variant: variant || 'default'
      },
      results: sendResults
    });

  } catch (error) {
    console.error("❌ Email send error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid request data", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Webhook signature verification function
const verifyBrevoWebhookSignature = (payload: any, signature: string | undefined, secret: string): boolean => {
  if (!signature || !secret) {
    return false;
  }
  
  try {
    // Brevo webhook signature verification (implement based on Brevo's documentation)
    const crypto = require('crypto');
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
    
    // Compare signatures securely
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ Webhook signature verification error:', error);
    return false;
  }
};

// POST /api/cookaing-marketing/webhooks/brevo  
router.post("/webhooks/brevo", async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.BREVO_WEBHOOK_SECRET;
    
    // SECURITY: Enforce webhook secret in production
    if (!webhookSecret) {
      console.error("❌ BREVO_WEBHOOK_SECRET not configured - webhook disabled");
      return res.status(503).json({ 
        error: "Webhook service unavailable - configuration missing" 
      });
    }
    
    // SECURITY: Verify webhook signature
    const signature = req.headers['x-brevo-signature'] as string;
    if (!verifyBrevoWebhookSignature(req.body, signature, webhookSecret)) {
      console.error("❌ Invalid Brevo webhook signature");
      return res.status(401).json({ 
        error: "Unauthorized - Invalid webhook signature" 
      });
    }
    
    console.log("✅ Brevo webhook signature verified");

    const { event, email, 'message-id': messageId, date, url } = req.body;
    
    if (!event || !email) {
      return res.status(400).json({ error: "Missing required webhook data" });
    }

    // Map Brevo events to our email event types
    const eventMapping: Record<string, string> = {
      'delivered': 'delivered',
      'opens': 'open',
      'clicks': 'click',
      'bounce': 'bounce',
      'blocked': 'bounce',
      'spam': 'complaint',
      'unsubscribed': 'unsubscribe'
    };

    const emailEventType = eventMapping[event];
    if (!emailEventType) {
      console.warn(`⚠️ Unknown Brevo webhook event: ${event}`);
      return res.json({ received: true, ignored: true });
    }

    // Find the campaign recipient by email and message ID
    const recipients = await storage.getCampaignRecipientsByEmail(email);
    
    for (const recipient of recipients) {
      const recipientMeta = recipient.metaJson as any;
      
      // Match by message ID if available
      if (messageId && recipientMeta?.messageId !== messageId) {
        continue;
      }

      try {
        // Update campaign recipient status
        const updateData: any = {};
        
        switch (emailEventType) {
          case 'delivered':
            updateData.deliveredAt = new Date(date);
            updateData.status = 'delivered';
            break;
          case 'open':
            updateData.openedAt = new Date(date);
            updateData.status = 'opened';
            updateData.opens = (recipient.opens || 0) + 1;
            break;
          case 'click':
            updateData.clickedAt = new Date(date);
            updateData.status = 'clicked';
            updateData.clicks = (recipient.clicks || 0) + 1;
            if (url) {
              updateData.metaJson = {
                ...recipientMeta,
                lastClickedUrl: url
              };
            }
            break;
          case 'bounce':
            updateData.bouncedAt = new Date(date);
            updateData.status = 'bounced';
            break;
          case 'unsubscribe':
            updateData.unsubscribedAt = new Date(date);
            updateData.status = 'unsubscribed';
            break;
        }

        await storage.updateCampaignRecipient(recipient.id, updateData);

        // Create analytics event
        await storage.createAnalyticsEvent({
          orgId: recipient.campaign?.orgId || 1, // TODO: Get org ID properly
          eventType: `email_${emailEventType}`,
          entityType: 'campaign',
          entityId: recipient.campaignId,
          contactId: recipient.contactId,
          emailEventType: emailEventType as any,
          metaJson: {
            messageId,
            url,
            date,
            webhookEvent: event
          }
        });

        console.log(`✅ Processed ${emailEventType} event for recipient ${recipient.id}`);
      } catch (error) {
        console.error(`❌ Failed to process webhook for recipient ${recipient.id}:`, error);
      }
    }

    res.json({ received: true, processed: recipients.length });

  } catch (error) {
    console.error("❌ Brevo webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;