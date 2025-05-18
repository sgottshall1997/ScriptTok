import express from 'express';
import { storage } from '../storage';
import { insertContentHistorySchema } from '@shared/schema';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/history - Get content history with pagination (filtered by user permission)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // If user is admin, show all history; otherwise only show their own
    let history;
    if (req.user && req.user.role === 'admin') {
      history = await storage.getAllContentHistory(limit, offset);
    } else if (req.user) {
      history = await storage.getContentHistoryByUserId(req.user.id, limit, offset);
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
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
    console.error('Error fetching content history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content history',
      message: error.message
    });
  }
});

// GET /api/history/:id - Get content history by id (with permission check)
router.get('/:id', async (req: AuthRequest, res) => {
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
    
    // Permission check: users can only view their own history unless they're admins
    if (req.user && (req.user.role === 'admin' || historyItem.userId === req.user.id)) {
      return res.json({
        success: true,
        history: historyItem
      });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You do not have permission to view this content history item'
      });
    }
  } catch (error: any) {
    console.error(`Error fetching content history item #${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content history item',
      message: error.message
    });
  }
});

// GET /api/history/niche/:niche - Get content history by niche (with permission check)
router.get('/niche/:niche', async (req: AuthRequest, res) => {
  try {
    const niche = req.params.niche;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // If user is admin, get all content for the niche; otherwise filter by user ID
    let history;
    if (req.user && req.user.role === 'admin') {
      history = await storage.getContentHistoryByNiche(niche, limit, offset);
    } else if (req.user) {
      // Need to get content filtered by both user ID and niche
      history = await storage.getContentHistoryByUserIdAndNiche(req.user.id, niche, limit, offset);
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
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

// GET /api/history/user/:userId - Get content history by user ID (with permission check)
router.get('/user/:userId', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user ID parameter'
      });
    }
    
    // Permission check: users can only view their own history unless they're admins
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You do not have permission to view another user\'s content history'
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

// POST /api/history - Save content history with authenticated user ID
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required to save content history' 
      });
    }
    
    // Validate request body against schema
    const result = insertContentHistorySchema.safeParse({
      ...req.body,
      userId: req.user.id // Ensure the history is associated with the logged in user
    });
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body',
        issues: result.error.format()
      });
    }
    
    const contentHistoryData = result.data;
    const savedHistory = await storage.saveContentHistory(contentHistoryData);
    
    // Record user activity
    await storage.logUserActivity({
      userId: req.user.id,
      action: 'content_generation',
      metadata: { 
        contentHistoryId: savedHistory.id,
        niche: savedHistory.niche,
        contentType: savedHistory.contentType
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']?.toString()
    });
    
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