import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import type { RequestHandler } from 'express';
import { storage } from './storage';

async function getOrCreateUser(clerkUserId: string): Promise<number> {
  let user = await storage.getUserByClerkId(clerkUserId);
  
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    
    user = await storage.createClerkUser({
      clerkId: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      profileImageUrl: clerkUser.imageUrl || undefined,
    });
  }
  
  return user.id;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const auth = (req as any).auth;
    
    if (!auth?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = await getOrCreateUser(auth.userId);
    (req as any).user = { id: userId, clerkId: auth.userId };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const clerkMiddleware = ClerkExpressRequireAuth();
