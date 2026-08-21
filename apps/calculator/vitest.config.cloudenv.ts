/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for cloud environments (GitHub Copilot agents)
 *
 * This config is used when running tests in environments without:
 * - .env files
 * - Running dev server on port 3000
 * - Database connection
 *
 * It only runs unit tests that don't depend on external services.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    // Use cloudenv global setup that doesn't fail when .env is missing
    globalSetup: ["./src/__tests__/global-setup.cloudenv.ts"],
    setupFiles: ["./src/__tests__/setup.ts"],
    testTimeout: 10_000,
    hookTimeout: 10_000,
    // Only include specific unit tests that don't need server/db
    include: [
      "src/__tests__/basic.test.ts",
      "src/__tests__/no-process-env.test.ts",
      "src/__tests__/env-entrypoints.test.ts",
      "src/__tests__/distance-validation.test.ts",
      "src/__tests__/distance-validation.de.test.ts",
      "src/__tests__/orpc-error-type-safety.test.ts",
    ],
    exclude: [
      ".next",
      "node_modules",
      "docs/**",
      "dist",
      "build",
      "public",
      "coverage",
      "storybook-static",
      "src/__tests__/e2e/**",
      // Excluded integration tests that need server/db
      "src/__tests__/openapi-rest.test.ts",
      "src/__tests__/db-ssl-connection.test.ts",
      "src/__tests__/project-activities.integration.test.ts",
      "src/__tests__/project-details.test.tsx",
      "src/__tests__/country-i18n.test.ts",
      // Excluded due to monorepo cross-package env dependencies
      "src/__tests__/metadata.test.ts",
    ],
  },
  server: {
    watch: {
      ignored: [
        "**/.next/**",
        "**/node_modules/**",
        "**/docs/**",
        "**/dist/**",
        "**/build/**",
        "**/public/**",
        "**/coverage/**",
        "**/storybook-static/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
});
