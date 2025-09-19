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
    const healthResponse = await fetch('http://localhost:5000/api/cookaing-marketing/self-test');
    if (!healthResponse.ok) {
      throw new Error('Server health check failed');
    }
    
    // Seed minimal test data for consistent test runs
    const response = await fetch('http://localhost:5000/api/cookaing-marketing/admin/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset: 'minimal' })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to setup test environment: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📊 Test environment seeded:', result.stats);
    return true;
  } catch (error) {
    console.warn('⚠️ Could not setup test environment, server may not be running');
    return false;
  }
}

async function resetMockProviders() {
  try {
    const response = await fetch('http://localhost:5000/api/cookaing-marketing/admin/reset-mocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('🔄 Mock providers reset');
    }
  } catch (error) {
    // Silent fail if server not available
  }
}

async function cleanupTestEnvironment() {
  // Cleanup can be added here if needed
  console.log('🧹 Test environment cleanup complete');
}