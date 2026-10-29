import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-backend",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4180", trace: "retain-on-failure" },
  webServer: {
    command: "node server/start.mjs",
    url: "http://127.0.0.1:4180",
    reuseExistingServer: false,
    env: { PORT: "4180", STORE_DB: "test-results/backend.sqlite" },
  },
});
