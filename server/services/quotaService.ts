import type { IStorage } from '../storage';
import type { MonthlyUsage, Subscription, InsertMonthlyUsage } from '@shared/schema';

export class QuotaService {
  constructor(private storage: IStorage) {}

  /**
   * Returns current period as 'YYYY-MM' string
   * Example: '2025-10' for October 2025
   */
  currentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Gets or creates monthly usage record for user
   * @param userId - User ID
   * @returns Monthly usage record
   */
  async getOrCreateMonthlyUsage(userId: number): Promise<MonthlyUsage> {
    try {
      const period = this.currentPeriod();
      console.log(`[QuotaService] Getting or creating monthly usage for user ${userId}, period: ${period}`);
      
      let usage = await this.storage.getMonthlyUsage(userId, period);
      
      if (usage) {
        console.log(`[QuotaService] Found existing usage record for user ${userId}: ${usage.generationsUsed} generations used`);
        return usage;
      }
      
      console.log(`[QuotaService] No usage record found for user ${userId}, creating new record`);
      usage = await this.storage.createMonthlyUsage({
        userId,
        periodYyyymm: period,
        generationsUsed: 0
      });
      
      console.log(`[QuotaService] Created new usage record for user ${userId}`);
      return usage;
    } catch (error) {
      console.error(`[QuotaService] Error getting or creating monthly usage for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Increments usage count for user atomically
   * @param userId - User ID
   * @param count - Number to increment by (default: 1)
   * @returns Updated usage record
   */
  async incrementUsage(userId: number, count: number = 1): Promise<MonthlyUsage> {
    try {
      const period = this.currentPeriod();
      console.log(`[QuotaService] Incrementing usage for user ${userId} by ${count} for period ${period}`);
      
      const updated = await this.storage.incrementUsage(userId, period, count);
      
      console.log(`[QuotaService] Usage incremented for user ${userId}: ${updated.generationsUsed} total generations used`);
      return updated;
    } catch (error) {
      console.error(`[QuotaService] Error incrementing usage for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Gets user's subscription tier
   * @param userId - User ID
   * @returns Tier string ('free' or 'pro')
   */
  async getUserTier(userId: number): Promise<string> {
    try {
      console.log(`[QuotaService] Getting subscription tier for user ${userId}`);
      
      const subscription = await this.storage.getUserSubscription(userId);
      
      if (!subscription) {
        console.log(`[QuotaService] No subscription found for user ${userId}, defaulting to 'free' tier`);
        return 'free';
      }
      
      console.log(`[QuotaService] User ${userId} has tier: ${subscription.tier}`);
      return subscription.tier;
    } catch (error) {
      console.error(`[QuotaService] Error getting user tier for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Gets generation limit for a tier
   * @param tier - Tier name ('free', 'pro', etc.)
   * @returns Generation limit for the tier
   */
  getTierLimit(tier: string): number {
    console.log(`[QuotaService] Getting tier limit for tier: ${tier}`);
    
    switch (tier) {
      case 'free':
        console.log(`[QuotaService] Tier 'free' has limit: 10 generations/month`);
        return 10;
      case 'pro':
        console.log(`[QuotaService] Tier 'pro' has limit: 500 generations/month`);
        return 500;
      default:
        console.log(`[QuotaService] Unknown tier '${tier}', returning Infinity as safety fallback`);
        return Infinity;
    }
  }

  /**
   * Checks if user has available quota for generation
   * @param userId - User ID
   * @returns Quota check result with allowed flag, used count, limit, and remaining
   */
  async checkQuota(userId: number): Promise<{
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
  }> {
    try {
      console.log(`[QuotaService] Checking quota for user ${userId}`);
      
      const tier = await this.getUserTier(userId);
      const limit = this.getTierLimit(tier);
      const usage = await this.getOrCreateMonthlyUsage(userId);
      const used = usage.generationsUsed;
      const allowed = used < limit;
      const remaining = Math.max(0, limit - used);
      
      console.log(`[QuotaService] Quota check for user ${userId}: allowed=${allowed}, used=${used}, limit=${limit}, remaining=${remaining}`);
      
      return {
        allowed,
        used,
        limit,
        remaining
      };
    } catch (error) {
      console.error(`[QuotaService] Error checking quota for user ${userId}:`, error);
      throw error;
    }
  }
}

/**
 * Factory function to create a new QuotaService instance
 * @param storage - Storage implementation
 * @returns New QuotaService instance
 */
export function createQuotaService(storage: IStorage): QuotaService {
  console.log('[QuotaService] Creating new QuotaService instance');
  return new QuotaService(storage);
}

/**
 * Singleton instance - will be initialized when imported with a storage instance
 * To use: import { quotaService } from './quotaService'
 * Or create your own: createQuotaService(storage)
 */
let quotaServiceInstance: QuotaService | null = null;

export function getQuotaService(storage: IStorage): QuotaService {
  if (!quotaServiceInstance) {
    quotaServiceInstance = createQuotaService(storage);
  }
  return quotaServiceInstance;
}
