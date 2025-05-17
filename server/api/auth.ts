import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { insertUserSchema, users } from '@shared/schema';
import { storage } from '../storage';
import { generateToken } from '../middleware/auth';

const authRouter = Router();

// Validation schemas
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(3).max(100),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// User registration endpoint
authRouter.post('/register', async (req, res) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);
    
    // Create user with hashed password
    const newUser = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
      // Set default role if not provided
      role: validatedData.role || 'writer',
    });
    
    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
    
    // Update user's last login time
    await storage.updateUser(newUser.id, {
      lastLogin: new Date(),
      loginCount: 1,
    });
    
    // Record login activity
    await storage.recordUserActivity({
      userId: newUser.id,
      action: 'register',
      metadata: {
        method: 'email_password',
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Return user data and token (excluding password)
    const { password, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// User login endpoint
authRouter.post('/login', async (req, res) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(validatedData.username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: `Your account is ${user.status}. Please contact support.` });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    
    // Update user's last login time and increment login count
    await storage.updateUser(user.id, {
      lastLogin: new Date(),
      loginCount: (user.loginCount || 0) + 1,
    });
    
    // Record login activity
    await storage.recordUserActivity({
      userId: user.id,
      action: 'login',
      metadata: {
        method: 'email_password',
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Return user data and token (excluding password)
    const { password, ...userWithoutPassword } = user;
    return res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile endpoint (protected)
authRouter.get('/profile', async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile endpoint (protected)
authRouter.put('/profile', async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate update data using a subset of the user schema
    const updateProfileSchema = z.object({
      firstName: z.string().optional().nullable(),
      lastName: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      profileImage: z.string().optional().nullable(),
      preferences: z.any().optional(),
    });
    
    const validatedData = updateProfileSchema.parse(req.body);
    
    // If email is being updated, check if it's already in use
    if (validatedData.email && validatedData.email !== user.email) {
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Update user profile
    const updatedUser = await storage.updateUser(user.id, validatedData);
    
    // Record profile update activity
    await storage.recordUserActivity({
      userId: user.id,
      action: 'profile_update',
      metadata: {
        fieldsUpdated: Object.keys(validatedData),
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Return updated user data without password
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Change password endpoint (protected)
authRouter.post('/change-password', async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Validate password data
    const changePasswordSchema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8).max(100),
      confirmPassword: z.string().min(8).max(100),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
    
    const validatedData = changePasswordSchema.parse(req.body);
    
    // Retrieve user
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, salt);
    
    await storage.updateUser(user.id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
    
    // Record password change activity
    await storage.recordUserActivity({
      userId: user.id,
      action: 'password_change',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

export default authRouter;