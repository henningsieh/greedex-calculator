---
name: turborepo
description: Turborepo monorepo build system guidance for task pipelines, caching, and CI optimization
metadata:
  version: 2.7.6-canary.3
---

# Turborepo Skill

Build system for JavaScript/TypeScript monorepos. Turborepo caches task outputs and runs tasks in parallel based on dependency graph.

## IMPORTANT: Package Tasks, Not Root Tasks

**DO NOT create Root Tasks. ALWAYS create package tasks.**

When creating tasks/scripts/pipelines, you MUST:

1. Add the script to each relevant package's `package.json`
2. Register the task in root `turbo.json`
3. Root `package.json` only delegates via `turbo run <task>`

**DO NOT** put task logic in root `package.json`. This defeats Turborepo's parallelization.

```json
// DO THIS: Scripts in each package
// apps/web/package.json
{ "scripts": { "build": "next build", "lint": "eslint .", "test": "vitest" } }

// apps/api/package.json
{ "scripts": { "build": "tsc", "lint": "eslint .", "test": "vitest" } }

// packages/ui/package.json
{ "scripts": { "build": "tsc", "lint": "eslint .", "test": "vitest" } }
```

```json
// turbo.json - register tasks
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {},
    "test": { "dependsOn": ["build"] }
  }
}
```

```json
// Root package.json - ONLY delegates, no task logic
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

```json
// DO NOT DO THIS - defeats parallelization
// Root package.json
{
  "scripts": {
    "build": "cd apps/web && next build && cd ../api && tsc",
    "lint": "eslint apps/ packages/",
    "test": "vitest"
  }
}
```

Root Tasks (`//#taskname`) are ONLY for tasks that truly cannot exist in packages (rare).

## Secondary Rule: `turbo run` vs `turbo`

**Always use `turbo run` when the command is written into code:**

```json
// package.json - ALWAYS "turbo run"
{
  "scripts": {
    "build": "turbo run build"
  }
}
```

```yaml
# CI workflows - ALWAYS "turbo run"
- run: turbo run build --affected
```

**The shorthand `turbo <tasks>` is ONLY for one-off terminal commands** typed directly by humans or agents. Never write `turbo build` into package.json, CI, or scripts.

## Quick Decision Trees

### "I need to configure a task"

```
Configure a task?
├─ Define task dependencies → references/configuration/tasks.md
├─ Lint/check-types (parallel + caching) → Use Transit Nodes pattern (see below)
├─ Specify build outputs → references/configuration/tasks.md#outputs
├─ Handle environment variables → references/environment/README.md
├─ Set up dev/watch tasks → references/configuration/tasks.md#persistent
├─ Package-specific config → references/configuration/README.md#package-configurations
└─ Global settings (cacheDir, daemon) → references/configuration/global-options.md
```

### "My cache isn't working"

```
Cache problems?
├─ Tasks run but outputs not restored → Missing `outputs` key
├─ Cache misses unexpectedly → references/caching/gotchas.md
├─ Need to debug hash inputs → Use --summarize or --dry
├─ Want to skip cache entirely → Use --force or cache: false
├─ Remote cache not working → references/caching/remote-cache.md
└─ Environment causing misses → references/environment/gotchas.md
```

### "I want to run only changed packages"

```
Run only what changed?
├─ Changed packages + dependents (RECOMMENDED) → turbo run build --affected
├─ Custom base branch → --affected --affected-base=origin/develop
├─ Manual git comparison → --filter=...[origin/main]
└─ See all filter options → references/filtering/README.md
```

**`--affected` is the primary way to run only changed packages.** It automatically compares against the default branch and includes dependents.

### "I want to filter packages"

```
Filter packages?
├─ Only changed packages → --affected (see above)
├─ By package name → --filter=web
├─ By directory → --filter=./apps/*
├─ Package + dependencies → --filter=web...
├─ Package + dependents → --filter=...web
└─ Complex combinations → references/filtering/patterns.md
```

### "Environment variables aren't working"

```
Environment issues?
├─ Vars not available at runtime → Strict mode filtering (default)
├─ Cache hits with wrong env → Var not in `env` key
├─ .env changes not causing rebuilds → .env not in `inputs`
├─ CI variables missing → references/environment/gotchas.md
└─ Framework vars (NEXT_PUBLIC_*) → Auto-included via inference
```

### "I need to set up CI"

```
CI setup?
├─ GitHub Actions → references/ci/github-actions.md
├─ Vercel deployment → references/ci/vercel.md
├─ Remote cache in CI → references/caching/remote-cache.md
├─ Only build changed packages → --affected flag
├─ Skip unnecessary builds → turbo-ignore (references/cli/commands.md)
└─ Skip container setup when no changes → turbo-ignore
```

### "I want to watch for changes during development"

```
Watch mode?
├─ Re-run tasks on change → turbo watch (references/watch/README.md)
├─ Dev servers with dependencies → Use `with` key (references/configuration/tasks.md#with)
├─ Restart dev server on dep change → Use `interruptible: true`
└─ Persistent dev tasks → Use `persistent: true`
```

### "I need to create/structure a package"

```
Package creation/structure?
├─ Create an internal package → references/best-practices/packages.md
├─ Repository structure → references/best-practices/structure.md
├─ Dependency management → references/best-practices/dependencies.md
├─ Best practices overview → references/best-practices/README.md
├─ JIT vs Compiled packages → references/best-practices/packages.md#compilation-strategies
└─ Sharing code between apps → references/best-practices/README.md#package-types
```

### "How should I structure my monorepo?"

```
Monorepo structure?
├─ Standard layout (apps/, packages/) → references/best-practices/README.md
├─ Package types (apps vs libraries) → references/best-practices/README.md#package-types
├─ Creating internal packages → references/best-practices/packages.md
├─ TypeScript configuration → references/best-practices/structure.md#typescript-configuration
├─ ESLint configuration → references/best-practices/structure.md#eslint-configuration
├─ Dependency management → references/best-practices/dependencies.md
└─ Enforce package boundaries → references/boundaries/README.md
```

### "I want to enforce architectural boundaries"

```
Enforce boundaries?
├─ Check for violations → turbo boundaries
├─ Tag packages → references/boundaries/README.md#tags
├─ Restrict which packages can import others → references/boundaries/README.md#rule-types
└─ Prevent cross-package file imports → references/boundaries/README.md
```

### "I need to manage dependencies"

```
Manage dependencies?
├─ Shared utilities (clsx, tailwind-merge, @paralleldrive/cuid2, zod) → Declare in root package.json only, enforce versions with pnpm.overrides
├─ Framework packages (React, Next.js) → Declare in each app/package that uses them, enforce versions with pnpm.overrides
├─ Version conflicts → Use pnpm.overrides in root to enforce consistent versions across workspace
├─ Hoisting issues → Check pnpm-workspace.yaml hoistPattern and onlyBuiltDependencies
├─ Internal packages → Use "workspace:*" versions for workspace dependencies
├─ External dependencies → Install in packages that directly use them, not in root
└─ Dependency deduplication → Root should contain only truly shared utilities, not app-specific packages
```

**Why not declare frameworks in root?** Framework packages like Next.js, React, and Next-intl should be declared in each app/package that uses them (not in root) because:

- Different apps may use different versions or may not need the framework at all
- Prevents unnecessary dependencies in packages that don't use the framework
- Allows for gradual migration between framework versions
- Root should only contain truly shared utilities used across the entire workspace

## Repository Patterns

Read [repository-patterns.md](./references/repository-patterns.md) before creating or reviewing tasks, caching, environment handling, package boundaries, or dependency placement. Apply every matching anti-pattern and task pattern.

## Reference Index

### Configuration

| File                                                                            | Purpose                                                  |
| ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [configuration/README.md](./references/configuration/README.md)                 | turbo.json overview, Package Configurations              |
| [configuration/tasks.md](./references/configuration/tasks.md)                   | dependsOn, outputs, inputs, env, cache, persistent       |
| [configuration/global-options.md](./references/configuration/global-options.md) | globalEnv, globalDependencies, cacheDir, daemon, envMode |
| [configuration/gotchas.md](./references/configuration/gotchas.md)               | Common configuration mistakes                            |

### Caching

| File                                                            | Purpose                                      |
| --------------------------------------------------------------- | -------------------------------------------- |
| [caching/README.md](./references/caching/README.md)             | How caching works, hash inputs               |
| [caching/remote-cache.md](./references/caching/remote-cache.md) | Vercel Remote Cache, self-hosted, login/link |
| [caching/gotchas.md](./references/caching/gotchas.md)           | Debugging cache misses, --summarize, --dry   |

### Environment Variables

| File                                                          | Purpose                                   |
| ------------------------------------------------------------- | ----------------------------------------- |
| [environment/README.md](./references/environment/README.md)   | env, globalEnv, passThroughEnv            |
| [environment/modes.md](./references/environment/modes.md)     | Strict vs Loose mode, framework inference |
| [environment/gotchas.md](./references/environment/gotchas.md) | .env files, CI issues                     |

### Filtering

| File                                                        | Purpose                  |
| ----------------------------------------------------------- | ------------------------ |
| [filtering/README.md](./references/filtering/README.md)     | --filter syntax overview |
| [filtering/patterns.md](./references/filtering/patterns.md) | Common filter patterns   |

### CI/CD

| File                                                      | Purpose                         |
| --------------------------------------------------------- | ------------------------------- |
| [ci/README.md](./references/ci/README.md)                 | General CI principles           |
| [ci/github-actions.md](./references/ci/github-actions.md) | Complete GitHub Actions setup   |
| [ci/vercel.md](./references/ci/vercel.md)                 | Vercel deployment, turbo-ignore |
| [ci/patterns.md](./references/ci/patterns.md)             | --affected, caching strategies  |

### CLI

| File                                            | Purpose                                       |
| ----------------------------------------------- | --------------------------------------------- |
| [cli/README.md](./references/cli/README.md)     | turbo run basics                              |
| [cli/commands.md](./references/cli/commands.md) | turbo run flags, turbo-ignore, other commands |

### Best Practices

| File                                                                          | Purpose                                                         |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [best-practices/README.md](./references/best-practices/README.md)             | Monorepo best practices overview                                |
| [best-practices/structure.md](./references/best-practices/structure.md)       | Repository structure, workspace config, TypeScript/ESLint setup |
| [best-practices/packages.md](./references/best-practices/packages.md)         | Creating internal packages, JIT vs Compiled, exports            |
| [best-practices/dependencies.md](./references/best-practices/dependencies.md) | Dependency management, installing, version sync                 |

### Watch Mode

| File                                            | Purpose                                         |
| ----------------------------------------------- | ----------------------------------------------- |
| [watch/README.md](./references/watch/README.md) | turbo watch, interruptible tasks, dev workflows |

### Boundaries (Experimental)

| File                                                      | Purpose                                               |
| --------------------------------------------------------- | ----------------------------------------------------- |
| [boundaries/README.md](./references/boundaries/README.md) | Enforce package isolation, tag-based dependency rules |

## Source Documentation

This skill is based on the official Turborepo documentation at:

- Source: `docs/site/content/docs/` in the Turborepo repository
- Live: https://turborepo.dev/docs
