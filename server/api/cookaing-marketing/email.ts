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
    
    if (!emailArtifact) {
      return res.status(404).json({ 
        error: `No email content found for campaign${variant ? ` variant ${variant}` : ''}` 
      });
    }

    // Get recipients from segments
    let recipients: any[] = [];
    
    if (segmentIds && segmentIds.length > 0) {
      // Get contacts from specific segments
      for (const segmentId of segmentIds) {
        const segment = await storage.getSegment(segmentId);
        if (segment) {
          const segmentContacts = await storage.getContactsBySegment(segmentId);
          recipients.push(...segmentContacts);
        }
      }
    } else {
      // Get all contacts for the organization
      recipients = await storage.getContactsByOrganization(campaign.orgId);
    }

    // Remove duplicates
    recipients = recipients.filter((contact, index, self) => 
      index === self.findIndex(c => c.id === contact.id)
    );

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
    const emailContent = emailArtifact.contentJson as any;
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

// POST /api/cookaing-marketing/webhooks/brevo
router.post("/webhooks/brevo", async (req: Request, res: Response) => {
  try {
    console.log("🔗 Brevo webhook received:", req.body);

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