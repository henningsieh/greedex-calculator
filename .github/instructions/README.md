---
applyTo: '**'
description: Navigation guide for integration instructions and comprehensive documentation
---

# Instructions Directory

This folder contains **quick reference guides** for specific libraries and frameworks. Each instruction file is a navigation aid that points to **comprehensive, extensive documentation in `/docs/`**.

## ⚠️ CRITICAL: Always Consult Full Documentation

**Every library in this project has detailed, comprehensive documentation in `/docs/`.** The instruction files here are shortcuts—they contain essential patterns and point you to the full guides. Always read the complete documentation before implementing features.

## When to use these files

These are **quick reference guides** with pointers to comprehensive documentation. Each instruction file links to extensive documentation in `/docs/` organized by library:

- **`better-auth.instructions.md`** — Better Auth configuration, authentication, and oRPC SSR pattern
  → Full docs: `/docs/better-auth/` (4 comprehensive files)
  
- **`i18n.instructions.md`** — next-intl internationalization setup and country selection
  → Full docs: `/docs/i18n/` (6 comprehensive files)
  
- **`orpc.instructions.md`** — oRPC core concepts, integrations, and SSR optimization
  → Full docs: `/docs/orpc/` (17 comprehensive files)
  
- **`shadcn.instructions.md`** — Shadcn UI component patterns and accessibility
  → Full docs: `/docs/shadcn/` (3 comprehensive files)

## Comprehensive Documentation in `/docs/`

**⚠️ CRITICAL**: All instruction files point to extensive documentation in `/docs/`. Always consult the comprehensive docs for:

| Library | Location | Files | Coverage |
|---------|----------|-------|----------|
| Better Auth | `/docs/better-auth/` | 4 files | Options, organizations, email/password, utilities |
| i18n (next-intl) | `/docs/i18n/` | 6 files | Setup, country selection, EU config, file organization |
| oRPC | `/docs/orpc/` | 17 files | Procedures, routers, integrations, OpenAPI, SSR |
| Shadcn UI | `/docs/shadcn/` | 3 files | Data tables, forms, empty states |
| TanStack Query | `/docs/tanstack-react-query/` | 5 files | SSR, hydration, prefetching, request waterfalls |
| React Email | `/docs/react-email/` | 4 files | Setup, HTML components, Nodemailer, Tailwind |
| Permissions | `/docs/permissions/` | 1 file | Access control model and implementation |
| Questionnaire | `/docs/participate/` | 5 files | Flow, calculations, conditional logic, testing |
| Ultracite | `/docs/ultracite/` | 3 files | Setup, configuration, usage |
| Database | `/docs/database/` | 1 file | Coolify SSL connections |

## Main Instructions

For all general guidelines, architecture, conventions, and agent rules, see `/.github/copilot-instructions.md`
