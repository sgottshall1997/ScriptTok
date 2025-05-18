import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { AuthRequest } from '../middleware/auth';
import { createOrUpdateUserPreferencesSchema } from '../../shared/schema';

// Create router
export const preferencesRouter = Router();

/**
 * @route   GET /api/preferences
 * @desc    Get user preferences
 * @access  Private
 */
preferencesRouter.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;
    
    // Get user preferences
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences) {
      // If no preferences found, return default values
      return res.json({
        defaultNiche: null,
        defaultContentType: null,
        defaultTone: null,
        defaultModel: null
      });
    }
    
    return res.json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/preferences/update
 * @desc    Update user preferences
 * @access  Private
 */
preferencesRouter.post('/update', async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;
    
    // Validate request body
    const validationResult = createOrUpdateUserPreferencesSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: validationResult.error.format() 
      });
    }
    
    const preferenceData = validationResult.data;
    
    // Check if user already has preferences
    const existingPreferences = await storage.getUserPreferences(userId);
    
    let updatedPreferences;
    
    if (existingPreferences) {
      // Update existing preferences
      updatedPreferences = await storage.updateUserPreferences(userId, {
        ...preferenceData
      });
    } else {
      // Create new preferences
      updatedPreferences = await storage.createUserPreferences({
        userId,
        ...preferenceData
      });
    }
    
    // Log user activity
    await storage.logUserActivity({
      userId,
      action: 'update_preferences',
      metadata: { preferences: preferenceData },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});