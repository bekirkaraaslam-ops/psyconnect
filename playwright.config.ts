import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 360000,
  use: {
    baseURL: 'https://seansify.com',
    video: 'on',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      slowMo: 80,
      args: ['--start-maximized'],
    },
    screenshot: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'demo-output',
})
