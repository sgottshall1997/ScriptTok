import { test, expect } from '@playwright/test';

/**
 * Bulk Generation E2E Test Suite
 * 
 * Tests the automated bulk content generation system:
 * - Scheduled bulk generation
 * - Manual bulk generation
 * - Job monitoring and management
 * - Error handling and recovery
 */

test.describe('Bulk Generation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to bulk generation page
    await page.goto('/cookaing-marketing/bulk-generation');
    await expect(page).toHaveTitle(/Bulk Generation/);
  });

  test('should create and execute manual bulk generation job', async ({ page }) => {
    // Configure bulk generation parameters
    await page.getByTestId('input-job-name').fill('Test Bulk Job');
    await page.getByTestId('input-content-count').fill('5');
    
    // Select multiple niches
    await page.getByTestId('select-niches').click();
    await page.getByTestId('option-fitness').click();
    await page.getByTestId('option-beauty').click();
    await page.getByTestId('select-niches').press('Escape'); // Close dropdown
    
    // Select platforms
    await page.getByTestId('select-platforms').click();
    await page.getByTestId('option-instagram').click();
    await page.getByTestId('option-tiktok').click();
    await page.getByTestId('select-platforms').press('Escape');
    
    // Configure AI settings
    await page.getByTestId('select-ai-model').click();
    await page.getByTestId('option-claude').click();
    
    // Start bulk generation
    await page.getByTestId('button-start-bulk').click();
    
    // Verify job is created and started
    await expect(page.getByTestId('text-job-status')).toHaveText('Running', { timeout: 5000 });
    await expect(page.getByTestId('text-job-progress')).toBeVisible();
    
    // Wait for job completion (with timeout)
    await expect(page.getByTestId('text-job-status')).toHaveText('Completed', { timeout: 30000 });
    
    // Verify results
    await expect(page.getByTestId('text-generated-count')).toContainText('5');
    await expect(page.getByTestId('text-success-rate')).toBeVisible();
  });

  test('should display job queue and active jobs', async ({ page }) => {
    // Check if job queue is visible
    await expect(page.getByTestId('section-job-queue')).toBeVisible();
    
    // Should show active jobs list
    await expect(page.getByTestId('list-active-jobs')).toBeVisible();
    
    // If there are existing jobs, verify their display
    const jobItems = page.getByTestId('item-job').first();
    if (await jobItems.isVisible()) {
      await expect(jobItems.getByTestId('text-job-name')).toBeVisible();
      await expect(jobItems.getByTestId('text-job-status')).toBeVisible();
      await expect(jobItems.getByTestId('text-job-progress')).toBeVisible();
    }
  });

  test('should handle job cancellation', async ({ page }) => {
    // Start a bulk job
    await page.getByTestId('input-job-name').fill('Cancellable Job');
    await page.getByTestId('input-content-count').fill('10');
    await page.getByTestId('select-niches').click();
    await page.getByTestId('option-food').click();
    await page.getByTestId('select-niches').press('Escape');
    
    await page.getByTestId('button-start-bulk').click();
    
    // Wait for job to start
    await expect(page.getByTestId('text-job-status')).toHaveText('Running', { timeout: 5000 });
    
    // Cancel the job
    await page.getByTestId('button-cancel-job').click();
    
    // Confirm cancellation
    await page.getByTestId('button-confirm-cancel').click();
    
    // Verify job is cancelled
    await expect(page.getByTestId('text-job-status')).toHaveText('Cancelled', { timeout: 10000 });
  });

  test('should validate bulk generation parameters', async ({ page }) => {
    // Try to start bulk generation without required fields
    await page.getByTestId('button-start-bulk').click();
    
    // Should show validation errors
    await expect(page.getByTestId('text-validation-error')).toBeVisible();
    await expect(page.getByTestId('text-validation-error')).toContainText('Job name is required');
    
    // Fill job name but invalid count
    await page.getByTestId('input-job-name').fill('Test Job');
    await page.getByTestId('input-content-count').fill('0');
    await page.getByTestId('button-start-bulk').click();
    
    // Should show count validation error
    await expect(page.getByTestId('text-validation-error')).toContainText('Content count must be at least 1');
    
    // Test maximum count validation
    await page.getByTestId('input-content-count').fill('1001');
    await page.getByTestId('button-start-bulk').click();
    
    // Should show max count validation error
    await expect(page.getByTestId('text-validation-error')).toContainText('Content count cannot exceed 1000');
  });

  test('should display bulk generation analytics', async ({ page }) => {
    // Navigate to analytics section if it exists
    const analyticsSection = page.getByTestId('section-bulk-analytics');
    if (await analyticsSection.isVisible()) {
      
      // Check for key metrics
      await expect(page.getByTestId('text-total-jobs')).toBeVisible();
      await expect(page.getByTestId('text-success-rate')).toBeVisible();
      await expect(page.getByTestId('text-avg-generation-time')).toBeVisible();
      
      // Check for charts/visualizations
      await expect(page.getByTestId('chart-job-history')).toBeVisible();
      await expect(page.getByTestId('chart-success-rates')).toBeVisible();
    }
  });
});