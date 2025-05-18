import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string().optional(), // This field comes from the form but isn't stored
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
});

// User registration endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log("Processing registration for:", req.body.username);
    
    // Basic validation - passwords must match
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    // Basic required fields check
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(req.body.email);
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds);

    // Create user with minimal required fields
    try {
      const userData = {
        username: req.body.username,
        email: req.body.email,
        password: passwordHash,
        role: 'writer'
      };
      
      const newUser = await storage.createUser(userData);
      
      // Generate token
      const token = generateToken({
        id: newUser.id,
        username: newUser.username,
        role: newUser.role || 'writer',
      });
      
      // Return user data (without password)
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        token
      });
    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      return res.status(500).json({ message: 'Failed to create user account' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    // Provide a more helpful error message
    res.status(500).json({ 
      message: 'Failed to register user',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// User login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors 
      });
    }

    const { username, password } = validationResult.data;

    // Find user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // We'll just log the login activity instead of updating fields
    // that might not exist in our schema

    // Record login activity
    await storage.logUserActivity({
      userId: user.id,
      action: 'login',
      metadata: { source: 'api_login' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']?.toString()
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // Return user data with token (no password)
    const userResponse = {
      ...user,
      token,
      password: undefined // Remove password from response
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (no password)
    const userResponse = {
      ...user,
      password: undefined // Remove password from response
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to retrieve user information' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate request body
    const validationResult = profileUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors 
      });
    }

    const { firstName, lastName, email } = validationResult.data;

    // Check if email is already in use by another user
    if (email) {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    // Update user profile
    const updatedUser = await storage.updateUser(req.user.id, {
      firstName,
      lastName,
      email,
    });

    // Record profile update activity
    await storage.logUserActivity({
      userId: req.user.id,
      action: 'profile_update',
      metadata: { fields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']?.toString()
    });

    // Return updated user data (password is never exposed to the client)
    const userResponse = {
      ...updatedUser,
      password: undefined // Remove password from response
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate request body
    const validationResult = passwordUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors 
      });
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get current user with password
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await storage.updateUser(req.user.id, {
      password: passwordHash,
    });

    // Record password change activity
    await storage.logUserActivity({
      userId: req.user.id,
      action: 'password_change',
      metadata: { timestamp: new Date().toISOString() },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']?.toString()
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Logout endpoint (just for frontend, actual token invalidation should be done client-side)
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      // Record logout activity
      await storage.logUserActivity({
        userId: req.user.id,
        action: 'logout',
        metadata: { timestamp: new Date().toISOString() },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']?.toString()
      });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

export default router;