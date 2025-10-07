import { Request, Response, NextFunction } from 'express';
import { getQuotaService } from '../services/quotaService';
import { identityService } from '../services/identityService';
import { storage } from '../storage';

const quotaService = getQuotaService(storage);
const bypassLimits = process.env.BYPASS_LIMITS === '1';
const authProvider = process.env.AUTH_PROVIDER || 'replit';

console.log(`[CheckQuota] Initializing quota middleware`);
console.log(`[CheckQuota] Bypass limits mode: ${bypassLimits ? 'ENABLED (dev)' : 'DISABLED (production)'}`);
console.log(`[CheckQuota] BYPASS_LIMITS = ${process.env.BYPASS_LIMITS || '(not set)'}`);
console.log(`[CheckQuota] Auth provider: ${authProvider}`);

export const checkQuota = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Development mode bypass
    if (bypassLimits) {
      console.log(`[CheckQuota] 🔧 Bypass mode enabled - skipping quota check for ${req.method} ${req.path}`);
      next();
      return;
    }

    // Production mode - enforce quotas
    console.log(`[CheckQuota] Checking quota for ${req.method} ${req.path}`);

    // Check authentication
    if (!req.user) {
      console.error(`[CheckQuota] ❌ No user in request - authentication required`);
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const providerUserId = req.user.userId;
    console.log(`[CheckQuota] Provider user ID: ${providerUserId}`);

    // Get internal user ID from identity service
    const user = await identityService.getUserByIdentity(authProvider, providerUserId);
    
    if (!user) {
      console.error(`[CheckQuota] ❌ User not found for provider ${authProvider}, ID: ${providerUserId}`);
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const internalUserId = user.id;
    console.log(`[CheckQuota] Internal user ID: ${internalUserId}`);

    // Check quota
    const quotaCheck = await quotaService.checkQuota(internalUserId);
    console.log(`[CheckQuota] Quota check result:`, {
      userId: internalUserId,
      allowed: quotaCheck.allowed,
      used: quotaCheck.used,
      limit: quotaCheck.limit,
      remaining: quotaCheck.remaining
    });

    if (!quotaCheck.allowed) {
      // Quota exceeded
      const tier = await quotaService.getUserTier(internalUserId);
      const message = `You've used ${quotaCheck.used} of ${quotaCheck.limit} generations this month. Upgrade to Pro for 500/month.`;
      
      console.warn(`[CheckQuota] ⚠️ Quota exceeded for user ${internalUserId}:`, {
        used: quotaCheck.used,
        limit: quotaCheck.limit,
        tier
      });

      res.status(429).json({
        error: 'Quota exceeded',
        message,
        used: quotaCheck.used,
        limit: quotaCheck.limit,
        tier,
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }

    // Quota available - increment usage
    await quotaService.incrementUsage(internalUserId);
    console.log(`[CheckQuota] ✅ Quota check passed for user ${internalUserId} - usage incremented`);
    
    next();
  } catch (error) {
    // Error handling - allow request but log error
    console.error(`[CheckQuota] 💥 Error during quota check:`, error);
    console.error(`[CheckQuota] Allowing request to proceed despite error`);
    next();
  }
};

export default checkQuota;
