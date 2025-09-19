/**
 * Calendar Service - Content calendar management and scheduling
 */

import { db } from '../../db';
import { contentCalendar, analyticsEvents } from '../../../shared/schema.ts';
import { eq, and, between, desc } from 'drizzle-orm';

interface CalendarItem {
  id: number;
  title: string;
  startAt: Date;
  endAt: Date;
  channel: string;
  refId: number | null;
  status: 'scheduled' | 'published' | 'cancelled';
  createdAt: Date;
}

interface CreateCalendarItemRequest {
  title: string;
  startAt: string | Date;
  endAt: string | Date;
  channel: string;
  refId?: number;
  status?: 'scheduled' | 'published' | 'cancelled';
}

interface MoveItemRequest {
  id: number;
  newStart: string | Date;
  newEnd: string | Date;
}

class CalendarService {
  /**
   * List timeline items within date range
   */
  async listTimeline({ from, to }: { from: Date; to: Date }): Promise<CalendarItem[]> {
    const items = await db
      .select()
      .from(contentCalendar)
      .where(
        and(
          between(contentCalendar.startAt, from, to)
        )
      )
      .orderBy(contentCalendar.startAt);

    return items.map((item: any) => ({
      id: item.id,
      title: item.title,
      startAt: item.startAt,
      endAt: item.endAt,
      channel: item.channel,
      refId: item.refId,
      status: item.status as 'scheduled' | 'published' | 'cancelled',
      createdAt: item.createdAt
    }));
  }

  /**
   * Create or update calendar item
   */
  async upsertItem(request: CreateCalendarItemRequest): Promise<CalendarItem> {
    const { title, startAt, endAt, channel, refId, status = 'scheduled' } = request;

    const startDate = typeof startAt === 'string' ? new Date(startAt) : startAt;
    const endDate = typeof endAt === 'string' ? new Date(endAt) : endAt;

    // Validate dates
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    const [item] = await db
      .insert(contentCalendar)
      .values({
        title,
        startAt: startDate,
        endAt: endDate,
        channel,
        refId: refId || null,
        status
      })
      .returning();

    // Log analytics event
    await this.logAnalyticsEvent('calendar_upsert', 'calendar_item', item.id, {
      title,
      channel,
      status,
      duration: endDate.getTime() - startDate.getTime(),
      hasReference: !!refId
    });

    return {
      id: item.id,
      title: item.title,
      startAt: item.startAt,
      endAt: item.endAt,
      channel: item.channel,
      refId: item.refId,
      status: item.status as 'scheduled' | 'published' | 'cancelled',
      createdAt: item.createdAt
    };
  }

  /**
   * Move calendar item to new time slot
   */
  async moveItem(request: MoveItemRequest): Promise<CalendarItem> {
    const { id, newStart, newEnd } = request;

    const startDate = typeof newStart === 'string' ? new Date(newStart) : newStart;
    const endDate = typeof newEnd === 'string' ? new Date(newEnd) : newEnd;

    // Validate dates
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    const [item] = await db
      .update(contentCalendar)
      .set({
        startAt: startDate,
        endAt: endDate
      })
      .where(eq(contentCalendar.id, id))
      .returning();

    if (!item) {
      throw new Error('Calendar item not found');
    }

    // Log analytics event
    await this.logAnalyticsEvent('calendar_move', 'calendar_item', id, {
      newStart: startDate.toISOString(),
      newEnd: endDate.toISOString(),
      duration: endDate.getTime() - startDate.getTime()
    });

    return {
      id: item.id,
      title: item.title,
      startAt: item.startAt,
      endAt: item.endAt,
      channel: item.channel,
      refId: item.refId,
      status: item.status as 'scheduled' | 'published' | 'cancelled',
      createdAt: item.createdAt
    };
  }

  /**
   * Update calendar item status
   */
  async updateStatus(id: number, status: 'scheduled' | 'published' | 'cancelled'): Promise<CalendarItem> {
    const [item] = await db
      .update(contentCalendar)
      .set({ status })
      .where(eq(contentCalendar.id, id))
      .returning();

    if (!item) {
      throw new Error('Calendar item not found');
    }

    return {
      id: item.id,
      title: item.title,
      startAt: item.startAt,
      endAt: item.endAt,
      channel: item.channel,
      refId: item.refId,
      status: item.status as 'scheduled' | 'published' | 'cancelled',
      createdAt: item.createdAt
    };
  }

  /**
   * Delete calendar item
   */
  async deleteItem(id: number): Promise<boolean> {
    const result = await db
      .delete(contentCalendar)
      .where(eq(contentCalendar.id, id));

    return result.rowCount > 0;
  }

  /**
   * Get calendar item by ID
   */
  async getItem(id: number): Promise<CalendarItem | null> {
    const [item] = await db
      .select()
      .from(contentCalendar)
      .where(eq(contentCalendar.id, id));

    if (!item) return null;

    return {
      id: item.id,
      title: item.title,
      startAt: item.startAt,
      endAt: item.endAt,
      channel: item.channel,
      refId: item.refId,
      status: item.status as 'scheduled' | 'published' | 'cancelled',
      createdAt: item.createdAt
    };
  }

  /**
   * Export calendar as ICS format
   */
  async icsExport({ from, to }: { from: Date; to: Date }): Promise<string> {
    const items = await this.listTimeline({ from, to });

    // Generate ICS content
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CookAIng Marketing Engine//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    items.forEach(item => {
      // Convert dates to ICS format (YYYYMMDDTHHMMSSZ)
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };

      const uid = `calendar-item-${item.id}@cookaing.com`;
      const dtstart = formatICSDate(item.startAt);
      const dtend = formatICSDate(item.endAt);
      const dtstamp = formatICSDate(new Date());

      icsLines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${item.title}`,
        `DESCRIPTION:${item.channel} content - Status: ${item.status}`,
        `CATEGORIES:${item.channel.toUpperCase()}`,
        `STATUS:${item.status === 'published' ? 'CONFIRMED' : item.status === 'cancelled' ? 'CANCELLED' : 'TENTATIVE'}`,
        'END:VEVENT'
      );
    });

    icsLines.push('END:VCALENDAR');

    return icsLines.join('\r\n');
  }

  /**
   * Get calendar statistics
   */
  async getStats(): Promise<{
    total: number;
    scheduled: number;
    published: number;
    cancelled: number;
    byChannel: Record<string, number>;
    upcoming: number;
  }> {
    const allItems = await db.select().from(contentCalendar);
    const now = new Date();
    
    const stats = {
      total: allItems.length,
      scheduled: allItems.filter((item: any) => item.status === 'scheduled').length,
      published: allItems.filter((item: any) => item.status === 'published').length,
      cancelled: allItems.filter((item: any) => item.status === 'cancelled').length,
      byChannel: {} as Record<string, number>,
      upcoming: allItems.filter((item: any) => item.startAt > now && item.status === 'scheduled').length
    };

    // Count by channel
    allItems.forEach((item: any) => {
      stats.byChannel[item.channel] = (stats.byChannel[item.channel] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get items by channel
   */
  async getByChannel(channel: string): Promise<CalendarItem[]> {
    const items = await db
      .select()
      .from(contentCalendar)
      .where(eq(contentCalendar.channel, channel))
      .orderBy(contentCalendar.startAt);

    return items.map((item: any) => ({
      id: item.id,
      title: item.title,
      startAt: item.startAt,
      endAt: item.endAt,
      channel: item.channel,
      refId: item.refId,
      status: item.status as 'scheduled' | 'published' | 'cancelled',
      createdAt: item.createdAt
    }));
  }

  /**
   * Get upcoming items (next 7 days)
   */
  async getUpcoming(days: number = 7): Promise<CalendarItem[]> {
    const now = new Date();
    const future = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    return this.listTimeline({ from: now, to: future });
  }

  /**
   * Check for scheduling conflicts
   */
  async checkConflicts(startAt: Date, endAt: Date, channel: string, excludeId?: number): Promise<CalendarItem[]> {
    let query = db
      .select()
      .from(contentCalendar)
      .where(
        and(
          eq(contentCalendar.channel, channel),
          // Check for overlap: start < endAt AND end > startAt
          db.or(
            and(
              db.lte(contentCalendar.startAt, endAt),
              db.gte(contentCalendar.endAt, startAt)
            )
          )
        )
      );

    if (excludeId) {
      query = query.where(db.ne(contentCalendar.id, excludeId));
    }

    const conflicts = await query;
    
    return conflicts.map(item => ({
      id: item.id,
      title: item.title,
      startAt: item.startAt,
      endAt: item.endAt,
      channel: item.channel,
      refId: item.refId,
      status: item.status as 'scheduled' | 'published' | 'cancelled',
      createdAt: item.createdAt
    }));
  }

  /**
   * Log analytics event
   */
  private async logAnalyticsEvent(eventType: string, entityType: string, entityId: number, meta: any) {
    try {
      await db.insert(analyticsEvents).values({
        orgId: 1, // Default org for now
        eventType,
        entityType,
        entityId,
        metaJson: meta
      });
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }
}

export const calendarService = new CalendarService();
export default calendarService;