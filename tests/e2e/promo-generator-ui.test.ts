import { test, expect, Page } from '@playwright/test';

test.describe('CookAIng Manual Promo Generator E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/cookaing-marketing');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('CookAIng Marketing');
    
    // Navigate to Promo Generator section
    await page.click('[data-testid="nav-promo-generator"]');
    await expect(page.locator('[data-testid="promo-generator-form"]')).toBeVisible();
  });

  test.describe('Form Input Validation', () => {
    test('should display all required form fields', async () => {
      // Check all form fields are present
      await expect(page.locator('[data-testid="input-audience-persona"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-key-benefits"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-features"]')).toBeVisible();
      await expect(page.locator('[data-testid="select-channels"]')).toBeVisible();
      await expect(page.locator('[data-testid="select-objective"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-cta-url"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-campaign"]')).toBeVisible();
      
      // Optional fields should be visible but not required
      await expect(page.locator('[data-testid="input-offer"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-proof-points"]')).toBeVisible();
      await expect(page.locator('[data-testid="select-tone"]')).toBeVisible();
    });

    test('should validate required fields on submit', async () => {
      // Click generate without filling required fields
      await page.click('[data-testid="button-generate"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="error-audience-persona"]')).toContainText('required');
      await expect(page.locator('[data-testid="error-key-benefits"]')).toContainText('required');
      await expect(page.locator('[data-testid="error-features"]')).toContainText('required');
      await expect(page.locator('[data-testid="error-channels"]')).toContainText('required');
      await expect(page.locator('[data-testid="error-cta-url"]')).toContainText('required');
      await expect(page.locator('[data-testid="error-campaign"]')).toContainText('required');
    });

    test('should validate URL format', async () => {
      // Fill in required fields with invalid URL
      await page.fill('[data-testid="input-audience-persona"]', 'busy parents');
      await page.fill('[data-testid="input-key-benefits"]', 'save time, healthy meals');
      await page.fill('[data-testid="input-features"]', 'meal planning, recipes');
      await page.selectOption('[data-testid="select-channels"]', 'tiktok_reel');
      await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
      await page.fill('[data-testid="input-cta-url"]', 'not-a-valid-url');
      await page.fill('[data-testid="input-campaign"]', 'test-campaign');
      
      await page.click('[data-testid="button-generate"]');
      
      // Should show URL validation error
      await expect(page.locator('[data-testid="error-cta-url"]')).toContainText('valid URL');
    });

    test('should accept valid form input', async () => {
      // Fill in all required fields with valid data
      await page.fill('[data-testid="input-audience-persona"]', 'busy working parents');
      await page.fill('[data-testid="input-key-benefits"]', 'save time on meal planning, healthier family meals');
      await page.fill('[data-testid="input-features"]', 'AI meal suggestions, grocery list automation');
      await page.selectOption('[data-testid="select-channels"]', 'tiktok_reel');
      await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com/signup');
      await page.fill('[data-testid="input-campaign"]', 'summer-launch');
      
      // Should not show validation errors
      await expect(page.locator('[data-testid="error-audience-persona"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="error-key-benefits"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="error-features"]')).not.toBeVisible();
    });
  });

  test.describe('Content Generation Flow', () => {
    test('should generate promo content successfully', async () => {
      // Fill in valid form data
      await page.fill('[data-testid="input-audience-persona"]', 'busy working parents');
      await page.fill('[data-testid="input-key-benefits"]', 'save time on meal planning, healthier family meals');
      await page.fill('[data-testid="input-features"]', 'AI meal suggestions, grocery list automation');
      await page.selectOption('[data-testid="select-channels"]', 'tiktok_reel');
      await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com/signup');
      await page.fill('[data-testid="input-campaign"]', 'e2e-test-campaign');
      
      // Click generate button
      await page.click('[data-testid="button-generate"]');
      
      // Should show loading state
      await expect(page.locator('[data-testid="loading-generate"]')).toBeVisible();
      await expect(page.locator('[data-testid="button-generate"]')).toBeDisabled();
      
      // Wait for content to be generated
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
      
      // Should hide loading state
      await expect(page.locator('[data-testid="loading-generate"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="button-generate"]')).toBeEnabled();
    });

    test('should display generated content correctly', async () => {
      // Fill and generate content
      await page.fill('[data-testid="input-audience-persona"]', 'home cooks');
      await page.fill('[data-testid="input-key-benefits"]', 'easier meal planning');
      await page.fill('[data-testid="input-features"]', 'recipe suggestions');
      await page.selectOption('[data-testid="select-channels"]', 'email');
      await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com');
      await page.fill('[data-testid="input-campaign"]', 'display-test');
      
      await page.click('[data-testid="button-generate"]');
      
      // Wait for content to be displayed
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
      
      // Check content structure
      await expect(page.locator('[data-testid="content-body"]')).toBeVisible();
      await expect(page.locator('[data-testid="content-body"]')).toContainText('CookAIng');
      
      // Check CTA information
      await expect(page.locator('[data-testid="content-cta"]')).toBeVisible();
      await expect(page.locator('[data-testid="cta-text"]')).not.toBeEmpty();
      await expect(page.locator('[data-testid="cta-url"]')).toContainText('https://cookaing.com');
      await expect(page.locator('[data-testid="utm-url"]')).toContainText('utm_');
      
      // Check metadata
      await expect(page.locator('[data-testid="content-metadata"]')).toBeVisible();
      await expect(page.locator('[data-testid="metadata-persona"]')).toContainText('home cooks');
      await expect(page.locator('[data-testid="metadata-objective"]')).toContainText('feature_highlight');
      await expect(page.locator('[data-testid="metadata-channel"]')).toContainText('email');
    });

    test('should generate content for multiple channels', async () => {
      // Fill form with multiple channels
      await page.fill('[data-testid="input-audience-persona"]', 'cooking enthusiasts');
      await page.fill('[data-testid="input-key-benefits"]', 'discover new recipes');
      await page.fill('[data-testid="input-features"]', 'AI recommendations');
      
      // Select multiple channels
      await page.selectOption('[data-testid="select-channels"]', ['tiktok_reel', 'instagram_reel', 'email']);
      
      await page.selectOption('[data-testid="select-objective"]', 'how_to_demo');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com/demo');
      await page.fill('[data-testid="input-campaign"]', 'multi-channel-test');
      
      await page.click('[data-testid="button-generate"]');
      
      // Should generate content for each channel
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
      
      // Should have multiple content sections
      await expect(page.locator('[data-testid="content-tiktok_reel"]')).toBeVisible();
      await expect(page.locator('[data-testid="content-instagram_reel"]')).toBeVisible();
      await expect(page.locator('[data-testid="content-email"]')).toBeVisible();
      
      // Each should have different content
      const tiktokContent = await page.locator('[data-testid="content-body-tiktok_reel"]').textContent();
      const instagramContent = await page.locator('[data-testid="content-body-instagram_reel"]').textContent();
      const emailContent = await page.locator('[data-testid="content-body-email"]').textContent();
      
      expect(tiktokContent).not.toBe(instagramContent);
      expect(instagramContent).not.toBe(emailContent);
    });

    test('should handle generation errors gracefully', async () => {
      // Mock a server error by using invalid data that might cause backend failure
      await page.fill('[data-testid="input-audience-persona"]', 'TRIGGER_ERROR_TEST');
      await page.fill('[data-testid="input-key-benefits"]', 'error test');
      await page.fill('[data-testid="input-features"]', 'error feature');
      await page.selectOption('[data-testid="select-channels"]', 'tiktok_reel');
      await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
      await page.fill('[data-testid="input-cta-url"]', 'https://error-test.com');
      await page.fill('[data-testid="input-campaign"]', 'error-campaign');
      
      await page.click('[data-testid="button-generate"]');
      
      // Should either succeed or show error gracefully
      await Promise.race([
        // Wait for success
        expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 }),
        // Or wait for error message
        expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 })
      ]);
      
      // Loading state should be removed
      await expect(page.locator('[data-testid="loading-generate"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="button-generate"]')).toBeEnabled();
    });
  });

  test.describe('Content Quality Validation', () => {
    test('generated content should be Spartan compliant', async () => {
      // Generate content
      await page.fill('[data-testid="input-audience-persona"]', 'busy families');
      await page.fill('[data-testid="input-key-benefits"]', 'quick meal planning');
      await page.fill('[data-testid="input-features"]', 'smart recipes');
      await page.selectOption('[data-testid="select-channels"]', 'tiktok_reel');
      await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com');
      await page.fill('[data-testid="input-campaign"]', 'spartan-test');
      
      await page.click('[data-testid="button-generate"]');
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
      
      // Get generated content
      const contentBody = await page.locator('[data-testid="content-body"]').textContent();
      
      // Should contain CookAIng branding
      expect(contentBody).toContain('CookAIng');
      
      // Should not contain banned Spartan words
      const bannedWords = ['can', 'really', 'very', 'amazing', 'incredible', 'revolutionize', 'game-changer'];
      bannedWords.forEach(word => {
        expect(contentBody?.toLowerCase()).not.toContain(word);
      });
      
      // Should not contain emojis
      expect(contentBody).not.toMatch(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu);
      
      // Should not contain asterisks
      expect(contentBody).not.toContain('*');
    });

    test('should respect word count constraints per channel', async () => {
      const testCases = [
        { channel: 'tiktok_reel', maxWords: 50 },
        { channel: 'instagram_reel', maxWords: 50 },
        { channel: 'email', maxWords: 200 }
      ];

      for (const { channel, maxWords } of testCases) {
        // Fill form
        await page.fill('[data-testid="input-audience-persona"]', 'test users');
        await page.fill('[data-testid="input-key-benefits"]', 'test benefits');
        await page.fill('[data-testid="input-features"]', 'test features');
        await page.selectOption('[data-testid="select-channels"]', channel);
        await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
        await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com');
        await page.fill('[data-testid="input-campaign"]', `word-count-test-${channel}`);
        
        await page.click('[data-testid="button-generate"]');
        await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
        
        // Check word count
        const contentBody = await page.locator('[data-testid="content-body"]').textContent();
        const wordCount = contentBody?.split(/\s+/).length || 0;
        
        expect(wordCount).toBeLessThanOrEqual(maxWords + 10); // Allow small buffer for edge cases
        
        // Reset form for next test
        await page.reload();
        await page.click('[data-testid="nav-promo-generator"]');
      }
    });

    test('should include proper UTM tracking', async () => {
      await page.fill('[data-testid="input-audience-persona"]', 'test audience');
      await page.fill('[data-testid="input-key-benefits"]', 'test benefits');
      await page.fill('[data-testid="input-features"]', 'test features');
      await page.selectOption('[data-testid="select-channels"]', 'email');
      await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com/pricing');
      await page.fill('[data-testid="input-campaign"]', 'utm-tracking-test');
      
      await page.click('[data-testid="button-generate"]');
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
      
      // Check UTM parameters
      const utmUrl = await page.locator('[data-testid="utm-url"]').textContent();
      
      expect(utmUrl).toContain('utm_source=');
      expect(utmUrl).toContain('utm_medium=');
      expect(utmUrl).toContain('utm_campaign=utm-tracking-test');
      expect(utmUrl).toContain('utm_content=');
    });
  });

  test.describe('User Experience', () => {
    test('should provide helpful field descriptions', async () => {
      // Check for help text or tooltips
      await page.hover('[data-testid="input-audience-persona"]');
      
      // Should show tooltip or help text for persona field
      await expect(page.locator('[data-testid="tooltip-audience-persona"]')).toBeVisible();
      
      // Check other important fields have guidance
      await page.hover('[data-testid="select-objective"]');
      await expect(page.locator('[data-testid="tooltip-objective"]')).toBeVisible();
    });

    test('should save form state during generation', async () => {
      // Fill form
      const testPersona = 'form-state-test-persona';
      await page.fill('[data-testid="input-audience-persona"]', testPersona);
      await page.fill('[data-testid="input-key-benefits"]', 'test benefits');
      await page.fill('[data-testid="input-features"]', 'test features');
      await page.selectOption('[data-testid="select-channels"]', 'blog');
      await page.selectOption('[data-testid="select-objective"]', 'deep_dive');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com');
      await page.fill('[data-testid="input-campaign"]', 'form-state-test');
      
      await page.click('[data-testid="button-generate"]');
      
      // During loading, form should maintain its values
      const personaValue = await page.locator('[data-testid="input-audience-persona"]').inputValue();
      expect(personaValue).toBe(testPersona);
      
      // After generation, form should still maintain its values
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
      
      const personaValueAfter = await page.locator('[data-testid="input-audience-persona"]').inputValue();
      expect(personaValueAfter).toBe(testPersona);
    });

    test('should allow copying generated content', async () => {
      // Generate content
      await page.fill('[data-testid="input-audience-persona"]', 'copy test user');
      await page.fill('[data-testid="input-key-benefits"]', 'copy benefits');
      await page.fill('[data-testid="input-features"]', 'copy features');
      await page.selectOption('[data-testid="select-channels"]', 'linkedin_post');
      await page.selectOption('[data-testid="select-objective"]', 'feature_highlight');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com');
      await page.fill('[data-testid="input-campaign"]', 'copy-test');
      
      await page.click('[data-testid="button-generate"]');
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
      
      // Should have copy buttons
      await expect(page.locator('[data-testid="button-copy-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="button-copy-utm-url"]')).toBeVisible();
      
      // Click copy button
      await page.click('[data-testid="button-copy-content"]');
      
      // Should show copy success message
      await expect(page.locator('[data-testid="copy-success-message"]')).toBeVisible();
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Form should still be usable
      await expect(page.locator('[data-testid="promo-generator-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-audience-persona"]')).toBeVisible();
      await expect(page.locator('[data-testid="button-generate"]')).toBeVisible();
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Form should adapt appropriately
      await expect(page.locator('[data-testid="promo-generator-form"]')).toBeVisible();
      
      // Reset to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  });

  test.describe('Integration with Content History', () => {
    test('should save generated content to history', async () => {
      // Generate content
      await page.fill('[data-testid="input-audience-persona"]', 'history test user');
      await page.fill('[data-testid="input-key-benefits"]', 'history benefits');
      await page.fill('[data-testid="input-features"]', 'history features');
      await page.selectOption('[data-testid="select-channels"]', 'x_thread');
      await page.selectOption('[data-testid="select-objective"]', 'user_scenario');
      await page.fill('[data-testid="input-cta-url"]', 'https://cookaing.com');
      await page.fill('[data-testid="input-campaign"]', 'history-integration-test');
      
      await page.click('[data-testid="button-generate"]');
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 10000 });
      
      // Navigate to content history
      await page.click('[data-testid="nav-content-history"]');
      
      // Should show the generated content in history
      await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="history-item"]').first()).toContainText('history-integration-test');
      await expect(page.locator('[data-testid="history-item"]').first()).toContainText('user_scenario');
    });
  });
});