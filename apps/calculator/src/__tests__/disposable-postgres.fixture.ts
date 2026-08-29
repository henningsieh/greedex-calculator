import { randomUUID } from "node:crypto";

import { DatabaseError, Pool } from "pg";
import { afterEach } from "vitest";

import { env } from "@/env";

export type DisposablePostgresDatabase = {
  pool: Pool;
};

function databaseUrl(databaseName: string): string {
  const url = new URL(env.DATABASE_URL);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

function attachExpectedTerminationHandler(pool: Pool): void {
  pool.on("error", (error) => {
    // Terminating sessions while dropping the database can race with an idle
    // client. PostgreSQL reports only that expected condition as 57P01.
    if (error instanceof DatabaseError && error.code === "57P01") {
      return;
    }

    throw error;
  });
}

async function disposeDatabase(
  databaseName: string,
  adminPool: Pool,
  pool: Pool,
): Promise<void> {
  try {
    await pool.end();
  } finally {
    try {
      await adminPool.query(
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1",
        [databaseName],
      );
      await adminPool.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    } finally {
      await adminPool.end();
    }
  }
}

export function createDisposablePostgresFixture(namePrefix: string): {
  create: () => Promise<DisposablePostgresDatabase>;
} {
  if (!/^[a-z_][a-z0-9_]*$/.test(namePrefix)) {
    throw new Error("Disposable PostgreSQL fixture name prefix is invalid");
  }

  const databases: {
    adminPool: Pool;
    databaseName: string;
    pool: Pool;
  }[] = [];

  afterEach(async () => {
    await Promise.all(
      databases
        .splice(0)
        .map(({ adminPool, databaseName, pool }) =>
          disposeDatabase(databaseName, adminPool, pool),
        ),
    );
  });

  return {
    async create(): Promise<DisposablePostgresDatabase> {
      const databaseName = `${namePrefix}_${randomUUID().replaceAll("-", "")}`;
      const adminPool = new Pool({
        connectionString: databaseUrl("postgres"),
        max: 1,
      });
      await adminPool.query(`CREATE DATABASE "${databaseName}"`);

      const pool = new Pool({
        connectionString: databaseUrl(databaseName),
        max: 1,
      });
      attachExpectedTerminationHandler(pool);
      databases.push({ adminPool, databaseName, pool });

      return { pool };
    },
  };
}
