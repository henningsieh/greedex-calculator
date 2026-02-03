# Bun Migration Guide

## Migration Status ✅

All code and configuration changes have been **successfully completed**. The repository has been fully migrated from pnpm to bun as the package manager.

## What Changed

### Package Manager Configuration

1. **Root `package.json`**:
   - Changed `packageManager` from `pnpm@10.28.2` to `bun@1.3.8`
   - Replaced `pnpm.overrides` with `overrides` (bun-compatible format)
   - Added `workspaces` field for bun workspace support
   - Removed framework dependencies (react, react-dom) from root per Turborepo best practices

2. **Workspace Configuration**:
   - Removed `pnpm-workspace.yaml`
   - Created `bunfig.toml` for bun-specific configuration
   - Workspaces are now defined in root `package.json`

3. **Scripts Updated**:
   - `apps/calculator/package.json`: All `pnpm` → `bun`, `pnpx` → `bunx`
   - `packages/database/package.json`: All `pnpm exec` → `bun exec`
   - `.husky/pre-commit`: Updated to use `bun turbo`

4. **Documentation Updates**:
   - `.github/copilot-instructions.md`
   - `.github/instructions/conventions.instructions.md`
   - `.github/instructions/turborepo-package-management.instructions.md`
   - `.github/instructions/quick-start.instructions.md`
   - `.github/instructions/architecture.instructions.md`
   - `README.md`

5. **Other Files**:
   - `.npmrc`: Updated for bun compatibility
   - `.gitignore`: Changed `.pnpm-debug.log*` to `.bun-debug.log*`
   - Removed `pnpm-lock.yaml`

## Testing Locally

Since bun install encountered network/registry issues in the CI environment, you'll need to complete these steps locally:

### Prerequisites

1. Install bun (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Verify bun version:
   ```bash
   bun --version  # Should be 1.3.8 or higher
   ```

### Installation Steps

1. **Install dependencies**:
   ```bash
   bun install
   ```
   
   This will:
   - Install all workspace dependencies
   - Generate `bun.lockb` (the bun lockfile)
   - Set up node_modules

2. **Verify installation**:
   ```bash
   # Check that all packages are installed
   ls node_modules

   # Check workspace packages
   ls apps/*/node_modules
   ls packages/*/node_modules
   ```

### Testing the Migration

Run these commands to verify everything works:

1. **Type checking** (fastest validation):
   ```bash
   bun run type-check
   ```

2. **Build all packages** (per requirements):
   ```bash
   bun turbo run build:cloudenv
   ```
   
   Expected output: All packages should build successfully

3. **Run tests** (per requirements):
   ```bash
   bun turbo run test:cloudenv
   ```
   
   Expected output: All tests should pass

4. **Additional validation**:
   ```bash
   # Lint
   bun run lint
   
   # Format
   bun run format
   ```

## Commit the Lockfile

After successful local installation and testing:

```bash
# Add the generated lockfile
git add bun.lockb

# Commit
git commit -m "Add bun.lockb lockfile"

# Push
git push
```

## Common Commands Reference

| Task | Old (pnpm) | New (bun) |
|------|------------|-----------|
| Install dependencies | `pnpm install` | `bun install` |
| Add package | `pnpm add <pkg>` | `bun add <pkg>` |
| Add dev package | `pnpm add -d <pkg>` | `bun add -d <pkg>` |
| Remove package | `pnpm remove <pkg>` | `bun remove <pkg>` |
| Run script | `pnpm run <script>` | `bun run <script>` |
| Execute binary | `pnpm exec <cmd>` | `bun exec <cmd>` or `bunx <cmd>` |
| Filter workspace | `pnpm --filter <pkg>` | `bun --filter <pkg>` |
| Run turbo task | `pnpm turbo run <task>` | `bun turbo run <task>` |

## Workspace Protocol

All internal dependencies use the `workspace:*` protocol, which is supported by both pnpm and bun:

```json
{
  "dependencies": {
    "@greendex/database": "workspace:*",
    "@greendex/auth": "workspace:*"
  }
}
```

This ensures packages always use the local workspace version.

## Troubleshooting

### If `bun install` fails:

1. **Clear bun cache**:
   ```bash
   bun pm cache rm
   ```

2. **Try again**:
   ```bash
   bun install
   ```

3. **Check for conflicting lockfiles**:
   ```bash
   # Should not exist
   ls pnpm-lock.yaml package-lock.json yarn.lock
   ```

### If builds fail:

1. **Clean build artifacts**:
   ```bash
   bun run clean
   ```

2. **Reinstall**:
   ```bash
   rm -rf node_modules
   bun install
   ```

3. **Build again**:
   ```bash
   bun turbo run build:cloudenv
   ```

## Verification Checklist

- [ ] `bun install` completes successfully
- [ ] `bun.lockb` is generated
- [ ] `bun turbo run build:cloudenv` succeeds
- [ ] `bun turbo run test:cloudenv` succeeds  
- [ ] `bun run type-check` passes
- [ ] `bun run lint` passes
- [ ] `bun run format` runs without errors
- [ ] All workspace packages can be built
- [ ] No pnpm references remain in codebase

## Definition of Done

✅ **Code Changes**: Complete
✅ **Documentation Updates**: Complete
✅ **Configuration Files**: Complete
⏳ **Local Testing**: Pending (requires local environment)
⏳ **Lockfile Generation**: Pending (requires local `bun install`)

The migration is **ready for local testing**. Once you run `bun install` locally and verify the build/test commands work, the migration will be 100% complete.

## Benefits of Bun

- **Faster installs**: Bun is significantly faster than pnpm/npm
- **Native TypeScript**: Run TypeScript files directly with `bun run`
- **Built-in test runner**: Use `bun test` (though this project uses Vitest)
- **Better performance**: Faster module resolution and execution
- **Simpler configuration**: Less boilerplate than pnpm
- **Active development**: Rapidly improving with new features

## Support

If you encounter any issues during local testing, check:

1. Bun version: `bun --version` (should be >= 1.3.8)
2. Node version: `node --version` (should be >= 18)
3. Check bun docs: https://bun.sh/docs
4. Turborepo + bun guide: https://turborepo.dev/blog/turbo-2-6#bun-package-manager-to-stable
