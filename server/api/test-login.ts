import { Request, Response } from "express";
import { storage } from "../storage";

export async function handleTestLogin(req: Request, res: Response) {
  try {
    // Check if test user exists
    let user = await storage.getUserByUsername('testuser');
    
    if (!user) {
      // Create a test user if it doesn't exist
      user = await storage.createUser({
        username: 'testuser',
        password: 'test-password-hashed', // In real app, this would be hashed
        email: 'test@example.com',
        role: 'writer',
        firstName: 'Test',
        lastName: 'User',
        profileImage: null,
        status: 'active',
        lastLogin: new Date(),
        loginCount: 1,
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Created test user:', user);
    } else {
      // Update login information
      user = await storage.updateUser(user.id, {
        lastLogin: new Date(),
        loginCount: (user.loginCount || 0) + 1,
      });
    }
    
    // Set session information (simplified for testing)
    req.session.userId = user.id;
    
    // Return user information (exclude sensitive data)
    const { password, ...userInfo } = user;
    return res.status(200).json(userInfo);
  } catch (error) {
    console.error('Test login error:', error);
    return res.status(500).json({
      message: 'Test login failed',
      error: error.message
    });
  }
}