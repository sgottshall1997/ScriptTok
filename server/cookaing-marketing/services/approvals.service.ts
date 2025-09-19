/**
 * Approvals Service - Manage approval workflows and lifecycle
 */

import { db } from '../../db';
import { approvals, analyticsEvents } from '../../../shared/schema.ts';
import { eq, and, desc } from 'drizzle-orm';

interface ApprovalRequest {
  entityType: 'campaign' | 'artifact' | 'version';
  entityId: number;
  assignee: string;
  notes?: string;
}

interface ApprovalDecision {
  approvalId: number;
  status: 'approved' | 'rejected';
  notes?: string;
}

interface ApprovalStatus {
  id: number;
  entityType: string;
  entityId: number;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  assignee: string;
  notes: string | null;
  createdAt: Date;
  decidedAt?: Date;
}

class ApprovalsService {
  /**
   * Submit entity for review
   */
  async submitForReview(request: ApprovalRequest): Promise<ApprovalStatus> {
    const { entityType, entityId, assignee, notes } = request;

    // Check if approval already exists for this entity
    const [existing] = await db
      .select()
      .from(approvals)
      .where(
        and(
          eq(approvals.entityType, entityType),
          eq(approvals.entityId, entityId)
        )
      );

    let approval;

    if (existing) {
      // Update existing approval to review status
      [approval] = await db
        .update(approvals)
        .set({
          status: 'review',
          assignee,
          notes: notes || null
        })
        .where(eq(approvals.id, existing.id))
        .returning();
    } else {
      // Create new approval
      [approval] = await db
        .insert(approvals)
        .values({
          entityType,
          entityId,
          status: 'review',
          assignee,
          notes: notes || null
        })
        .returning();
    }

    // Log analytics event
    await this.logAnalyticsEvent('approval_submit', entityType, entityId, {
      assignee,
      submittedAt: new Date().toISOString(),
      hasNotes: !!notes
    });

    return {
      id: approval.id,
      entityType: approval.entityType,
      entityId: approval.entityId,
      status: approval.status as 'draft' | 'review' | 'approved' | 'rejected',
      assignee: approval.assignee || '',
      notes: approval.notes,
      createdAt: approval.createdAt
    };
  }

  /**
   * Make approval decision
   */
  async decide(decision: ApprovalDecision): Promise<ApprovalStatus> {
    const { approvalId, status, notes } = decision;

    // Update approval status
    const [approval] = await db
      .update(approvals)
      .set({
        status,
        notes: notes || null
      })
      .where(eq(approvals.id, approvalId))
      .returning();

    if (!approval) {
      throw new Error('Approval not found');
    }

    // Log analytics event
    await this.logAnalyticsEvent('approval_decide', approval.entityType, approval.entityId, {
      approvalId,
      decision: status,
      decidedAt: new Date().toISOString(),
      hasNotes: !!notes
    });

    return {
      id: approval.id,
      entityType: approval.entityType,
      entityId: approval.entityId,
      status: approval.status as 'draft' | 'review' | 'approved' | 'rejected',
      assignee: approval.assignee || '',
      notes: approval.notes,
      createdAt: approval.createdAt,
      decidedAt: new Date()
    };
  }

  /**
   * Get approval status for entity
   */
  async getStatus(entityType: string, entityId: number): Promise<ApprovalStatus | null> {
    const [approval] = await db
      .select()
      .from(approvals)
      .where(
        and(
          eq(approvals.entityType, entityType),
          eq(approvals.entityId, entityId)
        )
      );

    if (!approval) return null;

    return {
      id: approval.id,
      entityType: approval.entityType,
      entityId: approval.entityId,
      status: approval.status as 'draft' | 'review' | 'approved' | 'rejected',
      assignee: approval.assignee || '',
      notes: approval.notes,
      createdAt: approval.createdAt
    };
  }

  /**
   * List approvals by status
   */
  async listByStatus(status: 'draft' | 'review' | 'approved' | 'rejected'): Promise<ApprovalStatus[]> {
    const approvalList = await db
      .select()
      .from(approvals)
      .where(eq(approvals.status, status))
      .orderBy(desc(approvals.createdAt));

    return approvalList.map((approval: any) => ({
      id: approval.id,
      entityType: approval.entityType,
      entityId: approval.entityId,
      status: approval.status as 'draft' | 'review' | 'approved' | 'rejected',
      assignee: approval.assignee || '',
      notes: approval.notes,
      createdAt: approval.createdAt
    }));
  }

  /**
   * List approvals assigned to user
   */
  async listByAssignee(assignee: string): Promise<ApprovalStatus[]> {
    const approvalList = await db
      .select()
      .from(approvals)
      .where(eq(approvals.assignee, assignee))
      .orderBy(desc(approvals.createdAt));

    return approvalList.map((approval: any) => ({
      id: approval.id,
      entityType: approval.entityType,
      entityId: approval.entityId,
      status: approval.status as 'draft' | 'review' | 'approved' | 'rejected',
      assignee: approval.assignee || '',
      notes: approval.notes,
      createdAt: approval.createdAt
    }));
  }

  /**
   * Get pending approvals count
   */
  async getPendingCount(assignee?: string): Promise<number> {
    let query = db
      .select({ count: db.$count() })
      .from(approvals)
      .where(eq(approvals.status, 'review'));

    if (assignee) {
      query = query.where(eq(approvals.assignee, assignee));
    }

    const [result] = await query;
    return result.count || 0;
  }

  /**
   * Get approval statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byEntityType: Record<string, number>;
  }> {
    const allApprovals = await db.select().from(approvals);
    
    const stats = {
      total: allApprovals.length,
      pending: allApprovals.filter((a: any) => a.status === 'review').length,
      approved: allApprovals.filter((a: any) => a.status === 'approved').length,
      rejected: allApprovals.filter((a: any) => a.status === 'rejected').length,
      byEntityType: {} as Record<string, number>
    };

    // Count by entity type
    allApprovals.forEach((approval: any) => {
      stats.byEntityType[approval.entityType] = (stats.byEntityType[approval.entityType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Check if entity is approved
   */
  async isApproved(entityType: string, entityId: number): Promise<boolean> {
    const status = await this.getStatus(entityType, entityId);
    return status?.status === 'approved';
  }

  /**
   * Check if entity is pending approval
   */
  async isPending(entityType: string, entityId: number): Promise<boolean> {
    const status = await this.getStatus(entityType, entityId);
    return status?.status === 'review';
  }

  /**
   * Delete approval (reset to draft)
   */
  async reset(entityType: string, entityId: number): Promise<boolean> {
    const result = await db
      .delete(approvals)
      .where(
        and(
          eq(approvals.entityType, entityType),
          eq(approvals.entityId, entityId)
        )
      );

    return result.rowCount > 0;
  }

  /**
   * Get approval workflow for entity
   */
  async getWorkflow(entityType: string, entityId: number): Promise<ApprovalStatus[]> {
    const workflowHistory = await db
      .select()
      .from(approvals)
      .where(
        and(
          eq(approvals.entityType, entityType),
          eq(approvals.entityId, entityId)
        )
      )
      .orderBy(desc(approvals.createdAt));

    return workflowHistory.map((approval: any) => ({
      id: approval.id,
      entityType: approval.entityType,
      entityId: approval.entityId,
      status: approval.status as 'draft' | 'review' | 'approved' | 'rejected',
      assignee: approval.assignee || '',
      notes: approval.notes,
      createdAt: approval.createdAt
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

export const approvalsService = new ApprovalsService();
export default approvalsService;