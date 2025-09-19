import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const router = Router();

// JWT secret - use APP_PASSWORD or fallback for testing
const JWT_SECRET = process.env.APP_PASSWORD || 'test-secret-key';

// Mock user database for testing
const TEST_USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' },
  { id: 3, username: 'viewer', password: 'viewer123', role: 'viewer' }
];

// Password verification schema
const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required')
});

/**
 * POST /api/auth/verify-password
 * Verifies the application password
 */
// Login schema for enhanced authentication testing
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

/**
 * POST /api/auth/login
 * Enhanced login endpoint for authentication testing
 */
router.post('/login', (req, res) => {
  try {
    // Validate request body
    const result = loginSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: result.error.errors
      });
    }

    const { username, password } = result.data;

    // Find user in mock database
    const user = TEST_USERS.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      },
      JWT_SECRET
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required',
        message: 'Please provide Authorization header with Bearer token'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Generate new token
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          username: decoded.username, 
          role: decoded.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
        },
        JWT_SECRET
      );

      return res.json({
        success: true,
        message: 'Token refreshed successfully',
        token: newToken
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Token refresh failed'
      });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (stateless - client should discard token)
 */
router.post('/logout', (req, res) => {
  return res.json({
    success: true,
    message: 'Logout successful'
  });
});

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

/**
 * Middleware to verify JWT tokens
 */
export const verifyAuth = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required',
        message: 'Please provide Authorization header with Bearer token'
      });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format',
        message: 'Authorization header must use Bearer token format'
      });
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token required',
        message: 'Bearer token is required'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Token verification failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User context not found'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

export { router as authRouter };