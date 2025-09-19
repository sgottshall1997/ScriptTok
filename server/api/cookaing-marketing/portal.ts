/**
 * Client Portal API Routes - Phase 5
 * Read-only client access to marketing data
 */

import { Router } from 'express';
import { z } from 'zod';
import { rbacService } from '../../cookaing-marketing/services/rbac.service';
import { approvalsService } from '../../cookaing-marketing/services/approvals.service';
import { calendarService } from '../../cookaing-marketing/services/calendar.service';
import { db } from '../../db';
import { campaigns, campaignArtifacts, contacts, analyticsEvents } from '../../../shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

const router = Router();

// Middleware to ensure client portal access
const requireClientAccess = async (req: any, res: any, next: any) => {
  try {
    const user = req.headers['x-user-email'] || req.user?.email || 'anonymous';
    const orgId = req.query.orgId || req.body.orgId || 1;

    if (user === 'anonymous') {
      return res.status(401).json({ error: 'Authentication required for portal access' });
    }

    // Check if user has client role or higher permissions
    const hasAccess = await rbacService.can(user, 'read', 'portal');
    const isClient = await rbacService.hasRole(user, 'client');
    
    if (!hasAccess && !isClient) {
      return res.status(403).json({ 
        error: 'Client portal access denied',
        message: 'Please contact your account manager for access'
      });
    }

    req.portalContext = { user, orgId: parseInt(orgId as string) };
    next();
  } catch (error) {
    console.error('Portal access check failed:', error);
    res.status(500).json({ error: 'Portal access verification failed' });
  }
};

// CLIENT PORTAL ROUTES

/**
 * GET /api/cookaing-marketing/portal/overview
 * Get high-level overview for client
 */
router.get('/overview', requireClientAccess, async (req, res) => {
  try {
    const { orgId } = req.portalContext;

    // Get campaign summary (bleached of internal details)
    const campaignSummary = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        type: campaigns.type,
        status: campaigns.status,
        createdAt: campaigns.createdAt
      })
      .from(campaigns)
      .where(eq(campaigns.orgId, orgId))
      .orderBy(desc(campaigns.createdAt))
      .limit(10);

    // Get contact count
    const [contactCount] = await db
      .select({ count: db.$count() })
      .from(contacts)
      .where(eq(contacts.orgId, orgId));

    // Get recent approvals count
    const approvalStats = await approvalsService.getStats();

    // Get upcoming calendar items
    const upcoming = await calendarService.getUpcoming(7);

    const overview = {
      campaigns: {
        total: campaignSummary.length,
        recent: campaignSummary.slice(0, 5).map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          status: c.status,
          createdAt: c.createdAt
        }))
      },
      audience: {
        totalContacts: contactCount.count
      },
      approvals: {
        pending: approvalStats.pending,
        approved: approvalStats.approved
      },
      calendar: {
        upcomingItems: upcoming.length,
        nextItems: upcoming.slice(0, 3).map(item => ({
          title: item.title,
          channel: item.channel,
          startAt: item.startAt
        }))
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: overview,
      mode: 'client_portal'
    });
  } catch (error: any) {
    console.error('Portal overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load portal overview'
    });
  }
});

/**
 * GET /api/cookaing-marketing/portal/artifacts
 * Get limited artifact metadata for client
 */
router.get('/artifacts', requireClientAccess, async (req, res) => {
  try {
    const { orgId } = req.portalContext;
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const to = req.query.to ? new Date(req.query.to as string) : new Date();

    // Get approved campaign artifacts only (bleached of sensitive data)
    const artifacts = await db
      .select({
        id: campaignArtifacts.id,
        campaignId: campaignArtifacts.campaignId,
        channel: campaignArtifacts.channel,
        variant: campaignArtifacts.variant,
        createdAt: campaignArtifacts.createdAt
      })
      .from(campaignArtifacts)
      .innerJoin(campaigns, eq(campaignArtifacts.campaignId, campaigns.id))
      .where(
        and(
          eq(campaigns.orgId, orgId),
          gte(campaignArtifacts.createdAt, from),
          gte(to, campaignArtifacts.createdAt)
        )
      )
      .orderBy(desc(campaignArtifacts.createdAt))
      .limit(50);

    const sanitizedArtifacts = artifacts.map(artifact => ({
      id: artifact.id,
      campaignId: artifact.campaignId,
      channel: artifact.channel,
      variant: artifact.variant,
      createdAt: artifact.createdAt,
      // Note: payloadJson is excluded for client privacy
      status: 'available'
    }));

    res.json({
      success: true,
      data: sanitizedArtifacts,
      count: sanitizedArtifacts.length,
      dateRange: { from, to },
      mode: 'client_portal'
    });
  } catch (error: any) {
    console.error('Portal artifacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load artifacts'
    });
  }
});

/**
 * GET /api/cookaing-marketing/portal/reports
 * Get trimmed reports for client
 */
router.get('/reports', requireClientAccess, async (req, res) => {
  try {
    const { orgId } = req.portalContext;
    const range = req.query.range || '30d';

    // Calculate date range
    const now = new Date();
    let fromDate: Date;
    
    switch (range) {
      case '7d':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics events for the period (high-level only)
    const analyticsData = await db
      .select({
        eventType: analyticsEvents.eventType,
        entityType: analyticsEvents.entityType,
        createdAt: analyticsEvents.createdAt
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.orgId, orgId),
          gte(analyticsEvents.createdAt, fromDate)
        )
      )
      .orderBy(desc(analyticsEvents.createdAt));

    // Aggregate data for client report
    const eventCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    analyticsData.forEach(event => {
      // Count by event type
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
      
      // Count by day
      const day = event.createdAt.toISOString().split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    const reports = {
      period: range,
      dateRange: { from: fromDate, to: now },
      summary: {
        totalEvents: analyticsData.length,
        eventTypes: Object.keys(eventCounts).length,
        avgDailyActivity: Object.values(dailyCounts).reduce((a, b) => a + b, 0) / Object.keys(dailyCounts).length || 0
      },
      eventBreakdown: eventCounts,
      dailyActivity: dailyCounts,
      trends: {
        // Mock trend analysis
        campaignActivity: eventCounts['campaign_create'] || 0,
        contentGeneration: eventCounts['content_generate'] || 0,
        approvalActivity: (eventCounts['approval_submit'] || 0) + (eventCounts['approval_decide'] || 0)
      }
    };

    res.json({
      success: true,
      data: reports,
      mode: 'client_portal'
    });
  } catch (error: any) {
    console.error('Portal reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load reports'
    });
  }
});

/**
 * GET /api/cookaing-marketing/portal/calendar
 * Get calendar view for client (read-only)
 */
router.get('/calendar', requireClientAccess, async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date();
    const to = req.query.to ? new Date(req.query.to as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

    const items = await calendarService.listTimeline({ from, to });

    // Filter to only show published or confirmed items for client
    const clientItems = items
      .filter(item => item.status === 'published' || item.status === 'scheduled')
      .map(item => ({
        id: item.id,
        title: item.title,
        startAt: item.startAt,
        endAt: item.endAt,
        channel: item.channel,
        status: item.status
        // Note: refId excluded for privacy
      }));

    res.json({
      success: true,
      data: clientItems,
      count: clientItems.length,
      dateRange: { from, to },
      mode: 'client_portal'
    });
  } catch (error: any) {
    console.error('Portal calendar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load calendar'
    });
  }
});

/**
 * GET /api/cookaing-marketing/portal/settings
 * Get portal branding and configuration
 */
router.get('/settings', requireClientAccess, async (req, res) => {
  try {
    const { orgId } = req.portalContext;

    // Mock settings - in a real app this would come from org configuration
    const settings = {
      branding: {
        logoUrl: '/assets/client-logo.png',
        primaryColor: '#2563eb',
        companyName: 'Your Organization',
        supportEmail: 'support@example.com'
      },
      features: {
        showCampaigns: true,
        showArtifacts: true,
        showReports: true,
        showCalendar: true,
        allowExports: false // Clients typically don't get export access
      },
      permissions: {
        canViewInternal: false,
        canModifyContent: false,
        canApprove: false,
        canExport: false
      }
    };

    res.json({
      success: true,
      data: settings,
      mode: 'client_portal'
    });
  } catch (error: any) {
    console.error('Portal settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load portal settings'
    });
  }
});

export default router;