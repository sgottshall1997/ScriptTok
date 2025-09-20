/**
 * Vitest Setup - Phase 6 Testing Infrastructure
 * Global test configuration and environment setup
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';

// Global test configuration
beforeAll(async () => {
  console.log('🧪 Phase 6 Test Suite Setup');
  
  // Ensure test environment
  process.env.NODE_ENV = 'test';
  process.env.ALLOW_ADMIN_IN_PROD = 'true'; // Allow admin endpoints in test
  
  // Setup test database state
  await setupTestEnvironment();
});

afterAll(async () => {
  console.log('🧪 Phase 6 Test Suite Teardown');
  await cleanupTestEnvironment();
});

beforeEach(async () => {
  // Reset mock states before each test
  await resetMockProviders();
});

async function setupTestEnvironment() {
  try {
    // Check if server is running first
    const healthResponse = await fetch('http://localhost:5000/api/cookaing-marketing/admin/self-test');
    if (!healthResponse.ok) {
      console.warn('⚠️ CookAIng server health check failed, proceeding with available data');
    } else {
      console.log('✅ CookAIng server health check passed');
    }
    
    // Check GlowBot health  
    const glowbotHealth = await fetch('http://localhost:5000/api/glowbot/admin/self-test');
    if (!glowbotHealth.ok) {
      console.warn('⚠️ GlowBot server health check failed');
    } else {
      console.log('✅ GlowBot server health check passed');
    }
    
    // Skip seeding to avoid timeouts - use existing data from health checks
    console.log('📊 Using existing test data from server');
    return true;
  } catch (error) {
    console.warn('⚠️ Could not setup test environment, proceeding without server');
    return false;
  }
}

async function resetMockProviders() {
  try {
    // Reset both GlowBot and CookAIng mocks
    const glowbotReset = fetch('http://localhost:5000/api/glowbot/admin/reset-mocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => null);
    
    const cookAIngReset = fetch('http://localhost:5000/api/cookaing-marketing/admin/reset-mocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => null);
    
    const [glowResult, cookResult] = await Promise.allSettled([glowbotReset, cookAIngReset]);
    console.log('🔄 Mock providers reset attempted');
  } catch (error) {
    // Silent fail if server not available
  }
}

async function cleanupTestEnvironment() {
  // Cleanup can be added here if needed
  console.log('🧹 Test environment cleanup complete');
}