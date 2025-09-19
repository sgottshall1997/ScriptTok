/**
 * RBAC Service - Role-Based Access Control
 */

import { db } from '../../db';
import { collaborationRoles } from '../../../shared/schema.ts';
import { eq } from 'drizzle-orm';

interface RoleScope {
  read?: boolean;
  write?: boolean;
  approve?: boolean;
  publish?: boolean;
  export?: boolean;
  admin?: boolean;
}

interface UserRole {
  user: string;
  role: 'admin' | 'editor' | 'viewer' | 'client';
  scopes: RoleScope;
}

class RBACService {
  // Default role permissions
  private readonly defaultRoleScopes: Record<string, RoleScope> = {
    admin: {
      read: true,
      write: true,
      approve: true,
      publish: true,
      export: true,
      admin: true
    },
    editor: {
      read: true,
      write: true,
      approve: false,
      publish: false,
      export: true,
      admin: false
    },
    viewer: {
      read: true,
      write: false,
      approve: false,
      publish: false,
      export: false,
      admin: false
    },
    client: {
      read: true,  // Read-only access for client portal
      write: false,
      approve: false,
      publish: false,
      export: false,
      admin: false
    }
  };

  /**
   * Check if user can perform action on entity
   */
  async can(user: string, action: string, entity: string = 'general'): Promise<boolean> {
    try {
      // Get user's role and scopes
      const [userRole] = await db
        .select()
        .from(collaborationRoles)
        .where(eq(collaborationRoles.user, user));

      if (!userRole) {
        // No role assigned, deny access
        return false;
      }

      const scopes = userRole.scopesJson as RoleScope;
      
      // Check specific action permissions
      switch (action.toLowerCase()) {
        case 'read':
        case 'view':
          return scopes.read || false;
        
        case 'write':
        case 'edit':
        case 'create':
        case 'update':
          return scopes.write || false;
        
        case 'approve':
        case 'review':
          return scopes.approve || false;
        
        case 'publish':
        case 'send':
          return scopes.publish || false;
        
        case 'export':
        case 'download':
          return scopes.export || false;
        
        case 'admin':
        case 'manage':
        case 'delete':
          return scopes.admin || false;
        
        default:
          // Unknown action, default to read permission
          return scopes.read || false;
      }
    } catch (error) {
      console.error('RBAC check failed:', error);
      return false;
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(user: string, role: 'admin' | 'editor' | 'viewer' | 'client', customScopes?: RoleScope): Promise<UserRole> {
    const scopes = customScopes || this.defaultRoleScopes[role];
    
    if (!scopes) {
      throw new Error(`Invalid role: ${role}`);
    }

    // Check if user already has a role
    const [existingRole] = await db
      .select()
      .from(collaborationRoles)
      .where(eq(collaborationRoles.user, user));

    if (existingRole) {
      // Update existing role
      await db
        .update(collaborationRoles)
        .set({
          role,
          scopesJson: scopes
        })
        .where(eq(collaborationRoles.user, user));
    } else {
      // Create new role assignment
      await db.insert(collaborationRoles).values({
        user,
        role,
        scopesJson: scopes
      });
    }

    return { user, role, scopes };
  }

  /**
   * Remove role from user
   */
  async removeRole(user: string): Promise<boolean> {
    const result = await db
      .delete(collaborationRoles)
      .where(eq(collaborationRoles.user, user));

    return result.rowCount > 0;
  }

  /**
   * Get user's role and permissions
   */
  async getUserRole(user: string): Promise<UserRole | null> {
    const [userRole] = await db
      .select()
      .from(collaborationRoles)
      .where(eq(collaborationRoles.user, user));

    if (!userRole) return null;

    return {
      user: userRole.user,
      role: userRole.role as 'admin' | 'editor' | 'viewer' | 'client',
      scopes: userRole.scopesJson as RoleScope
    };
  }

  /**
   * List all user roles
   */
  async listRoles(): Promise<UserRole[]> {
    const roles = await db
      .select()
      .from(collaborationRoles);

    return roles.map((role: any) => ({
      user: role.user,
      role: role.role as 'admin' | 'editor' | 'viewer' | 'client',
      scopes: role.scopesJson as RoleScope
    }));
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'admin' | 'editor' | 'viewer' | 'client'): Promise<UserRole[]> {
    const roles = await db
      .select()
      .from(collaborationRoles)
      .where(eq(collaborationRoles.role, role));

    return roles.map((r: any) => ({
      user: r.user,
      role: r.role as 'admin' | 'editor' | 'viewer' | 'client',
      scopes: r.scopesJson as RoleScope
    }));
  }

  /**
   * Check if user has specific role
   */
  async hasRole(user: string, role: 'admin' | 'editor' | 'viewer' | 'client'): Promise<boolean> {
    const userRole = await this.getUserRole(user);
    return userRole?.role === role;
  }

  /**
   * Middleware helper for route protection
   */
  requirePermission(action: string, entity: string = 'general') {
    return async (req: any, res: any, next: any) => {
      try {
        // Get user from request (mock implementation)
        const user = req.headers['x-user-email'] || req.user?.email || 'anonymous';
        
        if (user === 'anonymous') {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const hasPermission = await this.can(user, action, entity);
        
        if (!hasPermission) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            required: action,
            entity 
          });
        }

        // Add RBAC context to request
        req.rbac = {
          user,
          can: (actionCheck: string, entityCheck: string = 'general') => 
            this.can(user, actionCheck, entityCheck)
        };

        next();
      } catch (error) {
        console.error('RBAC middleware error:', error);
        res.status(500).json({ error: 'Authorization check failed' });
      }
    };
  }

  /**
   * Get default role scopes
   */
  getDefaultScopes(role: string): RoleScope {
    return this.defaultRoleScopes[role] || this.defaultRoleScopes.viewer;
  }

  /**
   * Validate scopes object
   */
  validateScopes(scopes: any): boolean {
    if (typeof scopes !== 'object' || scopes === null) return false;
    
    const validKeys = ['read', 'write', 'approve', 'publish', 'export', 'admin'];
    const scopeKeys = Object.keys(scopes);
    
    return scopeKeys.every(key => 
      validKeys.includes(key) && typeof scopes[key] === 'boolean'
    );
  }
}

export const rbacService = new RBACService();
export default rbacService;