import { Request, Response, NextFunction } from 'express';
import { verifyAuth, AuthResult } from '../auth/adapters';

declare global {
  namespace Express {
    interface Request {
      user?: AuthResult;
    }
  }
}

const isProduction = process.env.APP_ENV === 'production';

console.log(`[AuthGuard] Initializing auth guard middleware`);
console.log(`[AuthGuard] Environment mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`[AuthGuard] APP_ENV = ${process.env.APP_ENV || '(not set, defaulting to dev)'}`);

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
    
    req.user = {
      userId: process.env.DEV_USER_ID || '00000000-0000-0000-0000-000000000001',
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
    
    next();
  } catch (error) {
    console.error(`[AuthGuard] 💥 Unexpected error during authentication:`, error);
    
    if (isProduction) {
      console.error(`[AuthGuard] Production mode - returning 401 due to error`);
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    console.warn(`[AuthGuard] Development mode - injecting dev user despite error`);
    
    req.user = {
      userId: process.env.DEV_USER_ID || '00000000-0000-0000-0000-000000000001',
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
    
    next();
  }
};

export default authGuard;
