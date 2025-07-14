import { Express } from 'express';
import { getAvailableModels } from '../services/aiModelRouter';

export function registerAIModelsRoutes(app: Express) {
  // Get available AI models
  app.get('/api/ai-models/available', async (req, res) => {
    try {
      const models = await getAvailableModels();
      
      // Return in the expected format for the frontend - Claude and ChatGPT
      const modelArray = [
        { id: 'claude', name: 'Claude', available: models.claude },
        { id: 'chatgpt', name: 'ChatGPT', available: models.chatgpt }
      ];
      
      res.json(modelArray);
    } catch (error) {
      console.error('Error fetching available AI models:', error);
      res.status(500).json({ 
        error: 'Failed to fetch available AI models',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test Claude AI model availability
  app.post('/api/ai-models/test', async (req, res) => {
    try {
      // Only test Claude - it's the only supported model
      const { checkClaudeApiKey } = await import('../services/claude');
      const isAvailable = await checkClaudeApiKey();
      
      res.json({
        model: 'claude',
        available: isAvailable,
        message: isAvailable ? 'Claude API key is valid' : 'Claude API key is invalid or not set'
      });
    } catch (error) {
      console.error('Error testing Claude AI model:', error);
      res.status(500).json({ 
        error: 'Failed to test Claude AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}