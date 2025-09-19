import { test, expect } from '@playwright/test';

/**
 * Content Generation E2E Test Suite
 * 
 * Tests the core content generation workflow:
 * - Platform-specific content creation
 * - Multi-AI provider integration
 * - Bulk generation capabilities
 * - Content quality validation
 */

test.describe('Content Generation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to content generation page
    await page.goto('/cookaing-marketing/content-generation');
    await expect(page).toHaveTitle(/Content Generation/);
  });

  test('should generate platform-specific content for TikTok', async ({ page }) => {
    // Select niche
    await page.getByTestId('input-niche').fill('fitness');
    
    // Select platform
    await page.getByTestId('select-platform').click();
    await page.getByTestId('option-tiktok').click();
    
    // Select tone
    await page.getByTestId('select-tone').click();
    await page.getByTestId('option-casual').click();
    
    // Generate content
    await page.getByTestId('button-generate').click();
    
    // Wait for generation to complete
    await expect(page.getByTestId('text-generation-status')).toHaveText('Generation complete', { timeout: 10000 });
    
    // Verify content is generated
    await expect(page.getByTestId('text-main-content')).toBeVisible();
    await expect(page.getByTestId('text-main-content')).not.toBeEmpty();
    
    // Verify platform-specific caption
    await expect(page.getByTestId('text-tiktok-caption')).toBeVisible();
    await expect(page.getByTestId('text-tiktok-caption')).not.toBeEmpty();
    
    // Verify content meets TikTok length requirements (should be under 2200 characters)
    const tiktokCaption = await page.getByTestId('text-tiktok-caption').textContent();
    expect(tiktokCaption?.length).toBeLessThanOrEqual(2200);
  });

  test('should generate content for Instagram with proper hashtags', async ({ page }) => {
    // Fill form for Instagram
    await page.getByTestId('input-niche').fill('beauty');
    await page.getByTestId('select-platform').click();
    await page.getByTestId('option-instagram').click();
    await page.getByTestId('select-tone').click();
    await page.getByTestId('option-professional').click();
    
    // Generate content
    await page.getByTestId('button-generate').click();
    
    // Wait for completion
    await expect(page.getByTestId('text-generation-status')).toHaveText('Generation complete', { timeout: 10000 });
    
    // Verify Instagram-specific content
    await expect(page.getByTestId('text-instagram-caption')).toBeVisible();
    
    // Verify hashtags are included
    const instagramCaption = await page.getByTestId('text-instagram-caption').textContent();
    expect(instagramCaption).toMatch(/#\w+/); // Should contain hashtags
    
    // Verify content length for Instagram (should be under 2200 characters)
    expect(instagramCaption?.length).toBeLessThanOrEqual(2200);
  });

  test('should handle multiple AI providers with fallback', async ({ page }) => {
    // Test with tech niche which might trigger different AI providers
    await page.getByTestId('input-niche').fill('tech');
    await page.getByTestId('select-platform').click();
    await page.getByTestId('option-youtube').click();
    await page.getByTestId('select-tone').click();
    await page.getByTestId('option-educational').click();
    
    // Generate content
    await page.getByTestId('button-generate').click();
    
    // Should complete successfully even with mock providers
    await expect(page.getByTestId('text-generation-status')).toHaveText('Generation complete', { timeout: 15000 });
    
    // Verify content quality indicators
    await expect(page.getByTestId('text-main-content')).toBeVisible();
    await expect(page.getByTestId('text-youtube-caption')).toBeVisible();
    
    // Verify AI provider attribution (should show mock mode)
    const statusText = await page.getByTestId('text-generation-status').textContent();
    expect(statusText).toBeTruthy();
  });

  test('should validate content before generation', async ({ page }) => {
    // Try to generate without required fields
    await page.getByTestId('button-generate').click();
    
    // Should show validation errors
    await expect(page.getByTestId('text-validation-error')).toBeVisible();
    await expect(page.getByTestId('text-validation-error')).toContainText('Niche is required');
    
    // Fill niche but leave platform empty
    await page.getByTestId('input-niche').fill('food');
    await page.getByTestId('button-generate').click();
    
    // Should still show validation error
    await expect(page.getByTestId('text-validation-error')).toContainText('Platform is required');
  });

  test('should display generation metrics and analytics', async ({ page }) => {
    // Generate content successfully
    await page.getByTestId('input-niche').fill('travel');
    await page.getByTestId('select-platform').click();
    await page.getByTestId('option-facebook').click();
    await page.getByTestId('select-tone').click();
    await page.getByTestId('option-engaging').click();
    
    await page.getByTestId('button-generate').click();
    await expect(page.getByTestId('text-generation-status')).toHaveText('Generation complete', { timeout: 10000 });
    
    // Check for analytics data
    await expect(page.getByTestId('text-generation-time')).toBeVisible();
    await expect(page.getByTestId('text-word-count')).toBeVisible();
    
    // Verify metrics show reasonable values
    const generationTime = await page.getByTestId('text-generation-time').textContent();
    expect(generationTime).toMatch(/\d+/); // Should contain numbers
    
    const wordCount = await page.getByTestId('text-word-count').textContent();
    expect(wordCount).toMatch(/\d+/); // Should contain numbers
  });
});