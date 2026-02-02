---
name: "Turborepo Package Management"
description: "Industry-standard dependency management for Turborepo monorepos"
applyTo: "**/package.json,turbo.json"
---

# Turborepo Package Management Standards

## Dependency Organization

### Root Package Management

- **Root `package.json`**: Contains only shared utilities and build tools
- **Framework dependencies**: Never declare React, Next.js, or other framework packages in root
- **Version enforcement**: Use `pnpm.overrides` in root to enforce consistent versions across workspace

### App-Level Dependencies

- **Apps declare frameworks**: Each Next.js/React app explicitly declares its framework dependencies
- **Peer dependencies**: Packages declare framework dependencies as peer dependencies when needed
- **No duplication**: Framework packages are only declared where they're directly used

### Version Consistency

- **Root overrides**: Enforce exact versions for critical dependencies via `pnpm.overrides`
- **Semantic versioning**: Use exact versions for framework packages, caret ranges for utilities
- **Regular updates**: Keep framework versions in sync across all apps

## Implementation Pattern

### Root package.json Structure

```json
{
  "dependencies": {
    // Only shared utilities and build tools
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "zod": "^4.3.6"
    // NO: react, next, next-intl, etc.
  },
  "pnpm": {
    "overrides": {
      // Enforce versions across workspace
      "next": "16.1.6",
      "react": "19.2.4",
      "react-dom": "19.2.4"
    }
  }
}
```

### App package.json Structure

```json
{
  "dependencies": {
    // Framework dependencies declared here
    "next": "16.1.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "next-intl": "4.8.1"
  }
}
```

### Package Structure

```json
{
  "peerDependencies": {
    // Framework packages as peers when needed
    "next": "^16.1.6",
    "next-intl": "^4.7.0"
  }
}
```

## Benefits

- **Clear ownership**: Each app/package owns its framework dependencies
- **Version control**: Root overrides ensure consistency without duplication
- **Reduced conflicts**: No version resolution conflicts between root and apps
- **Maintainability**: Easier to update individual apps without affecting others
- **Industry standard**: Follows patterns used by major monorepo projects

## Migration Guide

When setting up new apps or packages:

1. Add framework dependencies to the app/package that uses them
2. Add critical versions to root `pnpm.overrides`
3. Remove framework dependencies from root if they exist
4. Run `pnpm install` to verify resolution
5. Run `pnpm run type-check` to ensure no type conflicts
