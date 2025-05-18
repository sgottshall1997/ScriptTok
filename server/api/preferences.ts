import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";

// Get user preferences
export async function getUserPreferences(req: Request, res: Response) {
  try {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    
    return res.status(200).json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return res.status(500).json({ message: "Error fetching user preferences" });
  }
}

// Create or update user preferences
export async function saveUserPreferences(req: Request, res: Response) {
  try {
    // Validate request body
    const schema = z.object({
      userId: z.number(),
      defaultNiche: z.string().nullable(),
      defaultContentType: z.string().nullable(),
      defaultTone: z.string().nullable(),
      defaultModel: z.string().nullable(),
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid request body", 
        errors: validationResult.error.errors 
      });
    }
    
    const { userId, ...preferencesData } = validationResult.data;
    
    // Convert undefined to null for compatibility with our schema
    const nullSafeData = {
      defaultNiche: preferencesData.defaultNiche === undefined ? null : preferencesData.defaultNiche,
      defaultContentType: preferencesData.defaultContentType === undefined ? null : preferencesData.defaultContentType,
      defaultTone: preferencesData.defaultTone === undefined ? null : preferencesData.defaultTone,
      defaultModel: preferencesData.defaultModel === undefined ? null : preferencesData.defaultModel
    };
    
    // Check if user preferences already exist
    const existingPreferences = await storage.getUserPreferences(userId);
    
    let preferences;
    
    if (existingPreferences) {
      // Update existing preferences
      preferences = await storage.updateUserPreferences(userId, nullSafeData);
    } else {
      // Create new preferences
      preferences = await storage.createUserPreferences({
        userId,
        ...nullSafeData
      });
    }
    
    return res.status(200).json(preferences);
  } catch (error) {
    console.error("Error saving user preferences:", error);
    return res.status(500).json({ message: "Error saving user preferences" });
  }
}

// Update user preferences
export async function updateUserPreferences(req: Request, res: Response) {
  try {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Validate request body
    const schema = z.object({
      defaultNiche: z.string().nullable(),
      defaultContentType: z.string().nullable(),
      defaultTone: z.string().nullable(),
      defaultModel: z.string().nullable(),
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid request body", 
        errors: validationResult.error.errors 
      });
    }
    
    const preferencesData = validationResult.data;
    
    // Convert undefined to null for compatibility with our schema
    const nullSafeData = {
      defaultNiche: preferencesData.defaultNiche === undefined ? null : preferencesData.defaultNiche,
      defaultContentType: preferencesData.defaultContentType === undefined ? null : preferencesData.defaultContentType,
      defaultTone: preferencesData.defaultTone === undefined ? null : preferencesData.defaultTone,
      defaultModel: preferencesData.defaultModel === undefined ? null : preferencesData.defaultModel
    };
    
    // Update preferences
    const preferences = await storage.updateUserPreferences(userId, nullSafeData);
    
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    
    return res.status(200).json(preferences);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return res.status(500).json({ message: "Error updating user preferences" });
  }
}