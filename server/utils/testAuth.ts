import type { IStorage } from '../storage';
import type { User, InsertSubscription } from '@shared/schema';
import { createIdentityService } from '../services/identityService';
import { createQuotaService } from '../services/quotaService';

/**
 * Test Authentication and Quota Utilities
 * 
 * This module provides utilities for creating test users and managing quotas
 * in development and testing environments.
 * 
 * @example
 * ```typescript
 * import { createTestUser, validateQuotaEnforcement } from './utils/testAuth';
 * 
 * // Create a test user with pro tier
 * const user = await createTestUser(storage, 'test@example.com', 'pro');
 * 
 * // Validate quota enforcement
 * const quota = await validateQuotaEnforcement(storage, user.id);
 * console.log(`User has ${quota.remaining} generations remaining`);
 * ```
 */

/**
 * Creates a test user with optional email and tier
 * 
 * Uses identityService to create a user with the 'dev' provider and sets up
 * a subscription with the specified tier. This is useful for testing and
 * development environments.
 * 
 * @param storage - Storage implementation
 * @param email - User email (default: 'test@example.com')
 * @param tier - Subscription tier (default: 'starter')
 * @returns The created user with internal ID
 * 
 * @example
 * ```typescript
 * const starterUser = await createTestUser(storage);
 * const proUser = await createTestUser(storage, 'pro@example.com', 'pro');
 * ```
 */
export async function createTestUser(
  storage: IStorage,
  email: string = 'test@example.com',
  tier: 'starter' | 'creator' | 'pro' | 'agency' = 'starter'
): Promise<User> {
  console.log(`[TestAuth] Creating test user with email: ${email}, tier: ${tier}`);
  
  try {
    const identityService = createIdentityService(storage);
    
    // Generate unique provider user ID for this test user
    const providerUserId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const name = email.split('@')[0];
    
    console.log(`[TestAuth] Using dev provider with ID: ${providerUserId}`);
    
    // Create user via identity service
    const userId = await identityService.findOrCreateUser(
      'dev',
      providerUserId,
      email,
      name
    );
    
    console.log(`[TestAuth] User created with ID: ${userId}`);
    
    // Update subscription to specified tier if not 'starter'
    if (tier !== 'starter') {
      console.log(`[TestAuth] Updating subscription to tier: ${tier}`);
      await storage.updateSubscription(userId, {
        tier,
        status: 'active',
        startAt: new Date()
      });
      console.log(`[TestAuth] ✅ Subscription updated to ${tier}`);
    }
    
    // Get the created user
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error(`Failed to retrieve created user with ID: ${userId}`);
    }
    
    console.log(`[TestAuth] ✅ Test user created successfully:`, {
      id: user.id,
      email: user.email,
      tier
    });
    
    return user;
  } catch (error) {
    console.error(`[TestAuth] ❌ Error creating test user:`, error);
    throw new Error(`Failed to create test user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Returns the dev user ID from environment variables
 * 
 * @returns Dev user ID from DEV_USER_ID env var or default UUID
 * 
 * @example
 * ```typescript
 * const devUserId = getDevUserId();
 * console.log(`Dev user ID: ${devUserId}`);
 * ```
 */
export function getDevUserId(): string {
  const defaultDevUserId = '00000000-0000-0000-0000-000000000001';
  const devUserId = process.env.DEV_USER_ID || defaultDevUserId;
  
  console.log(`[TestAuth] Dev user ID: ${devUserId}${devUserId === defaultDevUserId ? ' (default)' : ' (from env)'}`);
  
  return devUserId;
}

/**
 * Creates the default dev user from environment variables
 * 
 * Uses DEV_USER_ID, DEV_USER_EMAIL, DEV_USER_NAME from environment variables
 * to create a development user with 'pro' tier subscription.
 * 
 * @param storage - Storage implementation
 * @returns The created dev user
 * 
 * @example
 * ```typescript
 * const devUser = await createDevUser(storage);
 * console.log(`Dev user created: ${devUser.email}`);
 * ```
 */
export async function createDevUser(storage: IStorage): Promise<User> {
  const devUserId = getDevUserId();
  const devEmail = process.env.DEV_USER_EMAIL || 'dev@example.com';
  const devName = process.env.DEV_USER_NAME || 'Dev User';
  
  console.log(`[TestAuth] Creating dev user:`, {
    providerUserId: devUserId,
    email: devEmail,
    name: devName
  });
  
  try {
    const identityService = createIdentityService(storage);
    
    // Create dev user via identity service
    const userId = await identityService.findOrCreateUser(
      'dev',
      devUserId,
      devEmail,
      devName
    );
    
    console.log(`[TestAuth] Dev user created with ID: ${userId}`);
    
    // Set up 'pro' tier subscription for dev user
    console.log(`[TestAuth] Setting up 'pro' tier subscription for dev user`);
    await storage.updateSubscription(userId, {
      tier: 'pro',
      status: 'active',
      startAt: new Date()
    });
    
    console.log(`[TestAuth] ✅ Dev user subscription set to 'pro'`);
    
    // Get the created user
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error(`Failed to retrieve dev user with ID: ${userId}`);
    }
    
    console.log(`[TestAuth] ✅ Dev user created successfully:`, {
      id: user.id,
      email: user.email,
      tier: 'pro'
    });
    
    return user;
  } catch (error) {
    console.error(`[TestAuth] ❌ Error creating dev user:`, error);
    throw new Error(`Failed to create dev user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates quota enforcement for a user
 * 
 * Checks the current quota status and returns detailed information about
 * usage, limits, and remaining generations.
 * 
 * @param storage - Storage implementation
 * @param userId - User ID to validate
 * @returns Quota information including used, limit, remaining, tier, and allowed flag
 * 
 * @example
 * ```typescript
 * const quota = await validateQuotaEnforcement(storage, userId);
 * if (quota.allowed) {
 *   console.log(`User can generate ${quota.remaining} more items`);
 * } else {
 *   console.log(`User has reached their limit of ${quota.limit}`);
 * }
 * ```
 */
export async function validateQuotaEnforcement(
  storage: IStorage,
  userId: number
): Promise<{
  used: number;
  limit: number;
  remaining: number;
  tier: string;
  allowed: boolean;
}> {
  console.log(`[TestAuth] Validating quota enforcement for user ${userId}`);
  
  try {
    const quotaService = createQuotaService(storage);
    
    // Get quota check result
    const quotaCheck = await quotaService.checkQuota(userId);
    
    // Get user tier
    const tier = await quotaService.getUserTier(userId);
    
    const result = {
      used: quotaCheck.used,
      limit: quotaCheck.limit,
      remaining: quotaCheck.remaining,
      tier,
      allowed: quotaCheck.allowed
    };
    
    console.log(`[TestAuth] ✅ Quota validation result:`, result);
    
    return result;
  } catch (error) {
    console.error(`[TestAuth] ❌ Error validating quota enforcement:`, error);
    throw new Error(`Failed to validate quota enforcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Resets the monthly usage for a user to 0
 * 
 * This function resets the user's generation count for the current period.
 * Useful for testing and resetting test data.
 * 
 * Note: This implementation uses a workaround by decrementing the usage count.
 * For production use, consider adding a direct reset method to the storage interface.
 * 
 * @param storage - Storage implementation
 * @param userId - User ID to reset
 * @returns Success boolean
 * 
 * @example
 * ```typescript
 * const success = await resetUserQuota(storage, userId);
 * if (success) {
 *   console.log('Quota reset successfully');
 * }
 * ```
 */
export async function resetUserQuota(
  storage: IStorage,
  userId: number
): Promise<boolean> {
  console.log(`[TestAuth] Resetting quota for user ${userId}`);
  
  try {
    const quotaService = createQuotaService(storage);
    const period = quotaService.currentPeriod();
    
    // Get current usage
    const usage = await storage.getMonthlyUsage(userId, period);
    
    if (!usage) {
      console.log(`[TestAuth] ⚠️ No usage record found for user ${userId}, nothing to reset`);
      return true;
    }
    
    const currentUsage = usage.gptGenerationsUsed + usage.claudeGenerationsUsed + usage.trendAnalysesUsed;
    
    if (currentUsage === 0) {
      console.log(`[TestAuth] ✅ Usage already at 0 for user ${userId}`);
      return true;
    }
    
    // Decrement usage to reset to 0
    console.log(`[TestAuth] Decrementing GPT usage from ${usage.gptGenerationsUsed} to 0`);
    await storage.incrementGptUsage(userId, period, -usage.gptGenerationsUsed);
    console.log(`[TestAuth] Decrementing Claude usage from ${usage.claudeGenerationsUsed} to 0`);
    await storage.incrementClaudeUsage(userId, period, -usage.claudeGenerationsUsed);
    console.log(`[TestAuth] Decrementing Trend Analysis usage from ${usage.trendAnalysesUsed} to 0`);
    await storage.incrementTrendAnalysisUsage(userId, period, -usage.trendAnalysesUsed);
    
    // Verify reset
    const updatedUsage = await storage.getMonthlyUsage(userId, period);
    const finalUsage = updatedUsage ? (updatedUsage.gptGenerationsUsed + updatedUsage.claudeGenerationsUsed + updatedUsage.trendAnalysesUsed) : 0;
    
    if (finalUsage === 0) {
      console.log(`[TestAuth] ✅ Quota reset successfully for user ${userId}`);
      return true;
    } else {
      console.error(`[TestAuth] ❌ Quota reset verification failed. Expected 0, got ${finalUsage}`);
      return false;
    }
  } catch (error) {
    console.error(`[TestAuth] ❌ Error resetting quota:`, error);
    return false;
  }
}

/**
 * Simulates quota usage by incrementing the count
 * 
 * Increments the user's generation count by the specified amount.
 * Useful for testing quota limits and enforcement.
 * 
 * @param storage - Storage implementation
 * @param userId - User ID to simulate usage for
 * @param count - Number of generations to simulate
 * @returns Updated usage stats
 * 
 * @example
 * ```typescript
 * // Simulate using 5 generations
 * const stats = await simulateQuotaUsage(storage, userId, 5);
 * console.log(`User has now used ${stats.used} generations`);
 * ```
 */
export async function simulateQuotaUsage(
  storage: IStorage,
  userId: number,
  count: number
): Promise<{
  used: number;
  limit: number;
  remaining: number;
  tier: string;
  allowed: boolean;
}> {
  console.log(`[TestAuth] Simulating ${count} quota usage for user ${userId}`);
  
  try {
    const quotaService = createQuotaService(storage);
    
    // Increment usage by count
    await quotaService.incrementUsage(userId, count);
    
    console.log(`[TestAuth] ✅ Usage incremented by ${count}`);
    
    // Get updated quota status
    const result = await validateQuotaEnforcement(storage, userId);
    
    console.log(`[TestAuth] ✅ Updated usage stats:`, result);
    
    return result;
  } catch (error) {
    console.error(`[TestAuth] ❌ Error simulating quota usage:`, error);
    throw new Error(`Failed to simulate quota usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
