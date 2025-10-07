import type { IStorage } from "../storage";
import type { User, InsertUser, InsertUserIdentity, InsertSubscription } from "@shared/schema";
import { storage } from "../storage";

export class IdentityService {
  constructor(private storage: IStorage) {}

  async findOrCreateUser(
    provider: string,
    providerUserId: string,
    email: string,
    name?: string,
    profileImage?: string
  ): Promise<number> {
    console.log(`[IdentityService] findOrCreateUser called:`, {
      provider,
      providerUserId,
      email,
      name: name || '(not provided)',
      profileImage: profileImage ? '✓ present' : '(not provided)'
    });

    try {
      const existingIdentity = await this.storage.getUserIdentity(provider, providerUserId);

      if (existingIdentity) {
        console.log(`[IdentityService] ✅ Found existing identity, returning userId:`, existingIdentity.userId);
        return existingIdentity.userId;
      }

      console.log(`[IdentityService] No existing identity found, creating new user...`);

      const username = this.generateUsername(email, provider, providerUserId);
      const password = this.generateSecurePassword();

      const [firstName, lastName] = this.parseFullName(name);

      // In development mode, grant Pro tier automatically
      const isDevelopment = provider === 'dev' || process.env.NODE_ENV === 'development';
      const subscriptionTier = isDevelopment ? 'pro' : 'starter';

      const newUserData: InsertUser = {
        username,
        password,
        email,
        firstName,
        lastName,
        profileImage,
        role: 'creator',
        status: 'active',
        lastLogin: new Date(),
        subscriptionTier,
      };

      console.log(`[IdentityService] Creating user with username:`, username, `tier: ${subscriptionTier} (dev mode: ${isDevelopment})`);
      const newUser = await this.storage.createUser(newUserData);
      console.log(`[IdentityService] ✅ User created with ID:`, newUser.id);

      const identityData: InsertUserIdentity = {
        userId: newUser.id,
        provider,
        providerUserId,
        emailAtSignup: email,
      };

      console.log(`[IdentityService] Creating user_identity record...`);
      await this.storage.createUserIdentity(identityData);
      console.log(`[IdentityService] ✅ User identity created`);

      const subscriptionData: InsertSubscription = {
        userId: newUser.id,
        tier: subscriptionTier,
        status: 'active',
        startAt: new Date(),
      };

      console.log(`[IdentityService] Creating default '${subscriptionTier}' subscription (dev mode: ${isDevelopment})...`);
      await this.storage.createSubscription(subscriptionData);
      console.log(`[IdentityService] ✅ Subscription created`);

      console.log(`[IdentityService] ✅ User setup complete, returning userId:`, newUser.id);
      return newUser.id;

    } catch (error) {
      console.error(`[IdentityService] ❌ Error in findOrCreateUser:`, error);
      throw new Error(`Failed to find or create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async linkIdentity(
    userId: number,
    provider: string,
    providerUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log(`[IdentityService] linkIdentity called:`, {
      userId,
      provider,
      providerUserId
    });

    try {
      const user = await this.storage.getUser(userId);
      if (!user) {
        console.error(`[IdentityService] ❌ User not found with ID:`, userId);
        return { success: false, error: 'User not found' };
      }

      const existingIdentity = await this.storage.getUserIdentity(provider, providerUserId);
      if (existingIdentity) {
        if (existingIdentity.userId === userId) {
          console.log(`[IdentityService] ✅ Identity already linked to this user`);
          return { success: true };
        } else {
          console.error(`[IdentityService] ❌ Identity already linked to another user:`, existingIdentity.userId);
          return { success: false, error: 'Identity already linked to another user' };
        }
      }

      const identityData: InsertUserIdentity = {
        userId,
        provider,
        providerUserId,
        emailAtSignup: user.email || '',
      };

      console.log(`[IdentityService] Creating user_identity link...`);
      await this.storage.createUserIdentity(identityData);
      console.log(`[IdentityService] ✅ Identity linked successfully`);

      return { success: true };

    } catch (error) {
      console.error(`[IdentityService] ❌ Error in linkIdentity:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getUserByIdentity(
    provider: string,
    providerUserId: string
  ): Promise<User | undefined> {
    console.log(`[IdentityService] getUserByIdentity called:`, {
      provider,
      providerUserId
    });

    try {
      const identity = await this.storage.getUserIdentity(provider, providerUserId);

      if (!identity) {
        console.log(`[IdentityService] ⚠️ No identity found for provider:`, provider, 'userId:', providerUserId);
        return undefined;
      }

      console.log(`[IdentityService] ✅ Identity found, fetching user:`, identity.userId);
      const user = await this.storage.getUser(identity.userId);

      if (user) {
        console.log(`[IdentityService] ✅ User retrieved:`, {
          id: user.id,
          username: user.username,
          email: user.email
        });
      } else {
        console.warn(`[IdentityService] ⚠️ User not found for identity userId:`, identity.userId);
      }

      return user;

    } catch (error) {
      console.error(`[IdentityService] ❌ Error in getUserByIdentity:`, error);
      return undefined;
    }
  }

  private generateUsername(email: string, provider: string, providerUserId: string): string {
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-6);
    return `${emailPrefix}_${timestamp}`;
  }

  private generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const length = 32;
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private parseFullName(name?: string): [string | null, string | null] {
    if (!name) return [null, null];

    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return [null, null];
    if (parts.length === 1) return [parts[0], null];

    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return [firstName, lastName];
  }
}

export function createIdentityService(storageInstance: IStorage = storage): IdentityService {
  return new IdentityService(storageInstance);
}

export const identityService = createIdentityService();