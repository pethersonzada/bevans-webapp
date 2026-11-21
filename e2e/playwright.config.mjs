import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
 testDir:'.',
 testMatch:'**/*.spec.mjs',
 fullyParallel:true,
 forbidOnly:!!process.env.CI,
 retries:process.env.CI?1:0,
 workers:process.env.CI?2:undefined,
 timeout:30000,
 expect:{timeout:10000},
 reporter:process.env.CI?[['list'],['html',{open:'never',outputFolder:'playwright-report'}]]:'list',
 use:{
  baseURL:process.env.BEVANS_E2E_BASE_URL||'http://127.0.0.1:4173',
  trace:'retain-on-failure',
  screenshot:'only-on-failure',
  video:'off',
  actionTimeout:10000,
 },
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
 webServer:{
  command:'npm run start -- -p 4173',
  url:'http://127.0.0.1:4173/painel',
  reuseExistingServer:!process.env.CI,
  timeout:90000,
 },
});
