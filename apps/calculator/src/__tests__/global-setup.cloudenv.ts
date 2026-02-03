import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Cloud environment global setup for tests
 *
 * This setup file is used for running tests in cloud environments
 * (like GitHub Copilot agents) where .env files are not available.
 *
 * Unlike the regular global-setup.ts, this version:
 * - Does NOT fail if .env file is missing
 * - Sets minimal mock environment variables for tests that don't need real values
 * - Skips environment validation
 */

// Try to load environment variables from monorepo root, but don't fail if missing
const envPath = resolve(process.cwd(), "../../.env");

if (existsSync(envPath)) {
  config({ path: envPath });
  console.log(`✅ Loaded environment variables from: ${envPath}`);
} else {
  console.log(`⚠️  .env file not found at: ${envPath}`);
  console.log("   Running in cloud environment mode with minimal mock values");

  // Set minimal mock values for tests that might need them
  // These are just placeholders to prevent undefined errors
  if (!process.env.SKIP_ENV_VALIDATION) process.env.SKIP_ENV_VALIDATION = "true";
  if (!process.env.NEXT_PUBLIC_BASE_URL)
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  if (!process.env.DATABASE_URL)
    process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";
  if (!process.env.BETTER_AUTH_SECRET)
    process.env.BETTER_AUTH_SECRET = "mock-auth-secret-for-testing";
  if (!process.env.PORT) process.env.PORT = "3000";
  if (!process.env.SOCKET_PORT) process.env.SOCKET_PORT = "4000";
  if (!process.env.NEXT_DIST_DIR) process.env.NEXT_DIST_DIR = ".next";
  if (!process.env.ORPC_DEV_DELAY_MS) process.env.ORPC_DEV_DELAY_MS = "0";
}

export default function setup() {
  // Global setup function - runs before all tests
  console.log("🧪 Running tests in cloud environment mode");
}
