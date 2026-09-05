import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

type PackageManifest = {
  scripts: Record<string, string>;
  dependencies?: Record<string, string>;
};

describe("environment entrypoints", () => {
  const content = readFileSync(path.resolve("src/socket-server.ts"), "utf8");
  const rootPackage = JSON.parse(
    readFileSync(path.resolve("../../package.json"), "utf8"),
  ) as PackageManifest;
  const nextConfig = readFileSync(path.resolve("next.config.ts"), "utf8");
  const calculatorPackage = JSON.parse(
    readFileSync(path.resolve("package.json"), "utf8"),
  ) as PackageManifest;
  const documentationPackage = JSON.parse(
    readFileSync(path.resolve("../../apps/documentation/package.json"), "utf8"),
  ) as PackageManifest;
  const turboConfig = JSON.parse(
    readFileSync(path.resolve("../../turbo.json"), "utf8"),
  ) as {
    tasks: Record<string, { env?: string[] }>;
  };
  const calculatorTurboConfig = JSON.parse(
    readFileSync(path.resolve("turbo.json"), "utf8"),
  ) as {
    tasks: Record<string, { env?: string[] }>;
  };

  it("does not load dotenv from a hardcoded .env path", () => {
    const importLine = content
      .split("\n")
      .findIndex((line) => line.trim() === 'import { config } from "dotenv";');
    expect(importLine).toBe(-1);
  });

  it("reads environment variables via the shared @/env module", () => {
    expect(content).toMatch(/await import\("@\/env"\)/);
  });

  it("loads the root .env before Turbo only for local commands", () => {
    expect(rootPackage.scripts.dev).toBe(
      "dotenv -v NODE_ENV=development -e .env -- turbo run dev",
    );
    expect(rootPackage.scripts.build).toBe(
      "dotenv -v NODE_ENV=production -e .env -- turbo run build",
    );
    expect(rootPackage.scripts.start).toBe(
      "dotenv -v NODE_ENV=production -e .env -- turbo run start",
    );
  });

  it("configures every service port from the environment", () => {
    expect(calculatorPackage.scripts["dev:next"]).toBe(
      "NODE_ENV=development next dev --port $PORT",
    );
    expect(calculatorPackage.scripts.prestart).toContain(
      "pnpx kill-port $PORT $SOCKET_PORT",
    );
    expect(calculatorPackage.scripts.start).toContain("next start --port $PORT");
    expect(documentationPackage.scripts.dev).toBe(
      "next dev --port $DOCUMENTATION_PORT",
    );
    expect(documentationPackage.scripts.start).toBe(
      "next start --port $DOCUMENTATION_PORT",
    );
  });

  it("keeps runtime CLI dependencies available to the production start commands", () => {
    expect(rootPackage.dependencies).toMatchObject({
      "dotenv-cli": expect.any(String),
      turbo: expect.any(String),
    });
    expect(calculatorPackage.dependencies).toMatchObject({
      concurrently: expect.any(String),
      tsx: expect.any(String),
    });
  });

  it("forwards only Calculator's required environment variables to its dev task", () => {
    expect(turboConfig.tasks.dev.env).toBeUndefined();
    expect(calculatorTurboConfig.tasks.dev.env).toEqual([
      "NEXT_PUBLIC_BASE_URL",
      "NEXT_PUBLIC_SOCKET_URL",
      "DATABASE_URL",
      "BETTER_AUTH_SECRET",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "DISCORD_CLIENT_ID",
      "DISCORD_CLIENT_SECRET",
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_SENDER",
      "SMTP_USERNAME",
      "SMTP_PASSWORD",
      "SMTP_SECURE",
      "NODE_ENV",
      "PORT",
      "ORPC_DEV_DELAY_MS",
      "SOCKET_PORT",
    ]);
    expect(turboConfig.tasks["db:migrate"].env).toEqual(["DATABASE_URL"]);
  });

  it("does not load dotenv inside calculator processes", () => {
    expect(nextConfig).not.toMatch(
      /(?:from\s+|import\s+|require\s*\()\s*["']dotenv(?:\/config)?["']/,
    );
    expect(calculatorPackage.scripts["dev:socket"]).not.toContain("dotenv");
    expect(calculatorPackage.scripts.start).not.toContain("dotenv");
  });
});
