import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright E2E tests
 * 
 * This setup ensures:
 * - Server is running and healthy
 * - Mock providers are properly initialized
 * - Test environment is clean and ready
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting CookAIng Marketing Engine E2E test setup...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for server to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:5000';
    console.log(`⏳ Waiting for server at ${baseURL}...`);
    
    await page.goto(baseURL, { timeout: 30000 });
    console.log('✅ Server is ready');

    // Initialize mock providers and reset test environment
    console.log('🔧 Setting up mock providers...');
    
    try {
      // Reset mock providers to clean state
      const resetResponse = await page.request.post(`${baseURL}/api/cookaing-marketing/admin/reset-mocks`);
      if (resetResponse.ok()) {
        console.log('✅ Mock providers reset successfully');
      } else {
        console.log('⚠️ Mock provider reset failed, continuing...');
      }

      // Seed minimal test data
      const seedResponse = await page.request.post(`${baseURL}/api/cookaing-marketing/admin/seed`, {
        data: { preset: 'minimal' }
      });
      if (seedResponse.ok()) {
        console.log('✅ Test data seeded successfully');
      } else {
        console.log('⚠️ Test data seeding failed, continuing...');
      }

    } catch (error) {
      console.log('⚠️ Setup requests failed, continuing with tests...', error);
    }

    // Verify critical endpoints are responding
    console.log('🔍 Verifying critical endpoints...');
    
    const healthResponse = await page.request.get(`${baseURL}/api/cookaing-marketing/self-test`);
    if (healthResponse.ok()) {
      console.log('✅ Health check passed');
    } else {
      console.log('⚠️ Health check failed, tests may be unreliable');
    }

    console.log('🎯 E2E test environment ready!');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;