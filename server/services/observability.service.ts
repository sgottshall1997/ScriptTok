import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

/**
 * Centralized Observability Service for CookAIng Marketing Engine
 * 
 * Provides comprehensive monitoring, logging, error tracking, and performance analytics.
 * Integrates with existing infrastructure while adding Phase 6 enhancements.
 */

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  service: string;
  component: string;
  message: string;
  metadata?: Record<string, any>;
  traceId?: string;
  userId?: string;
  requestId?: string;
}

export interface MetricEntry {
  timestamp: string;
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent' | 'rate';
  tags?: Record<string, string>;
  service: string;
}

export interface ErrorEntry {
  timestamp: string;
  errorId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  component: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    threshold: number;
    timeWindow: number; // minutes
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggered?: string;
}

class ObservabilityService extends EventEmitter {
  private logs: LogEntry[] = [];
  private metrics: MetricEntry[] = [];
  private errors: ErrorEntry[] = [];
  private alerts: AlertRule[] = [];
  private performanceMetrics: Map<string, number[]> = new Map();
  
  // Configuration
  private config = {
    maxLogEntries: 10000,
    maxMetricEntries: 50000,
    maxErrorEntries: 5000,
    retentionDays: 30,
    enableFileLogging: true,
    enableConsoleLogging: true,
    logLevel: (process.env.LOG_LEVEL || 'info') as LogEntry['level'],
    enableAlerts: true,
    metricsFlushInterval: 60000, // 1 minute
  };

  constructor() {
    super();
    this.initializeDefaultAlerts();
    this.startMetricsFlush();
    this.startLogRetention();
  }

  /**
   * Enhanced Structured Logging
   */
  log(level: LogEntry['level'], service: string, component: string, message: string, metadata?: Record<string, any>, traceId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      component,
      message,
      metadata,
      traceId,
      requestId: this.generateRequestId()
    };

    // Add to in-memory store
    this.logs.push(entry);
    this.trimLogs();

    // Console logging with enhanced formatting
    if (this.config.enableConsoleLogging && this.shouldLog(level)) {
      this.formatConsoleLog(entry);
    }

    // File logging
    if (this.config.enableFileLogging) {
      this.writeToLogFile(entry);
    }

    // Emit event for real-time monitoring
    this.emit('log', entry);

    // Auto-detect errors and create error entries
    if (level === 'error' || level === 'critical') {
      this.recordError({
        timestamp: entry.timestamp,
        errorId: this.generateErrorId(),
        severity: level === 'critical' ? 'critical' : 'high',
        service,
        component,
        message,
        context: metadata,
        resolved: false
      });
    }
  }

  /**
   * Performance Metrics Collection
   */
  recordMetric(name: string, value: number, unit: MetricEntry['unit'], service: string, tags?: Record<string, string>) {
    const entry: MetricEntry = {
      timestamp: new Date().toISOString(),
      name,
      value,
      unit,
      tags,
      service
    };

    this.metrics.push(entry);
    this.trimMetrics();

    // Store for real-time aggregation
    if (!this.performanceMetrics.has(name)) {
      this.performanceMetrics.set(name, []);
    }
    const values = this.performanceMetrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values for real-time stats
    if (values.length > 100) {
      values.splice(0, values.length - 100);
    }

    // Check alert rules
    this.checkAlertRules(name, value);

    // Emit for real-time monitoring
    this.emit('metric', entry);
  }

  /**
   * Error Tracking and Management
   */
  recordError(error: Omit<ErrorEntry, 'timestamp' | 'errorId'> & { timestamp?: string; errorId?: string }) {
    const entry: ErrorEntry = {
      timestamp: error.timestamp || new Date().toISOString(),
      errorId: error.errorId || this.generateErrorId(),
      severity: error.severity,
      service: error.service,
      component: error.component,
      message: error.message,
      stack: error.stack,
      context: error.context,
      userId: error.userId,
      resolved: false
    };

    this.errors.push(entry);
    this.trimErrors();

    // Log as structured log entry
    this.log('error', entry.service, entry.component, `[${entry.errorId}] ${entry.message}`, {
      errorId: entry.errorId,
      severity: entry.severity,
      context: entry.context
    });

    // Emit for real-time monitoring
    this.emit('error', entry);

    return entry.errorId;
  }

  /**
   * Request Performance Tracking
   */
  startRequest(requestId: string, method: string, path: string, userId?: string) {
    const startTime = Date.now();
    
    return {
      end: (statusCode: number, responseSize?: number) => {
        const duration = Date.now() - startTime;
        
        // Record metrics
        this.recordMetric('request_duration', duration, 'ms', 'api', {
          method,
          path,
          status: statusCode.toString()
        });

        if (responseSize) {
          this.recordMetric('response_size', responseSize, 'bytes', 'api', {
            method,
            path
          });
        }

        // Log request
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
        this.log(level, 'api', 'request', `${method} ${path} ${statusCode} ${duration}ms`, {
          requestId,
          method,
          path,
          statusCode,
          duration,
          responseSize,
          userId
        }, requestId);
      }
    };
  }

  /**
   * System Health Monitoring
   */
  getSystemHealth() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const fiveMinutesAgo = now - 300000;

    // Recent metrics
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > oneMinuteAgo
    );

    const recentErrors = this.errors.filter(e => 
      new Date(e.timestamp).getTime() > fiveMinutesAgo && !e.resolved
    );

    // Calculate health score
    const errorRate = recentErrors.length / Math.max(recentMetrics.length, 1);
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
    
    let healthScore = 100;
    healthScore -= (errorRate * 50); // Reduce by error rate
    healthScore -= (criticalErrors * 20); // Heavy penalty for critical errors
    healthScore = Math.max(0, Math.min(100, healthScore));

    const status = healthScore >= 90 ? 'healthy' : 
                   healthScore >= 70 ? 'warning' : 'critical';

    return {
      status,
      score: Math.round(healthScore),
      timestamp: new Date().toISOString(),
      metrics: {
        totalRequests: recentMetrics.filter(m => m.name === 'request_duration').length,
        avgResponseTime: this.getAverageMetric('request_duration'),
        errorRate: Math.round(errorRate * 100),
        activeErrors: recentErrors.length,
        criticalErrors,
        uptime: process.uptime()
      },
      services: this.getServiceHealth()
    };
  }

  /**
   * Analytics and Reporting
   */
  getAnalytics(timeRange: 'hour' | 'day' | 'week' = 'day') {
    const timeRangeMs = {
      hour: 3600000,
      day: 86400000,
      week: 604800000
    }[timeRange];

    const cutoff = Date.now() - timeRangeMs;
    
    const filteredLogs = this.logs.filter(l => 
      new Date(l.timestamp).getTime() > cutoff
    );
    
    const filteredMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    );

    const filteredErrors = this.errors.filter(e => 
      new Date(e.timestamp).getTime() > cutoff
    );

    return {
      timeRange,
      period: `${new Date(cutoff).toISOString()} - ${new Date().toISOString()}`,
      summary: {
        totalLogs: filteredLogs.length,
        totalMetrics: filteredMetrics.length,
        totalErrors: filteredErrors.length,
        errorsByLevel: this.groupBy(filteredLogs.filter(l => 
          l.level === 'error' || l.level === 'critical'
        ), 'level'),
        topServices: this.getTopServices(filteredLogs),
        avgResponseTime: this.getAverageMetric('request_duration', timeRangeMs),
        requestVolume: filteredMetrics.filter(m => m.name === 'request_duration').length
      },
      trends: this.calculateTrends(filteredMetrics),
      alerts: this.alerts.filter(a => 
        a.lastTriggered && new Date(a.lastTriggered).getTime() > cutoff
      )
    };
  }

  /**
   * Alert Management
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>) {
    const alertRule: AlertRule = {
      ...rule,
      id: this.generateAlertId()
    };
    
    this.alerts.push(alertRule);
    return alertRule.id;
  }

  /**
   * Data Export for External Systems
   */
  exportData(format: 'json' | 'csv' = 'json', dataType: 'logs' | 'metrics' | 'errors' | 'all' = 'all') {
    const data = {
      logs: dataType === 'all' || dataType === 'logs' ? this.logs : [],
      metrics: dataType === 'all' || dataType === 'metrics' ? this.metrics : [],
      errors: dataType === 'all' || dataType === 'errors' ? this.errors : [],
      alerts: this.alerts,
      exportTimestamp: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV format
      return this.convertToCSV(data, dataType);
    }
  }

  // Utility Methods
  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'critical'];
    const configLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= configLevel;
  }

  private formatConsoleLog(entry: LogEntry) {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      critical: '🚨'
    }[entry.level];

    const color = {
      debug: '\x1b[36m',
      info: '\x1b[32m', 
      warn: '\x1b[33m',
      error: '\x1b[31m',
      critical: '\x1b[41m'
    }[entry.level];

    const reset = '\x1b[0m';
    
    console.log(
      `${color}${emoji} [${entry.timestamp}] ${entry.service}/${entry.component}: ${entry.message}${reset}`,
      entry.metadata ? JSON.stringify(entry.metadata, null, 2) : ''
    );
  }

  private async writeToLogFile(entry: LogEntry) {
    try {
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `${entry.level}.log`);
      const logLine = JSON.stringify(entry) + '\n';
      
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      // Fallback to console if file logging fails
      console.error('Failed to write to log file:', error);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trimLogs() {
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs.splice(0, this.logs.length - this.config.maxLogEntries);
    }
  }

  private trimMetrics() {
    if (this.metrics.length > this.config.maxMetricEntries) {
      this.metrics.splice(0, this.metrics.length - this.config.maxMetricEntries);
    }
  }

  private trimErrors() {
    if (this.errors.length > this.config.maxErrorEntries) {
      this.errors.splice(0, this.errors.length - this.config.maxErrorEntries);
    }
  }

  private getAverageMetric(metricName: string, timeRangeMs?: number): number {
    let filteredMetrics = this.metrics.filter(m => m.name === metricName);
    
    if (timeRangeMs) {
      const cutoff = Date.now() - timeRangeMs;
      filteredMetrics = filteredMetrics.filter(m => 
        new Date(m.timestamp).getTime() > cutoff
      );
    }

    if (filteredMetrics.length === 0) return 0;
    
    const sum = filteredMetrics.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / filteredMetrics.length);
  }

  private getServiceHealth() {
    const services = Array.from(new Set(this.logs.map(l => l.service)));
    
    return services.map(service => {
      const serviceLogs = this.logs.filter(l => l.service === service);
      const recentErrors = serviceLogs.filter(l => 
        (l.level === 'error' || l.level === 'critical') &&
        new Date(l.timestamp).getTime() > Date.now() - 300000
      );

      const status = recentErrors.length === 0 ? 'healthy' :
                     recentErrors.length < 5 ? 'warning' : 'critical';

      return {
        name: service,
        status,
        lastSeen: serviceLogs[serviceLogs.length - 1]?.timestamp,
        errorCount: recentErrors.length
      };
    });
  }

  private initializeDefaultAlerts() {
    this.alerts = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: { metric: 'error_rate', operator: '>', threshold: 10, timeWindow: 5 },
        severity: 'high',
        enabled: true
      },
      {
        id: 'slow_response_time',
        name: 'Slow Response Time',
        condition: { metric: 'request_duration', operator: '>', threshold: 5000, timeWindow: 5 },
        severity: 'medium',
        enabled: true
      },
      {
        id: 'critical_error',
        name: 'Critical Error Detected',
        condition: { metric: 'critical_errors', operator: '>', threshold: 0, timeWindow: 1 },
        severity: 'critical',
        enabled: true
      }
    ];
  }

  private checkAlertRules(metricName: string, value: number) {
    if (!this.config.enableAlerts) return;

    this.alerts.forEach(alert => {
      if (!alert.enabled || alert.condition.metric !== metricName) return;

      const shouldTrigger = this.evaluateCondition(alert.condition, value);
      
      if (shouldTrigger) {
        alert.lastTriggered = new Date().toISOString();
        this.emit('alert', alert, value);
        
        this.log('warn', 'observability', 'alerts', 
          `Alert triggered: ${alert.name} (${metricName}: ${value})`, {
            alertId: alert.id,
            condition: alert.condition,
            value
          }
        );
      }
    });
  }

  private evaluateCondition(condition: AlertRule['condition'], value: number): boolean {
    switch (condition.operator) {
      case '>': return value > condition.threshold;
      case '<': return value < condition.threshold;
      case '>=': return value >= condition.threshold;
      case '<=': return value <= condition.threshold;
      case '==': return value === condition.threshold;
      case '!=': return value !== condition.threshold;
      default: return false;
    }
  }

  private startMetricsFlush() {
    setInterval(() => {
      this.emit('metrics_flush', {
        timestamp: new Date().toISOString(),
        metricCount: this.metrics.length,
        performanceSnapshot: Object.fromEntries(
          Array.from(this.performanceMetrics.entries()).map(([key, values]) => [
            key,
            {
              count: values.length,
              avg: values.reduce((a, b) => a + b, 0) / values.length,
              min: Math.min(...values),
              max: Math.max(...values)
            }
          ])
        )
      });
    }, this.config.metricsFlushInterval);
  }

  private startLogRetention() {
    // Clean up old entries daily
    setInterval(() => {
      const cutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
      
      this.logs = this.logs.filter(l => new Date(l.timestamp).getTime() > cutoff);
      this.metrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > cutoff);
      this.errors = this.errors.filter(e => new Date(e.timestamp).getTime() > cutoff);
      
      this.log('info', 'observability', 'retention', 'Completed log retention cleanup');
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const group = String(item[key]);
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopServices(logs: LogEntry[], limit = 5) {
    const serviceCounts = this.groupBy(logs, 'service');
    return Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([service, count]) => ({ service, count }));
  }

  private calculateTrends(metrics: MetricEntry[]) {
    const metricNames = Array.from(new Set(metrics.map(m => m.name)));
    
    return metricNames.map(name => {
      const metricValues = metrics
        .filter(m => m.name === name)
        .map(m => ({ timestamp: m.timestamp, value: m.value }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (metricValues.length < 2) {
        return { metric: name, trend: 'stable', change: 0 };
      }

      const firstHalf = metricValues.slice(0, Math.floor(metricValues.length / 2));
      const secondHalf = metricValues.slice(Math.floor(metricValues.length / 2));

      const firstAvg = firstHalf.reduce((acc, m) => acc + m.value, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((acc, m) => acc + m.value, 0) / secondHalf.length;

      const change = ((secondAvg - firstAvg) / firstAvg) * 100;
      const trend = Math.abs(change) < 5 ? 'stable' : change > 0 ? 'increasing' : 'decreasing';

      return { metric: name, trend, change: Math.round(change) };
    });
  }

  private convertToCSV(data: any, dataType: string): string {
    // Implementation for CSV conversion
    // This is a simplified version - could be enhanced for complex objects
    const headers = Object.keys(data[dataType === 'all' ? 'logs' : dataType][0] || {});
    const rows = data[dataType === 'all' ? 'logs' : dataType];
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');

    return csvContent;
  }

  // Public API for getting current state
  getLogs(filters?: { level?: string; service?: string; component?: string; limit?: number }) {
    let filteredLogs = [...this.logs];

    if (filters?.level) {
      filteredLogs = filteredLogs.filter(l => l.level === filters.level);
    }
    if (filters?.service) {
      filteredLogs = filteredLogs.filter(l => l.service === filters.service);
    }
    if (filters?.component) {
      filteredLogs = filteredLogs.filter(l => l.component === filters.component);
    }

    const limit = filters?.limit || 1000;
    return filteredLogs.slice(-limit);
  }

  getMetrics(filters?: { name?: string; service?: string; limit?: number }) {
    let filteredMetrics = [...this.metrics];

    if (filters?.name) {
      filteredMetrics = filteredMetrics.filter(m => m.name === filters.name);
    }
    if (filters?.service) {
      filteredMetrics = filteredMetrics.filter(m => m.service === filters.service);
    }

    const limit = filters?.limit || 1000;
    return filteredMetrics.slice(-limit);
  }

  getErrors(filters?: { severity?: string; service?: string; resolved?: boolean; limit?: number }) {
    let filteredErrors = [...this.errors];

    if (filters?.severity) {
      filteredErrors = filteredErrors.filter(e => e.severity === filters.severity);
    }
    if (filters?.service) {
      filteredErrors = filteredErrors.filter(e => e.service === filters.service);
    }
    if (filters?.resolved !== undefined) {
      filteredErrors = filteredErrors.filter(e => e.resolved === filters.resolved);
    }

    const limit = filters?.limit || 1000;
    return filteredErrors.slice(-limit);
  }

  resolveError(errorId: string, resolvedBy?: string) {
    const error = this.errors.find(e => e.errorId === errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
      
      this.log('info', 'observability', 'error_management', 
        `Error resolved: ${errorId}`, { errorId, resolvedBy }
      );
    }
  }

  getAlerts() {
    return [...this.alerts];
  }
}

// Export singleton instance
export const observabilityService = new ObservabilityService();

// Export helper functions for easy integration
export const logger = {
  debug: (service: string, component: string, message: string, metadata?: Record<string, any>) => 
    observabilityService.log('debug', service, component, message, metadata),
  info: (service: string, component: string, message: string, metadata?: Record<string, any>) => 
    observabilityService.log('info', service, component, message, metadata),
  warn: (service: string, component: string, message: string, metadata?: Record<string, any>) => 
    observabilityService.log('warn', service, component, message, metadata),
  error: (service: string, component: string, message: string, metadata?: Record<string, any>) => 
    observabilityService.log('error', service, component, message, metadata),
  critical: (service: string, component: string, message: string, metadata?: Record<string, any>) => 
    observabilityService.log('critical', service, component, message, metadata),
  log: (level: 'debug' | 'info' | 'warn' | 'error' | 'critical', service: string, component: string, message: string, metadata?: Record<string, any>, traceId?: string) =>
    observabilityService.log(level, service, component, message, metadata, traceId),
};

export const metrics = {
  record: (name: string, value: number, unit: MetricEntry['unit'], service: string, tags?: Record<string, string>) =>
    observabilityService.recordMetric(name, value, unit, service, tags),
  
  timer: (service: string, tags?: Record<string, string>) => {
    const start = Date.now();
    return {
      end: (name: string) => {
        const duration = Date.now() - start;
        observabilityService.recordMetric(name, duration, 'ms', service, tags);
        return duration;
      }
    };
  }
};

export default observabilityService;