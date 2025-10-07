import { Request, Response, NextFunction } from 'express';
import { verifyAuth, AuthResult } from '../auth/adapters';
import { identityService } from '../services/identityService';

declare global {
  namespace Express {
    interface Request {
      user?: AuthResult;
      internalUserId?: number;
    }
  }
}

const isProduction = process.env.APP_ENV === 'production';
const authProvider = process.env.AUTH_PROVIDER || 'replit';

console.log(`[AuthGuard] Initializing auth guard middleware`);
console.log(`[AuthGuard] Environment mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`[AuthGuard] APP_ENV = ${process.env.APP_ENV || '(not set, defaulting to dev)'}`);
console.log(`[AuthGuard] Auth provider: ${authProvider}`);

export const authGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log(`[AuthGuard] Processing authentication for ${req.method} ${req.path}`);
    
    const authResult = await verifyAuth(req);
    
    if (authResult) {
      req.user = authResult;
      console.log(`[AuthGuard] ✅ Authentication successful:`, {
        userId: authResult.userId,
        email: authResult.email || '(not provided)',
        name: authResult.name || '(not provided)',
        tierHint: authResult.tierHint || '(not set)'
      });
      
      // Look up internal user ID and attach to request
      const provider = isProduction ? 'replit' : 'dev';
      const internalUser = await identityService.getUserByIdentity(provider, authResult.userId);
      
      if (internalUser) {
        req.internalUserId = internalUser.id;
        console.log(`[AuthGuard] ✅ Internal user ID attached: ${internalUser.id}`);
      } else {
        console.warn(`[AuthGuard] ⚠️ No internal user found for provider ${provider}, userId ${authResult.userId}`);
      }
      
      next();
      return;
    }
    
    if (isProduction) {
      console.error(`[AuthGuard] ❌ Authentication failed in production - no valid auth result`);
      console.error(`[AuthGuard] Blocking request: returning 401 Unauthorized`);
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    console.warn(`[AuthGuard] ⚠️ Authentication failed in development mode - injecting dev user`);
    
    const devUserId = process.env.DEV_USER_ID || '00000000-0000-0000-0000-000000000001';
    
    req.user = {
      userId: devUserId,
      email: process.env.DEV_USER_EMAIL || 'dev@scripttok.local',
      name: process.env.DEV_USER_NAME || 'Dev User',
      tierHint: 'pro'
    };
    
    console.log(`[AuthGuard] 🔧 Dev user auto-injected:`, {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      tierHint: req.user.tierHint
    });
    
    // Look up internal user ID for dev user
    const internalUser = await identityService.getUserByIdentity('dev', devUserId);
    if (internalUser) {
      req.internalUserId = internalUser.id;
      console.log(`[AuthGuard] ✅ Dev internal user ID attached: ${internalUser.id}`);
    } else {
      console.warn(`[AuthGuard] ⚠️ No internal user found for dev user ${devUserId}`);
    }
    
    next();
  } catch (error) {
    console.error(`[AuthGuard] 💥 Unexpected error during authentication:`, error);
    
    if (isProduction) {
      console.error(`[AuthGuard] Production mode - returning 401 due to error`);
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    console.warn(`[AuthGuard] Development mode - injecting dev user despite error`);
    
    const devUserId = process.env.DEV_USER_ID || '00000000-0000-0000-0000-000000000001';
    
    req.user = {
      userId: devUserId,
      email: process.env.DEV_USER_EMAIL || 'dev@scripttok.local',
      name: process.env.DEV_USER_NAME || 'Dev User',
      tierHint: 'pro'
    };
    
    console.log(`[AuthGuard] 🔧 Dev user auto-injected after error:`, {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      tierHint: req.user.tierHint
    });
    
    // Try to look up internal user ID for dev user (best effort)
    try {
      const internalUser = await identityService.getUserByIdentity('dev', devUserId);
      if (internalUser) {
        req.internalUserId = internalUser.id;
        console.log(`[AuthGuard] ✅ Dev internal user ID attached after error: ${internalUser.id}`);
      }
    } catch (e) {
      console.warn(`[AuthGuard] ⚠️ Could not look up dev internal user ID:`, e);
    }
    
    next();
  }
};

export default authGuard;
