/**
 * 🛑 SYSTEM-WIDE GENERATION SAFEGUARDS 🛑
 * This module provides failsafe protection against unwanted automated content generation
 */

export interface GenerationContext {
  source: 'manual_ui' | 'scheduled_job' | 'webhook_trigger' | 'cron_job' | 'automated_bulk' | 'test' | 'unknown';
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  referer?: string;
}

export interface SafeguardConfig {
  ALLOW_AUTOMATED_GENERATION: boolean;
  ALLOW_SCHEDULED_GENERATION: boolean;
  ALLOW_WEBHOOK_TRIGGERS: boolean;
  ALLOW_CRON_GENERATION: boolean;
  PRODUCTION_MODE: boolean;
  ALLOW_TREND_FETCHING: boolean;  // Allow Perplexity trend data fetching (read-only)
}

// 🚫 PRODUCTION SAFEGUARD CONFIGURATION
const SAFEGUARD_CONFIG: SafeguardConfig = {
  ALLOW_AUTOMATED_GENERATION: false,  // 🛑 BLOCKS ALL AUTOMATED GENERATION
  ALLOW_SCHEDULED_GENERATION: false,  // 🛑 BLOCKS SCHEDULED JOBS
  ALLOW_WEBHOOK_TRIGGERS: false,      // 🛑 BLOCKS WEBHOOK TRIGGERS
  ALLOW_CRON_GENERATION: false,       // 🛑 BLOCKS CRON JOBS
  PRODUCTION_MODE: true,              // 🔒 PRODUCTION LOCKDOWN MODE
  ALLOW_TREND_FETCHING: false         // 🚫 ALL AUTOMATED PROCESSES DISABLED
};

/**
 * 🛡️ CORE SAFEGUARD: Validates if content generation is allowed
 */
export function validateGenerationRequest(context: GenerationContext): {
  allowed: boolean;
  reason?: string;
  action: 'allow' | 'block' | 'log_only';
} {
  const { source } = context;

  // ✅ ALWAYS ALLOW MANUAL UI TRIGGERS
  if (source === 'manual_ui') {
    console.log('🟢 SAFEGUARD: Manual UI generation request - ALLOWED');
    return { allowed: true, action: 'allow' };
  }

  // ✅ ALLOW TEST REQUESTS IN DEVELOPMENT
  if (source === 'test' && !SAFEGUARD_CONFIG.PRODUCTION_MODE) {
    console.log('🟡 SAFEGUARD: Test generation request - ALLOWED (dev mode)');
    return { allowed: true, action: 'allow' };
  }

  // 🛑 BLOCK ALL AUTOMATED GENERATION
  if (!SAFEGUARD_CONFIG.ALLOW_AUTOMATED_GENERATION) {
    const reason = `Automated generation is disabled in production mode. Source: ${source}`;
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // 🛑 BLOCK SCHEDULED GENERATION
  if (source === 'scheduled_job' && !SAFEGUARD_CONFIG.ALLOW_SCHEDULED_GENERATION) {
    const reason = 'Scheduled generation is disabled';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // 🛑 BLOCK WEBHOOK TRIGGERS
  if (source === 'webhook_trigger' && !SAFEGUARD_CONFIG.ALLOW_WEBHOOK_TRIGGERS) {
    const reason = 'Webhook-triggered generation is disabled';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // 🛑 BLOCK CRON JOBS
  if (source === 'cron_job' && !SAFEGUARD_CONFIG.ALLOW_CRON_GENERATION) {
    const reason = 'Cron-triggered generation is disabled';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // 🛑 BLOCK AUTOMATED BULK
  if (source === 'automated_bulk' && !SAFEGUARD_CONFIG.ALLOW_AUTOMATED_GENERATION) {
    const reason = 'Automated bulk generation is disabled';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // 🛑 BLOCK UNKNOWN SOURCES
  if (source === 'unknown') {
    const reason = 'Generation source is unknown - blocking for security';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // Default fallback
  console.log(`🟡 SAFEGUARD: Unknown case for source ${source} - allowing with warning`);
  return { allowed: true, action: 'allow' };
}

/**
 * 🔍 CONTEXT DETECTOR: Determines generation source from request
 */
/**
 * 🌐 TREND FETCHING VALIDATOR: Checks if trend fetching is allowed
 */
export function validateTrendFetchRequest(): {
  allowed: boolean;
  reason?: string;
} {
  if (SAFEGUARD_CONFIG.ALLOW_TREND_FETCHING) {
    console.log('🟢 SAFEGUARD: Trend fetching request - ALLOWED (read-only data operation)');
    return { allowed: true };
  } else {
    const reason = 'Trend fetching is disabled in current safeguard configuration';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason };
  }
}

export function detectGenerationContext(req: any): GenerationContext {
  const userAgent = req?.headers?.['user-agent'] || '';
  const referer = req?.headers?.referer || '';
  const source = req?.headers?.['x-generation-source'] || '';

  // Detect manual UI requests
  if (referer.includes('/unified-generator') || referer.includes('/dashboard')) {
    return {
      source: 'manual_ui',
      userAgent,
      referer,
      requestId: req?.headers?.['x-request-id']
    };
  }

  // Detect scheduled job requests
  if (source === 'scheduled_job' || userAgent.includes('cron') || userAgent.includes('scheduled')) {
    return {
      source: 'scheduled_job',
      userAgent,
      referer
    };
  }

  // Detect webhook triggers
  if (source === 'webhook' || referer.includes('webhook') || userAgent.includes('webhook')) {
    return {
      source: 'webhook_trigger',
      userAgent,
      referer
    };
  }

  // Detect cron jobs
  if (source === 'cron' || userAgent.includes('node-cron')) {
    return {
      source: 'cron_job',
      userAgent,
      referer
    };
  }

  // Detect test requests
  if (referer.includes('test') || userAgent.includes('test') || source === 'test') {
    return {
      source: 'test',
      userAgent,
      referer
    };
  }

  // Default to unknown
  return {
    source: 'unknown',
    userAgent,
    referer
  };
}

/**
 * 📊 SAFEGUARD MIDDLEWARE: Express middleware for generation protection
 */
export function generationSafeguardMiddleware(req: any, res: any, next: any) {
  // Only apply to generation endpoints
  if (!req.path.includes('/generate') && !req.path.includes('/bulk')) {
    return next();
  }

  const context = detectGenerationContext(req);
  const validation = validateGenerationRequest(context);

  // Log all generation attempts
  console.log(`🔍 GENERATION ATTEMPT: ${context.source} -> ${req.path}`);
  
  if (!validation.allowed) {
    console.log(`🚫 GENERATION BLOCKED: ${validation.reason}`);
    return res.status(403).json({
      success: false,
      error: 'Content generation blocked by security safeguards',
      reason: validation.reason,
      source: context.source,
      action: 'Contact administrator if this was a legitimate request'
    });
  }

  // Add context to request for downstream use
  req.generationContext = context;
  next();
}

/**
 * 🎛️ SAFEGUARD CONTROLS: Admin functions
 */
export function enableAutomatedGeneration() {
  SAFEGUARD_CONFIG.ALLOW_AUTOMATED_GENERATION = true;
  console.log('⚠️ SAFEGUARD: Automated generation ENABLED');
}

export function disableAutomatedGeneration() {
  SAFEGUARD_CONFIG.ALLOW_AUTOMATED_GENERATION = false;
  console.log('🔒 SAFEGUARD: Automated generation DISABLED');
}

export function getSafeguardStatus(): SafeguardConfig {
  return { ...SAFEGUARD_CONFIG };
}

/**
 * 📋 GENERATION LOG: Track all generation attempts
 */
const generationLog: Array<{
  timestamp: Date;
  source: string;
  endpoint: string;
  allowed: boolean;
  reason?: string;
}> = [];

export function logGenerationAttempt(context: GenerationContext, endpoint: string, allowed: boolean, reason?: string) {
  generationLog.push({
    timestamp: new Date(),
    source: context.source,
    endpoint,
    allowed,
    reason
  });
  
  // Keep only last 100 entries to prevent memory issues
  if (generationLog.length > 100) {
    generationLog.splice(0, generationLog.length - 100);
  }
}

export function getGenerationLog() {
  return [...generationLog];
}

export function clearGenerationLog() {
  generationLog.length = 0;
  console.log('🗑️ SAFEGUARD: Generation log cleared');
}