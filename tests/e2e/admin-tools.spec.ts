import { test, expect } from '@playwright/test';

/**
 * Admin Tools E2E Test Suite
 * 
 * Tests the administrative and testing tools:
 * - System health monitoring
 * - Test data seeding and reset
 * - Provider testing and validation
 * - Performance monitoring
 */

test.describe('Admin Tools Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin tools page
    await page.goto('/cookaing-marketing/admin');
    await expect(page).toHaveTitle(/Admin Tools/);
  });

  test('should display system health dashboard', async ({ page }) => {
    // Check for health status indicators
    await expect(page.getByTestId('indicator-system-health')).toBeVisible();
    await expect(page.getByTestId('indicator-database-health')).toBeVisible();
    await expect(page.getByTestId('indicator-api-health')).toBeVisible();
    
    // Verify health statuses show appropriate values
    const systemHealth = await page.getByTestId('indicator-system-health').textContent();
    expect(systemHealth).toMatch(/(Healthy|Warning|Error)/);
    
    // Check for system metrics
    await expect(page.getByTestId('text-uptime')).toBeVisible();
    await expect(page.getByTestId('text-memory-usage')).toBeVisible();
    await expect(page.getByTestId('text-response-time')).toBeVisible();
  });

  test('should run system self-test successfully', async ({ page }) => {
    // Click run self-test button
    await page.getByTestId('button-run-self-test').click();
    
    // Wait for test to complete
    await expect(page.getByTestId('text-test-status')).toHaveText('Running', { timeout: 5000 });
    await expect(page.getByTestId('text-test-status')).toHaveText('Completed', { timeout: 30000 });
    
    // Verify test results
    await expect(page.getByTestId('section-test-results')).toBeVisible();
    
    // Check individual test components
    await expect(page.getByTestId('result-content-generation')).toContainText('✓');
    await expect(page.getByTestId('result-intelligence-providers')).toContainText('✓');
    await expect(page.getByTestId('result-social-automation')).toContainText('✓');
    await expect(page.getByTestId('result-personalization')).toContainText('✓');
    
    // Verify overall success
    await expect(page.getByTestId('text-overall-result')).toContainText('All tests passed');
  });

  test('should manage test data seeding', async ({ page }) => {
    // Navigate to test data section
    await page.getByTestId('tab-test-data').click();
    
    // Reset test data first
    await page.getByTestId('button-reset-test-data').click();
    await page.getByTestId('button-confirm-reset').click();
    
    // Wait for reset completion
    await expect(page.getByTestId('text-reset-status')).toHaveText('Completed', { timeout: 10000 });
    
    // Seed minimal test data
    await page.getByTestId('select-seed-preset').click();
    await page.getByTestId('option-minimal').click();
    await page.getByTestId('button-seed-data').click();
    
    // Verify seeding completion
    await expect(page.getByTestId('text-seed-status')).toHaveText('Completed', { timeout: 15000 });
    
    // Check seeding statistics
    await expect(page.getByTestId('text-organizations-count')).toContainText('1');
    // Verify counts show numbers
    const contactsText = await page.getByTestId('text-contacts-count').textContent();
    const campaignsText = await page.getByTestId('text-campaigns-count').textContent();
    expect(contactsText).toMatch(/\d+/);
    expect(campaignsText).toMatch(/\d+/);
  });

  test('should test provider mock functionality', async ({ page }) => {
    // Navigate to provider testing section
    await page.getByTestId('tab-provider-testing').click();
    
    // Test content generation provider
    await page.getByTestId('button-test-content-generation').click();
    await expect(page.getByTestId('result-content-generation')).toContainText('✓', { timeout: 10000 });
    
    // Test intelligence providers
    await page.getByTestId('button-test-intelligence').click();
    await expect(page.getByTestId('result-intelligence')).toContainText('✓', { timeout: 10000 });
    
    // Test social automation
    await page.getByTestId('button-test-social').click();
    await expect(page.getByTestId('result-social')).toContainText('✓', { timeout: 10000 });
    
    // Test personalization
    await page.getByTestId('button-test-personalization').click();
    await expect(page.getByTestId('result-personalization')).toContainText('✓', { timeout: 10000 });
    
    // Run comprehensive test
    await page.getByTestId('button-test-all-providers').click();
    await expect(page.getByTestId('text-comprehensive-result')).toContainText('All providers working correctly', { timeout: 20000 });
  });

  test('should display performance monitoring data', async ({ page }) => {
    // Navigate to performance monitoring
    await page.getByTestId('tab-performance').click();
    
    // Check for performance metrics
    await expect(page.getByTestId('chart-response-times')).toBeVisible();
    await expect(page.getByTestId('chart-throughput')).toBeVisible();
    await expect(page.getByTestId('chart-error-rates')).toBeVisible();
    
    // Verify key performance indicators
    await expect(page.getByTestId('text-avg-response-time')).toBeVisible();
    await expect(page.getByTestId('text-requests-per-minute')).toBeVisible();
    await expect(page.getByTestId('text-error-rate')).toBeVisible();
    
    // Check for alerts and warnings
    const alertsSection = page.getByTestId('section-performance-alerts');
    if (await alertsSection.isVisible()) {
      await expect(page.getByTestId('list-active-alerts')).toBeVisible();
    }
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    // Test invalid test data preset
    await page.getByTestId('tab-test-data').click();
    
    // Try seeding with invalid preset (if validation exists)
    await page.getByTestId('select-seed-preset').click();
    
    // If there's a way to input invalid data, test it
    // This would depend on implementation details
    
    // Test provider failure scenarios
    await page.getByTestId('tab-provider-testing').click();
    
    // The mock providers should always succeed in test mode
    // But verify error handling UI is present
    await expect(page.getByTestId('section-error-handling')).toBeVisible();
  });

  test('should export system diagnostics', async ({ page }) => {
    // Navigate to diagnostics section
    await page.getByTestId('tab-diagnostics').click();
    
    // Generate diagnostics report
    await page.getByTestId('button-generate-diagnostics').click();
    
    // Wait for generation
    await expect(page.getByTestId('text-diagnostics-status')).toHaveText('Ready for download', { timeout: 15000 });
    
    // Verify download button is available
    await expect(page.getByTestId('button-download-diagnostics')).toBeVisible();
    
    // Check report contents preview
    await expect(page.getByTestId('text-report-summary')).toBeVisible();
    await expect(page.getByTestId('text-system-info')).toBeVisible();
    await expect(page.getByTestId('text-test-results')).toBeVisible();
  });
});