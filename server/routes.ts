import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateContentRouter } from "./api/generateContent";
import { trendingRouter } from "./api/trending";
import { analyticsRouter } from "./api/analytics";
import { templateTestRouter } from "./api/templateTest";
import { templateRouter } from "./api/templates";
import { scraperStatusRouter } from "./api/scraperStatus";
import { customTemplateTestRouter } from "./api/customTemplateTest";
import { aiModelConfigRouter } from "./api/aiModelConfig";
import { hashtagEmojiRouter } from "./api/hashtagEmoji";
import { socialMediaOptimizationRouter } from "./api/socialMediaOptimization";
import { videoScriptRouter } from "./api/videoScript";
import { claudeContentRouter } from "./api/claudeContent";
import { trendingEmojisHashtagsRouter } from "./api/trendingEmojisHashtags";
import apiIntegrationRouter from "./api/apiIntegration";
import optionsRouter from "./api/options";
import { historyRouter } from "./api/history";
import { usageSummaryRouter } from "./api/usageSummary";
import { webhooksRouter } from "./api/webhooks";
import { webhookTestRouter } from "./api/webhook-test";
import authRouter from "./api/auth";
import protectedRouter from "./api/protected-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register API routes
  
  // Direct test route for preferences that bypasses React routing
  app.get('/test-preferences-direct', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>User Preferences Test</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f8fa;
        }
        h1 { color: #333; }
        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          padding: 25px;
          margin-bottom: 20px;
        }
        label { 
          display: block; 
          margin-bottom: 6px;
          font-weight: 500;
        }
        select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 16px;
        }
        button {
          background-color: #5469d4;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
        }
        button:hover {
          background-color: #4054b4;
        }
        .description {
          font-size: 14px;
          color: #666;
          margin-top: -10px;
          margin-bottom: 15px;
        }
        .footer {
          text-align: center;
          color: #888;
          font-size: 14px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>User Preferences Test</h1>
        <p>This is a test page for setting default preferences for content generation.</p>
        
        <form id="preferences-form">
          <div>
            <label for="niche">Default Niche</label>
            <select id="niche" required>
              <option value="">Select your preferred niche</option>
              <option value="skincare">Skincare</option>
              <option value="tech">Tech</option>
              <option value="fashion">Fashion</option>
              <option value="fitness">Fitness</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="pets">Pets</option>
            </select>
            <p class="description">The default industry to focus on when generating content.</p>
          </div>
          
          <div>
            <label for="contentType">Default Content Type</label>
            <select id="contentType" required>
              <option value="">Select your preferred content type</option>
              <option value="social_post">Social Post</option>
              <option value="product_description">Product Description</option>
              <option value="article">Article</option>
              <option value="email">Email</option>
              <option value="ad_copy">Ad Copy</option>
            </select>
            <p class="description">The default type of content you want to generate.</p>
          </div>
          
          <div>
            <label for="tone">Default Tone</label>
            <select id="tone" required>
              <option value="">Select your preferred tone</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="informative">Informative</option>
              <option value="persuasive">Persuasive</option>
            </select>
            <p class="description">The default tone or voice for your generated content.</p>
          </div>
          
          <div>
            <label for="model">Preferred AI Model</label>
            <select id="model" required>
              <option value="">Select your preferred AI model</option>
              <option value="gpt-4o">GPT-4o (OpenAI)</option>
              <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet (Anthropic)</option>
            </select>
            <p class="description">Your preferred AI model for generating content.</p>
          </div>
          
          <button type="submit">Save Preferences</button>
        </form>
      </div>
      
      <div class="footer">
        This is a test page only. No data will be saved to the database.
      </div>
      
      <script>
        document.getElementById('preferences-form').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const niche = document.getElementById('niche').value;
          const contentType = document.getElementById('contentType').value;
          const tone = document.getElementById('tone').value;
          const model = document.getElementById('model').value;
          
          alert(
            'Test Mode: These preferences would be saved:\\n\\n' +
            'Niche: ' + niche + '\\n' +
            'Content Type: ' + contentType + '\\n' +
            'Tone: ' + tone + '\\n' +
            'AI Model: ' + model
          );
        });
      </script>
    </body>
    </html>
    `);
  });

  // Authentication routes (non-protected)
  app.use('/api/auth', authRouter);
  
  // Public routes that don't require authentication
  app.use('/api/trending', trendingRouter);
  
  // Direct trending products endpoint for dashboard
  app.get('/api/trending/products', async (req, res) => {
    try {
      const { getRefreshedTrendingProducts } = require('./services/trendRefresher');
      const trendingProducts = await getRefreshedTrendingProducts();
      res.json(trendingProducts);
    } catch (error) {
      console.error("Error fetching trending products:", error);
      res.status(500).json({ error: "Failed to fetch trending products" });
    }
  });
  
  app.use('/api/template-test', templateTestRouter);
  app.use('/api/templates', templateRouter);
  app.use('/api/scraper-status', scraperStatusRouter);
  app.use('/api/hashtag-emoji', hashtagEmojiRouter);
  app.use('/api/trending-emojis-hashtags', trendingEmojisHashtagsRouter);
  app.use('/api/options', optionsRouter);
  
  // User preferences routes
  app.get('/api/preferences', (req, res) => {
    const { getUserPreferences } = require('./api/preferences');
    getUserPreferences(req, res);
  });
  
  app.post('/api/preferences', (req, res) => {
    const { saveUserPreferences } = require('./api/preferences');
    saveUserPreferences(req, res);
  });
  
  app.patch('/api/preferences', (req, res) => {
    const { updateUserPreferences } = require('./api/preferences');
    updateUserPreferences(req, res);
  });
  
  // Test login route for development
  app.post('/api/test-login', (req, res) => {
    const { handleTestLogin } = require('./api/test-login');
    handleTestLogin(req, res);
  });
  
  // Apply protected routes (requires authentication)
  app.use('/api', protectedRouter);
  
  // These routes are now handled through the protected router
  // app.use('/api/generate', generateContentRouter);
  // app.use('/api/analytics', analyticsRouter);
  // app.use('/api/custom-template', customTemplateTestRouter);
  // app.use('/api/ai-model-config', aiModelConfigRouter);
  // app.use('/api/social-media-optimization', socialMediaOptimizationRouter);
  // app.use('/api/video-script', videoScriptRouter);
  // app.use('/api/claude-content', claudeContentRouter);
  // app.use('/api/integrations', apiIntegrationRouter);
  // app.use('/api/history', historyRouter);
  // app.use('/api/usage-summary', usageSummaryRouter);
  // app.use('/api/webhooks', webhooksRouter);
  // app.use('/api/webhooks/test', webhookTestRouter);
  
  // Get scraper health endpoint
  app.get('/api/scraper-health', async (req, res) => {
    try {
      const scraperHealth = await storage.getScraperStatus();
      res.json(scraperHealth);
    } catch (error) {
      console.error("Error fetching scraper health:", error);
      res.status(500).json({ error: "Failed to fetch scraper health" });
    }
  });
  
  // Get API usage endpoint
  app.get('/api/usage', async (req, res) => {
    try {
      const apiUsage = await storage.getApiUsage();
      const today = await storage.getTodayApiUsage();
      const weeklyUsage = await storage.getWeeklyApiUsage();
      const monthlyUsage = await storage.getMonthlyApiUsage();
      
      res.json({
        today,
        weekly: weeklyUsage,
        monthly: monthlyUsage,
        limit: 500 // Monthly limit
      });
    } catch (error) {
      console.error("Error fetching API usage:", error);
      res.status(500).json({ error: "Failed to fetch API usage" });
    }
  });
  
  // Analytics endpoints are now handled by analyticsRouter

  const httpServer = createServer(app);
  return httpServer;
}
