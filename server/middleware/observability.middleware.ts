import { Request, Response, NextFunction } from 'express';
import { observabilityService, logger, metrics } from '../services/observability.service';

/**
 * Observability Middleware for CookAIng Marketing Engine
 * 
 * Provides automatic request tracking, performance monitoring, and error handling
 * integration with the centralized ObservabilityService.
 */

// Extend Request interface to include observability tracking
declare global {
  namespace Express {
    interface Request {
      observability?: {
        requestId: string;
        startTime: number;
        service: string;
        endpoint: string;
        userId?: string;
      };
    }
  }
}

/**
 * Request tracking middleware
 * Automatically tracks all API requests with performance metrics
 */
export function requestTrackingMiddleware(serviceName: string = 'api') {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add observability context to request
    req.observability = {
      requestId,
      startTime,
      service: serviceName,
      endpoint: `${req.method} ${req.path}`,
      userId: req.headers['x-user-id'] as string // If user tracking is available
    };

    // Log request start
    logger.info(serviceName, 'request', `Started ${req.method} ${req.path}`, {
      requestId,
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: req.observability.userId
    }, requestId);

    // Track request count
    metrics.record('request_count', 1, 'count', serviceName, {
      method: req.method,
      endpoint: req.path
    });

    // Override res.json to capture response data
    const originalJson = res.json;
    res.json = function(body) {
      const duration = Date.now() - startTime;
      const responseSize = JSON.stringify(body).length;

      // Record performance metrics
      metrics.record('request_duration', duration, 'ms', serviceName, {
        method: req.method,
        endpoint: req.path,
        status: res.statusCode.toString()
      });

      metrics.record('response_size', responseSize, 'bytes', serviceName, {
        method: req.method,
        endpoint: req.path
      });

      // Log request completion
      const level = res.statusCode >= 500 ? 'error' : 
                   res.statusCode >= 400 ? 'warn' : 'info';
                   
      logger.log(level, serviceName, 'request', 
        `Completed ${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
          requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          responseSize,
          userId: req.observability?.userId
        }, requestId
      );

      // Track error rates
      if (res.statusCode >= 400) {
        metrics.record('error_count', 1, 'count', serviceName, {
          method: req.method,
          endpoint: req.path,
          status: res.statusCode.toString()
        });
      }

      return originalJson.call(this, body);
    };

    // Track response events
    res.on('close', () => {
      if (!res.headersSent) {
        // Request was aborted/closed before completion
        const duration = Date.now() - startTime;
        logger.warn(serviceName, 'request', `Aborted ${req.method} ${req.path} after ${duration}ms`, {
          requestId,
          method: req.method,
          path: req.path,
          duration,
          userId: req.observability?.userId
        }, requestId);

        metrics.record('request_aborted', 1, 'count', serviceName, {
          method: req.method,
          endpoint: req.path
        });
      }
    });

    next();
  };
}

/**
 * Error tracking middleware
 * Captures and logs all unhandled errors with full context
 */
export function errorTrackingMiddleware(serviceName: string = 'api') {
  return (error: any, req: Request, res: Response, next: NextFunction) => {
    const errorId = observabilityService.recordError({
      severity: error.status >= 500 ? 'high' : 'medium',
      service: serviceName,
      component: 'error_handler',
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: {
        requestId: req.observability?.requestId,
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        userId: req.observability?.userId,
        body: req.body,
        query: req.query,
        params: req.params
      },
      userId: req.observability?.userId,
      resolved: false
    });

    // Log critical errors with full context
    if (error.status >= 500) {
      logger.critical(serviceName, 'error_handler', `Unhandled error: ${error.message}`, {
        errorId,
        requestId: req.observability?.requestId,
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      }, req.observability?.requestId);
    }

    // Track error metrics
    metrics.record('unhandled_error', 1, 'count', serviceName, {
      errorType: error.constructor.name,
      statusCode: error.status?.toString() || '500'
    });

    // Send error response with error ID for tracking
    const status = error.status || error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: error.message || 'Internal Server Error',
      errorId,
      timestamp: new Date().toISOString()
    });
  };
}

/**
 * Performance monitoring middleware
 * Tracks detailed performance metrics for specific routes
 */
export function performanceMonitoringMiddleware(options: {
  trackDetailedMetrics?: boolean;
  slowRequestThreshold?: number;
  service?: string;
} = {}) {
  const {
    trackDetailedMetrics = false,
    slowRequestThreshold = 5000, // 5 seconds
    service = 'api'
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!trackDetailedMetrics) {
      return next();
    }

    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    // Override res.end to capture final metrics
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: BufferEncoding) {
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();
      
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      // Record detailed performance metrics
      metrics.record('cpu_time', duration, 'ms', service, {
        endpoint: req.path,
        method: req.method
      });

      metrics.record('memory_delta', memoryDelta, 'bytes', service, {
        endpoint: req.path,
        method: req.method
      });

      // Track slow requests
      if (duration > slowRequestThreshold) {
        logger.warn(service, 'performance', `Slow request detected: ${req.method} ${req.path} took ${duration}ms`, {
          requestId: req.observability?.requestId,
          duration,
          memoryDelta,
          threshold: slowRequestThreshold
        });

        metrics.record('slow_request', 1, 'count', service, {
          endpoint: req.path,
          method: req.method
        });
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Health check middleware
 * Provides standardized health check responses with observability data
 */
export function healthCheckMiddleware(serviceName: string) {
  return (req: Request, res: Response) => {
    const health = observabilityService.getSystemHealth();
    
    // Add service-specific health data
    const serviceHealth = {
      service: serviceName,
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      health
    };

    // Log health check
    logger.info(serviceName, 'health_check', `Health check performed`, {
      status: health.status,
      score: health.score
    });

    // Set appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 :
                       health.status === 'warning' ? 200 : 503;

    res.status(statusCode).json({
      success: health.status !== 'critical',
      data: serviceHealth
    });
  };
}

/**
 * Rate limiting with observability tracking
 */
export function observabilityRateLimitMiddleware(options: {
  windowMs: number;
  maxRequests: number;
  service?: string;
} = { windowMs: 60000, maxRequests: 100 }) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  const { windowMs, maxRequests, service = 'api' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    const resetTime = now + windowMs;
    
    if (!requests.has(key) || requests.get(key)!.resetTime < now) {
      requests.set(key, { count: 1, resetTime });
    } else {
      const entry = requests.get(key)!;
      entry.count++;
    }

    const currentCount = requests.get(key)!.count;

    // Track rate limiting metrics
    metrics.record('rate_limit_check', 1, 'count', service, {
      ip: key,
      exceeded: (currentCount > maxRequests).toString()
    });

    if (currentCount > maxRequests) {
      logger.warn(service, 'rate_limit', `Rate limit exceeded for ${key}`, {
        ip: key,
        count: currentCount,
        limit: maxRequests,
        windowMs
      });

      metrics.record('rate_limit_exceeded', 1, 'count', service, {
        ip: key
      });

      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((requests.get(key)!.resetTime - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentCount));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requests.get(key)!.resetTime / 1000));

    next();
  };
}

/**
 * Security monitoring middleware
 * Tracks suspicious activities and security events
 */
export function securityMonitoringMiddleware(service: string = 'api') {
  return (req: Request, res: Response, next: NextFunction) => {
    // Track potentially suspicious patterns
    const suspiciousPatterns = [
      /\.\.\//, // Path traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /javascript:/i, // JavaScript injection
    ];

    const fullUrl = req.originalUrl || req.url;
    const bodyStr = JSON.stringify(req.body || {});
    
    let suspiciousActivity = false;
    const detectedPatterns: string[] = [];

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(fullUrl) || pattern.test(bodyStr)) {
        suspiciousActivity = true;
        detectedPatterns.push(pattern.toString());
      }
    });

    if (suspiciousActivity) {
      logger.warn(service, 'security', `Suspicious activity detected`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        url: fullUrl,
        patterns: detectedPatterns,
        requestId: req.observability?.requestId
      });

      metrics.record('security_alert', 1, 'count', service, {
        type: 'suspicious_pattern',
        ip: req.ip || 'unknown'
      });
    }

    // Track authentication events
    if (req.headers.authorization) {
      metrics.record('auth_attempt', 1, 'count', service, {
        type: req.headers.authorization.split(' ')[0] || 'unknown'
      });
    }

    next();
  };
}

export default {
  requestTracking: requestTrackingMiddleware,
  errorTracking: errorTrackingMiddleware,
  performanceMonitoring: performanceMonitoringMiddleware,
  healthCheck: healthCheckMiddleware,
  rateLimiting: observabilityRateLimitMiddleware,
  securityMonitoring: securityMonitoringMiddleware
};