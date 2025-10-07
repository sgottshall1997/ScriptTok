export type AuthResult = { 
  userId: string; 
  email?: string; 
  name?: string;
  profileImage?: string;
  tierHint?: 'pro' | 'free' 
};

export type VerifyFn = (req: any) => Promise<AuthResult | null>;

export const verifyDev: VerifyFn = async (req: any): Promise<AuthResult | null> => {
  console.log('[Auth:Dev] Starting development authentication...');
  
  const userId = process.env.DEV_USER_ID;
  const email = process.env.DEV_USER_EMAIL;
  const name = process.env.DEV_USER_NAME || 'Dev User';
  
  if (!userId) {
    console.error('[Auth:Dev] ❌ DEV_USER_ID not set in environment variables');
    return null;
  }
  
  const result: AuthResult = {
    userId,
    email,
    name,
    tierHint: 'pro'
  };
  
  console.log('[Auth:Dev] ✅ Development user authenticated:', {
    userId: result.userId,
    email: result.email,
    name: result.name,
    tierHint: result.tierHint
  });
  
  return result;
};

export const verifyReplitAuth: VerifyFn = async (req: any): Promise<AuthResult | null> => {
  console.log('[Auth:Replit] Starting Replit Auth verification...');
  console.log('[Auth:Replit] Request headers:', {
    userId: req.headers['x-replit-user-id'] ? '✓ present' : '✗ missing',
    userName: req.headers['x-replit-user-name'] ? '✓ present' : '✗ missing',
    userEmail: req.headers['x-replit-user-email'] ? '✓ present' : '✗ missing',
    profileImage: req.headers['x-replit-user-profile-image'] ? '✓ present' : '✗ missing'
  });
  
  const userId = req.headers['x-replit-user-id'];
  
  if (!userId) {
    console.warn('[Auth:Replit] ⚠️ No X-Replit-User-Id header found - authentication failed');
    console.log('[Auth:Replit] Available headers:', Object.keys(req.headers).filter(h => h.toLowerCase().includes('replit')));
    return null;
  }
  
  const result: AuthResult = {
    userId: userId as string,
    email: req.headers['x-replit-user-email'] as string | undefined,
    name: req.headers['x-replit-user-name'] as string | undefined,
    profileImage: req.headers['x-replit-user-profile-image'] as string | undefined
  };
  
  console.log('[Auth:Replit] ✅ Replit user authenticated:', {
    userId: result.userId,
    email: result.email || '(not provided)',
    name: result.name || '(not provided)',
    profileImage: result.profileImage ? '✓ present' : '(not provided)'
  });
  
  return result;
};

export const verifyAuth: VerifyFn = 
  process.env.APP_ENV === 'production' ? verifyReplitAuth : verifyDev;

console.log(`[Auth:Config] Authentication mode: ${process.env.APP_ENV === 'production' ? 'PRODUCTION (Replit Auth)' : 'DEVELOPMENT (Dev User)'}`);
console.log(`[Auth:Config] APP_ENV = ${process.env.APP_ENV || '(not set, defaulting to dev)'}`);
