import express from 'express';
import { storage } from '../storage';
import { insertContentHistorySchema, contentHistory } from '@shared/schema';
import { z } from 'zod';
import { db } from '../db';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/supabaseAuth';
import { getUserIdFromSupabaseId } from '../middleware/supabaseUserHelper';

const router = express.Router();

// GET /api/history - Get all content history with pagination (filtered by authenticated user)
router.get('/', isAuthenticated, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const userId = await getUserIdFromSupabaseId(req.userId, req.user?.email);
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const history = await storage.getContentHistory(userId, limit);
    
    res.json({
      success: true,
      history,
      pagination: {
        limit,
        offset,
        total: history.length // In a real app, we would have a count query
      }
    });
  } catch (error: any) {
    console.error('Error fetching content history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content history',
      message: error.message
    });
  }
});

// Clear all content history
router.post("/clear-all", async (req, res) => {
  try {
    // Delete all content history entries from database
    await db.delete(contentHistory);
    
    console.log('✅ All content history cleared from database');
    
    res.json({
      success: true,
      message: "All content history has been cleared"
    });
  } catch (error) {
    console.error('❌ Error clearing content history:', error);
    res.status(500).json({
      success: false,
      error: "Failed to clear content history"
    });
  }
});

// GET /api/history/:id - Get content history by id (filtered by authenticated user)
router.get('/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const userId = await getUserIdFromSupabaseId(req.userId, req.user?.email);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid ID parameter'
      });
    }
    
    const historyItem = await storage.getContentHistoryById(id, userId);
    
    if (!historyItem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Content history item not found'
      });
    }
    
    res.json({
      success: true,
      history: historyItem
    });
  } catch (error: any) {
    console.error(`Error fetching content history item #${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content history item',
      message: error.message
    });
  }
});

// POST /api/history - Save content history (protected)
router.post('/', isAuthenticated, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const userId = await getUserIdFromSupabaseId(req.userId, req.user?.email);
    
    // Validate request body against schema
    const result = insertContentHistorySchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body',
        issues: result.error.format()
      });
    }
    
    // Ensure userId is set from authenticated user
    const contentHistoryData = {
      ...result.data,
      userId
    };
    const savedHistory = await storage.saveContentHistory(contentHistoryData);
    
    res.status(201).json({
      success: true,
      history: savedHistory
    });
  } catch (error: any) {
    console.error('Error saving content history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save content history',
      message: error.message
    });
  }
});

export const historyRouter = router;