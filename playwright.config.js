// playwright.config.js
// Playwright configuration pro GDPR E2E testing

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
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
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Custom user agent for testing */
    userAgent: 'Playwright-GDPR-Test',
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
    
    /* Set viewport size */
    viewport: { width: 1280, height: 720 },
    
    /* Set locale for testing */
    locale: 'cs-CZ',
    
    /* Set timezone */
    timezoneId: 'Europe/Prague',
  },

  /* Global setup */
  globalSetup: require.resolve('./tests/e2e/global-setup.js'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.js'),

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Desktop browsers
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        // Simulate Czech user
        locale: 'cs-CZ',
        timezoneId: 'Europe/Prague',
      },
    },

    {
      name: 'firefox',
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Firefox'],
        locale: 'cs-CZ',
        timezoneId: 'Europe/Prague',
      },
    },

    {
      name: 'webkit',
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Safari'],
        locale: 'cs-CZ',
        timezoneId: 'Europe/Prague',
      },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      dependencies: ['setup'],
      use: { 
        ...devices['Pixel 5'],
        locale: 'cs-CZ',
        timezoneId: 'Europe/Prague',
      },
    },

    {
      name: 'Mobile Safari',
      dependencies: ['setup'],
      use: { 
        ...devices['iPhone 12'],
        locale: 'cs-CZ',
        timezoneId: 'Europe/Prague',
      },
    },

    // GDPR specific test scenarios
    {
      name: 'gdpr-strict',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        locale: 'cs-CZ',
        timezoneId: 'Europe/Prague',
        // Disable JavaScript to test fallbacks
        javaScriptEnabled: false,
      },
    },

    {
      name: 'gdpr-old-browser',
      dependencies: ['setup'],
      use: {
        // Simulate older browser without modern features
        ...devices['Desktop Chrome'],
        locale: 'cs-CZ',
        // Simulate slow connection
        launchOptions: {
          args: ['--limit-network-throughput=50000'], // 50KB/s
        },
      },
    },
  ],

  /* Folder for test artifacts */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    env: {
      // Test environment variables
      NEXT_PUBLIC_GA_ID: 'GA-TEST-ID',
      NEXT_PUBLIC_FB_PIXEL_ID: 'FB-TEST-ID',
      NEXT_PUBLIC_HOTJAR_ID: 'HJ-TEST-ID',
      GDPR_ENCRYPTION_KEY: 'test-encryption-key-for-e2e',
      GDPR_JWT_SECRET: 'test-jwt-secret-for-e2e',
      NODE_ENV: 'test',
    },
  },

  /* Test timeout */
  timeout: 30 * 1000, // 30 seconds per test

  /* Global test configuration */
  expect: {
    // Custom timeout for expect assertions
    timeout: 10 * 1000, // 10 seconds
  },
});