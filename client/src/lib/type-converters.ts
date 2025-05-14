/**
 * Helper functions to convert between backend and frontend types
 * This handles the date format conversion
 */

import type { ContentGeneration, ScraperStatus, ApiUsage } from "./types";
import type { 
  ContentGeneration as BackendContentGeneration,
  ScraperStatus as BackendScraperStatus,
} from "@shared/schema";

/**
 * Convert backend ContentGeneration to frontend ContentGeneration
 */
export function convertContentGeneration(backendGen: BackendContentGeneration): ContentGeneration {
  return {
    ...backendGen,
    createdAt: typeof backendGen.createdAt === 'string' 
      ? backendGen.createdAt 
      : new Date(backendGen.createdAt).toISOString()
  };
}

/**
 * Convert backend ScraperStatus to frontend ScraperStatus
 */
export function convertScraperStatus(backendStatus: BackendScraperStatus): ScraperStatus {
  return {
    ...backendStatus,
    status: backendStatus.status as 'active' | 'gpt-fallback' | 'degraded' | 'error' | 'rate-limited',
    lastCheck: typeof backendStatus.lastCheck === 'string'
      ? backendStatus.lastCheck
      : new Date(backendStatus.lastCheck).toISOString(),
    errorMessage: backendStatus.errorMessage || undefined
  };
}

/**
 * Convert arrays of backend types to frontend types
 */
export function convertContentGenerations(
  backendGens: BackendContentGeneration[]
): ContentGeneration[] {
  return backendGens.map(convertContentGeneration);
}

export function convertScraperStatuses(
  backendStatuses: BackendScraperStatus[]
): ScraperStatus[] {
  return backendStatuses.map(convertScraperStatus);
}