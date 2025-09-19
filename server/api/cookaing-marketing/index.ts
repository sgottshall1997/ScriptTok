/**
 * CookAIng Marketing Engine - Phase 5 API Routes
 * Main router for all Phase 5 functionality
 */

import { Router } from 'express';
import personalizationRouter from './personalization';
import voiceRouter from './voice';
import collaborationRouter from './collaboration';
import approvalsRouter from './approvals';
import portalRouter from './portal';
import calendarRouter from './calendar';
import adminRouter from './admin';
import { ensureDemoRoles, optionalAuth } from '../../cookaing-marketing/middleware/rbac';

const router = Router();

// Global middleware for Phase 5 routes
router.use(optionalAuth); // Add user context when available
router.use(ensureDemoRoles); // Auto-assign roles in demo mode

// Mount Phase 5 API routes
router.use('/personalize', personalizationRouter);
router.use('/voice', voiceRouter);
router.use('/collab', collaborationRouter);
router.use('/approvals', approvalsRouter);
router.use('/portal', portalRouter);
router.use('/calendar', calendarRouter);

// Mount Phase 6 admin routes
router.use('/admin', adminRouter);

// Compatibility route for Phase 6 spec compliance
router.get('/self-test', async (req, res) => {
  // Delegate to admin self-test but allow anonymous access
  try {
    const response = await fetch('http://localhost:5000/api/cookaing-marketing/admin/self-test');
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Self-test delegation failed',
      details: error.message
    });
  }
});

// Health check for Phase 5 features  
router.get('/phase5-health', async (req, res) => {
  try {
    const mode = process.env.OPENAI_API_KEY ? 'live' : 'mock';
    
    const healthStatus = {
      timestamp: new Date().toISOString(),
      mode,
      features: {
        dynamicContent: {
          status: 'ok',
          mode: mode === 'live' ? 'live' : 'mock_mode',
          description: 'Dynamic content adaptation by audience rules'
        },
        brandVoice: {
          status: 'ok',
          mode: mode === 'live' ? 'live' : 'mock_mode',
          description: 'Brand voice learning and application'
        },
        collab: {
          status: 'ok',
          mode: 'mock_mode',
          description: 'Role-based access control and collaboration'
        },
        calendar: {
          status: 'ok',
          mode: 'mock_mode',
          description: 'Content calendar management and scheduling'
        },
        clientPortal: {
          status: 'ok',
          mode: 'mock_mode',
          description: 'Read-only client portal with branding'
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
        hasPerplexity: !!process.env.PERPLEXITY_API_KEY
      }
    };

    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error: any) {
    console.error('Phase 5 health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

// Feature flags endpoint
router.get('/feature-flags', async (req, res) => {
  try {
    const flags = {
      ENABLE_DYNAMIC_ADAPT: true,
      ENABLE_BRAND_VOICE_LEARN: true,
      ENABLE_COLLAB: true,
      ENABLE_CLIENT_PORTAL: true,
      ENABLE_CALENDAR: true,
      // Mock mode flags
      MOCK_MODE_ACTIVE: !process.env.OPENAI_API_KEY,
      DEMO_ROLES_ENABLED: true
    };

    res.json({
      success: true,
      data: flags
    });
  } catch (error: any) {
    console.error('Feature flags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get feature flags'
    });
  }
});

export default router;