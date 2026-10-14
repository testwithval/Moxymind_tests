import fs from 'node:fs';
import { chromium, defineConfig, devices } from '@playwright/test';

/**
 * Sauce Demo UI tests (Chromium).
 * Run: npm test
 *
 * Prefer the Chromium build Playwright installs. If that binary is missing
 * because the download CDN timed out, fall back to local Chrome so the
 * default command still starts.
 */
const browserLaunch = fs.existsSync(chromium.executablePath())
  ? {}
  : { channel: 'chrome' as const };

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',
    headless: !!process.env.CI,
    // Sauce Demo exposes stable data-test attributes (not data-testid).
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    // Screenshots are enough; video stays off so a missing ffmpeg download cannot fail the run.
    video: 'off',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...browserLaunch,
      },
    },
  ],
});
