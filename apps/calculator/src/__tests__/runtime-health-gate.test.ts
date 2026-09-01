// @vitest-environment node

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const temporaryDirectories: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("runtime image health gate", () => {
  it("withholds Calculator health until the final runtime topology is ready", async () => {
    const directory = mkdtempSync(
      path.join(tmpdir(), "greendex-runtime-health-"),
    );
    temporaryDirectories.push(directory);
    const readyFile = path.join(directory, "ready");
    vi.stubEnv("RUNTIME_IMAGE_GATE_FILE", readyFile);
    vi.resetModules();
    vi.doUnmock("@/env");

    const { GET } = await import("@/app/api/rpc/[[...rest]]/route");
    const request = new Request("http://127.0.0.1:3000/api/rpc/health");

    const blockedResponse = await GET(request);
    writeFileSync(readyFile, "ready\n");
    const readyResponse = await GET(request);

    expect(blockedResponse.status).toBe(503);
    expect(readyResponse.status).toBe(200);
  });
});
