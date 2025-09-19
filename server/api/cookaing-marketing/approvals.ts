/**
 * Approvals API Routes - Phase 5
 * Approval Workflows and Lifecycle Management
 */

import { Router } from 'express';
import { z } from 'zod';
import { approvalsService } from '../../cookaing-marketing/services/approvals.service';
import { rbacService } from '../../cookaing-marketing/services/rbac.service';

const router = Router();

// Request schemas
const submitApprovalSchema = z.object({
  entityType: z.enum(['campaign', 'artifact', 'version']),
  entityId: z.number(),
  assignee: z.string().min(1, 'Assignee is required'),
  notes: z.string().optional()
});

const approvalDecisionSchema = z.object({
  approvalId: z.number(),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional()
});

const getStatusSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.number()
});

// APPROVAL ROUTES

/**
 * POST /api/cookaing-marketing/approvals/submit
 * Submit entity for approval
 */
router.post('/submit', rbacService.requirePermission('write'), async (req, res) => {
  try {
    const { entityType, entityId, assignee, notes } = submitApprovalSchema.parse(req.body);

    const approval = await approvalsService.submitForReview({
      entityType,
      entityId,
      assignee,
      notes
    });

    res.json({
      success: true,
      data: approval,
      message: `${entityType} ${entityId} submitted for approval`
    });
  } catch (error: any) {
    console.error('Submit approval error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to submit for approval'
    });
  }
});

/**
 * POST /api/cookaing-marketing/approvals/decision
 * Make approval decision
 */
router.post('/decision', rbacService.requirePermission('approve'), async (req, res) => {
  try {
    const { approvalId, status, notes } = approvalDecisionSchema.parse(req.body);

    const approval = await approvalsService.decide({
      approvalId,
      status,
      notes
    });

    res.json({
      success: true,
      data: approval,
      message: `Approval ${status} successfully`
    });
  } catch (error: any) {
    console.error('Approval decision error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to make approval decision'
    });
  }
});

/**
 * GET /api/cookaing-marketing/approvals/status
 * Get approval status for entity
 */
router.get('/status', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const entityType = req.query.entityType as string;
    const entityId = parseInt(req.query.entityId as string);

    if (!entityType || isNaN(entityId)) {
      return res.status(400).json({
        success: false,
        error: 'entityType and entityId are required'
      });
    }

    const status = await approvalsService.getStatus(entityType, entityId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Approval status not found'
      });
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('Get approval status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get approval status'
    });
  }
});

/**
 * GET /api/cookaing-marketing/approvals/list/:status
 * List approvals by status
 */
router.get('/list/:status', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const status = req.params.status as 'draft' | 'review' | 'approved' | 'rejected';
    
    if (!['draft', 'review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be draft, review, approved, or rejected'
      });
    }

    const approvals = await approvalsService.listByStatus(status);

    res.json({
      success: true,
      data: approvals,
      count: approvals.length,
      status
    });
  } catch (error: any) {
    console.error('List approvals by status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approvals'
    });
  }
});

/**
 * GET /api/cookaing-marketing/approvals/assigned/:assignee
 * List approvals assigned to user
 */
router.get('/assigned/:assignee', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const assignee = req.params.assignee;
    const approvals = await approvalsService.listByAssignee(assignee);

    res.json({
      success: true,
      data: approvals,
      count: approvals.length,
      assignee
    });
  } catch (error: any) {
    console.error('List assigned approvals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned approvals'
    });
  }
});

/**
 * GET /api/cookaing-marketing/approvals/pending-count
 * Get count of pending approvals
 */
router.get('/pending-count', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const assignee = req.query.assignee as string;
    const count = await approvalsService.getPendingCount(assignee);

    res.json({
      success: true,
      data: {
        pendingCount: count,
        assignee: assignee || 'all'
      }
    });
  } catch (error: any) {
    console.error('Get pending count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending approvals count'
    });
  }
});

/**
 * GET /api/cookaing-marketing/approvals/stats
 * Get approval statistics
 */
router.get('/stats', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const stats = await approvalsService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get approval stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get approval statistics'
    });
  }
});

/**
 * GET /api/cookaing-marketing/approvals/workflow
 * Get approval workflow history for entity
 */
router.get('/workflow', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const entityType = req.query.entityType as string;
    const entityId = parseInt(req.query.entityId as string);

    if (!entityType || isNaN(entityId)) {
      return res.status(400).json({
        success: false,
        error: 'entityType and entityId are required'
      });
    }

    const workflow = await approvalsService.getWorkflow(entityType, entityId);

    res.json({
      success: true,
      data: workflow,
      count: workflow.length
    });
  } catch (error: any) {
    console.error('Get approval workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get approval workflow'
    });
  }
});

/**
 * DELETE /api/cookaing-marketing/approvals/reset
 * Reset approval (back to draft)
 */
router.delete('/reset', rbacService.requirePermission('admin'), async (req, res) => {
  try {
    const { entityType, entityId } = getStatusSchema.parse(req.body);

    const success = await approvalsService.reset(entityType, entityId);

    if (success) {
      res.json({
        success: true,
        message: 'Approval reset to draft successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Approval not found'
      });
    }
  } catch (error: any) {
    console.error('Reset approval error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to reset approval'
    });
  }
});

export default router;