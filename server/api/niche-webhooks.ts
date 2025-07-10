import { Express } from 'express';
import { db } from '../db';
import { nicheWebhooks, insertNicheWebhookSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { 
  getNicheWebhooks, 
  updateNicheWebhook, 
  testNicheWebhook,
  sendMultiPlatformWebhook
} from '../services/webhookService';

export const registerNicheWebhookRoutes = (app: Express) => {
  /**
   * Get all niche webhook configurations
   */
  app.get('/api/niche-webhooks', async (req, res) => {
    try {
      const webhooks = await getNicheWebhooks();
      res.json(webhooks);
    } catch (error) {
      console.error('Error fetching niche webhooks:', error);
      res.status(500).json({ error: 'Failed to fetch niche webhooks' });
    }
  });

  /**
   * Get webhook configuration for a specific niche
   */
  app.get('/api/niche-webhooks/:niche', async (req, res) => {
    try {
      const { niche } = req.params;
      const webhook = await db.select()
        .from(nicheWebhooks)
        .where(eq(nicheWebhooks.niche, niche.toLowerCase()));
      
      if (webhook.length === 0) {
        return res.status(404).json({ error: 'Webhook not found for this niche' });
      }
      
      res.json(webhook[0]);
    } catch (error) {
      console.error(`Error fetching webhook for niche ${req.params.niche}:`, error);
      res.status(500).json({ error: 'Failed to fetch niche webhook' });
    }
  });

  /**
   * Create or update webhook configuration for a specific niche
   */
  app.post('/api/niche-webhooks/:niche', async (req, res) => {
    try {
      const { niche } = req.params;
      const validatedData = insertNicheWebhookSchema.parse({
        niche: niche.toLowerCase(),
        ...req.body
      });

      const success = await updateNicheWebhook(
        validatedData.niche,
        validatedData.webhookUrl,
        validatedData.enabled
      );

      if (success) {
        res.json({ 
          success: true, 
          message: `Webhook configured successfully for ${niche} niche`
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to update webhook configuration' 
        });
      }
    } catch (error) {
      console.error(`Error updating webhook for niche ${req.params.niche}:`, error);
      res.status(400).json({ error: 'Invalid webhook data' });
    }
  });

  /**
   * Test webhook connection for a specific niche
   */
  app.post('/api/niche-webhooks/:niche/test', async (req, res) => {
    try {
      const { niche } = req.params;
      const result = await testNicheWebhook(niche.toLowerCase());
      
      res.json(result);
    } catch (error) {
      console.error(`Error testing webhook for niche ${req.params.niche}:`, error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to test webhook connection' 
      });
    }
  });

  /**
   * Delete webhook configuration for a specific niche
   */
  app.delete('/api/niche-webhooks/:niche', async (req, res) => {
    try {
      const { niche } = req.params;
      
      const result = await db.delete(nicheWebhooks)
        .where(eq(nicheWebhooks.niche, niche.toLowerCase()));
      
      if (result.rowCount && result.rowCount > 0) {
        res.json({ 
          success: true, 
          message: `Webhook configuration deleted for ${niche} niche`
        });
      } else {
        res.status(404).json({ 
          success: false, 
          error: 'Webhook not found for this niche' 
        });
      }
    } catch (error) {
      console.error(`Error deleting webhook for niche ${req.params.niche}:`, error);
      res.status(500).json({ error: 'Failed to delete webhook configuration' });
    }
  });

  /**
   * Get webhook statistics for all niches
   */
  app.get('/api/niche-webhooks/stats/all', async (req, res) => {
    try {
      const webhooks = await db.select().from(nicheWebhooks);
      
      const stats = webhooks.map(webhook => ({
        niche: webhook.niche,
        enabled: webhook.enabled,
        successCount: webhook.successCount,
        failureCount: webhook.failureCount,
        lastUsed: webhook.lastUsed,
        successRate: webhook.successCount + webhook.failureCount > 0 
          ? (webhook.successCount / (webhook.successCount + webhook.failureCount) * 100).toFixed(1)
          : '0.0'
      }));
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching webhook statistics:', error);
      res.status(500).json({ error: 'Failed to fetch webhook statistics' });
    }
  });

  /**
   * Send test content to niche-specific webhook
   */
  app.post('/api/niche-webhooks/:niche/send-test-content', async (req, res) => {
    try {
      const { niche } = req.params;
      
      const testContent = {
        niche: niche.toLowerCase(),
        productName: 'Test Product for Webhook',
        platforms: ['TikTok', 'Instagram'],
        content: {
          mainContent: 'This is a test content generation for webhook testing.',
          hook: 'Test hook for your attention!',
          hashtags: ['#test', '#webhook', `#${niche}`]
        },
        affiliateLink: 'https://amazon.com/test-product',
        metadata: {
          tone: 'friendly',
          template: 'product_review',
          generatedAt: new Date().toISOString(),
          testMode: true
        }
      };

      const result = await sendMultiPlatformWebhook(testContent);
      res.json(result);
    } catch (error) {
      console.error(`Error sending test content for niche ${req.params.niche}:`, error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send test content' 
      });
    }
  });

  /**
   * Bulk update webhook configurations
   */
  app.post('/api/niche-webhooks/bulk-update', async (req, res) => {
    try {
      const { webhooks } = req.body;
      
      if (!Array.isArray(webhooks)) {
        return res.status(400).json({ error: 'Webhooks must be an array' });
      }

      const results = [];
      
      for (const webhook of webhooks) {
        const validatedData = insertNicheWebhookSchema.parse(webhook);
        const success = await updateNicheWebhook(
          validatedData.niche,
          validatedData.webhookUrl,
          validatedData.enabled
        );
        
        results.push({
          niche: validatedData.niche,
          success
        });
      }

      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: successCount === results.length,
        message: `Updated ${successCount}/${results.length} webhooks successfully`,
        results
      });
    } catch (error) {
      console.error('Error bulk updating webhooks:', error);
      res.status(400).json({ error: 'Invalid bulk update data' });
    }
  });
};