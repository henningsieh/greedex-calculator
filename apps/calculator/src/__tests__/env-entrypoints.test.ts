import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

type PackageManifest = {
  scripts: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe("environment entrypoints", () => {
  const content = readFileSync(path.resolve("src/socket-server.ts"), "utf8");
  const calculatorPackage = JSON.parse(
    readFileSync(path.resolve("package.json"), "utf8"),
  ) as PackageManifest;
  const rootPackage = JSON.parse(
    readFileSync(path.resolve("../../package.json"), "utf8"),
  ) as PackageManifest;
  const workspacePackages = [
    "apps/documentation/package.json",
    "packages/auth/package.json",
    "packages/config/package.json",
    "packages/database/package.json",
    "packages/email/package.json",
    "packages/i18n/package.json",
  ].map(
    (manifestPath) =>
      JSON.parse(
        readFileSync(path.resolve("../..", manifestPath), "utf8"),
      ) as PackageManifest,
  );
  const workspaceConfig = readFileSync(
    path.resolve("../../pnpm-workspace.yaml"),
    "utf8",
  );
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
  const playwrightConfig = readFileSync(
    path.resolve("playwright.config.ts"),
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
    expect(turboConfig.tasks["test:run"].env).toEqual(["CANDIDATE_BASE_URL"]);
  });

  it("runs Database migrations directly before build and release startup", () => {
    const directMigrationCommand =
      "pnpm --filter @greendex/database run db:migrate";

    expect(calculatorPackage.scripts.prebuild).toBe(directMigrationCommand);
    expect(calculatorPackage.scripts.prestart).toBe(directMigrationCommand);
    expect(calculatorPackage.scripts.prebuild).not.toContain("pnpx");
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

  it("runs candidate-local Playwright coverage after the candidate starts", () => {
    expect(candidateTestScript).toContain(
      "pnpm --filter @greendex/calculator run test:e2e",
    );
    expect(candidateTestScript.indexOf("server_pid=$!")).toBeLessThan(
      candidateTestScript.indexOf(
        "pnpm --filter @greendex/calculator run test:e2e",
      ),
    );
    expect(playwrightConfig).toContain(
      "process.env.CANDIDATE_BASE_URL ?? process.env.NEXT_PUBLIC_BASE_URL",
    );
  });

  it("runs non-mutating repository quality checks before candidate setup", () => {
    expect(rootPackage.scripts.format).toBe("turbo run format");
    expect(rootPackage.scripts.lint).toBe(
      "turbo run lint --concurrency 1 && pnpm run check:agent-instructions",
    );
    expect(rootPackage.scripts["type-check"]).toBe("turbo run type-check");
    expect(rootPackage.scripts["test:run"]).toBe("turbo run test:run --");
    expect(workspaceConfig).toContain("  oxfmt: 0.65.0");
    expect(workspaceConfig).toContain("  oxlint: 1.80.0");
    expect(rootPackage.devDependencies).toMatchObject({
      oxfmt: "catalog:",
      oxlint: "catalog:",
    });
    for (const workspacePackage of [calculatorPackage, ...workspacePackages]) {
      expect(workspacePackage.scripts.format).toBe("oxfmt --check");
      expect(workspacePackage.scripts.lint).toBe("oxlint");
      expect(workspacePackage.scripts["type-check"]).toBeDefined();
    }

    expect(candidateTestScript).toContain("pnpm run format");
    expect(candidateTestScript).toContain("pnpm run lint");
    expect(candidateTestScript).toContain("pnpm run type-check");
    expect(candidateTestScript).toContain("pnpm run test:run");
    expect(candidateTestScript.indexOf("pnpm run format")).toBeLessThan(
      candidateTestScript.indexOf(
        "pnpm --filter @greendex/database run db:migrate",
      ),
    );
    expect(candidateTestScript.indexOf("pnpm run test:run")).toBeGreaterThan(
      candidateTestScript.indexOf("server_pid=$!"),
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
    expect(candidateTestScript).toContain(
      'export GOOGLE_CLIENT_SECRET="GOCSPX-release-gate-secret"',
    );
    expect(candidateTestScript).toContain(
      'export GITHUB_CLIENT_SECRET="release-gate-github-secret-1234567890123"',
    );
    expect(environmentExample).toContain("EMAIL_TEST_SENDER=");
    expect(environmentExample).toContain("EMAIL_TEST_RECIPIENT=");
  });
});
