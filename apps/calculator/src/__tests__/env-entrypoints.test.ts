import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("socket server environment handling", () => {
  const content = readFileSync(path.resolve("src/socket-server.ts"), "utf8");

  it("does not load dotenv from a hardcoded .env path", () => {
    const importLine = content
      .split("\n")
      .findIndex((line) => line.trim() === 'import { config } from "dotenv";');
    expect(importLine).toBe(-1);
  });

  it("reads environment variables via the shared @/env module", () => {
    expect(content).toMatch(/await import\("@\/env"\)/);
  });
});
