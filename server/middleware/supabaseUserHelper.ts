import { storage } from '../storage';
import type { User } from '@shared/schema';

export async function getOrCreateSupabaseUser(supabaseUserId: string, email?: string): Promise<User> {
  // Check if user already exists
  let user = await storage.getUserBySupabaseId(supabaseUserId);
  
  if (!user) {
    // Create new user if not found
    user = await storage.createSupabaseUser({
      supabaseId: supabaseUserId,
      email: email,
    });
  }
  
  return user;
}

export async function getUserIdFromSupabaseId(supabaseUserId: string, email?: string): Promise<number> {
  const user = await getOrCreateSupabaseUser(supabaseUserId, email);
  return user.id;
}
