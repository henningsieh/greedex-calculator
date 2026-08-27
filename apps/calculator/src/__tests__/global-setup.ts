import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

// Load local development values when available. Coolify injects values into
// the candidate container directly and intentionally has no repository .env.
const envPath = resolve(process.cwd(), "../../.env");

if (existsSync(envPath)) {
  config({ path: envPath });
  console.log(`✅ Loaded environment variables from: ${envPath}`);
} else {
  console.log("✅ Using environment variables injected by the runtime");
}

export default function setup() {
  // Global setup function - runs before all tests
}
