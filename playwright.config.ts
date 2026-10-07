import { defineConfig, devices } from '@playwright/test';

// Testes de comportamento contra o site construído (ADR-012).
// `npm test` faz o build antes; aqui só servimos `dist/` com o preview do Astro.
const PORT = 4321;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, locale: 'pt-BR' } },
    { name: 'celular', use: { ...devices['Pixel 7'], locale: 'pt-BR' } },
  ],
  webServer: {
    command: `npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
