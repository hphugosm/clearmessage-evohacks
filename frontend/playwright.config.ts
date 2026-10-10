import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, retries: 0, maxFailures: 1,
  reporter: 'list',
  use: { trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'production', use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:8000' } },
    { name: 'dev-proxy', use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:5173' } },
  ],
  webServer: [
    { command: '.venv/bin/python scripts/serve.py', cwd: root, url: 'http://127.0.0.1:8000/api/health', reuseExistingServer: false, timeout: 30000 },
    { command: 'npm --prefix frontend run dev', cwd: root, url: 'http://127.0.0.1:5173', reuseExistingServer: false, timeout: 30000 },
  ],
});
