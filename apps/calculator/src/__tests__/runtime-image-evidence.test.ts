import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];

type EvidenceFixtureOptions = {
  gateStatus?: "failed" | "passed";
  healthStatus?: "healthy" | "unhealthy";
  imageSize?: string;
};

function writeExecutable(filePath: string, content: string) {
  writeFileSync(filePath, content, { mode: 0o755 });
}

function runEvidenceCollector(options: EvidenceFixtureOptions = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "greendex-image-evidence-"));
  temporaryDirectories.push(root);
  const binDirectory = path.join(root, "bin");
  mkdirSync(binDirectory);
  writeExecutable(
    path.join(binDirectory, "docker"),
    `#!/usr/bin/env bash
set -Eeuo pipefail
if [[ "$1" == "logs" ]]; then
  printf '{"event":"greendex.runtime-image-gate","container":"abcdef123456","status":"%s","phase":"terminal"}\\n' "$FAKE_GATE_STATUS"
  exit 0
fi
if [[ "$1" == "image" && "$2" == "ls" ]]; then
  printf '%s\\n' "$FAKE_IMAGE_SIZE"
  exit 0
fi
if [[ "$1" == "image" ]]; then format="$4"; else format="$3"; fi
case "$1:$2:$format" in
  'inspect:--format:{{.Id}}') printf '%s\\n' 'abcdef1234567890' ;;
  'inspect:--format:{{.Image}}') printf '%s\\n' 'sha256:image-id' ;;
  'inspect:--format:{{.Config.Image}}') printf '%s\\n' 'greendex:commit' ;;
  'inspect:--format:{{.Config.User}}') printf '%s\\n' 'node' ;;
  'inspect:--format:{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}') printf '%s\\n' "$FAKE_HEALTH_STATUS" ;;
  'image:inspect:{{.Id}}') printf '%s\\n' 'sha256:image-id' ;;
  'image:inspect:{{join .RepoDigests "\\n"}}') printf '%s\\n' 'mirror@sha256:unrelated-digest' 'greendex@sha256:registry-digest' ;;
  *) printf 'Unexpected docker arguments: %s\\n' "$*" >&2; exit 64 ;;
esac
`,
  );

  const collector = path.resolve("../../docker/collect-runtime-evidence.sh");
  return new Promise<{ code: number | null; output: string; error: string }>(
    (resolve, reject) => {
      const child = spawn(collector, ["greendex-runtime"], {
        env: {
          FAKE_GATE_STATUS: options.gateStatus ?? "passed",
          FAKE_HEALTH_STATUS: options.healthStatus ?? "healthy",
          FAKE_IMAGE_SIZE: options.imageSize ?? "1.099GB",
          NODE_ENV: "test",
          PATH: `${binDirectory}:/usr/bin:/bin`,
        },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let output = "";
      let error = "";
      child.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        error += chunk.toString();
      });
      child.once("error", reject);
      child.once("close", (code) => resolve({ code, error, output }));
    },
  );
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("runtime image deployment evidence", () => {
  it("binds the terminal gate result to the selected immutable image digest", async () => {
    const result = await runEvidenceCollector();

    expect(result.code).toBe(0);
    expect(JSON.parse(result.output)).toEqual({
      event: "greendex.runtime-image-evidence",
      container: "abcdef1234567890",
      imageReference: "greendex:commit",
      imageDigest: "sha256:image-id",
      imageSizeBytes: 1_099_000_000,
      maxImageSizeBytes: 1_100_000_000,
      repositoryDigest: "greendex@sha256:registry-digest",
      gateStatus: "passed",
      healthStatus: "healthy",
      user: "node",
    });
  });

  it("rejects a runtime image larger than the release budget", async () => {
    const result = await runEvidenceCollector({
      imageSize: "1.100000001GB",
    });

    expect(result.code).toBe(1);
    expect(JSON.parse(result.output)).toMatchObject({
      imageSizeBytes: 1_100_000_001,
      maxImageSizeBytes: 1_100_000_000,
    });
    expect(result.error).toContain(
      "The selected runtime image exceeds the 1100000000-byte size budget.",
    );
  });

  it("records the selected digest when the terminal gate result failed", async () => {
    const result = await runEvidenceCollector({
      gateStatus: "failed",
      healthStatus: "unhealthy",
    });

    expect(result.code).toBe(1);
    expect(JSON.parse(result.output)).toMatchObject({
      event: "greendex.runtime-image-evidence",
      imageDigest: "sha256:image-id",
      repositoryDigest: "greendex@sha256:registry-digest",
      gateStatus: "failed",
      healthStatus: "unhealthy",
    });
  });
});
