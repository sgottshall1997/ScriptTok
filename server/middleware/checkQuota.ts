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

// Helper function to get internal user ID
async function getInternalUserId(req: Request): Promise<number | null> {
  let internalUserId = (req as any).internalUserId;
  
  if (!internalUserId) {
    // Fallback: try to look up from req.user if authGuard didn't set it
    if (!req.user) {
      console.error(`[CheckQuota] ❌ No user or internalUserId in request - authentication required`);
      return null;
    }

    const providerUserId = req.user.userId;
    console.log(`[CheckQuota] No internalUserId found, looking up from provider user ID: ${providerUserId}`);

    const user = await identityService.getUserByIdentity(authProvider, providerUserId);
    
    if (!user) {
      console.error(`[CheckQuota] ❌ User not found for provider ${authProvider}, ID: ${providerUserId}`);
      return null;
    }

    (req as any).internalUserId = user.id;
    console.log(`[CheckQuota] Internal user ID looked up: ${user.id}`);
    internalUserId = user.id;
  } else {
    console.log(`[CheckQuota] Using internal user ID from authGuard: ${internalUserId}`);
  }

  return internalUserId;
}

// Helper function to detect trend analysis requests
function isTrendAnalysisRequest(req: Request): boolean {
  return req.path.includes('/api/trending') || req.path.includes('/api/trend-history');
}

// Helper function to get AI model type
function getModelType(req: Request): 'gpt' | 'claude' | null {
  const aiModel = req.body?.aiModel;
  if (aiModel === 'gpt' || aiModel === 'chatgpt') {
    return 'gpt';
  }
  if (aiModel === 'claude') {
    return 'claude';
  }
  return null;
}

// Helper function to get bulk count
function getBulkCount(req: Request): number {
  return req.body?.bulkCount || 1;
}

// Main quota check middleware (backward compatible)
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

    // Get internal user ID
    const internalUserId = await getInternalUserId(req);
    
    if (!internalUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Detect request type and check appropriate quota
    const isTrendRequest = isTrendAnalysisRequest(req);
    const modelType = getModelType(req);
    const bulkCount = getBulkCount(req);
    const tier = await quotaService.getUserTier(internalUserId);

    // Check bulk generation permission
    if (bulkCount > 1 && !quotaService.canBulkGenerate(tier)) {
      console.warn(`[CheckQuota] ⚠️ Bulk generation denied for user ${internalUserId} (tier: ${tier})`);
      res.status(429).json({
        error: 'Permission denied',
        message: 'Bulk generation is a Pro feature. Upgrade to generate 10-20 scripts at once.',
        used: 0,
        limit: 0,
        tier,
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }

    // Check quota based on request type
    let quotaCheck;
    let usageType: 'gpt' | 'claude' | 'trend' = 'gpt';

    if (isTrendRequest) {
      quotaCheck = await quotaService.checkTrendAnalysisQuota(internalUserId);
      usageType = 'trend';
    } else if (modelType) {
      quotaCheck = await quotaService.checkModelQuota(internalUserId, modelType);
      usageType = modelType;
    } else {
      // Default to GPT for backward compatibility
      quotaCheck = await quotaService.checkModelQuota(internalUserId, 'gpt');
      usageType = 'gpt';
    }

    console.log(`[CheckQuota] Quota check result for ${usageType}:`, {
      userId: internalUserId,
      allowed: quotaCheck.allowed,
      used: quotaCheck.used,
      limit: quotaCheck.limit,
      remaining: quotaCheck.remaining
    });

    if (!quotaCheck.allowed) {
      // Quota exceeded - return tier-specific message
      let message: string;
      
      if (usageType === 'gpt') {
        message = `You've used ${quotaCheck.used} of ${quotaCheck.limit} GPT generations. Try Claude or upgrade to Pro.`;
      } else if (usageType === 'claude') {
        message = `You've used ${quotaCheck.used} of ${quotaCheck.limit} Claude generations. Upgrade to Pro for 150/month.`;
      } else {
        message = `You've used ${quotaCheck.used} of ${quotaCheck.limit} trend analyses. Upgrade to Pro for 250/month.`;
      }
      
      console.warn(`[CheckQuota] ⚠️ Quota exceeded for user ${internalUserId}:`, {
        type: usageType,
        used: quotaCheck.used,
        limit: quotaCheck.limit,
        tier: quotaCheck.tier
      });

      res.status(429).json({
        error: 'Quota exceeded',
        message,
        used: quotaCheck.used,
        limit: quotaCheck.limit,
        tier: quotaCheck.tier,
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }

    // Quota available - increment appropriate usage counter
    if (usageType === 'gpt') {
      await quotaService.incrementGptUsage(internalUserId, bulkCount);
    } else if (usageType === 'claude') {
      await quotaService.incrementClaudeUsage(internalUserId, bulkCount);
    } else {
      await quotaService.incrementTrendAnalysisUsage(internalUserId, bulkCount);
    }
    
    console.log(`[CheckQuota] ✅ Quota check passed for user ${internalUserId} - ${usageType} usage incremented by ${bulkCount}`);
    
    next();
  } catch (error) {
    // Error handling - allow request but log error
    console.error(`[CheckQuota] 💥 Error during quota check:`, error);
    console.error(`[CheckQuota] Allowing request to proceed despite error`);
    next();
  }
};

// Specialized middleware for content generation with model detection
export const checkContentQuota = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Development mode bypass
    if (bypassLimits) {
      console.log(`[CheckContentQuota] 🔧 Bypass mode enabled - skipping quota check`);
      next();
      return;
    }

    console.log(`[CheckContentQuota] Checking content generation quota`);

    // Get internal user ID
    const internalUserId = await getInternalUserId(req);
    
    if (!internalUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Detect model type
    const modelType = getModelType(req) || 'gpt'; // Default to GPT
    const bulkCount = getBulkCount(req);
    const tier = await quotaService.getUserTier(internalUserId);

    // Check bulk generation permission
    if (bulkCount > 1 && !quotaService.canBulkGenerate(tier)) {
      console.warn(`[CheckContentQuota] ⚠️ Bulk generation denied for user ${internalUserId}`);
      res.status(429).json({
        error: 'Permission denied',
        message: 'Bulk generation is a Pro feature. Upgrade to generate 10-20 scripts at once.',
        used: 0,
        limit: 0,
        tier,
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }

    // Check model-specific quota
    const quotaCheck = await quotaService.checkModelQuota(internalUserId, modelType);

    if (!quotaCheck.allowed) {
      const message = modelType === 'gpt'
        ? `You've used ${quotaCheck.used} of ${quotaCheck.limit} GPT generations. Try Claude or upgrade to Pro.`
        : `You've used ${quotaCheck.used} of ${quotaCheck.limit} Claude generations. Upgrade to Pro for 150/month.`;

      res.status(429).json({
        error: 'Quota exceeded',
        message,
        used: quotaCheck.used,
        limit: quotaCheck.limit,
        tier: quotaCheck.tier,
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }

    // Increment usage
    if (modelType === 'gpt') {
      await quotaService.incrementGptUsage(internalUserId, bulkCount);
    } else {
      await quotaService.incrementClaudeUsage(internalUserId, bulkCount);
    }

    console.log(`[CheckContentQuota] ✅ Content quota check passed - ${modelType} usage incremented`);
    next();
  } catch (error) {
    console.error(`[CheckContentQuota] 💥 Error:`, error);
    next();
  }
};

// Specialized middleware for trend analysis requests
export const checkTrendQuota = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Development mode bypass
    if (bypassLimits) {
      console.log(`[CheckTrendQuota] 🔧 Bypass mode enabled - skipping quota check`);
      next();
      return;
    }

    console.log(`[CheckTrendQuota] Checking trend analysis quota`);

    // Get internal user ID
    const internalUserId = await getInternalUserId(req);
    
    if (!internalUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check trend analysis quota
    const quotaCheck = await quotaService.checkTrendAnalysisQuota(internalUserId);

    if (!quotaCheck.allowed) {
      const message = `You've used ${quotaCheck.used} of ${quotaCheck.limit} trend analyses. Upgrade to Pro for 250/month.`;

      res.status(429).json({
        error: 'Quota exceeded',
        message,
        used: quotaCheck.used,
        limit: quotaCheck.limit,
        tier: quotaCheck.tier,
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }

    // Increment usage
    await quotaService.incrementTrendAnalysisUsage(internalUserId);

    console.log(`[CheckTrendQuota] ✅ Trend quota check passed - usage incremented`);
    next();
  } catch (error) {
    console.error(`[CheckTrendQuota] 💥 Error:`, error);
    next();
  }
};

// Specialized middleware for bulk generation validation
export const checkBulkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Development mode bypass
    if (bypassLimits) {
      console.log(`[CheckBulkPermission] 🔧 Bypass mode enabled - skipping permission check`);
      next();
      return;
    }

    console.log(`[CheckBulkPermission] Checking bulk generation permission`);

    // Get internal user ID
    const internalUserId = await getInternalUserId(req);
    
    if (!internalUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const bulkCount = getBulkCount(req);
    const tier = await quotaService.getUserTier(internalUserId);

    // Check if bulk generation is requested
    if (bulkCount > 1 && !quotaService.canBulkGenerate(tier)) {
      console.warn(`[CheckBulkPermission] ⚠️ Bulk generation denied for user ${internalUserId} (tier: ${tier})`);
      res.status(429).json({
        error: 'Permission denied',
        message: 'Bulk generation is a Pro feature. Upgrade to generate 10-20 scripts at once.',
        used: 0,
        limit: 0,
        tier,
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }

    console.log(`[CheckBulkPermission] ✅ Bulk permission check passed`);
    next();
  } catch (error) {
    console.error(`[CheckBulkPermission] 💥 Error:`, error);
    next();
  }
};

export default checkQuota;
