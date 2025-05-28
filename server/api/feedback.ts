import type { Express } from "express";
import { logFeedback, updateUserFeedback, trackClick, getFeedbackData, getFeedbackAnalytics } from "../database/feedbackLogger";

export function setupFeedbackRoutes(app: Express): void {
  // Log new feedback entry when content is generated
  app.post('/api/feedback/log', async (req, res) => {
    try {
      const { productName, templateType, tone, generatedOutput } = req.body;
      
      if (!productName || !templateType || !tone || !generatedOutput) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: productName, templateType, tone, generatedOutput'
        });
      }

      const feedbackId = await logFeedback(productName, templateType, tone, generatedOutput);
      
      res.json({
        success: true,
        data: {
          feedbackId,
          message: 'Feedback logged successfully'
        }
      });
    } catch (error) {
      console.error('Error logging feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to log feedback'
      });
    }
  });

  // Main feedback endpoint - handles all user interactions
  app.post('/api/feedback/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { userPick, starRating, incrementClick } = req.body;

      // Validate input
      if (userPick !== undefined && typeof userPick !== 'boolean') {
        return res.status(400).json({ 
          success: false,
          error: 'userPick must be a boolean' 
        });
      }

      if (starRating !== undefined && (typeof starRating !== 'number' || starRating < 1 || starRating > 5)) {
        return res.status(400).json({ 
          success: false,
          error: 'starRating must be a number between 1 and 5' 
        });
      }

      let changes = 0;
      let message = '';

      // Handle click tracking
      if (incrementClick) {
        changes = await trackClick(parseInt(id));
        message = 'Click tracked successfully';
      } else {
        // Handle user feedback updates
        const updates: any = {};
        if (userPick !== undefined) updates.userPick = userPick;
        if (starRating !== undefined) updates.starRating = starRating;
        
        changes = await updateUserFeedback(parseInt(id), updates);
        message = 'Feedback updated successfully';
      }
      
      if (changes === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Feedback entry not found' 
        });
      }

      res.json({ 
        success: true, 
        data: {
          changes,
          message
        }
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update feedback' 
      });
    }
  });

  // Legacy PATCH endpoint for backward compatibility
  app.patch('/api/feedback/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const changes = await updateUserFeedback(parseInt(id), updates);
      
      res.json({
        success: true,
        data: {
          changes,
          message: 'Feedback updated successfully'
        }
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update feedback'
      });
    }
  });

  // Track click count
  app.post('/api/feedback/:id/click', async (req, res) => {
    try {
      const { id } = req.params;
      
      const changes = await trackClick(parseInt(id));
      
      res.json({
        success: true,
        data: {
          changes,
          message: 'Click tracked successfully'
        }
      });
    } catch (error) {
      console.error('Error tracking click:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track click'
      });
    }
  });

  // Get feedback data with optional filters
  app.get('/api/feedback', async (req, res) => {
    try {
      const filters = req.query;
      
      const feedbackData = await getFeedbackData(filters);
      
      res.json({
        success: true,
        data: {
          feedback: feedbackData,
          count: feedbackData.length
        }
      });
    } catch (error) {
      console.error('Error retrieving feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve feedback'
      });
    }
  });

  // Get feedback analytics
  app.get('/api/feedback/analytics', async (req, res) => {
    try {
      const analytics = await getFeedbackAnalytics();
      
      res.json({
        success: true,
        data: {
          analytics
        }
      });
    } catch (error) {
      console.error('Error retrieving analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics'
      });
    }
  });
}