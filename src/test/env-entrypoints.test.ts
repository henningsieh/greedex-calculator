import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("dotenv config import in node entrypoints", () => {
  const files = ["src/socket-server.ts"];

  files.forEach((file) => {
    it(`should import "dotenv/config" at top of ${file}`, () => {
      const content = readFileSync(path.resolve(file), "utf8");
      expect(content.includes('import "dotenv/config"')).toBe(true);
    });
  });
});
