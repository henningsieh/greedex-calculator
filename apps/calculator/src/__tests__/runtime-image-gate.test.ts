import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import {
  chmodSync,
  chownSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const RUNTIME_GATE_TIMEOUT_MS = 10_000;
const NODE_USER_ID = 1000;
const NODE_GROUP_ID = 1000;

type RuntimeFixture = {
  process: ChildProcessWithoutNullStreams;
  root: string;
  eventsFile: string;
  requestsFile: string;
  output: () => string;
};

type RuntimeFixtureOptions = {
  failUrlFragment?: string;
  writablePackage?: boolean;
};

const fixtureRoots: string[] = [];
const fixtureProcesses: ChildProcessWithoutNullStreams[] = [];

function writeExecutable(filePath: string, content: string) {
  writeFileSync(filePath, content, { mode: 0o755 });
}

function createRuntimeFixture(
  options: RuntimeFixtureOptions = {},
): RuntimeFixture {
  const root = mkdtempSync(path.join(tmpdir(), "greendex-runtime-gate-"));
  fixtureRoots.push(root);

  const binDirectory = path.join(root, "bin");
  const eventsFile = path.join(root, "events.log");
  const requestsFile = path.join(root, "requests.log");
  mkdirSync(binDirectory);
  mkdirSync(path.join(root, "apps/calculator/.next"), { recursive: true });
  mkdirSync(path.join(root, "apps/documentation/.next"), { recursive: true });
  mkdirSync(path.join(root, "apps/documentation/.source"), { recursive: true });
  const packageMode = options.writablePackage === true ? 0o644 : 0o444;
  writeFileSync(path.join(root, "package.json"), "{}\n", {
    mode: packageMode,
  });

  writeExecutable(
    path.join(binDirectory, "curl"),
    `#!/usr/bin/env bash
set -Eeuo pipefail
url="\${!#}"
printf '%s\\n' "$url" >> "$REQUESTS_FILE"
if [[ -n "\${FAIL_URL_FRAGMENT:-}" && "$url" == *"$FAIL_URL_FRAGMENT"* ]]; then
  exit 22
fi
if [[ "$url" == *'/socket.io/'* ]]; then
  printf '0{"sid":"runtime-gate"}'
else
  printf '{"status":"ok"}'
fi
`,
  );
  writeExecutable(
    path.join(binDirectory, "hostname"),
    "#!/usr/bin/env bash\nprintf 'runtime-container-id\\n'\n",
  );

  const fakeRuntime = path.join(root, "fake-runtime.sh");
  writeExecutable(
    fakeRuntime,
    `#!/usr/bin/env bash
set -Eeuo pipefail
printf 'start:%s:%s\\n' "$PORT" "$RUNTIME_IMAGE_GATE_FILE" >> "$EVENTS_FILE"
shutdown() {
  printf 'term:%s\\n' "$PORT" >> "$EVENTS_FILE"
  exit 0
}
trap shutdown TERM INT
while true; do sleep 0.1; done
`,
  );

  if (process.getuid?.() === 0) {
    chownSync(root, NODE_USER_ID, NODE_GROUP_ID);
    for (const directory of [
      binDirectory,
      path.join(root, "apps"),
      path.join(root, "apps/calculator"),
      path.join(root, "apps/calculator/.next"),
      path.join(root, "apps/documentation"),
      path.join(root, "apps/documentation/.next"),
      path.join(root, "apps/documentation/.source"),
    ]) {
      chownSync(directory, NODE_USER_ID, NODE_GROUP_ID);
    }
    for (const file of [
      path.join(binDirectory, "curl"),
      path.join(binDirectory, "hostname"),
      fakeRuntime,
      path.join(root, "package.json"),
    ]) {
      chownSync(file, NODE_USER_ID, NODE_GROUP_ID);
    }
    chmodSync(path.join(root, "package.json"), packageMode);
  }

  const entrypoint = path.resolve("../../docker/runtime-entrypoint.sh");
  const child = spawn(entrypoint, [fakeRuntime], {
    cwd: root,
    env: {
      ...process.env,
      EVENTS_FILE: eventsFile,
      FAIL_URL_FRAGMENT: options.failUrlFragment ?? "",
      PATH: `${binDirectory}:${process.env.PATH ?? ""}`,
      PORT: "3000",
      REQUESTS_FILE: requestsFile,
      RUNTIME_IMAGE_GATE_TIMEOUT_SECONDS: "2",
      SECRET_SENTINEL: "must-not-appear-in-gate-output",
      SOCKET_PORT: "4000",
      TMPDIR: root,
    },
    gid: process.getuid?.() === 0 ? NODE_GROUP_ID : undefined,
    uid: process.getuid?.() === 0 ? NODE_USER_ID : undefined,
  });
  fixtureProcesses.push(child);

  let output = "";
  child.stdout.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });

  return {
    process: child,
    root,
    eventsFile,
    requestsFile,
    output: () => output,
  };
}

async function waitForOutput(
  fixture: RuntimeFixture,
  expected: string,
): Promise<void> {
  const startedAt = Date.now();
  while (!fixture.output().includes(expected)) {
    if (Date.now() - startedAt > RUNTIME_GATE_TIMEOUT_MS) {
      throw new Error(
        `Timed out waiting for ${expected}. Output:\n${fixture.output()}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function waitForExit(child: ChildProcessWithoutNullStreams) {
  return new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
    (resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => resolve({ code, signal }));
    },
  );
}

afterEach(async () => {
  for (const child of fixtureProcesses.splice(0)) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
      await waitForExit(child).catch(() => undefined);
    }
  }
  for (const root of fixtureRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("final runtime image gate", () => {
  it("validates and gracefully restarts the real runtime command before reporting success", async () => {
    const fixture = createRuntimeFixture();

    await waitForOutput(fixture, '"status":"passed"');
    fixture.process.kill("SIGTERM");
    const exit = await waitForExit(fixture.process);

    expect(exit).toEqual({ code: 0, signal: null });
    const readyFile = path.join(
      fixture.root,
      "greendex-runtime-image-gate-ready",
    );
    expect(readFileSync(fixture.eventsFile, "utf8").trim().split("\n")).toEqual([
      `start:3100:${readyFile}`,
      "term:3100",
      `start:3000:${readyFile}`,
      "term:3000",
    ]);
    expect(readFileSync(fixture.requestsFile, "utf8").trim().split("\n")).toEqual(
      [
        "http://127.0.0.1:3100/",
        "http://127.0.0.1:3001/",
        "http://127.0.0.1:4000/socket.io/?EIO=4&transport=polling",
        "http://127.0.0.1:3100/api/rpc/health",
        "http://127.0.0.1:3000/",
        "http://127.0.0.1:3001/",
        "http://127.0.0.1:4000/socket.io/?EIO=4&transport=polling",
        "http://127.0.0.1:3000/api/rpc/health",
      ],
    );
    expect(fixture.output()).toContain(
      '{"event":"greendex.runtime-image-gate","container":"runtime-container-id","status":"passed","phase":"terminal"}',
    );
    expect(fixture.output()).not.toContain("must-not-appear-in-gate-output");
  });

  it("blocks production startup when a runtime service fails validation", async () => {
    const fixture = createRuntimeFixture({ failUrlFragment: ":3001/" });

    const exit = await waitForExit(fixture.process);

    expect(exit).toEqual({ code: 1, signal: null });
    expect(readFileSync(fixture.eventsFile, "utf8").trim().split("\n")).toEqual([
      expect.stringMatching(/^start:3100:/),
      "term:3100",
    ]);
    expect(fixture.output()).toContain(
      '{"event":"greendex.runtime-image-gate","container":"runtime-container-id","status":"failed","phase":"terminal"}',
    );
    expect(fixture.output()).not.toContain('"status":"passed"');
  });

  it("blocks startup when application files are writable by the runtime user", async () => {
    const fixture = createRuntimeFixture({ writablePackage: true });

    const exit = await waitForExit(fixture.process);

    expect(exit).toEqual({ code: 1, signal: null });
    expect(existsSync(fixture.eventsFile)).toBe(false);
    expect(fixture.output()).toContain(
      "Application files must remain read-only for the runtime user.",
    );
    expect(fixture.output()).toContain('"status":"failed"');
  });
});
