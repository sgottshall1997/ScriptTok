import { ValidationResult } from './contentValidator';

export interface ValidationLog {
  timestamp: string;
  templateType: string;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  errors: Array<{
    field: string;
    issue: string;
  }>;
  metadata: {
    wordCount: number;
  };
}

// In-memory ring buffer for validation logs (max 1000 entries)
const MAX_LOGS = 1000;
const validationLogs: ValidationLog[] = [];

// Template-specific metrics cache
const templateMetrics = new Map<string, {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  commonErrors: Map<string, number>;
}>();

export function logValidation(templateType: string, validationResult: ValidationResult): void {
  // Create log entry
  const logEntry: ValidationLog = {
    timestamp: new Date().toISOString(),
    templateType,
    isValid: validationResult.isValid,
    errorCount: validationResult.errors.length,
    warningCount: validationResult.warnings.length,
    errors: validationResult.errors.map(e => ({
      field: e.field,
      issue: e.issue
    })),
    metadata: {
      wordCount: validationResult.metadata.wordCount
    }
  };

  // Add to ring buffer
  validationLogs.push(logEntry);
  if (validationLogs.length > MAX_LOGS) {
    validationLogs.shift(); // Remove oldest entry
  }

  // Update template metrics
  const metrics = templateMetrics.get(templateType) || {
    totalValidations: 0,
    passedValidations: 0,
    failedValidations: 0,
    commonErrors: new Map<string, number>()
  };

  metrics.totalValidations++;
  if (validationResult.isValid) {
    metrics.passedValidations++;
  } else {
    metrics.failedValidations++;
    
    // Track common errors
    validationResult.errors.forEach(error => {
      const errorKey = `${error.field}: ${error.issue}`;
      metrics.commonErrors.set(errorKey, (metrics.commonErrors.get(errorKey) || 0) + 1);
    });
  }

  templateMetrics.set(templateType, metrics);

  // Log to console for monitoring
  console.log(`📊 Validation Log [${templateType}]:`, {
    isValid: validationResult.isValid,
    errors: validationResult.errors.length,
    warnings: validationResult.warnings.length
  });
}

export function getValidationLogs(limit: number = 50): ValidationLog[] {
  return validationLogs.slice(-limit).reverse(); // Most recent first
}

export function getTemplateMetrics(templateType?: string) {
  if (templateType) {
    const metrics = templateMetrics.get(templateType);
    if (!metrics) {
      return null;
    }
    
    return {
      templateType,
      totalValidations: metrics.totalValidations,
      passedValidations: metrics.passedValidations,
      failedValidations: metrics.failedValidations,
      passRate: (metrics.passedValidations / metrics.totalValidations * 100).toFixed(1) + '%',
      commonErrors: Array.from(metrics.commonErrors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([error, count]) => ({ error, count }))
    };
  }

  // Return all template metrics
  const allMetrics = Array.from(templateMetrics.entries()).map(([type, metrics]) => ({
    templateType: type,
    totalValidations: metrics.totalValidations,
    passedValidations: metrics.passedValidations,
    failedValidations: metrics.failedValidations,
    passRate: (metrics.passedValidations / metrics.totalValidations * 100).toFixed(1) + '%'
  }));

  return allMetrics.sort((a, b) => b.totalValidations - a.totalValidations);
}

export function getOverallMetrics() {
  const allMetrics = getTemplateMetrics() as Array<{
    templateType: string;
    totalValidations: number;
    passedValidations: number;
    failedValidations: number;
    passRate: string;
  }>;
  
  const total = allMetrics.reduce((sum: number, m) => sum + m.totalValidations, 0);
  const passed = allMetrics.reduce((sum: number, m) => sum + m.passedValidations, 0);
  
  return {
    totalValidations: total,
    passedValidations: passed,
    failedValidations: total - passed,
    overallPassRate: total > 0 ? (passed / total * 100).toFixed(1) + '%' : '0%',
    templateCount: allMetrics.length
  };
}
