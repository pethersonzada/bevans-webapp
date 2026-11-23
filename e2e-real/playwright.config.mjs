import {defineConfig,devices} from '@playwright/test';

// Uso somente no workflow manual de homologação, contra a origem aprovada.
export default defineConfig({
 testDir:'.',
 testMatch:'**/*.spec.mjs',
 fullyParallel:false,
 forbidOnly:true,
 retries:0,
 workers:1,
 timeout:60000,
 expect:{timeout:20000},
 reporter:'line',
 use:{
  ...devices['Desktop Chrome'],
  baseURL:process.env.BEVANS_STAGING_WEB_URL,
  trace:'off',
  screenshot:'off',
  video:'off',
  actionTimeout:15000,
 },
 projects:[{name:'chromium-staging',use:{...devices['Desktop Chrome']}}],
});
