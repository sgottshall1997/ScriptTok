import { Router, Request, Response } from 'express';
import { authGuard } from '../middleware/authGuard';

const router = Router();

const isProduction = process.env.APP_ENV === 'production';

console.log('[Auth API] Initializing auth routes');
console.log('[Auth API] Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

/**
 * GET /api/auth/me
 * Returns the current authenticated user or authentication status
 */
router.get('/me', authGuard, async (req: Request, res: Response) => {
  try {
    console.log('[Auth API] GET /api/auth/me - Checking auth status');
    
    if (req.user) {
      const response = {
        authenticated: true,
        user: {
          id: req.user.userId,
          email: req.user.email || '',
          name: req.user.name || '',
          profileImage: req.user.profileImage || ''
        }
      };
      
      console.log('[Auth API] ✅ User authenticated:', {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name
      });
      
      res.json(response);
      return;
    }
    
    console.log('[Auth API] ⚠️ No user found in request - returning unauthenticated');
    res.json({ authenticated: false });
  } catch (error) {
    console.error('[Auth API] ❌ Error in GET /api/auth/me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logs out the current user
 * Note: Replit Auth logout is handled client-side via page reload
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    console.log('[Auth API] POST /api/auth/logout - Logging out user');
    
    // Replit Auth logout is primarily handled client-side
    // This endpoint confirms the logout request
    console.log('[Auth API] ✅ Logout successful');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Auth API] ❌ Error in POST /api/auth/logout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
