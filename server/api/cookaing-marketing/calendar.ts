/**
 * Calendar API Routes - Phase 5
 * Content Calendar Management and Scheduling
 */

import { Router } from 'express';
import { z } from 'zod';
import { calendarService } from '../../cookaing-marketing/services/calendar.service';
import { rbacService } from '../../cookaing-marketing/services/rbac.service';

const router = Router();

// Request schemas
const createCalendarItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startAt: z.string(), // ISO date string
  endAt: z.string(),   // ISO date string
  channel: z.string().min(1, 'Channel is required'),
  refId: z.number().optional(),
  status: z.enum(['scheduled', 'published', 'cancelled']).optional().default('scheduled')
});

const moveItemSchema = z.object({
  id: z.number(),
  newStart: z.string(), // ISO date string
  newEnd: z.string()    // ISO date string
});

const updateStatusSchema = z.object({
  id: z.number(),
  status: z.enum(['scheduled', 'published', 'cancelled'])
});

const timelineQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional()
});

// CALENDAR ROUTES

/**
 * GET /api/cookaing-marketing/calendar
 * Get calendar timeline items
 */
router.get('/', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const defaultTo = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);  // 30 days ahead

    const from = req.query.from ? new Date(req.query.from as string) : defaultFrom;
    const to = req.query.to ? new Date(req.query.to as string) : defaultTo;

    const items = await calendarService.listTimeline({ from, to });

    res.json({
      success: true,
      data: items,
      count: items.length,
      dateRange: { from, to }
    });
  } catch (error: any) {
    console.error('Get calendar timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calendar timeline'
    });
  }
});

/**
 * POST /api/cookaing-marketing/calendar
 * Create new calendar item
 */
router.post('/', rbacService.requirePermission('write'), async (req, res) => {
  try {
    const { title, startAt, endAt, channel, refId, status } = createCalendarItemSchema.parse(req.body);

    // Check for conflicts
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    
    const conflicts = await calendarService.checkConflicts(startDate, endDate, channel);
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Schedule conflict detected',
        conflicts: conflicts.map(c => ({
          id: c.id,
          title: c.title,
          startAt: c.startAt,
          endAt: c.endAt
        }))
      });
    }

    const item = await calendarService.upsertItem({
      title,
      startAt: startDate,
      endAt: endDate,
      channel,
      refId,
      status
    });

    res.json({
      success: true,
      data: item,
      message: 'Calendar item created successfully'
    });
  } catch (error: any) {
    console.error('Create calendar item error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create calendar item'
    });
  }
});

/**
 * POST /api/cookaing-marketing/calendar/move
 * Move calendar item to new time slot
 */
router.post('/move', rbacService.requirePermission('write'), async (req, res) => {
  try {
    const { id, newStart, newEnd } = moveItemSchema.parse(req.body);

    // Get current item to check channel
    const currentItem = await calendarService.getItem(id);
    if (!currentItem) {
      return res.status(404).json({
        success: false,
        error: 'Calendar item not found'
      });
    }

    // Check for conflicts at new time
    const startDate = new Date(newStart);
    const endDate = new Date(newEnd);
    
    const conflicts = await calendarService.checkConflicts(startDate, endDate, currentItem.channel, id);
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Schedule conflict detected at new time',
        conflicts: conflicts.map(c => ({
          id: c.id,
          title: c.title,
          startAt: c.startAt,
          endAt: c.endAt
        }))
      });
    }

    const movedItem = await calendarService.moveItem({
      id,
      newStart: startDate,
      newEnd: endDate
    });

    res.json({
      success: true,
      data: movedItem,
      message: 'Calendar item moved successfully'
    });
  } catch (error: any) {
    console.error('Move calendar item error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to move calendar item'
    });
  }
});

/**
 * PUT /api/cookaing-marketing/calendar/:id/status
 * Update calendar item status
 */
router.put('/:id/status', rbacService.requirePermission('write'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid calendar item ID'
      });
    }

    const { status } = updateStatusSchema.parse({ id, ...req.body });

    const item = await calendarService.updateStatus(id, status);

    res.json({
      success: true,
      data: item,
      message: `Calendar item status updated to ${status}`
    });
  } catch (error: any) {
    console.error('Update calendar status error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update calendar item status'
    });
  }
});

/**
 * DELETE /api/cookaing-marketing/calendar/:id
 * Delete calendar item
 */
router.delete('/:id', rbacService.requirePermission('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid calendar item ID'
      });
    }

    const success = await calendarService.deleteItem(id);

    if (success) {
      res.json({
        success: true,
        message: 'Calendar item deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Calendar item not found'
      });
    }
  } catch (error: any) {
    console.error('Delete calendar item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete calendar item'
    });
  }
});

/**
 * GET /api/cookaing-marketing/calendar/ics
 * Export calendar as ICS file
 */
router.get('/ics', rbacService.requirePermission('export'), async (req, res) => {
  try {
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const defaultTo = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

    const from = req.query.from ? new Date(req.query.from as string) : defaultFrom;
    const to = req.query.to ? new Date(req.query.to as string) : defaultTo;

    const icsContent = await calendarService.icsExport({ from, to });

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="cookaing-calendar.ics"');
    res.send(icsContent);
  } catch (error: any) {
    console.error('Export ICS error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export calendar'
    });
  }
});

/**
 * GET /api/cookaing-marketing/calendar/stats
 * Get calendar statistics
 */
router.get('/stats', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const stats = await calendarService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get calendar stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get calendar statistics'
    });
  }
});

/**
 * GET /api/cookaing-marketing/calendar/channel/:channel
 * Get calendar items for specific channel
 */
router.get('/channel/:channel', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const channel = req.params.channel;
    const items = await calendarService.getByChannel(channel);

    res.json({
      success: true,
      data: items,
      count: items.length,
      channel
    });
  } catch (error: any) {
    console.error('Get channel calendar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get calendar items for channel'
    });
  }
});

/**
 * GET /api/cookaing-marketing/calendar/upcoming
 * Get upcoming calendar items
 */
router.get('/upcoming', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const items = await calendarService.getUpcoming(days);

    res.json({
      success: true,
      data: items,
      count: items.length,
      days
    });
  } catch (error: any) {
    console.error('Get upcoming calendar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get upcoming calendar items'
    });
  }
});

export default router;