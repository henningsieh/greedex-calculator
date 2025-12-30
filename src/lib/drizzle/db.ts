// src/lib/drizzle/db.ts
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
// biome-ignore lint/performance/noNamespaceImport: <import all schemes from a single entry point>
import * as schema from "@/lib/drizzle/schema";

// Global variable to store the client across hot reloads
declare global {
  var __db: PostgresJsDatabase<typeof schema> | undefined;
}

// Reuse existing client in development to prevent memory leaks
if (!global.__db) {
  const client = postgres(env.DATABASE_URL, {
    max: 10,
    // ssl: env.DATABASE_URL.includes("sslmode=require")
    //   ? { rejectUnauthorized: false }
    //   : false,
  });
  global.__db = drizzle(client, {
    schema,
  });
}

export const db = global.__db;
