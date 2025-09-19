import { test, expect } from '@playwright/test';

/**
 * Navigation and Layout E2E Test Suite
 * 
 * Tests the overall application navigation and layout:
 * - Sidebar navigation functionality
 * - Page routing and loading
 * - Responsive behavior
 * - User experience consistency
 */

test.describe('Navigation and Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the main CookAIng Marketing page
    await page.goto('/cookaing-marketing');
    await expect(page).toHaveTitle(/CookAIng Marketing/);
  });

  test('should navigate through all main sections', async ({ page }) => {
    // Verify sidebar is present
    await expect(page.getByTestId('sidebar-cookaing-marketing')).toBeVisible();
    
    // Test Content Generation navigation
    await page.getByTestId('link-content-generation').click();
    await expect(page).toHaveURL('/cookaing-marketing/content-generation');
    await expect(page.getByTestId('heading-content-generation')).toBeVisible();
    
    // Test Bulk Generation navigation
    await page.getByTestId('link-bulk-generation').click();
    await expect(page).toHaveURL('/cookaing-marketing/bulk-generation');
    await expect(page.getByTestId('heading-bulk-generation')).toBeVisible();
    
    // Test Intelligence navigation
    await page.getByTestId('link-intelligence').click();
    await expect(page).toHaveURL('/cookaing-marketing/intelligence');
    await expect(page.getByTestId('heading-intelligence')).toBeVisible();
    
    // Test Social Automation navigation
    await page.getByTestId('link-social-automation').click();
    await expect(page).toHaveURL('/cookaing-marketing/social-automation');
    await expect(page.getByTestId('heading-social-automation')).toBeVisible();
    
    // Test Personalization navigation
    await page.getByTestId('link-personalization').click();
    await expect(page).toHaveURL('/cookaing-marketing/personalization');
    await expect(page.getByTestId('heading-personalization')).toBeVisible();
  });

  test('should navigate through all marketing tool sections', async ({ page }) => {
    // Test Campaigns navigation
    await page.getByTestId('link-campaigns').click();
    await expect(page).toHaveURL('/cookaing-marketing/campaigns');
    await expect(page.getByTestId('heading-campaigns')).toBeVisible();
    
    // Test Segments navigation
    await page.getByTestId('link-segments').click();
    await expect(page).toHaveURL('/cookaing-marketing/segments');
    await expect(page.getByTestId('heading-segments')).toBeVisible();
    
    // Test A/B Testing navigation
    await page.getByTestId('link-ab-testing').click();
    await expect(page).toHaveURL('/cookaing-marketing/ab-testing');
    await expect(page.getByTestId('heading-ab-testing')).toBeVisible();
    
    // Test Reports navigation
    await page.getByTestId('link-reports').click();
    await expect(page).toHaveURL('/cookaing-marketing/reports');
    await expect(page.getByTestId('heading-reports')).toBeVisible();
    
    // Test Attribution navigation
    await page.getByTestId('link-attribution').click();
    await expect(page).toHaveURL('/cookaing-marketing/attribution');
    await expect(page.getByTestId('heading-attribution')).toBeVisible();
  });

  test('should access admin and testing tools', async ({ page }) => {
    // Test Admin Tools navigation
    await page.getByTestId('link-admin').click();
    await expect(page).toHaveURL('/cookaing-marketing/admin');
    await expect(page.getByTestId('heading-admin')).toBeVisible();
    
    // Test Testing Tools navigation
    await page.getByTestId('link-testing').click();
    await expect(page).toHaveURL('/cookaing-marketing/testing');
    await expect(page.getByTestId('heading-testing')).toBeVisible();
    
    // Test Developer Tools navigation
    await page.getByTestId('link-developer').click();
    await expect(page).toHaveURL('/cookaing-marketing/developer');
    await expect(page.getByTestId('heading-developer')).toBeVisible();
  });

  test('should handle responsive navigation on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // On mobile, sidebar might be collapsed or hidden
    const mobileMenu = page.getByTestId('button-mobile-menu');
    if (await mobileMenu.isVisible()) {
      // Open mobile menu
      await mobileMenu.click();
      
      // Verify navigation links are accessible
      await expect(page.getByTestId('link-content-generation')).toBeVisible();
      await expect(page.getByTestId('link-campaigns')).toBeVisible();
      
      // Test navigation still works
      await page.getByTestId('link-content-generation').click();
      await expect(page).toHaveURL('/cookaing-marketing/content-generation');
    }
  });

  test('should show active navigation states', async ({ page }) => {
    // Navigate to content generation
    await page.getByTestId('link-content-generation').click();
    
    // Verify active state styling
    await expect(page.getByTestId('link-content-generation')).toHaveClass(/active|selected|current/);
    
    // Navigate to different section
    await page.getByTestId('link-campaigns').click();
    
    // Verify previous link is no longer active
    await expect(page.getByTestId('link-content-generation')).not.toHaveClass(/active|selected|current/);
    
    // Verify new link is active
    await expect(page.getByTestId('link-campaigns')).toHaveClass(/active|selected|current/);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through several pages
    await page.getByTestId('link-content-generation').click();
    await expect(page).toHaveURL('/cookaing-marketing/content-generation');
    
    await page.getByTestId('link-campaigns').click();
    await expect(page).toHaveURL('/cookaing-marketing/campaigns');
    
    await page.getByTestId('link-intelligence').click();
    await expect(page).toHaveURL('/cookaing-marketing/intelligence');
    
    // Test browser back button
    await page.goBack();
    await expect(page).toHaveURL('/cookaing-marketing/campaigns');
    await expect(page.getByTestId('heading-campaigns')).toBeVisible();
    
    await page.goBack();
    await expect(page).toHaveURL('/cookaing-marketing/content-generation');
    await expect(page.getByTestId('heading-content-generation')).toBeVisible();
    
    // Test browser forward button
    await page.goForward();
    await expect(page).toHaveURL('/cookaing-marketing/campaigns');
    await expect(page.getByTestId('heading-campaigns')).toBeVisible();
  });

  test('should display loading states during navigation', async ({ page }) => {
    // Navigate to a page
    await page.getByTestId('link-intelligence').click();
    
    // Check if loading indicator appears (might be very brief)
    const loadingIndicator = page.getByTestId('loading-indicator');
    
    // If loading indicator exists, verify it appears and then disappears
    if (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
    }
    
    // Verify final page loads correctly
    await expect(page.getByTestId('heading-intelligence')).toBeVisible();
  });

  test('should handle direct URL access', async ({ page }) => {
    // Test direct navigation to specific pages
    await page.goto('/cookaing-marketing/bulk-generation');
    await expect(page.getByTestId('heading-bulk-generation')).toBeVisible();
    await expect(page.getByTestId('link-bulk-generation')).toHaveClass(/active|selected|current/);
    
    await page.goto('/cookaing-marketing/personalization');
    await expect(page.getByTestId('heading-personalization')).toBeVisible();
    await expect(page.getByTestId('link-personalization')).toHaveClass(/active|selected|current/);
    
    await page.goto('/cookaing-marketing/admin');
    await expect(page.getByTestId('heading-admin')).toBeVisible();
    await expect(page.getByTestId('link-admin')).toHaveClass(/active|selected|current/);
  });
});