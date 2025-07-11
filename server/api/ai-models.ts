import { Express } from 'express';
import { getAvailableModels } from '../services/aiModelRouter';

export function registerAIModelsRoutes(app: Express) {
  // Get available AI models
  app.get('/api/ai-models/available', async (req, res) => {
    try {
      const models = getAvailableModels();
      res.json(models);
    } catch (error) {
      console.error('Error fetching available AI models:', error);
      res.status(500).json({ 
        error: 'Failed to fetch available AI models',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test AI model availability
  app.post('/api/ai-models/test', async (req, res) => {
    try {
      const { model = 'chatgpt' } = req.body;
      
      // Import the appropriate service
      if (model === 'claude') {
        const { checkClaudeApiKey } = await import('../services/claude');
        const isAvailable = await checkClaudeApiKey();
        
        res.json({
          model: 'claude',
          available: isAvailable,
          message: isAvailable ? 'Claude API key is valid' : 'Claude API key is invalid or not set'
        });
      } else {
        // Default to ChatGPT
        const isAvailable = !!process.env.OPENAI_API_KEY;
        
        res.json({
          model: 'chatgpt',
          available: isAvailable,
          message: isAvailable ? 'OpenAI API key is valid' : 'OpenAI API key is not set'
        });
      }
    } catch (error) {
      console.error('Error testing AI model:', error);
      res.status(500).json({ 
        error: 'Failed to test AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}