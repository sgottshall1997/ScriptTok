import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function migrateTo4Tier() {
  console.log('[Migration] Starting tier migration: free → starter');
  
  try {
    // Update all 'free' tier users to 'starter'
    const result = await db
      .update(users)
      .set({ subscriptionTier: 'starter' })
      .where(eq(users.subscriptionTier, 'free'));
    
    console.log(`[Migration] ✅ Successfully migrated users from 'free' to 'starter'`);
    console.log(`[Migration] Updated ${result.rowCount || 0} users`);
    
    return { success: true, usersUpdated: result.rowCount || 0 };
  } catch (error) {
    console.error('[Migration] ❌ Error during tier migration:', error);
    throw error;
  }
}

// Migration can be run via API endpoint /api/billing/admin/migrate-tiers
