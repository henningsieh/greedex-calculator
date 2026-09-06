import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

// Load environment variables from monorepo root BEFORE any tests run
// Calculator owns the environment used by its test suite.
const envPath = resolve(process.cwd(), ".env");

if (!existsSync(envPath)) {
  console.error(`❌ .env file not found at: ${envPath}`);
  process.exit(1);
}

config({ path: envPath });

console.log(`✅ Loaded environment variables from: ${envPath}`);

export default function setup() {
  // Global setup function - runs before all tests
}
