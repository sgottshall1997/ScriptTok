import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { 
  updateUserPreferencesSchema, 
  userPreferences 
} from '@shared/schema';
import { AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get user preferences
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const userId = req.user.id;
    const userPrefs = await storage.getUserPreferences(userId);
    
    if (!userPrefs) {
      return res.status(200).json({
        defaultNiche: null,
        defaultContentType: null,
        defaultTone: null,
        defaultModel: null
      });
    }

    res.json(userPrefs);
  } catch (error) {
    console.error("Error getting user preferences:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get user preferences", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Update user preferences
router.post('/update', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const userId = req.user.id;
    
    // Validate request body
    const validationResult = updateUserPreferencesSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid preferences data',
        details: validationResult.error.format()
      });
    }
    
    const preferences = validationResult.data;
    
    // Check if user already has preferences
    const existingPrefs = await storage.getUserPreferences(userId);
    
    if (existingPrefs) {
      // Update existing preferences
      const updatedPrefs = await storage.updateUserPreferences(userId, preferences);
      return res.json(updatedPrefs);
    } else {
      // Create new preferences
      const newPrefs = await storage.createUserPreferences({
        userId,
        ...preferences
      });
      return res.json(newPrefs);
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update user preferences", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as preferencesRouter };