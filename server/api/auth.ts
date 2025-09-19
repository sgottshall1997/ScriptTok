import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Password verification schema
const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required')
});

/**
 * POST /api/auth/verify-password
 * Verifies the application password
 */
router.post('/verify-password', (req, res) => {
  try {
    const result = passwordSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: result.error.errors
      });
    }

    const { password } = result.data;
    const correctPassword = process.env.APP_PASSWORD;

    // If no password is set in environment, allow access (for development)
    if (!correctPassword) {
      console.warn('⚠️ APP_PASSWORD not set - allowing access without password verification');
      return res.json({
        success: true,
        message: 'Access granted (no password configured)'
      });
    }

    // Verify password
    if (password === correctPassword) {
      return res.json({
        success: true,
        message: 'Access granted'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as authRouter };