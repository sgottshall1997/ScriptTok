import express from 'express';
import { storage } from '../storage';
import { insertContentHistorySchema, contentHistory } from '@shared/schema';
import { z } from 'zod';
import { db } from '../db';
import { getQuotaService } from '../services/quotaService';

const router = express.Router();
const quotaService = getQuotaService(storage);

// GET /api/history - Get content history with tier-based filtering
router.get('/', async (req, res) => {
  try {
    // Get user ID from authGuard middleware
    const userId = req.internalUserId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - user ID not found'
      });
    }

    // Get user's tier
    const userTier = await quotaService.getUserTier(userId);
    const isStarterUser = userTier === 'starter';
    
    // Starter users only see last 10, higher tiers see more
    const limit = isStarterUser ? 10 : (req.query.limit ? parseInt(req.query.limit as string) : 50);
    
    // Get history filtered by user ID
    const history = await storage.getUserContentHistory(userId, limit);
    
    res.json({
      success: true,
      history,
      tier: userTier,
      isLimited: isStarterUser,
      pagination: {
        limit,
        total: history.length
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

// GET /api/history/:id - Get content history by id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid ID parameter'
      });
    }
    
    const historyItem = await storage.getContentHistoryById(id);
    
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

// GET /api/history/niche/:niche - Get content history by niche
router.get('/niche/:niche', async (req, res) => {
  try {
    const niche = req.params.niche;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const history = await storage.getContentHistoryByNiche(niche, limit, offset);
    
    res.json({
      success: true,
      history,
      pagination: {
        limit,
        offset,
        total: history.length
      }
    });
  } catch (error: any) {
    console.error(`Error fetching content history for niche ${req.params.niche}:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content history by niche',
      message: error.message
    });
  }
});

// GET /api/history/user/:userId - Get content history by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user ID parameter'
      });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const history = await storage.getContentHistoryByUserId(userId, limit, offset);
    
    res.json({
      success: true,
      history,
      pagination: {
        limit,
        offset,
        total: history.length
      }
    });
  } catch (error: any) {
    console.error(`Error fetching content history for user #${req.params.userId}:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content history by user',
      message: error.message
    });
  }
});

// POST /api/history - Save content history
router.post('/', async (req, res) => {
  try {
    // Validate request body against schema
    const result = insertContentHistorySchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body',
        issues: result.error.format()
      });
    }
    
    const contentHistoryData = result.data;
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

// DELETE /api/history/:id - Delete content history entry
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }
    
    await storage.deleteContentHistory(id);
    
    res.json({
      success: true,
      message: 'Content history entry deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting content history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete content history entry',
      message: error.message
    });
  }
});

export const historyRouter = router;