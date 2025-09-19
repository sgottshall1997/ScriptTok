import { defineConfig, devices } from '@playwright/test';

/**
 * CookAIng Marketing Engine - Playwright E2E Configuration
 * 
 * Comprehensive end-to-end testing configuration with:
 * - Multiple browser support (Chromium, Firefox, WebKit)
 * - Mock mode testing with deterministic providers
 * - Visual regression testing capabilities
 * - Parallel execution with proper isolation
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable mock mode for consistent testing
        extraHTTPHeaders: {
          'X-Test-Mode': 'mock'
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        extraHTTPHeaders: {
          'X-Test-Mode': 'mock'
        }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        extraHTTPHeaders: {
          'X-Test-Mode': 'mock'
        }
      },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        extraHTTPHeaders: {
          'X-Test-Mode': 'mock'
        }
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        extraHTTPHeaders: {
          'X-Test-Mode': 'mock'
        }
      },
    },
  ],

  /* Global setup for testing environment */
  globalSetup: './tests/e2e/global-setup.ts',
  
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Test timeout */
  timeout: 30 * 1000,
  
  /* Expect timeout */
  expect: {
    timeout: 5 * 1000,
  },
});