import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];

function writeExecutable(filePath: string, content: string) {
  writeFileSync(filePath, content, { mode: 0o755 });
}

function runEvidenceCollector() {
  const root = mkdtempSync(path.join(tmpdir(), "greendex-image-evidence-"));
  temporaryDirectories.push(root);
  const binDirectory = path.join(root, "bin");
  mkdirSync(binDirectory);
  writeExecutable(
    path.join(binDirectory, "docker"),
    `#!/usr/bin/env bash
set -Eeuo pipefail
if [[ "$1" == "logs" ]]; then
  printf '%s\\n' '{"event":"greendex.runtime-image-gate","container":"abcdef123456","status":"passed","phase":"terminal"}'
  exit 0
fi
if [[ "$1" == "image" ]]; then format="$4"; else format="$3"; fi
case "$1:$2:$format" in
  'inspect:--format:{{.Id}}') printf '%s\\n' 'abcdef1234567890' ;;
  'inspect:--format:{{.Image}}') printf '%s\\n' 'sha256:image-id' ;;
  'inspect:--format:{{.Config.Image}}') printf '%s\\n' 'greendex:commit' ;;
  'inspect:--format:{{.Config.User}}') printf '%s\\n' 'node' ;;
  'inspect:--format:{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}') printf '%s\\n' 'healthy' ;;
  'image:inspect:{{.Id}}') printf '%s\\n' 'sha256:image-id' ;;
  'image:inspect:{{join .RepoDigests "\\n"}}') printf '%s\\n' 'greendex@sha256:registry-digest' ;;
  *) printf 'Unexpected docker arguments: %s\\n' "$*" >&2; exit 64 ;;
esac
`,
  );

  const collector = path.resolve("../../docker/collect-runtime-evidence.sh");
  return new Promise<{ code: number | null; output: string }>(
    (resolve, reject) => {
      const child = spawn(collector, ["greendex-runtime"], {
        env: {
          NODE_ENV: "test",
          PATH: `${binDirectory}:/usr/bin:/bin`,
        },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let output = "";
      child.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.once("error", reject);
      child.once("close", (code) => resolve({ code, output }));
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
      imageId: "sha256:image-id",
      imageDigest: "greendex@sha256:registry-digest",
      gateStatus: "passed",
      healthStatus: "healthy",
      user: "node",
    });
  });
});
