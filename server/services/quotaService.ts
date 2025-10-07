import type { IStorage } from '../storage';
import type { MonthlyUsage } from '@shared/schema';

export interface QuotaCheck {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  tier: string;
}

export class QuotaService {
  constructor(private storage: IStorage) {}

  currentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  async getOrCreateMonthlyUsage(userId: number): Promise<MonthlyUsage> {
    try {
      const period = this.currentPeriod();
      console.log(`[QuotaService] Getting or creating monthly usage for user ${userId}, period: ${period}`);
      
      let usage = await this.storage.getMonthlyUsage(userId, period);
      
      if (usage) {
        console.log(`[QuotaService] Found existing usage record for user ${userId}`);
        return usage;
      }
      
      console.log(`[QuotaService] No usage record found for user ${userId}, creating new record`);
      const user = await this.storage.getUser(userId);
      const tier = user?.subscriptionTier || 'free';
      
      usage = await this.storage.createMonthlyUsage({
        userId,
        periodMonth: period,
        gptGenerationsUsed: 0,
        claudeGenerationsUsed: 0,
        trendAnalysesUsed: 0,
        userTier: tier
      });
      
      console.log(`[QuotaService] Created new usage record for user ${userId}`);
      return usage;
    } catch (error) {
      console.error(`[QuotaService] Error getting or creating monthly usage for user ${userId}:`, error);
      throw error;
    }
  }

  async incrementGptUsage(userId: number, count: number = 1): Promise<MonthlyUsage> {
    try {
      const period = this.currentPeriod();
      console.log(`[QuotaService] Incrementing GPT usage for user ${userId} by ${count} for period ${period}`);
      
      const updated = await this.storage.incrementGptUsage(userId, period, count);
      
      console.log(`[QuotaService] GPT usage incremented for user ${userId}: ${updated.gptGenerationsUsed} total`);
      return updated;
    } catch (error) {
      console.error(`[QuotaService] Error incrementing GPT usage for user ${userId}:`, error);
      throw error;
    }
  }

  async incrementClaudeUsage(userId: number, count: number = 1): Promise<MonthlyUsage> {
    try {
      const period = this.currentPeriod();
      console.log(`[QuotaService] Incrementing Claude usage for user ${userId} by ${count} for period ${period}`);
      
      const updated = await this.storage.incrementClaudeUsage(userId, period, count);
      
      console.log(`[QuotaService] Claude usage incremented for user ${userId}: ${updated.claudeGenerationsUsed} total`);
      return updated;
    } catch (error) {
      console.error(`[QuotaService] Error incrementing Claude usage for user ${userId}:`, error);
      throw error;
    }
  }

  async incrementTrendAnalysisUsage(userId: number, count: number = 1): Promise<MonthlyUsage> {
    try {
      const period = this.currentPeriod();
      console.log(`[QuotaService] Incrementing trend analysis usage for user ${userId} by ${count} for period ${period}`);
      
      const updated = await this.storage.incrementTrendAnalysisUsage(userId, period, count);
      
      console.log(`[QuotaService] Trend analysis usage incremented for user ${userId}: ${updated.trendAnalysesUsed} total`);
      return updated;
    } catch (error) {
      console.error(`[QuotaService] Error incrementing trend analysis usage for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserTier(userId: number): Promise<string> {
    try {
      console.log(`[QuotaService] Getting tier for user ${userId}`);
      
      const user = await this.storage.getUser(userId);
      
      if (!user) {
        console.log(`[QuotaService] User ${userId} not found, defaulting to 'free' tier`);
        return 'free';
      }
      
      const tier = user.subscriptionTier || 'free';
      console.log(`[QuotaService] User ${userId} has tier: ${tier}`);
      return tier;
    } catch (error) {
      console.error(`[QuotaService] Error getting user tier for user ${userId}:`, error);
      throw error;
    }
  }

  getGptLimit(tier: string): number {
    console.log(`[QuotaService] Getting GPT limit for tier: ${tier}`);
    
    switch (tier) {
      case 'free':
        return 10;
      case 'pro':
        return 300;
      default:
        console.log(`[QuotaService] Unknown tier '${tier}', returning Infinity as safety fallback`);
        return Infinity;
    }
  }

  getClaudeLimit(tier: string): number {
    console.log(`[QuotaService] Getting Claude limit for tier: ${tier}`);
    
    switch (tier) {
      case 'free':
        return 5;
      case 'pro':
        return 150;
      default:
        console.log(`[QuotaService] Unknown tier '${tier}', returning Infinity as safety fallback`);
        return Infinity;
    }
  }

  getTrendAnalysisLimit(tier: string): number {
    console.log(`[QuotaService] Getting trend analysis limit for tier: ${tier}`);
    
    switch (tier) {
      case 'free':
        return 10;
      case 'pro':
        return 250;
      default:
        console.log(`[QuotaService] Unknown tier '${tier}', returning Infinity as safety fallback`);
        return Infinity;
    }
  }

  getTierLimit(tier: string): number {
    return this.getGptLimit(tier);
  }

  async checkModelQuota(userId: number, modelType: 'gpt' | 'claude'): Promise<QuotaCheck> {
    try {
      console.log(`[QuotaService] Checking ${modelType} quota for user ${userId}`);
      
      const tier = await this.getUserTier(userId);
      const limit = modelType === 'gpt' ? this.getGptLimit(tier) : this.getClaudeLimit(tier);
      const usage = await this.getOrCreateMonthlyUsage(userId);
      const used = modelType === 'gpt' ? usage.gptGenerationsUsed : usage.claudeGenerationsUsed;
      const allowed = used < limit;
      const remaining = Math.max(0, limit - used);
      
      console.log(`[QuotaService] ${modelType} quota check for user ${userId}: allowed=${allowed}, used=${used}, limit=${limit}, remaining=${remaining}`);
      
      return {
        allowed,
        used,
        limit,
        remaining,
        tier
      };
    } catch (error) {
      console.error(`[QuotaService] Error checking ${modelType} quota for user ${userId}:`, error);
      throw error;
    }
  }

  async checkTrendAnalysisQuota(userId: number): Promise<QuotaCheck> {
    try {
      console.log(`[QuotaService] Checking trend analysis quota for user ${userId}`);
      
      const tier = await this.getUserTier(userId);
      const limit = this.getTrendAnalysisLimit(tier);
      const usage = await this.getOrCreateMonthlyUsage(userId);
      const used = usage.trendAnalysesUsed;
      const allowed = used < limit;
      const remaining = Math.max(0, limit - used);
      
      console.log(`[QuotaService] Trend analysis quota check for user ${userId}: allowed=${allowed}, used=${used}, limit=${limit}, remaining=${remaining}`);
      
      return {
        allowed,
        used,
        limit,
        remaining,
        tier
      };
    } catch (error) {
      console.error(`[QuotaService] Error checking trend analysis quota for user ${userId}:`, error);
      throw error;
    }
  }

  async checkQuota(userId: number): Promise<QuotaCheck> {
    return this.checkModelQuota(userId, 'gpt');
  }

  async incrementUsage(userId: number, count: number = 1): Promise<MonthlyUsage> {
    return this.incrementGptUsage(userId, count);
  }

  canBulkGenerate(tier: string): boolean {
    return tier === 'pro';
  }

  getUnlockedTemplateCount(tier: string): number {
    switch (tier) {
      case 'free':
        return 5;
      case 'pro':
        return Infinity;
      default:
        return 5;
    }
  }
}

export function createQuotaService(storage: IStorage): QuotaService {
  console.log('[QuotaService] Creating new QuotaService instance');
  return new QuotaService(storage);
}

let quotaServiceInstance: QuotaService | null = null;

export function getQuotaService(storage: IStorage): QuotaService {
  if (!quotaServiceInstance) {
    quotaServiceInstance = createQuotaService(storage);
  }
  return quotaServiceInstance;
}
