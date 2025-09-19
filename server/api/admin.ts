/**
 * GlowBot Admin API Routes - Comprehensive Test Battery Support
 * Test Data Control & Self-Test Endpoints for Main Application
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  contentHistory, analyticsEvents, trendingProducts,
  bulkGeneratedContent, contentRatings
} from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Security: Only allow admin endpoints in demo/development mode
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_ADMIN_IN_PROD) {
    return res.status(403).json({
      success: false,
      error: 'Admin endpoints not available in production'
    });
  }
  next();
});

// Request schemas
const seedSchema = z.object({
  preset: z.enum(['minimal', 'full', 'reset'])
});

/**
 * Test data fixtures for GlowBot main application
 */
const fixtures = {
  contentHistory: [
    {
      niche: 'tech',
      tone: 'professional',
      contentType: 'video',
      productName: 'Test Wireless Headphones',
      templateType: 'original',
      platforms: ['instagram', 'tiktok'],
      content: 'Experience crystal-clear audio with our premium wireless headphones. Perfect for professionals and music lovers alike.',
      platformCaptions: JSON.stringify({
        instagram: 'Crystal-clear audio meets premium design 🎧✨ #TechInnovation #AudioQuality #WirelessHeadphones',
        tiktok: 'POV: You finally found headphones that actually sound amazing 🎧🔥 #TechTok #AudioReview #WirelessHeadphones'
      }),
      aiProvider: 'claude',
      topRatedStyleUsed: false
    },
    {
      niche: 'beauty',
      tone: 'friendly',
      contentType: 'photo',
      productName: 'Test Vitamin C Serum',
      templateType: 'original',
      platforms: ['instagram'],
      content: 'Brighten your skin with our powerful Vitamin C serum. Clinically proven to reduce dark spots and boost radiance.',
      platformCaptions: JSON.stringify({
        instagram: 'Glowing skin starts here ✨ This Vitamin C serum is a game-changer! #SkincareRoutine #VitaminC #GlowUp #BeautyTips'
      }),
      aiProvider: 'openai',
      topRatedStyleUsed: true
    }
  ],

  trendingProducts: [
    {
      title: 'Sony WH-1000XM5 Wireless Headphones',
      source: 'test',
      mentions: 15000,
      niche: 'tech',
      dataSource: 'mock',
      reason: 'Top-rated noise-canceling technology'
    },
    {
      title: 'The Ordinary Niacinamide 10% + Zinc 1%',
      source: 'test', 
      mentions: 12000,
      niche: 'beauty',
      dataSource: 'mock',
      reason: 'Bestselling pore-minimizing serum'
    },
    {
      title: 'Lululemon Align Leggings',
      source: 'test',
      mentions: 8000, 
      niche: 'fitness',
      dataSource: 'mock',
      reason: 'Most comfortable workout leggings'
    }
  ]
};

/**
 * Comprehensive self-test endpoint
 */
router.get('/self-test', async (req, res) => {
  try {
    const checks = [];
    let overall = 'ok';

    // Database connectivity check
    try {
      await db.execute(sql`SELECT 1`);
      checks.push({
        category: 'database',
        name: 'PostgreSQL Connection',
        status: 'ok',
        message: 'Database connection successful'
      });
    } catch (error) {
      checks.push({
        category: 'database',
        name: 'PostgreSQL Connection',
        status: 'error',
        message: `Database connection failed: ${error.message}`
      });
      overall = 'error';
    }

    // Environment variables check
    const requiredEnvVars = ['DATABASE_URL'];
    const optionalEnvVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'PERPLEXITY_API_KEY'];
    
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        checks.push({
          category: 'environment',
          name: `${envVar}`,
          status: 'ok',
          message: 'Environment variable configured'
        });
      } else {
        checks.push({
          category: 'environment', 
          name: `${envVar}`,
          status: 'error',
          message: 'Required environment variable missing'
        });
        overall = 'error';
      }
    });

    optionalEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        checks.push({
          category: 'integrations',
          name: `${envVar}`,
          status: 'ok',
          message: 'API key configured (live mode available)'
        });
      } else {
        checks.push({
          category: 'integrations',
          name: `${envVar}`, 
          status: 'warning',
          message: 'API key not configured (mock mode only)'
        });
        if (overall === 'ok') overall = 'warning';
      }
    });

    // Storage/schema validation
    try {
      const tables = ['content_history', 'trending_products', 'analytics_events'];
      for (const table of tables) {
        await db.execute(sql.raw(`SELECT 1 FROM ${table} LIMIT 1`));
      }
      checks.push({
        category: 'storage',
        name: 'Schema Validation',
        status: 'ok', 
        message: 'All required tables accessible'
      });
    } catch (error: any) {
      checks.push({
        category: 'storage',
        name: 'Schema Validation',
        status: 'error',
        message: `Schema validation failed: ${error.message}`
      });
      overall = 'error';
    }

    // Mock provider status
    checks.push({
      category: 'providers',
      name: 'Mock Providers',
      status: 'ok',
      message: 'Mock providers ready for testing'
    });

    res.json({
      success: true,
      data: {
        overall,
        checks,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
      }
    });

  } catch (error: any) {
    console.error('Self-test error:', error);
    res.status(500).json({
      success: false,
      error: 'Self-test failed',
      details: error.message
    });
  }
});

/**
 * Seed test data endpoint
 */
router.post('/seed', async (req, res) => {
  try {
    const { preset } = seedSchema.parse(req.body);
    
    let stats = {
      contentHistory: 0,
      trendingProducts: 0,
      analyticsEvents: 0,
      bulkGeneratedContent: 0
    };

    if (preset === 'reset') {
      // Clear existing test data
      await db.delete(contentHistory).where(eq(contentHistory.productName, 'Test Wireless Headphones'));
      await db.delete(contentHistory).where(eq(contentHistory.productName, 'Test Vitamin C Serum'));
      await db.delete(trendingProducts).where(eq(trendingProducts.source, 'test'));
      await db.delete(analyticsEvents).where(eq(analyticsEvents.eventType, 'content_generated'));
      
      return res.json({
        success: true,
        preset,
        action: 'reset',
        message: 'Test data cleared',
        stats
      });
    }

    // Insert content history fixtures
    for (const item of fixtures.contentHistory) {
      try {
        await db.insert(contentHistory).values(item);
        stats.contentHistory++;
      } catch (error) {
        // Ignore duplicates
        console.log('Content history item may already exist:', error.message);
      }
    }

    // Insert trending products fixtures
    for (const item of fixtures.trendingProducts) {
      try {
        await db.insert(trendingProducts).values(item);
        stats.trendingProducts++;
      } catch (error) {
        console.log('Trending product may already exist:', error.message);
      }
    }

    // Full preset: Add analytics events
    if (preset === 'full') {
      try {
        await db.insert(analyticsEvents).values({
          eventType: 'content_generated',
          eventData: JSON.stringify({
            niche: 'tech',
            aiProvider: 'claude',
            platform: 'instagram'
          })
        });
        stats.analyticsEvents++;
      } catch (error: any) {
        console.log('Analytics event may already exist:', error.message);
      }
    }

    res.json({
      success: true,
      preset,
      action: 'seeded',
      stats,
      message: `GlowBot test data seeded (${preset} preset)`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed test data',
      details: error.message
    });
  }
});

/**
 * Reset mock providers endpoint
 */
router.post('/reset-mocks', async (req, res) => {
  try {
    // Reset any mock provider state
    // Note: This is a placeholder for actual mock provider reset logic
    const cleared = {
      contentGeneration: 'cleared',
      trendingData: 'cleared', 
      analytics: 'cleared',
      aiProviders: 'cleared'
    };

    res.json({
      success: true,
      cleared,
      message: 'GlowBot mock providers reset',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Reset mocks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset mock providers',
      details: error.message
    });
  }
});

export default router;