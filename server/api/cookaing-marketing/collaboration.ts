/**
 * Collaboration API Routes - Phase 5
 * RBAC, Role Management, and User Collaboration
 */

import { Router } from 'express';
import { z } from 'zod';
import { rbacService } from '../../cookaing-marketing/services/rbac.service';

const router = Router();

// Request schemas
const assignRoleSchema = z.object({
  user: z.string().min(1, 'User identifier is required'),
  role: z.enum(['admin', 'editor', 'viewer', 'client']),
  customScopes: z.object({
    read: z.boolean().optional(),
    write: z.boolean().optional(),
    approve: z.boolean().optional(),
    publish: z.boolean().optional(),
    export: z.boolean().optional(),
    admin: z.boolean().optional()
  }).optional()
});

const removeRoleSchema = z.object({
  user: z.string().min(1, 'User identifier is required')
});

const checkPermissionSchema = z.object({
  user: z.string().min(1, 'User identifier is required'),
  action: z.string().min(1, 'Action is required'),
  entity: z.string().optional().default('general')
});

// COLLABORATION & ROLES ROUTES

/**
 * GET /api/cookaing-marketing/collab/roles
 * List all user roles
 */
router.get('/roles', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const roles = await rbacService.listRoles();

    res.json({
      success: true,
      data: roles,
      count: roles.length
    });
  } catch (error: any) {
    console.error('List roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user roles'
    });
  }
});

/**
 * POST /api/cookaing-marketing/collab/roles
 * Assign role to user
 */
router.post('/roles', rbacService.requirePermission('admin'), async (req, res) => {
  try {
    const { user, role, customScopes } = assignRoleSchema.parse(req.body);

    const result = await rbacService.assignRole(user, role, customScopes);

    res.json({
      success: true,
      data: result,
      message: `Role ${role} assigned to ${user} successfully`
    });
  } catch (error: any) {
    console.error('Assign role error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to assign role'
    });
  }
});

/**
 * DELETE /api/cookaing-marketing/collab/roles
 * Remove role from user
 */
router.delete('/roles', rbacService.requirePermission('admin'), async (req, res) => {
  try {
    const { user } = removeRoleSchema.parse(req.body);

    const success = await rbacService.removeRole(user);

    if (success) {
      res.json({
        success: true,
        message: `Role removed from ${user} successfully`
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User role not found'
      });
    }
  } catch (error: any) {
    console.error('Remove role error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to remove role'
    });
  }
});

/**
 * GET /api/cookaing-marketing/collab/roles/:user
 * Get user's role and permissions
 */
router.get('/roles/:user', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const user = req.params.user;
    const userRole = await rbacService.getUserRole(user);

    if (!userRole) {
      return res.status(404).json({
        success: false,
        error: 'User role not found'
      });
    }

    res.json({
      success: true,
      data: userRole
    });
  } catch (error: any) {
    console.error('Get user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user role'
    });
  }
});

/**
 * POST /api/cookaing-marketing/collab/check-permission
 * Check if user has permission for action
 */
router.post('/check-permission', async (req, res) => {
  try {
    const { user, action, entity } = checkPermissionSchema.parse(req.body);

    const hasPermission = await rbacService.can(user, action, entity);

    res.json({
      success: true,
      data: {
        user,
        action,
        entity,
        hasPermission
      }
    });
  } catch (error: any) {
    console.error('Check permission error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to check permission'
    });
  }
});

/**
 * GET /api/cookaing-marketing/collab/roles/by-role/:role
 * Get users by specific role
 */
router.get('/roles/by-role/:role', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const role = req.params.role as 'admin' | 'editor' | 'viewer' | 'client';
    
    if (!['admin', 'editor', 'viewer', 'client'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified'
      });
    }

    const users = await rbacService.getUsersByRole(role);

    res.json({
      success: true,
      data: users,
      count: users.length,
      role
    });
  } catch (error: any) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users by role'
    });
  }
});

/**
 * GET /api/cookaing-marketing/collab/default-scopes/:role
 * Get default scopes for a role
 */
router.get('/default-scopes/:role', async (req, res) => {
  try {
    const role = req.params.role;
    const scopes = rbacService.getDefaultScopes(role);

    res.json({
      success: true,
      data: {
        role,
        scopes
      }
    });
  } catch (error: any) {
    console.error('Get default scopes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get default scopes'
    });
  }
});

export default router;