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

      // Find or create user - automatically creates new users on first login
      const provider = isProduction ? 'replit' : 'dev';
      const email = authResult.email || `${authResult.userId}@${provider}.local`;

      const internalUserId = await identityService.findOrCreateUser(
        provider,
        authResult.userId,
        email,
        authResult.name,
        authResult.profileImage
      );

      req.internalUserId = internalUserId;
      console.log(`[AuthGuard] ✅ Internal user ID attached: ${internalUserId}`);

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

    const allowedTiers = ['starter', 'creator', 'pro', 'agency'] as const;
    const requestedTier = process.env.DEV_USER_TIER || 'pro';
    const tier = allowedTiers.includes(requestedTier as any) ? requestedTier as typeof allowedTiers[number] : 'pro';
    if (requestedTier !== tier) {
      console.warn(`[AuthGuard] ⚠️ Invalid DEV_USER_TIER value "${requestedTier}" - falling back to "pro"`);
    }

    req.user = {
      userId: devUserId,
      email: process.env.DEV_USER_EMAIL || 'dev@pheme.local',
      name: process.env.DEV_USER_NAME || 'Dev User',
      tierHint: tier
    };

    console.log(`[AuthGuard] 🔧 Dev user auto-injected:`, {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      tierHint: req.user.tierHint
    });

    // Find or create dev user
    const internalUserId = await identityService.findOrCreateUser(
      'dev',
      devUserId,
      req.user.email || 'dev@pheme.local',
      req.user.name || 'Dev User'
    );
    req.internalUserId = internalUserId;
    console.log(`[AuthGuard] ✅ Dev internal user ID attached: ${internalUserId}`);

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

    const allowedTiers = ['starter', 'creator', 'pro', 'agency'] as const;
    const requestedTier = process.env.DEV_USER_TIER || 'pro';
    const tier = allowedTiers.includes(requestedTier as any) ? requestedTier as typeof allowedTiers[number] : 'pro';
    if (requestedTier !== tier) {
      console.warn(`[AuthGuard] ⚠️ Invalid DEV_USER_TIER value "${requestedTier}" - falling back to "pro"`);
    }

    req.user = {
      userId: devUserId,
      email: process.env.DEV_USER_EMAIL || 'dev@pheme.local',
      name: process.env.DEV_USER_NAME || 'Dev User',
      tierHint: tier
    };

    console.log(`[AuthGuard] 🔧 Dev user auto-injected after error:`, {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      tierHint: req.user.tierHint
    });

    // Try to find or create internal user ID for dev user (best effort)
    try {
      const internalUserId = await identityService.findOrCreateUser(
        'dev',
        devUserId,
        req.user.email || 'dev@pheme.local',
        req.user.name || 'Dev User'
      );
      req.internalUserId = internalUserId;
      console.log(`[AuthGuard] ✅ Dev internal user ID attached after error: ${internalUserId}`);
    } catch (e) {
      console.warn(`[AuthGuard] ⚠️ Could not create/find dev internal user ID:`, e);
    }

    next();
  }
};

export default authGuard;