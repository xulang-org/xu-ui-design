import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  outputDir: '.local/browser-results',
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  timeout: 30000,
  expect: { timeout: 5000, toHaveScreenshot: { animations:'disabled', caret:'hide', maxDiffPixelRatio:0.002 } },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'],['html',{outputFolder:'.local/browser-report',open:'never'}]],
  use: { baseURL:'http://127.0.0.1:4174', trace:'retain-on-failure', screenshot:'only-on-failure', locale:'zh-CN', reducedMotion:'reduce' },
  webServer: { command:'node scripts/serve.mjs', env:{PORT:'4174'}, url:'http://127.0.0.1:4174', reuseExistingServer:!process.env.CI },
  projects: [
    {name:'chromium',use:{browserName:'chromium'}},
    {name:'firefox',use:{browserName:'firefox'}},
    {name:'webkit',use:{browserName:'webkit'}}
  ]
});
