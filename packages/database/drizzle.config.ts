import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Database tooling uses the consuming Calculator application's environment.
config({ path: "../../apps/calculator/.env" });

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
