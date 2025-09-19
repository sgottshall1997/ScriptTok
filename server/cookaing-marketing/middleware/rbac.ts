/**
 * RBAC Middleware - Phase 5
 * Role-Based Access Control for Route Protection
 */

import { Request, Response, NextFunction } from 'express';
import { rbacService } from '../services/rbac.service';

// Extend Request interface to include RBAC context
declare global {
  namespace Express {
    interface Request {
      rbac?: {
        user: string;
        can: (action: string, entity?: string) => Promise<boolean>;
      };
      portalContext?: {
        user: string;
        orgId: number;
      };
    }
  }
}

/**
 * Extract user identity from request
 */
function extractUser(req: Request): string {
  // Priority order: JWT token, session, header, mock
  
  // 1. Check JWT token (if implemented)
  if (req.user?.email) {
    return req.user.email;
  }
  
  // 2. Check session (if implemented)
  if (req.session?.user?.email) {
    return req.session.user.email;
  }
  
  // 3. Check custom header (for testing/development)
  const headerUser = req.headers['x-user-email'] as string;
  if (headerUser) {
    return headerUser;
  }
  
  // 4. Check authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In a real implementation, you'd decode the JWT token
    // For now, we'll use a mock user
    return 'bearer-user@example.com';
  }
  
  // 5. Fallback to anonymous
  return 'anonymous';
}

/**
 * Authentication middleware - ensures user is identified
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = extractUser(req);
    
    if (user === 'anonymous') {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide valid authentication credentials'
      });
    }
    
    // Add user to request context
    req.user = { email: user };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication check failed'
    });
  }
};

/**
 * Authorization middleware factory - checks specific permissions
 */
export const authorize = (requiredAction: string, entity: string = 'general') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = extractUser(req);
      
      if (user === 'anonymous') {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }
      
      // Check permission
      const hasPermission = await rbacService.can(user, requiredAction, entity);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: `Insufficient permissions. Required: ${requiredAction} on ${entity}`,
          required: {
            action: requiredAction,
            entity
          }
        });
      }
      
      // Add RBAC context to request
      req.rbac = {
        user,
        can: async (action: string, entityCheck: string = 'general') => {
          return await rbacService.can(user, action, entityCheck);
        }
      };
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        error: 'Authorization check failed'
      });
    }
  };
};

/**
 * Role-based middleware - requires specific role
 */
export const requireRole = (requiredRole: 'admin' | 'editor' | 'viewer' | 'client') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = extractUser(req);
      
      if (user === 'anonymous') {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const hasRole = await rbacService.hasRole(user, requiredRole);
      
      if (!hasRole) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: `This resource requires ${requiredRole} role`,
          required: { role: requiredRole }
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Role verification failed'
      });
    }
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Editor or higher middleware
 */
export const requireEditor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = extractUser(req);
    
    if (user === 'anonymous') {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const isAdmin = await rbacService.hasRole(user, 'admin');
    const isEditor = await rbacService.hasRole(user, 'editor');
    
    if (!isAdmin && !isEditor) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'This resource requires editor or admin role'
      });
    }
    
    next();
  } catch (error) {
    console.error('Editor check error:', error);
    res.status(500).json({
      success: false,
      error: 'Role verification failed'
    });
  }
};

/**
 * Client portal access middleware
 */
export const requireClientAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = extractUser(req);
    const orgId = req.query.orgId || req.body.orgId || 1;
    
    if (user === 'anonymous') {
      return res.status(401).json({
        success: false,
        error: 'Authentication required for portal access'
      });
    }
    
    // Check if user has client role or higher permissions
    const hasPortalAccess = await rbacService.can(user, 'read', 'portal');
    const isClient = await rbacService.hasRole(user, 'client');
    
    if (!hasPortalAccess && !isClient) {
      return res.status(403).json({
        success: false,
        error: 'Client portal access denied',
        message: 'Please contact your account manager for portal access'
      });
    }
    
    // Add portal context
    req.portalContext = {
      user,
      orgId: parseInt(orgId as string) || 1
    };
    
    next();
  } catch (error) {
    console.error('Portal access check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Portal access verification failed'
    });
  }
};

/**
 * Development/demo mode middleware - creates basic roles if none exist
 */
export const ensureDemoRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = extractUser(req);
    
    if (user !== 'anonymous') {
      // Check if user has any role
      const userRole = await rbacService.getUserRole(user);
      
      if (!userRole) {
        // Assign default role based on email pattern
        let defaultRole: 'admin' | 'editor' | 'viewer' | 'client' = 'viewer';
        
        if (user.includes('admin')) {
          defaultRole = 'admin';
        } else if (user.includes('editor')) {
          defaultRole = 'editor';
        } else if (user.includes('client')) {
          defaultRole = 'client';
        }
        
        console.log(`[RBAC] Auto-assigning ${defaultRole} role to ${user} for demo purposes`);
        
        try {
          await rbacService.assignRole(user, defaultRole);
        } catch (error) {
          console.warn('Failed to auto-assign role:', error);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Demo role assignment error:', error);
    next(); // Continue even if role assignment fails
  }
};

/**
 * Optional authentication middleware - adds user context but doesn't require it
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = extractUser(req);
    
    if (user !== 'anonymous') {
      req.rbac = {
        user,
        can: async (action: string, entity: string = 'general') => {
          return await rbacService.can(user, action, entity);
        }
      };
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if auth check fails
  }
};

// Export the service for use in routes
export { rbacService };