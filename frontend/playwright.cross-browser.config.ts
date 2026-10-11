import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Firefox's Playwright protocol cannot grant clipboard-read/write. The two
// read-back tests remain in Chromium and WebKit; Firefox still checks denial,
// missing-API, selectable previews and sharing fallback.
export default defineConfig({
  ...base,
  projects: [
    { name: 'firefox', grepInvert: /actual clipboard write contains only the neutral preview|uncertain result guidance and copy keep source and selected situation private/, use: { ...devices['Desktop Firefox'], baseURL: 'http://127.0.0.1:8000' } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], baseURL: 'http://127.0.0.1:8000' } },
  ],
  webServer: Array.isArray(base.webServer) ? base.webServer.slice(0, 1) : base.webServer,
});
