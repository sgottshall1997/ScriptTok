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

// Run migration if called directly
if (require.main === module) {
  migrateTo4Tier()
    .then(() => {
      console.log('[Migration] Migration complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Migration failed:', error);
      process.exit(1);
    });
}
