import { lstat, readFile, readdir, readlink, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const instructionDirectory = path.join(root, ".github", "instructions");
const routerPath = path.join(root, ".github", "copilot-instructions.md");
const workflowPath = path.join(root, "docs", "agents", "agent-workflows.md");
const migrationGuidePath = path.join(
  root,
  "docs",
  "agents",
  "online-documentation-migration.md",
);
const legacyWorkflowPath = path.join(root, "docs", "agent-workflows.md");
const referenceFiles = [
  path.join(root, "README.md"),
  path.join(root, "docs", "README.md"),
  workflowPath,
  migrationGuidePath,
  path.join(root, "apps", "calculator", "src", "lib", "orpc", "README.md"),
  path.join(root, "docs", "projects", "README.md"),
];
const retiredDocumentationRoots = [
  path.join("docs", "clickdummy"),
  path.join("docs", "next"),
  path.join("docs", "orpc"),
  path.join("docs", "tanstack-react-query"),
];
const errors = [];

const expectedScopes = {
  "architecture.instructions.md":
    "apps/*/src/**/*.ts,apps/*/src/**/*.tsx,packages/*/src/**/*.ts,packages/*/src/**/*.tsx",
  "better-auth.instructions.md":
    "apps/calculator/src/lib/better-auth/**/*.ts,apps/calculator/src/features/authentication/**/*.ts,apps/calculator/src/features/authentication/**/*.tsx,apps/calculator/src/features/organizations/**/*.ts,apps/calculator/src/features/organizations/**/*.tsx,apps/calculator/src/features/projects/permissions.ts,apps/calculator/src/lib/orpc/middleware.ts,apps/calculator/src/lib/orpc/procedures.ts,apps/calculator/src/app/api/auth/**/*.ts,packages/database/src/schemas/auth-schema.ts",
  "code-standards.instructions.md":
    "apps/*/src/**/*.ts,apps/*/src/**/*.tsx,apps/*/src/**/*.js,apps/*/src/**/*.jsx,packages/*/src/**/*.ts,packages/*/src/**/*.tsx,packages/*/src/**/*.js,packages/*/src/**/*.jsx,scripts/**/*.js,scripts/**/*.mjs",
  "conventions.instructions.md":
    "package.json,apps/*/package.json,packages/*/package.json,pnpm-workspace.yaml,turbo.json,.node-version,.env.example,.oxfmtrc.json,.oxlintrc.json,**/*.config.ts,**/*.config.mjs",
  "i18n.instructions.md":
    "packages/i18n/src/**/*.ts,packages/i18n/src/locales/*.json,packages/config/src/languages.ts,apps/calculator/src/lib/i18n/**/*.ts,apps/calculator/src/proxy.ts,apps/calculator/src/app/**/page.tsx,apps/calculator/src/app/**/layout.tsx,apps/calculator/src/app/sitemap.ts",
  "orpc.instructions.md":
    "apps/calculator/src/lib/orpc/**/*.ts,apps/calculator/src/app/api/rpc/**/*.ts,apps/calculator/src/app/api/openapi/**/*.ts,apps/calculator/src/features/**/procedures.ts,apps/calculator/src/features/**/validation-schemas.ts,apps/calculator/src/instrumentation.ts,apps/calculator/src/app/**/page.tsx,apps/calculator/src/app/**/layout.tsx",
  "tanstack-react-query.instructions.md":
    "apps/calculator/src/lib/tanstack-react-query/**/*.ts,apps/calculator/src/lib/tanstack-react-query/**/*.tsx,apps/calculator/src/components/providers/query-provider.tsx,apps/calculator/src/lib/orpc/orpc.ts,apps/calculator/src/app/**/page.tsx,apps/calculator/src/app/**/layout.tsx,apps/calculator/src/features/**/components/**/*.ts,apps/calculator/src/features/**/components/**/*.tsx,apps/calculator/src/features/**/hooks/**/*.ts,apps/calculator/src/features/**/hooks/**/*.tsx",
  "shadcn.instructions.md":
    "apps/calculator/src/components/**/*.ts,apps/calculator/src/components/**/*.tsx,apps/calculator/src/features/**/components/**/*.ts,apps/calculator/src/features/**/components/**/*.tsx",
  "turborepo-package-management.instructions.md":
    "package.json,apps/*/package.json,packages/*/package.json,pnpm-workspace.yaml,turbo.json,.node-version",
};

const requiredRepositoryPaths = [
  ".env.example",
  ".node-version",
  ".oxfmtrc.json",
  ".oxlintrc.json",
  "apps/calculator/components.json",
  "apps/calculator/src/__tests__/e2e/project-routing.spec.ts",
  "apps/calculator/src/app/[locale]/layout.tsx",
  "apps/calculator/src/app/api/auth/[...all]/route.ts",
  "apps/calculator/src/app/api/openapi/[[...rest]]/route.ts",
  "apps/calculator/src/app/api/rpc/[[...rest]]/route.ts",
  "apps/calculator/src/env.ts",
  "apps/calculator/src/features/projects/permissions.ts",
  "apps/calculator/src/instrumentation.ts",
  "apps/calculator/src/lib/better-auth/index.ts",
  "apps/calculator/src/lib/email.ts",
  "apps/calculator/src/lib/i18n/routing.ts",
  "apps/calculator/src/lib/orpc/client.server.ts",
  "apps/calculator/src/lib/orpc/orpc.ts",
  "apps/calculator/src/lib/orpc/router.ts",
  "docs/agents/agent-workflows.md",
  "docs/agents/online-documentation-migration.md",
  "packages/config/src/languages.ts",
  "packages/database/src/schemas/auth-schema.ts",
  "packages/email/src/templates",
  "packages/i18n/src/locales",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "turbo.json",
];

const stalePatterns = [
  { pattern: /\bbunx\b/iu, message: "replace stale bunx guidance with pnpm" },
  { pattern: /\bpnpmx\b/iu, message: "replace the invalid pnpmx command" },
  { pattern: /pnpm\.lockb/iu, message: "use pnpm-lock.yaml" },
  {
    pattern: /`src\/lib\/drizzle(?:\/|`)/u,
    message: "use packages/database paths",
  },
  {
    pattern: /`messages\/<locale>/u,
    message: "use packages/i18n/src/locales paths",
  },
  {
    pattern: /`src\/lib\/email(?:\/|`)/u,
    message: "use packages/email or the calculator email adapter path",
  },
  {
    pattern: /`src\/instrumentation\.ts`/u,
    message: "use the full calculator instrumentation path",
  },
  {
    pattern: /quick-start\.instructions\.md/u,
    message: "use docs/agents/agent-workflows.md for opt-in task routing",
  },
];

const retiredPointerPatterns = [
  {
    pattern: /docs\/(?:clickdummy|next|orpc|tanstack-react-query)(?:\/|\b)/u,
    message: "replace pointers to retired vendor-documentation roots",
  },
  {
    pattern: /\]\((?:\.\.\/)*(?:clickdummy|next|orpc|tanstack-react-query)\//u,
    message: "replace relative pointers to retired vendor-documentation roots",
  },
];

const addError = (message) => {
  errors.push(message);
};

const readUtf8 = async (filePath) => readFile(filePath, "utf8");

const pathExists = async (targetPath) => {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
};

const findFiles = async (directoryPath) => {
  if (!(await pathExists(directoryPath))) {
    return [];
  }

  const files = [];
  for (const entry of await readdir(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
};

const parseFrontmatter = (content, fileName) => {
  const match = content.match(/^---\n([\s\S]*?)\n---/u);
  if (!match) {
    addError(`${fileName}: missing YAML frontmatter`);
    return {};
  }

  const values = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/u, "$2");
    values[key] = value;
  }

  return values;
};

const isOptionalGeneratedNextDocumentationIndex = (filePath, rawTarget) =>
  filePath === workflowPath && rawTarget === "../../.next-docs/index.mdx";

const validateMarkdownLinks = async (
  filePath,
  content,
  baseDirectory = path.dirname(filePath),
) => {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/gu;
  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1].trim().split(/\s+"/u)[0];
    if (
      rawTarget.startsWith("#") ||
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:")
    ) {
      continue;
    }

    const withoutAnchor = rawTarget.split("#", 1)[0];
    const decodedTarget = decodeURIComponent(withoutAnchor);
    // Resolve root-relative Markdown URLs against the repository root.
    const absoluteTarget = decodedTarget.startsWith("/")
      ? path.resolve(root, `.${decodedTarget}`)
      : path.resolve(baseDirectory, decodedTarget);
    if (
      !(await pathExists(absoluteTarget)) &&
      !isOptionalGeneratedNextDocumentationIndex(filePath, rawTarget)
    ) {
      addError(
        `${path.relative(root, filePath)}: broken link ${JSON.stringify(rawTarget)}`,
      );
    }
  }
};

const instructionFiles = (await readdir(instructionDirectory))
  .filter((fileName) => fileName.endsWith(".instructions.md"))
  .sort();
const expectedFiles = Object.keys(expectedScopes).sort();

if (JSON.stringify(instructionFiles) !== JSON.stringify(expectedFiles)) {
  addError(
    `instruction inventory mismatch\n  expected: ${expectedFiles.join(", ")}\n  actual:   ${instructionFiles.join(", ")}`,
  );
}

for (const relativePath of requiredRepositoryPaths) {
  if (!(await pathExists(path.join(root, relativePath)))) {
    addError(`required repository path is missing: ${relativePath}`);
  }
}

if (await pathExists(legacyWorkflowPath)) {
  addError(
    "docs/agent-workflows.md is obsolete; keep overall agent guidance under docs/agents/",
  );
}

for (const relativeRoot of retiredDocumentationRoots) {
  const files = await findFiles(path.join(root, relativeRoot));
  if (files.length > 0) {
    addError(
      `${relativeRoot}: retired documentation root contains files: ${files
        .map((filePath) => path.relative(root, filePath))
        .join(", ")}`,
    );
  }
}

const router = await readUtf8(routerPath);
const indexMatch = router.match(
  /<!-- AGENT-INSTRUCTION-INDEX-START -->([\s\S]*?)<!-- AGENT-INSTRUCTION-INDEX-END -->/u,
);

if (!indexMatch) {
  addError("copilot-instructions.md: missing scoped instruction index markers");
} else {
  const indexedFiles = [
    ...indexMatch[1].matchAll(/`([^`]+\.instructions\.md)`/gu),
  ]
    .map((match) => match[1])
    .sort();

  if (JSON.stringify(indexedFiles) !== JSON.stringify(instructionFiles)) {
    addError(
      `scoped instruction index mismatch\n  expected: ${instructionFiles.join(", ")}\n  actual:   ${indexedFiles.join(", ")}`,
    );
  }
}

const agentPath = path.join(root, "AGENTS.md");
try {
  const agentStats = await lstat(agentPath);
  if (!agentStats.isSymbolicLink()) {
    addError(
      "AGENTS.md must remain a symlink to .github/copilot-instructions.md",
    );
  } else {
    const target = await readlink(agentPath);
    if (target !== ".github/copilot-instructions.md") {
      addError(
        `AGENTS.md points to ${JSON.stringify(target)} instead of .github/copilot-instructions.md`,
      );
    }
  }
} catch {
  addError("AGENTS.md is missing");
}

const scannedFiles = [routerPath, workflowPath];
for (const fileName of instructionFiles) {
  const filePath = path.join(instructionDirectory, fileName);
  const content = await readUtf8(filePath);
  scannedFiles.push(filePath);

  const frontmatter = parseFrontmatter(content, fileName);
  for (const requiredKey of ["name", "description", "applyTo"]) {
    if (!frontmatter[requiredKey]) {
      addError(`${fileName}: missing ${requiredKey} frontmatter`);
    }
  }

  if (frontmatter.applyTo !== expectedScopes[fileName]) {
    addError(
      `${fileName}: applyTo drifted\n  expected: ${expectedScopes[fileName]}\n  actual:   ${frontmatter.applyTo ?? "<missing>"}`,
    );
  }

  const lineCount = content.split("\n").length;
  if (lineCount > 180) {
    addError(
      `${fileName}: ${lineCount} lines exceeds the 180-line instruction budget`,
    );
  }
}

for (const filePath of scannedFiles) {
  const content = await readUtf8(filePath);
  const relativePath = path.relative(root, filePath);

  for (const { pattern, message } of stalePatterns) {
    if (pattern.test(content)) {
      addError(`${relativePath}: ${message}`);
    }
  }
}

const pointerFiles = new Set([...scannedFiles, ...referenceFiles]);
for (const filePath of pointerFiles) {
  const content = await readUtf8(filePath);
  const relativePath = path.relative(root, filePath);

  for (const { pattern, message } of retiredPointerPatterns) {
    if (pattern.test(content)) {
      addError(`${relativePath}: ${message}`);
    }
  }

  // Agents consume copilot-instructions.md through the root AGENTS.md symlink.
  // Resolve its links only from that repository-root perspective.
  const linkBaseDirectory =
    filePath === routerPath ? root : path.dirname(filePath);
  await validateMarkdownLinks(filePath, content, linkBaseDirectory);
}

const instrumentation = await readUtf8(
  path.join(root, "apps/calculator/src/instrumentation.ts"),
);
if (!instrumentation.includes('await import("@/lib/orpc/client.server")')) {
  addError(
    "calculator instrumentation no longer initializes the server oRPC client",
  );
}

const localeLayout = await readUtf8(
  path.join(root, "apps/calculator/src/app/[locale]/layout.tsx"),
);
if (!localeLayout.includes('import "@/lib/orpc/client.server";')) {
  addError("calculator locale layout no longer imports the server oRPC client");
}

const turboConfig = JSON.parse(await readUtf8(path.join(root, "turbo.json")));
for (const taskName of ["build", "start"]) {
  const environment = turboConfig.tasks?.[taskName]?.env;
  if (!Array.isArray(environment) || !environment.includes("*")) {
    addError(`turbo.json: ${taskName} task must preserve env: ["*"]`);
  }
}

if (errors.length > 0) {
  console.error("Agent instruction drift detected:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Agent instructions are synchronized (${instructionFiles.length} scoped files checked).`,
  );
}
