import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { z } from 'zod';
import { sql, and, gte, lte, eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { 
  campaigns, 
  campaignRecipients, 
  analyticsEvents, 
  costs, 
  contacts, 
  abTests, 
  abAssignments, 
  abConversions 
} from '@shared/schema';

const router = Router();

// Query schema for date range filtering
const performanceQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  by: z.enum(['campaign', 'channel', 'segment']).optional().default('campaign'),
  orgId: z.coerce.number().optional().default(1)
});

// Performance rollups API
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const { from, to, by, orgId } = performanceQuerySchema.parse(req.query);
    
    // Default to last 14 days if no date range provided
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    console.log(`📊 Performance report request: ${by} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    let performanceData: any = {};

    if (by === 'campaign') {
      // Campaign-level performance rollup
      performanceData = await getCampaignPerformance(orgId, startDate, endDate);
    } else if (by === 'channel') {
      // Channel-level performance rollup  
      performanceData = await getChannelPerformance(orgId, startDate, endDate);
    } else if (by === 'segment') {
      // Segment-level performance rollup
      performanceData = await getSegmentPerformance(orgId, startDate, endDate);
    }

    res.json({
      success: true,
      data: performanceData,
      meta: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
        by,
        orgId
      }
    });

  } catch (error) {
    console.error('❌ Performance report error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get campaign-level performance metrics
async function getCampaignPerformance(orgId: number, startDate: Date, endDate: Date) {
  console.log('🔄 Fetching campaign performance data...');
  
  // Get campaigns in date range
  const campaignsInRange = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      type: campaigns.type,
      status: campaigns.status,
      createdAt: campaigns.createdAt
    })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.orgId, orgId),
        gte(campaigns.createdAt, startDate),
        lte(campaigns.createdAt, endDate)
      )
    );

  const results = [];

  for (const campaign of campaignsInRange) {
    // Email metrics
    const emailMetrics = await getEmailMetrics(campaign.id, startDate, endDate);
    
    // Social metrics (placeholder for now)
    const socialMetrics = await getSocialMetrics(campaign.id, startDate, endDate);
    
    // Blog metrics (placeholder for now) 
    const blogMetrics = await getBlogMetrics(campaign.id, startDate, endDate);
    
    // Push metrics
    const pushMetrics = await getPushMetrics(campaign.id, startDate, endDate);
    
    // Cost metrics
    const costMetrics = await getCostMetrics(campaign.name, startDate, endDate);
    
    // A/B test metrics
    const abTestMetrics = await getABTestMetrics(campaign.id);

    results.push({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        createdAt: campaign.createdAt
      },
      email: emailMetrics,
      social: socialMetrics,
      blog: blogMetrics,
      push: pushMetrics,
      costs: costMetrics,
      abTests: abTestMetrics
    });
  }

  return results;
}

// Get channel-level performance metrics
async function getChannelPerformance(orgId: number, startDate: Date, endDate: Date) {
  console.log('🔄 Fetching channel performance data...');
  
  // Aggregate metrics by channel (email, social, blog, push)
  const channels = ['email', 'social', 'blog', 'push'];
  const results = [];

  for (const channel of channels) {
    let metrics = { sent: 0, delivered: 0, opens: 0, clicks: 0, conversions: 0 };
    
    if (channel === 'email') {
      // Aggregate all email campaigns
      const emailAggregates = await db
        .select({
          sent: sql<number>`COUNT(CASE WHEN ${campaignRecipients.sentAt} IS NOT NULL THEN 1 END)`,
          delivered: sql<number>`COUNT(CASE WHEN ${campaignRecipients.sentAt} IS NOT NULL AND ${campaignRecipients.bounceAt} IS NULL THEN 1 END)`,
          opens: sql<number>`COUNT(CASE WHEN ${campaignRecipients.openAt} IS NOT NULL THEN 1 END)`,
          clicks: sql<number>`COUNT(CASE WHEN ${campaignRecipients.clickAt} IS NOT NULL THEN 1 END)`
        })
        .from(campaignRecipients)
        .innerJoin(campaigns, eq(campaignRecipients.campaignId, campaigns.id))
        .where(
          and(
            eq(campaigns.orgId, orgId),
            gte(campaignRecipients.createdAt, startDate),
            lte(campaignRecipients.createdAt, endDate)
          )
        );

      if (emailAggregates.length > 0) {
        metrics = { ...emailAggregates[0], conversions: 0 };
      }
    } else {
      // For other channels, count analytics events
      const eventCounts = await db
        .select({
          count: sql<number>`COUNT(*)`
        })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.orgId, orgId),
            eq(analyticsEvents.eventType, `${channel}_sent`),
            gte(analyticsEvents.createdAt, startDate),
            lte(analyticsEvents.createdAt, endDate)
          )
        );
      
      metrics.sent = eventCounts[0]?.count || 0;
    }

    results.push({
      channel,
      metrics
    });
  }

  return results;
}

// Get segment-level performance metrics
async function getSegmentPerformance(orgId: number, startDate: Date, endDate: Date) {
  console.log('🔄 Fetching segment performance data...');
  
  // This would typically aggregate by contact segments
  // For now, returning basic contact statistics
  const contactStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      recentlyAdded: sql<number>`COUNT(CASE WHEN ${contacts.createdAt} >= ${startDate} THEN 1 END)`
    })
    .from(contacts)
    .where(eq(contacts.orgId, orgId));

  return [{
    segment: 'all_contacts',
    metrics: contactStats[0] || { total: 0, recentlyAdded: 0 }
  }];
}

// Helper functions for specific metrics

async function getEmailMetrics(campaignId: number, startDate: Date, endDate: Date) {
  const results = await db
    .select({
      sent: sql<number>`COUNT(CASE WHEN ${campaignRecipients.sentAt} IS NOT NULL THEN 1 END)`,
      delivered: sql<number>`COUNT(CASE WHEN ${campaignRecipients.sentAt} IS NOT NULL AND ${campaignRecipients.bounceAt} IS NULL THEN 1 END)`,
      opens: sql<number>`COUNT(CASE WHEN ${campaignRecipients.openAt} IS NOT NULL THEN 1 END)`,
      clicks: sql<number>`COUNT(CASE WHEN ${campaignRecipients.clickAt} IS NOT NULL THEN 1 END)`,
      unsubscribes: sql<number>`COUNT(CASE WHEN ${campaignRecipients.unsubscribeAt} IS NOT NULL THEN 1 END)`
    })
    .from(campaignRecipients)
    .where(
      and(
        eq(campaignRecipients.campaignId, campaignId),
        gte(campaignRecipients.createdAt, startDate),
        lte(campaignRecipients.createdAt, endDate)
      )
    );

  const metrics = results[0] || { sent: 0, delivered: 0, opens: 0, clicks: 0, unsubscribes: 0 };
  
  // Calculate rates
  const openRate = metrics.delivered > 0 ? (metrics.opens / metrics.delivered) * 100 : 0;
  const clickThroughRate = metrics.opens > 0 ? (metrics.clicks / metrics.opens) * 100 : 0;
  
  return {
    ...metrics,
    openRate: Math.round(openRate * 100) / 100,
    clickThroughRate: Math.round(clickThroughRate * 100) / 100
  };
}

async function getSocialMetrics(campaignId: number, startDate: Date, endDate: Date) {
  const results = await db
    .select({
      scheduled: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'social_scheduled' THEN 1 END)`,
      published: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'social_published' THEN 1 END)`
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.entityId, campaignId),
        eq(analyticsEvents.entityType, 'campaign'),
        gte(analyticsEvents.createdAt, startDate),
        lte(analyticsEvents.createdAt, endDate)
      )
    );

  return results[0] || { scheduled: 0, published: 0 };
}

async function getBlogMetrics(campaignId: number, startDate: Date, endDate: Date) {
  const results = await db
    .select({
      published: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'blog_published' THEN 1 END)`
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.entityId, campaignId),
        eq(analyticsEvents.entityType, 'campaign'),
        gte(analyticsEvents.createdAt, startDate),
        lte(analyticsEvents.createdAt, endDate)
      )
    );

  return results[0] || { published: 0 };
}

async function getPushMetrics(campaignId: number, startDate: Date, endDate: Date) {
  const results = await db
    .select({
      sent: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'push_sent' THEN 1 END)`,
      delivered: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'push_delivered' THEN 1 END)`
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.entityId, campaignId),
        eq(analyticsEvents.entityType, 'campaign'),
        gte(analyticsEvents.createdAt, startDate),
        lte(analyticsEvents.createdAt, endDate)
      )
    );

  return results[0] || { sent: 0, delivered: 0 };
}

async function getCostMetrics(campaignName: string, startDate: Date, endDate: Date) {
  const results = await db
    .select({
      totalCost: sql<string>`COALESCE(SUM(${costs.cost}::numeric), 0)`,
      currency: costs.currency
    })
    .from(costs)
    .where(
      and(
        eq(costs.campaignName, campaignName),
        gte(costs.date, startDate),
        lte(costs.date, endDate)
      )
    )
    .groupBy(costs.currency);

  const result = results[0] || { totalCost: '0', currency: 'USD' };
  
  // Convert decimal string to number for ROAS calculations
  const totalCost = parseFloat(result.totalCost) || 0;
  
  return {
    totalCost,
    currency: result.currency
  };
}

async function getABTestMetrics(campaignId: number) {
  // Get A/B tests for this campaign's context
  const tests = await db
    .select({
      id: abTests.id,
      entity: abTests.entity,
      status: abTests.status,
      winner: abTests.winner
    })
    .from(abTests)
    .where(eq(abTests.status, 'running'));

  const results = [];
  
  for (const test of tests) {
    // Get assignment counts
    const assignments = await db
      .select({
        variantA: sql<number>`COUNT(CASE WHEN ${abAssignments.variant} = 'A' THEN 1 END)`,
        variantB: sql<number>`COUNT(CASE WHEN ${abAssignments.variant} = 'B' THEN 1 END)`
      })
      .from(abAssignments)
      .where(eq(abAssignments.abTestId, test.id));

    // Get conversion counts
    const conversions = await db
      .select({
        conversionsA: sql<number>`COUNT(CASE WHEN ${abConversions.variant} = 'A' THEN 1 END)`,
        conversionsB: sql<number>`COUNT(CASE WHEN ${abConversions.variant} = 'B' THEN 1 END)`
      })
      .from(abConversions)
      .where(eq(abConversions.abTestId, test.id));

    const assignmentData = assignments[0] || { variantA: 0, variantB: 0 };
    const conversionData = conversions[0] || { conversionsA: 0, conversionsB: 0 };

    results.push({
      testId: test.id,
      entity: test.entity,
      status: test.status,
      winner: test.winner,
      assignments: assignmentData,
      conversions: conversionData,
      conversionRates: {
        variantA: assignmentData.variantA > 0 ? (conversionData.conversionsA / assignmentData.variantA) * 100 : 0,
        variantB: assignmentData.variantB > 0 ? (conversionData.conversionsB / assignmentData.variantB) * 100 : 0
      }
    });
  }

  return results;
}

export default router;