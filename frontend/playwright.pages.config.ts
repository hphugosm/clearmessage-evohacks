import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export default defineConfig({
  testDir: './pages-tests', outputDir: './test-results-pages', workers: 1, retries: 0, reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:8872', trace: 'off' },
  webServer: { command: 'python3 scripts/preview_pages.py', cwd: root,
    url: 'http://127.0.0.1:8872/clearmessage-evohacks/', reuseExistingServer: false },
});
