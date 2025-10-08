import { Request, Response, NextFunction } from 'express';
import { getQuotaService } from '../services/quotaService';
import { storage } from '../storage';

const quotaService = getQuotaService(storage);
const bypassLimits = process.env.BYPASS_LIMITS === '1';

console.log(`[FeatureGate] Initializing feature gate middleware`);
console.log(`[FeatureGate] Bypass limits mode: ${bypassLimits ? 'ENABLED (dev)' : 'DISABLED (production)'}`);

type Feature = 'affiliate' | 'bulk' | 'export' | 'api' | 'brandTemplates' | 'forecasting';

async function getInternalUserId(req: Request): Promise<number | null> {
  const internalUserId = (req as any).internalUserId;
  
  if (!internalUserId) {
    console.error(`[FeatureGate] ❌ No internalUserId in request - authentication required`);
    return null;
  }
  
  return internalUserId;
}

export function checkFeatureAccess(feature: Feature) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (bypassLimits) {
        console.log(`[FeatureGate] 🔧 Bypass mode enabled - skipping ${feature} check`);
        next();
        return;
      }

      const userId = await getInternalUserId(req);
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tier = await quotaService.getUserTier(userId);
      console.log(`[FeatureGate] Checking ${feature} access for user ${userId} (tier: ${tier})`);

      let hasAccess = false;
      let errorMessage = '';
      let suggestedTier = '';

      switch (feature) {
        case 'affiliate':
          hasAccess = quotaService.canAccessAffiliate(tier);
          if (!hasAccess) {
            errorMessage = 'Affiliate Content Studio is only available on Pro and Agency plans';
            suggestedTier = 'pro';
          }
          break;

        case 'bulk':
          hasAccess = quotaService.canBulkGenerate(tier);
          if (!hasAccess) {
            const limit = quotaService.getBulkGenerationLimit(tier);
            errorMessage = `Bulk generation is only available on Pro (10 items) and Agency (50 items) plans. Your ${tier} plan limit: ${limit}`;
            suggestedTier = 'pro';
          }
          break;

        case 'export':
          hasAccess = quotaService.canExportContent(tier);
          if (!hasAccess) {
            errorMessage = 'Content export is only available on Creator, Pro, and Agency plans';
            suggestedTier = 'creator';
          }
          break;

        case 'api':
          hasAccess = quotaService.canUseAPI(tier);
          if (!hasAccess) {
            errorMessage = 'API access is only available on Agency plan';
            suggestedTier = 'agency';
          }
          break;

        case 'brandTemplates':
          hasAccess = quotaService.canUseBrandTemplates(tier);
          if (!hasAccess) {
            errorMessage = 'Brand templates are only available on Pro and Agency plans';
            suggestedTier = 'pro';
          }
          break;

        case 'forecasting':
          const forecastingLevel = quotaService.getTrendForecastingLevel(tier);
          hasAccess = forecastingLevel !== 'none';
          if (!hasAccess) {
            errorMessage = 'Trend forecasting is only available on Creator, Pro, and Agency plans';
            suggestedTier = 'creator';
          }
          break;
      }

      if (!hasAccess) {
        console.warn(`[FeatureGate] ⚠️ ${feature} access denied for user ${userId} (tier: ${tier})`);
        res.status(403).json({
          error: 'Feature not available',
          message: errorMessage,
          currentTier: tier,
          suggestedTier,
          feature,
          upgradeUrl: '/billing/upgrade'
        });
        return;
      }

      console.log(`[FeatureGate] ✅ ${feature} access granted for user ${userId}`);
      next();
    } catch (error) {
      console.error(`[FeatureGate] 💥 Error checking ${feature} access:`, error);
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  };
}

export async function checkTrendForecastingAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (bypassLimits) {
      console.log(`[FeatureGate] 🔧 Bypass mode enabled - skipping forecasting access check`);
      (req as any).forecastingLevel = 'full';
      next();
      return;
    }

    const userId = await getInternalUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tier = await quotaService.getUserTier(userId);
    const level = quotaService.getTrendForecastingLevel(tier);
    
    console.log(`[FeatureGate] Trend forecasting level for user ${userId} (tier: ${tier}): ${level}`);
    
    if (level === 'none') {
      console.warn(`[FeatureGate] ⚠️ Trend forecasting denied for user ${userId} (tier: ${tier})`);
      res.status(403).json({
        error: 'Trend forecasting not available',
        message: 'Upgrade to Creator plan or higher to access trend forecasting',
        currentTier: tier,
        suggestedTier: 'creator',
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }
    
    (req as any).forecastingLevel = level;
    console.log(`[FeatureGate] ✅ Trend forecasting access granted: ${level} level`);
    next();
  } catch (error) {
    console.error(`[FeatureGate] 💥 Error checking trend forecasting access:`, error);
    res.status(500).json({ error: 'Failed to check forecasting access' });
  }
}

export async function validateBulkGeneration(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (bypassLimits) {
      console.log(`[FeatureGate] 🔧 Bypass mode enabled - skipping bulk generation validation`);
      next();
      return;
    }

    const userId = await getInternalUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { count, bulkCount } = req.body;
    const requestedCount = count || bulkCount || 1;
    
    const tier = await quotaService.getUserTier(userId);
    const limit = quotaService.getBulkGenerationLimit(tier);
    
    console.log(`[FeatureGate] Validating bulk generation for user ${userId} (tier: ${tier}): requested=${requestedCount}, limit=${limit}`);
    
    if (limit === 0) {
      console.warn(`[FeatureGate] ⚠️ Bulk generation not available for user ${userId} (tier: ${tier})`);
      res.status(403).json({
        error: 'Bulk generation not available',
        message: `Bulk generation is only available on Pro (10 items) and Agency (50 items) plans`,
        currentTier: tier,
        suggestedTier: 'pro',
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }
    
    if (requestedCount > limit) {
      console.warn(`[FeatureGate] ⚠️ Bulk generation limit exceeded for user ${userId}: requested=${requestedCount}, limit=${limit}`);
      res.status(400).json({
        error: 'Bulk generation limit exceeded',
        message: `Your ${tier} plan allows up to ${limit} items per bulk generation. You requested ${requestedCount} items.`,
        currentTier: tier,
        currentLimit: limit,
        requested: requestedCount,
        upgradeUrl: '/billing/upgrade'
      });
      return;
    }
    
    console.log(`[FeatureGate] ✅ Bulk generation validation passed for user ${userId}`);
    next();
  } catch (error) {
    console.error(`[FeatureGate] 💥 Error validating bulk generation:`, error);
    res.status(500).json({ error: 'Failed to validate bulk generation' });
  }
}

export default checkFeatureAccess;
