import { Router, Request, Response, NextFunction } from 'express';
import { observabilityService, logger } from '../../services/observability.service';

/**
 * Observability API Endpoints for CookAIng Marketing Engine
 * 
 * Provides comprehensive access to logs, metrics, errors, and system health data.
 * Integrates with the centralized ObservabilityService for Phase 6 monitoring.
 */

const router = Router();

// Authentication middleware for observability endpoints
router.use((req: Request, res: Response, next: NextFunction) => {
  // Skip auth in development for easier testing
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const adminKey = req.headers['x-admin-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const expectedKey = process.env.ADMIN_API_KEY || process.env.COOKAING_SECTION_PASSWORD;

  if (!expectedKey) {
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error: No admin authentication configured' 
    });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(403).json({ 
      success: false, 
      error: 'Unauthorized: Admin access required' 
    });
  }

  next();
});

/**
 * GET /api/cookaing-marketing/observability/health
 * Get comprehensive system health status
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const health = observabilityService.getSystemHealth();
    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'health_endpoint', 'Failed to get system health', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system health',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/cookaing-marketing/observability/logs
 * Get filtered logs with pagination
 */
router.get('/logs', (req: Request, res: Response) => {
  try {
    const { level, service, component, limit } = req.query;
    
    const filters = {
      level: level as string,
      service: service as string,
      component: component as string,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const logs = observabilityService.getLogs(filters);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'logs_endpoint', 'Failed to get logs', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logs',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/cookaing-marketing/observability/metrics
 * Get performance metrics with filtering
 */
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const { name, service, limit } = req.query;
    
    const filters = {
      name: name as string,
      service: service as string,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const metrics = observabilityService.getMetrics(filters);
    
    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'metrics_endpoint', 'Failed to get metrics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/cookaing-marketing/observability/errors
 * Get error tracking data
 */
router.get('/errors', (req: Request, res: Response) => {
  try {
    const { severity, service, resolved, limit } = req.query;
    
    const filters = {
      severity: severity as string,
      service: service as string,
      resolved: resolved ? resolved === 'true' : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const errors = observabilityService.getErrors(filters);
    
    res.json({
      success: true,
      data: errors,
      count: errors.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'errors_endpoint', 'Failed to get errors', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve errors',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * PUT /api/cookaing-marketing/observability/errors/:errorId/resolve
 * Mark an error as resolved
 */
router.put('/errors/:errorId/resolve', (req: Request, res: Response) => {
  try {
    const { errorId } = req.params;
    const { resolvedBy } = req.body;

    observabilityService.resolveError(errorId, resolvedBy);
    
    res.json({
      success: true,
      message: `Error ${errorId} marked as resolved`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'resolve_error_endpoint', 'Failed to resolve error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to resolve error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/cookaing-marketing/observability/analytics
 * Get comprehensive analytics and reporting
 */
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const { timeRange } = req.query;
    const range = (timeRange as 'hour' | 'day' | 'week') || 'day';
    
    const analytics = observabilityService.getAnalytics(range);
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'analytics_endpoint', 'Failed to get analytics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/cookaing-marketing/observability/alerts
 * Get alert rules and status
 */
router.get('/alerts', (req: Request, res: Response) => {
  try {
    const alerts = observabilityService.getAlerts();
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'alerts_endpoint', 'Failed to get alerts', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alerts',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/cookaing-marketing/observability/alerts
 * Create new alert rule
 */
router.post('/alerts', (req: Request, res: Response) => {
  try {
    const { name, condition, severity, enabled } = req.body;
    
    if (!name || !condition || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, condition, severity',
        timestamp: new Date().toISOString()
      });
    }

    const alertId = observabilityService.addAlertRule({
      name,
      condition,
      severity,
      enabled: enabled !== false
    });
    
    res.json({
      success: true,
      data: { alertId },
      message: 'Alert rule created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'create_alert_endpoint', 'Failed to create alert', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to create alert rule',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/cookaing-marketing/observability/export
 * Export observability data
 */
router.get('/export', (req: Request, res: Response) => {
  try {
    const { format = 'json', dataType = 'all' } = req.query;
    
    const exportData = observabilityService.exportData(
      format as 'json' | 'csv',
      dataType as 'logs' | 'metrics' | 'errors' | 'all'
    );

    const filename = `observability_${dataType}_${new Date().toISOString().split('T')[0]}.${format}`;
    const contentType = format === 'json' ? 'application/json' : 'text/csv';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    logger.error('observability', 'export_endpoint', 'Failed to export data', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/cookaing-marketing/observability/test
 * Generate test data for observability validation
 */
router.post('/test', (req: Request, res: Response) => {
  try {
    const { type = 'all' } = req.body;
    
    // Generate test logs
    if (type === 'all' || type === 'logs') {
      logger.info('observability', 'test', 'Test info log generated');
      logger.warn('observability', 'test', 'Test warning log generated');
      logger.error('observability', 'test', 'Test error log generated');
    }

    // Generate test metrics
    if (type === 'all' || type === 'metrics') {
      observabilityService.recordMetric('test_metric', Math.random() * 100, 'count', 'observability');
      observabilityService.recordMetric('test_response_time', Math.random() * 1000, 'ms', 'observability');
    }

    // Generate test errors
    if (type === 'all' || type === 'errors') {
      observabilityService.recordError({
        severity: 'low',
        service: 'observability',
        component: 'test',
        message: 'Test error for validation',
        context: { testData: true },
        resolved: false
      });
    }

    res.json({
      success: true,
      message: `Test ${type} data generated successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('observability', 'test_endpoint', 'Failed to generate test data', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate test data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * WebSocket endpoint for real-time monitoring
 * Note: This would typically be implemented with Socket.IO or WebSockets
 * For now, we provide a polling endpoint for real-time-like updates
 */
router.get('/realtime', (req: Request, res: Response) => {
  try {
    const health = observabilityService.getSystemHealth();
    const recentLogs = observabilityService.getLogs({ limit: 50 });
    const recentErrors = observabilityService.getErrors({ resolved: false, limit: 20 });
    
    res.json({
      success: true,
      data: {
        health,
        recentLogs,
        recentErrors,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('observability', 'realtime_endpoint', 'Failed to get realtime data', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve realtime data',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;