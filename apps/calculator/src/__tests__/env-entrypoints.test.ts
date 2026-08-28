import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

type PackageManifest = {
  scripts: Record<string, string>;
  dependencies?: Record<string, string>;
};

describe("environment entrypoints", () => {
  const content = readFileSync(path.resolve("src/socket-server.ts"), "utf8");
  const calculatorPackage = JSON.parse(
    readFileSync(path.resolve("package.json"), "utf8"),
  ) as PackageManifest;
  const rootPackage = JSON.parse(
    readFileSync(path.resolve("../../package.json"), "utf8"),
  ) as PackageManifest;
  const nextConfig = readFileSync(path.resolve("next.config.ts"), "utf8");
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
  const candidateTestScript = readFileSync(
    path.resolve("../../docker/run-candidate-tests.sh"),
    "utf8",
  );
  const dockerfile = readFileSync(path.resolve("../../Dockerfile"), "utf8");
  const environmentExample = readFileSync(
    path.resolve("../../.env.example"),
    "utf8",
  );
  const runtimeDockerfile = dockerfile.slice(
    dockerfile.indexOf("FROM node:22-bookworm-slim AS runtime"),
  );
  const openApiRestTest = readFileSync(
    path.resolve("src/__tests__/openapi-rest.test.ts"),
    "utf8",
  );

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

  it("does not download utilities during release startup", () => {
    expect(calculatorPackage.scripts.prestart).toBe(
      "pnpm --filter @greendex/database run db:migrate",
    );
    expect(calculatorPackage.scripts.prestart).not.toContain("pnpx");
    expect(runtimeDockerfile).toContain(
      'CMD ["node", "node_modules/pnpm/bin/pnpm.cjs", "run", "start"]',
    );
    expect(runtimeDockerfile).not.toContain("corepack enable");
    expect(candidateTestScript).toContain(
      "runuser -u node --preserve-environment",
    );
  });

  it("does not load dotenv inside calculator processes", () => {
    expect(nextConfig).not.toMatch(
      /(?:from\s+|import\s+|require\s*\()\s*["']dotenv(?:\/config)?["']/,
    );
    expect(calculatorPackage.scripts["dev:socket"]).not.toContain("dotenv");
    expect(calculatorPackage.scripts.start).not.toContain("dotenv");
  });

  it("keeps public build URLs separate from the candidate HTTP endpoint", () => {
    expect(candidateTestScript).toContain(
      'export CANDIDATE_BASE_URL="http://127.0.0.1:3000"',
    );
    expect(candidateTestScript).not.toMatch(
      /export NEXT_PUBLIC_(?:BASE|SOCKET)_URL="http:\/\/127\.0\.0\.1/,
    );
    expect(dockerfile).toContain("id=NEXT_PUBLIC_BASE_URL");
    expect(dockerfile).toContain("id=NEXT_PUBLIC_SOCKET_URL");
    expect(openApiRestTest).toContain(
      "env.CANDIDATE_BASE_URL ?? env.NEXT_PUBLIC_BASE_URL",
    );
  });

  it("uses real SMTP and IMAP credentials only for the isolated release-gate email", () => {
    expect(calculatorPackage.scripts["test:release-email"]).toBe(
      "dotenv -e ../../.env -- tsx scripts/verify-release-gate-email.ts",
    );
    expect(dockerfile).toContain("id=IMAP_HOST");
    expect(dockerfile).toContain("id=IMAP_PASSWORD");
    expect(dockerfile).toContain("id=EMAIL_TEST_SENDER");
    expect(dockerfile).toContain("id=EMAIL_TEST_RECIPIENT");
    expect(dockerfile).not.toContain("id=GOOGLE_CLIENT_SECRET");
    expect(dockerfile).not.toContain("id=GITHUB_CLIENT_SECRET");
    expect(environmentExample).toContain(
      "EMAIL_TEST_SENDER=greendex-release-gate-sender@sieh.org",
    );
    expect(environmentExample).toContain(
      "EMAIL_TEST_RECIPIENT=greendex-release-gate-inbox@sieh.org",
    );
  });
});
