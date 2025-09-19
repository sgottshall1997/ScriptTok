import { test, expect } from '@playwright/test';

/**
 * Campaign Management E2E Test Suite
 * 
 * Tests the marketing campaign management workflow:
 * - Campaign creation and configuration
 * - A/B testing setup and analysis
 * - Audience segmentation
 * - Performance tracking
 */

test.describe('Campaign Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to campaign management page
    await page.goto('/cookaing-marketing/campaigns');
    await expect(page).toHaveTitle(/Campaigns/);
  });

  test('should create a new marketing campaign', async ({ page }) => {
    // Click create campaign button
    await page.getByTestId('button-create-campaign').click();
    
    // Fill campaign basic information
    await page.getByTestId('input-campaign-name').fill('Summer Fitness Campaign');
    await page.getByTestId('input-campaign-description').fill('Promoting summer fitness products and content');
    
    // Set campaign type
    await page.getByTestId('select-campaign-type').click();
    await page.getByTestId('option-product-launch').click();
    
    // Configure target audience
    await page.getByTestId('select-target-niches').click();
    await page.getByTestId('option-fitness').click();
    await page.getByTestId('option-health').click();
    await page.getByTestId('select-target-niches').press('Escape');
    
    // Set campaign schedule
    await page.getByTestId('input-start-date').fill('2025-06-01');
    await page.getByTestId('input-end-date').fill('2025-08-31');
    
    // Configure budget (if applicable)
    await page.getByTestId('input-budget').fill('5000');
    
    // Save campaign
    await page.getByTestId('button-save-campaign').click();
    
    // Verify campaign is created
    await expect(page.getByTestId('text-success-message')).toContainText('Campaign created successfully');
    await expect(page.getByTestId('text-campaign-status')).toHaveText('Draft');
  });

  test('should configure A/B testing for campaign', async ({ page }) => {
    // Assume we have a campaign to work with, or create one first
    await page.getByTestId('button-create-campaign').click();
    await page.getByTestId('input-campaign-name').fill('A/B Test Campaign');
    await page.getByTestId('select-campaign-type').click();
    await page.getByTestId('option-content-test').click();
    await page.getByTestId('button-save-campaign').click();
    
    // Navigate to A/B testing tab
    await page.getByTestId('tab-ab-testing').click();
    
    // Create variant A
    await page.getByTestId('button-add-variant').click();
    await page.getByTestId('input-variant-name').fill('Variant A - Casual Tone');
    await page.getByTestId('select-content-tone').click();
    await page.getByTestId('option-casual').click();
    await page.getByTestId('button-save-variant').click();
    
    // Create variant B
    await page.getByTestId('button-add-variant').click();
    await page.getByTestId('input-variant-name').fill('Variant B - Professional Tone');
    await page.getByTestId('select-content-tone').click();
    await page.getByTestId('option-professional').click();
    await page.getByTestId('button-save-variant').click();
    
    // Configure A/B test settings
    await page.getByTestId('input-traffic-split').fill('50'); // 50/50 split
    await page.getByTestId('select-success-metric').click();
    await page.getByTestId('option-engagement-rate').click();
    
    // Start A/B test
    await page.getByTestId('button-start-ab-test').click();
    
    // Verify test is running
    await expect(page.getByTestId('text-ab-status')).toHaveText('Running');
    await expect(page.getByTestId('text-traffic-split')).toContainText('50%');
  });

  test('should display campaign performance analytics', async ({ page }) => {
    // Look for existing campaigns or navigate to analytics view
    const campaignsExist = await page.getByTestId('item-campaign').first().isVisible();
    
    if (campaignsExist) {
      // Click on a campaign to view details
      await page.getByTestId('item-campaign').first().click();
      
      // Navigate to analytics tab
      await page.getByTestId('tab-analytics').click();
      
      // Verify analytics components are present
      await expect(page.getByTestId('chart-performance')).toBeVisible();
      await expect(page.getByTestId('text-total-reach')).toBeVisible();
      await expect(page.getByTestId('text-engagement-rate')).toBeVisible();
      await expect(page.getByTestId('text-conversion-rate')).toBeVisible();
      
      // Check for time-series data
      await expect(page.getByTestId('chart-timeline')).toBeVisible();
      
      // Verify data export functionality
      await expect(page.getByTestId('button-export-data')).toBeVisible();
    }
  });

  test('should manage campaign status transitions', async ({ page }) => {
    // Create a draft campaign first
    await page.getByTestId('button-create-campaign').click();
    await page.getByTestId('input-campaign-name').fill('Status Test Campaign');
    await page.getByTestId('select-campaign-type').click();
    await page.getByTestId('option-brand-awareness').click();
    await page.getByTestId('button-save-campaign').click();
    
    // Verify initial status is Draft
    await expect(page.getByTestId('text-campaign-status')).toHaveText('Draft');
    
    // Activate campaign
    await page.getByTestId('button-activate-campaign').click();
    await page.getByTestId('button-confirm-activate').click();
    
    // Verify status changed to Active
    await expect(page.getByTestId('text-campaign-status')).toHaveText('Active');
    
    // Pause campaign
    await page.getByTestId('button-pause-campaign').click();
    await page.getByTestId('button-confirm-pause').click();
    
    // Verify status changed to Paused
    await expect(page.getByTestId('text-campaign-status')).toHaveText('Paused');
  });

  test('should handle audience segmentation', async ({ page }) => {
    // Navigate to audience management
    await page.getByTestId('tab-audience').click();
    
    // Create new audience segment
    await page.getByTestId('button-create-segment').click();
    
    // Configure segment criteria
    await page.getByTestId('input-segment-name').fill('Fitness Enthusiasts');
    
    // Set demographic criteria
    await page.getByTestId('select-age-range').click();
    await page.getByTestId('option-25-34').click();
    
    // Set interest criteria
    await page.getByTestId('select-interests').click();
    await page.getByTestId('option-fitness').click();
    await page.getByTestId('option-nutrition').click();
    await page.getByTestId('select-interests').press('Escape');
    
    // Set behavioral criteria
    await page.getByTestId('select-behavior').click();
    await page.getByTestId('option-high-engagement').click();
    
    // Save segment
    await page.getByTestId('button-save-segment').click();
    
    // Verify segment is created
    await expect(page.getByTestId('text-success-message')).toContainText('Audience segment created');
    await expect(page.getByTestId('text-segment-size')).toBeVisible();
    // Verify segment size shows a number
    const segmentSizeText = await page.getByTestId('text-segment-size').textContent();
    expect(segmentSizeText).toMatch(/\d+/); // Should show a number
  });
});