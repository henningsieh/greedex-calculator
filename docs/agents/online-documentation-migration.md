# Online Documentation Migration

- **Status:** Temporary branch instruction
- **Trigger:** Use when replacing checked-in third-party or framework documentation under `docs/` with current official online documentation.
- **Lifecycle:** Delete this file, its index pointer, and its checker registration after every planned documentation migration is complete.

## Status

### Done

- [x] oRPC
- [x] TanStack React Query

### Open

- [x] Better Auth: upstream cache retired; project rules live in the scoped instruction.
- [x] Fumadocs: upstream cache retired; documentation-application ownership is scoped.
- [x] Internationalization: vendor cache retired; Greendex locale and country architecture remain in the scoped instruction.
- [x] Next.js duplicate reference: upstream cache retired in favor of the generated `.next-docs` route.
- [x] Oxc: upstream linting and formatting cache retired; repository commands remain in conventions.
- [x] React Email and Nodemailer: upstream cache retired; template and Calculator transport ownership are scoped.
- [x] shadcn/ui: upstream component cache retired; local components and configuration remain authoritative.
- [x] Clickdummy prototype: obsolete historical prototype retired; current questionnaire behavior remains owned by the participate documentation and implementation.

Project-authored documentation under `database`, `deployment`, `participate`, `projects`, and `schemas` is outside this migration unless classification finds cached upstream prose.

## Outcome

Retire local copies of upstream documentation while preserving:

1. project-specific invariants in scoped instructions or implementation maps;
2. branch-specific pointers to version-matched official documentation; and
3. deterministic validation that prevents retired files and links from returning.

Runtime behavior and dependency versions stay unchanged unless the task explicitly expands the scope.

## Authority

Resolve every retained claim in this order:

1. **Project source** defines local architecture and behavior.
2. **Installed packages** define available versions, exports, declarations, and APIs.
3. **Official versioned documentation** explains upstream behavior.
4. **Model memory** provides background only.

Installed declarations win when online examples disagree. Prefer exact-major official indexes and Markdown pages; use moving `latest` or repository-default-branch pages only when the vendor provides no versioned source.

## Classification gate

Classify every candidate file before editing:

- **Upstream cache:** copied or adapted vendor API prose; replace it with online pointers.
- **Project knowledge:** local architecture, ownership, constraints, or operational behavior; preserve it in its owning instruction or implementation map.
- **Hybrid:** split project knowledge from upstream prose, then retire the cached portion.
- **Obsolete:** guidance contradicted by current source, installed versions, or official documentation; remove it.

**Complete when:** every candidate file has one classification and every project-specific claim has a destination.

## Migration sequence

### 1. Establish the baseline

1. Read [repository instructions](../../AGENTS.md), the [documentation index](../README.md), and every scoped instruction matching the integration.
2. Run `pnpm dlx @tanstack/intent@latest list`; load only a skill that directly covers the active integration.
3. Record `git status --short` and preserve unrelated work.
4. Inventory the candidate tree by file, line count, and reference location.
5. Inspect manifests, lockfiles, imports, implementation seams, and existing checker behavior.
6. Identify concrete drift before rewriting: dead links, wrong protocols, nonexistent imports, obsolete workarounds, or prose that disagrees with source.

**Complete when:** the starting diff is accounted for, installed versions are known, every inbound reference is located, and known drift is explicit.

### 2. Build the online route

1. Find the official versioned documentation index for the installed major.
2. Fetch only the pages needed by the active branch; avoid bulk corpora when a focused page exists.
3. Verify committed URLs directly and prefer fully resolved URLs over base-plus-relative-path instructions.
4. Define a retrieval loop for the owning scoped instruction:
   - confirm the installed major;
   - open the matching official index;
   - fetch the smallest relevant page set;
   - compare examples with project source and installed declarations;
   - finish when every changed concern has an authoritative source.

**Complete when:** every upstream branch has a verified official entry point and no retained claim depends on rediscovery or model memory.

### 3. Preserve project knowledge

1. Give each invariant one prose owner.
2. Keep path-scoped implementation rules in `.github/instructions/`; keep concise human source maps beside the implementation when useful.
3. Derive instruction scope from current imports and integration surfaces instead of applying it repository-wide.
4. Keep scoped instructions within the line budget enforced by [`check:agent-instructions`](../../scripts/check-agent-instructions.mjs).
5. Use pointers for upstream API reference rather than reproducing vendor tutorials, dependency lists, or directory inventories.

**Complete when:** deleting the candidate tree would remove no unique project knowledge and every instruction scope covers its real consumers.

### 4. Repair navigation

Update every pointer-bearing owner, including:

- `AGENTS.md` through `.github/copilot-instructions.md`;
- matching scoped instructions;
- `docs/README.md` and `docs/agents/agent-workflows.md`;
- root and integration-level readmes; and
- feature indexes that referenced the retired tree.

Resolve links in `.github/copilot-instructions.md` from the repository-root `AGENTS.md` perspective. Front-load each pointer with the task branch that triggers it. Keep direct-page catalogs in the scoped instruction that owns the integration.

**Complete when:** every surviving pointer leads to current project source, an owning instruction, or a verified versioned official page.

### 5. Make drift executable

Extend [`scripts/check-agent-instructions.mjs`](../../scripts/check-agent-instructions.mjs) for each migration:

1. register any new scoped instruction and exact `applyTo` scope;
2. reject files under each retired documentation root;
3. reject direct and deeply nested relative links to each retired root;
4. scan an explicit list of known pointer-bearing files, including the workflow and integration readmes;
5. preserve existing architectural guardrails; and
6. keep CI deterministic and offline.

Self-test each retired root: create a disposable probe file, confirm the checker fails, remove the probe, and confirm it passes. Probe stale pointers separately when pointer matching changes.

**Complete when:** every new guard goes red on its probe, green after cleanup, and all pre-existing guardrails still pass.

### 6. Retire and validate

Delete the classified upstream caches only after their project knowledge has an owner. Git removes empty directories; leave no placeholders.

Run:

```bash
pnpm run format
pnpm run check:agent-instructions
pnpm run lint
git diff --check
git diff --cached --check
```

Construct a final `rg` audit for every retired root using both direct-path and zero-or-more-parent relative-link patterns. Inspect every match. Run type checking and affected tests when implementation or configuration files changed.

Review `git status --short`, `git diff --stat`, and the full diff. Confirm runtime source and dependency resolution stayed unchanged unless explicitly in scope.

**Complete when:** local checks pass, audits have no unexpected matches, probes are gone, and the diff contains one coherent documentation migration.

## Program completion

After all documentation families planned for this branch have migrated, delete:

- this temporary instruction;
- its pointer in `docs/README.md`; and
- its registration in `scripts/check-agent-instructions.mjs`.

The final branch must retain only durable scoped instructions, online routes, and executable drift guards.
