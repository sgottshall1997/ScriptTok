import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import { generateContentRouter } from './generateContent';
import { historyRouter } from './history';
import { webhooksRouter } from './webhooks';
import { usageSummaryRouter } from './usageSummary';
import { analyticsRouter } from './analytics/index';
import { aiModelConfigRouter } from './aiModelConfig';
import { apiIntegrationRouter } from './apiIntegration';

// Create router for protected routes
const protectedRouter = Router();

// Apply authentication middleware to all routes
protectedRouter.use(authenticateToken);

// Content generation - requires authentication
protectedRouter.use('/generate', generateContentRouter);

// Content history - requires authentication
protectedRouter.use('/history', historyRouter);

// Webhooks configuration - requires authentication
protectedRouter.use('/webhooks', webhooksRouter);

// Usage summary - requires authentication
protectedRouter.use('/usage-summary', usageSummaryRouter);

// Analytics - requires authentication
protectedRouter.use('/analytics', analyticsRouter);

// AI Model configuration - requires admin role
protectedRouter.use('/ai-model-config', authorize(['admin']), aiModelConfigRouter);

// API Integrations - requires authentication
protectedRouter.use('/integrations', apiIntegrationRouter);

export default protectedRouter;