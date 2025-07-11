/**
 * 🚫 GLOBAL GENERATION GATEKEEPER
 * This is the ultimate content generation security system that must be called
 * at the TOP of EVERY single content generation entry point.
 * 
 * CRITICAL: This prevents ALL unauthorized content generation
 */

import { Request } from 'express';
import { validateGenerationRequest, detectGenerationContext } from './generation-safeguards';

export interface GenerationAttempt {
  timestamp: string;
  source: string;
  endpoint: string;
  allowed: boolean;
  reason?: string;
  userAgent?: string;
  referer?: string;
  ipAddress?: string;
}

// Store all generation attempts for monitoring
const generationAttempts: GenerationAttempt[] = [];

/**
 * 🚫 CRITICAL GATEKEEPER: Must be called at the start of EVERY content generation function
 */
export function validateContentGenerationRequest(req: Request, endpoint: string): {
  allowed: boolean;
  reason?: string;
  source: string;
} {
  console.log(`\n🚫 GLOBAL GATEKEEPER: Validating generation request for ${endpoint}`);
  console.log('=' .repeat(80));
  
  // First detect the generation context from the request
  const context = detectGenerationContext(req);
  
  // Then validate the detected context
  const validation = validateGenerationRequest(context);
  
  const userAgent = req?.headers?.['user-agent'] || 'unknown';
  const referer = req?.headers?.referer || 'unknown';
  const ipAddress = req?.ip || 'unknown';
  
  // Log the attempt
  const attempt: GenerationAttempt = {
    timestamp: new Date().toISOString(),
    source: context.source,
    endpoint,
    allowed: validation.allowed,
    reason: validation.reason,
    userAgent,
    referer,
    ipAddress
  };
  
  generationAttempts.push(attempt);
  
  // Keep only last 100 attempts
  if (generationAttempts.length > 100) {
    generationAttempts.shift();
  }
  
  // Log the decision
  if (validation.allowed) {
    console.log(`✅ GATEKEEPER: GENERATION ALLOWED`);
    console.log(`   Source: ${context.source}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   User Agent: ${userAgent}`);
    console.log(`   Referer: ${referer}`);
  } else {
    console.log(`🚫 GATEKEEPER: GENERATION BLOCKED`);
    console.log(`   Reason: ${validation.reason}`);
    console.log(`   Source: ${context.source}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   User Agent: ${userAgent}`);
    console.log(`   Referer: ${referer}`);
  }
  
  console.log('=' .repeat(80));
  
  return {
    allowed: validation.allowed,
    reason: validation.reason,
    source: context.source
  };
}

/**
 * 📊 Get all generation attempts for monitoring
 */
export function getGenerationAttempts(): GenerationAttempt[] {
  return [...generationAttempts];
}

/**
 * 🚨 Get blocked generation attempts
 */
export function getBlockedAttempts(): GenerationAttempt[] {
  return generationAttempts.filter(attempt => !attempt.allowed);
}

/**
 * ✅ Get allowed generation attempts
 */
export function getAllowedAttempts(): GenerationAttempt[] {
  return generationAttempts.filter(attempt => attempt.allowed);
}

/**
 * 📈 Get generation attempt statistics
 */
export function getGenerationStats(): {
  total: number;
  allowed: number;
  blocked: number;
  sources: { [key: string]: number };
  endpoints: { [key: string]: number };
} {
  const stats = {
    total: generationAttempts.length,
    allowed: getAllowedAttempts().length,
    blocked: getBlockedAttempts().length,
    sources: {} as { [key: string]: number },
    endpoints: {} as { [key: string]: number }
  };
  
  generationAttempts.forEach(attempt => {
    stats.sources[attempt.source] = (stats.sources[attempt.source] || 0) + 1;
    stats.endpoints[attempt.endpoint] = (stats.endpoints[attempt.endpoint] || 0) + 1;
  });
  
  return stats;
}

/**
 * 🧹 Clear generation attempt history
 */
export function clearGenerationAttempts(): void {
  generationAttempts.length = 0;
  console.log('🧹 Generation attempt history cleared');
}