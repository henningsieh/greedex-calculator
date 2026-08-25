import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("environment entrypoints", () => {
  const content = readFileSync(path.resolve("src/socket-server.ts"), "utf8");
  const calculatorPackage = JSON.parse(
    readFileSync(path.resolve("package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  const rootPackage = JSON.parse(
    readFileSync(path.resolve("../../package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  const nextConfig = readFileSync(path.resolve("next.config.ts"), "utf8");
  const turboConfig = JSON.parse(
    readFileSync(path.resolve("../../turbo.json"), "utf8"),
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
    for (const command of [
      rootPackage.scripts.dev,
      rootPackage.scripts.build,
      rootPackage.scripts.start,
    ]) {
      expect(command).toContain("dotenv -e .env -- turbo run ");
    }
  });

  it("forwards local and platform environment variables to Turbo tasks", () => {
    expect(turboConfig.tasks.dev.env).toEqual(["*"]);
    expect(turboConfig.tasks["db:migrate"].env).toEqual(["DATABASE_URL"]);
  });

  it("does not load dotenv inside calculator processes", () => {
    expect(nextConfig).not.toContain('from "dotenv"');
    expect(calculatorPackage.scripts["dev:socket"]).not.toContain("dotenv");
    expect(calculatorPackage.scripts.start).not.toContain("dotenv");
  });
});
