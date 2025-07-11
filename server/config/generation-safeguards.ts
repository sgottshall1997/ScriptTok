/**
 * 🛑 SYSTEM-WIDE GENERATION SAFEGUARDS 🛑
 * This module provides failsafe protection against unwanted automated content generation
 */

export interface GenerationContext {
  source: 'manual_ui' | 'scheduled_job' | 'webhook_trigger' | 'cron_job' | 'automated_bulk' | 'bulk_scheduler' | 'automated_generator' | 'make_com_webhook' | 'test' | 'unknown';
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  referer?: string;
}

// 🎯 APPROVED GENERATION SOURCES - Trusted automation systems
const APPROVED_SOURCES = [
  'manual_ui',           // UI-triggered generation (always allowed)
  'automated_bulk',      // Bulk generator system
  'bulk_scheduler',      // Scheduled bulk generation
  'automated_generator', // Internal automation workflows
  'scheduled_job',       // Scheduled generation jobs
  'make_com_webhook'     // Make.com webhook automation
] as const;

type ApprovedSource = typeof APPROVED_SOURCES[number];

export interface SafeguardConfig {
  ALLOW_AUTOMATED_GENERATION: boolean;
  ALLOW_SCHEDULED_GENERATION: boolean;
  ALLOW_WEBHOOK_TRIGGERS: boolean;
  ALLOW_CRON_GENERATION: boolean;
  PRODUCTION_MODE: boolean;
  ALLOW_TREND_FETCHING: boolean;  // Allow Perplexity trend data fetching (read-only)
}

// 🚫 PRODUCTION SAFEGUARD CONFIGURATION WITH ENVIRONMENT VARIABLE OVERRIDES
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SAFEGUARD_CONFIG: SafeguardConfig = {
  ALLOW_AUTOMATED_GENERATION: IS_PRODUCTION 
    ? process.env.ALLOW_PROD_GENERATION === 'true' 
    : true,  // Allow in dev, require explicit flag in production
  ALLOW_SCHEDULED_GENERATION: IS_PRODUCTION 
    ? process.env.ALLOW_PROD_SCHEDULED === 'true' 
    : true,  // Allow in dev, require explicit flag in production
  ALLOW_WEBHOOK_TRIGGERS: IS_PRODUCTION 
    ? process.env.ALLOW_PROD_WEBHOOKS === 'true' 
    : true,  // Allow in dev, require explicit flag in production
  ALLOW_CRON_GENERATION: IS_PRODUCTION 
    ? process.env.ALLOW_PROD_CRON === 'true' 
    : true,  // Allow in dev, require explicit flag in production
  PRODUCTION_MODE: IS_PRODUCTION,     // Auto-detect production mode
  ALLOW_TREND_FETCHING: IS_PRODUCTION 
    ? process.env.ALLOW_PROD_TRENDS === 'true' 
    : true   // Allow in dev, require explicit flag in production
};

console.log('🔧 SAFEGUARD CONFIG LOADED:');
console.log('   - Production Mode:', SAFEGUARD_CONFIG.PRODUCTION_MODE);
console.log('   - Allow Automated Generation:', SAFEGUARD_CONFIG.ALLOW_AUTOMATED_GENERATION);
console.log('   - Allow Manual UI Generation: ALWAYS ALLOWED');
console.log('   - Allow Scheduled Generation:', SAFEGUARD_CONFIG.ALLOW_SCHEDULED_GENERATION);
console.log('   - Environment Variables:');
console.log('     * NODE_ENV:', process.env.NODE_ENV);
console.log('     * ALLOW_PROD_GENERATION:', process.env.ALLOW_PROD_GENERATION);
console.log('     * ALLOW_PROD_SCHEDULED:', process.env.ALLOW_PROD_SCHEDULED);

/**
 * 🛡️ CORE SAFEGUARD: Validates if content generation is allowed
 */
export function validateGenerationRequest(context: GenerationContext): {
  allowed: boolean;
  reason?: string;
  action: 'allow' | 'block' | 'log_only';
} {
  const { source } = context;

  // 🎯 APPROVED SOURCES: Check if source is in approved list
  if (APPROVED_SOURCES.includes(source as ApprovedSource)) {
    console.log(`🟢 SAFEGUARD: Approved source "${source}" - ALLOWED`);
    return { allowed: true, action: 'allow' };
  }

  // ✅ ALLOW TEST REQUESTS IN DEVELOPMENT
  if (source === 'test' && !SAFEGUARD_CONFIG.PRODUCTION_MODE) {
    console.log('🟡 SAFEGUARD: Test generation request - ALLOWED (dev mode)');
    return { allowed: true, action: 'allow' };
  }

  // 🛑 BLOCK WEBHOOK TRIGGERS (unless specifically approved)
  if (source === 'webhook_trigger') {
    const reason = 'Webhook-triggered generation requires approved source designation';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // 🛑 BLOCK CRON JOBS (unless specifically approved)
  if (source === 'cron_job') {
    const reason = 'Cron-triggered generation requires approved source designation';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // 🛑 BLOCK UNKNOWN SOURCES
  if (source === 'unknown') {
    const reason = 'Generation source is unknown - blocking for security';
    console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
    return { allowed: false, reason, action: 'block' };
  }

  // 🛑 BLOCK ALL OTHER SOURCES
  const reason = `Source "${source}" is not in approved sources list: ${APPROVED_SOURCES.join(', ')}`;
  console.log(`🔴 SAFEGUARD: BLOCKED - ${reason}`);
  return { allowed: false, reason, action: 'block' };
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
  const requestBody = req?.body || {};

  // 🔍 DEBUG: Log header information
  console.log(`🔍 DETECTION DEBUG: source="${source}", userAgent="${userAgent}", referer="${referer}"`);
  console.log(`🔍 APPROVED SOURCES: ${APPROVED_SOURCES.join(', ')}`);
  console.log(`🔍 SOURCE CHECK: source in approved? ${APPROVED_SOURCES.includes(source as ApprovedSource)}`);

  // 🎯 PRIMARY: Check x-generation-source header for approved sources
  if (source && APPROVED_SOURCES.includes(source as ApprovedSource)) {
    console.log(`🟢 CONTEXT: Approved source "${source}" detected in header`);
    return {
      source: source as GenerationContext['source'],
      userAgent,
      referer,
      requestId: req?.headers?.['x-request-id']
    };
  }

  // 🎯 SECONDARY: Check for explicit mode in request body
  if (requestBody.mode === 'manual') {
    console.log('🟢 CONTEXT: Manual mode detected in request body - MANUAL_UI');
    return {
      source: 'manual_ui',
      userAgent,
      referer,
      requestId: req?.headers?.['x-request-id']
    };
  }

  if (requestBody.mode === 'automated') {
    console.log('🟢 CONTEXT: Automated mode detected in request body - AUTOMATED_BULK');
    return {
      source: 'automated_bulk',
      userAgent,
      referer,
      requestId: req?.headers?.['x-request-id']
    };
  }

  // 🎯 TERTIARY: Check referer for UI pages (browser requests)
  if (referer && (referer.includes('/unified-generator') || referer.includes('/dashboard') || referer.includes('localhost:5000') || referer.includes('.replit.app'))) {
    console.log('🟢 CONTEXT: UI referer detected - MANUAL_UI');
    return {
      source: 'manual_ui',
      userAgent,
      referer,
      requestId: req?.headers?.['x-request-id']
    };
  }

  // 🎯 QUATERNARY: Check user agent for browser patterns (not curl/automated)
  if (userAgent && (userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari') || userAgent.includes('Firefox'))) {
    console.log('🟢 CONTEXT: Browser user-agent detected - MANUAL_UI');
    return {
      source: 'manual_ui',
      userAgent,
      referer,
      requestId: req?.headers?.['x-request-id']
    };
  }

  // Legacy source mappings for backward compatibility
  if (source === 'manual_ui' || source === 'manual') {
    console.log('🟢 CONTEXT: Legacy manual source detected - MANUAL_UI');
    return {
      source: 'manual_ui',
      userAgent,
      referer,
      requestId: req?.headers?.['x-request-id']
    };
  }

  if (source === 'bulk-scheduler' || source === 'bulk_scheduler') {
    console.log('🟢 CONTEXT: Bulk scheduler detected - BULK_SCHEDULER');
    return {
      source: 'bulk_scheduler',
      userAgent,
      referer
    };
  }

  if (source === 'automated-generator' || source === 'automated_generator') {
    console.log('🟢 CONTEXT: Automated generator detected - AUTOMATED_GENERATOR');
    return {
      source: 'automated_generator',
      userAgent,
      referer
    };
  }

  // Detect Make.com webhook requests
  if (source === 'make_com_webhook' || source === 'make-com-webhook' || userAgent.includes('Make-webhook') || userAgent.includes('make.com')) {
    console.log('🟢 CONTEXT: Make.com webhook detected - MAKE_COM_WEBHOOK');
    return {
      source: 'make_com_webhook',
      userAgent,
      referer
    };
  }

  // Detect scheduled job requests
  if (source === 'scheduled_job' || userAgent.includes('cron') || userAgent.includes('scheduled')) {
    console.log('🟢 CONTEXT: Scheduled job detected - SCHEDULED_JOB');
    return {
      source: 'scheduled_job',
      userAgent,
      referer
    };
  }

  // Detect webhook triggers
  if (source === 'webhook' || referer.includes('webhook') || userAgent.includes('webhook')) {
    console.log('🔴 CONTEXT: Webhook trigger detected - WEBHOOK_TRIGGER');
    return {
      source: 'webhook_trigger',
      userAgent,
      referer
    };
  }

  // Detect cron jobs
  if (source === 'cron' || userAgent.includes('node-cron')) {
    console.log('🔴 CONTEXT: Cron job detected - CRON_JOB');
    return {
      source: 'cron_job',
      userAgent,
      referer
    };
  }

  // Detect test requests
  if (referer.includes('test') || userAgent.includes('test') || source === 'test') {
    console.log('🟡 CONTEXT: Test request detected - TEST');
    return {
      source: 'test',
      userAgent,
      referer
    };
  }

  // Default to unknown
  console.log('🔴 CONTEXT: Unknown source detected - UNKNOWN');
  console.log(`   - User Agent: ${userAgent}`);
  console.log(`   - Referer: ${referer}`);
  console.log(`   - Source Header: ${source}`);
  console.log(`   - Request Mode: ${requestBody.mode || 'not specified'}`);
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

export function enableTrendFetching() {
  SAFEGUARD_CONFIG.ALLOW_TREND_FETCHING = true;
  console.log('🟢 SAFEGUARD: Trend fetching ENABLED');
}

export function disableTrendFetching() {
  SAFEGUARD_CONFIG.ALLOW_TREND_FETCHING = false;
  console.log('🔴 SAFEGUARD: Trend fetching DISABLED');
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