---
name: "Quick Start Guide"
description: "5-15 minute onboarding paths based on task type"
applyTo: "**/*"
---

# Quick Start Guide for AI Agents

This guide provides 5-15 minute onboarding paths based on task type.

---

## How to Use This Guide

1. **Identify your task** from the table below
2. **Follow the reading sequence** (entry point → deep dive → implementation)
3. **Reference code examples** in the specified locations
4. **Consult supplementary docs** as needed

---

## Task-Based Learning Paths

### 🔹 API & Backend Features

| Task                         | Entry Point (5 min)                     | Deep Dive (10 min)                                | Implementation Reference                                        |
| ---------------------------- | --------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| **Create API endpoint**      | `docs/orpc/QUICKSTART.md`               | `docs/orpc/DUAL-SETUP.md`                         | `src/lib/orpc/README.md`                                        |
| **Add protected procedure**  | `docs/orpc/QUICKSTART.md` (cheat sheet) | `docs/orpc/DUAL-SETUP.md`                         | `src/lib/orpc/middleware.ts`                                    |
| **Optimize SSR performance** | `docs/orpc/DUAL-SETUP.md`               | `docs/orpc/Optimize-Server-Side-Rendering.SSR.md` | `src/instrumentation.ts`                                        |
| **Integrate TanStack Query** | `docs/orpc/orpc.tanstack-query.md`      | `docs/tanstack-react-query/ssr.md`                | `.github/instructions/orpc.instructions.md`                     |
| **Add database schema**      | `src/lib/drizzle/`                      | Run `bun run db:generate`                        | `.github/instructions/conventions.instructions.md` (migrations) |

### 🔹 Authentication & Authorization

| Task                          | Entry Point                                                  | Deep Dive                                 | Implementation Reference     |
| ----------------------------- | ------------------------------------------------------------ | ----------------------------------------- | ---------------------------- |
| **Set up auth flow**          | `docs/better-auth/better-auth.credentials.email_password.md` | `docs/better-auth/better-auth.options.md` | `src/lib/better-auth/`       |
| **Add organization features** | `docs/better-auth/better-auth.organizations.md`              | `docs/projects/permissions.md`            | `src/lib/better-auth/`       |
| **Track login methods**       | `docs/better-auth/better-auth.utility.LastLoginMethod.md`    | —                                         | `src/lib/better-auth/`       |
| **Auth + oRPC SSR pattern**   | `.github/instructions/better-auth.instructions.md`           | `docs/orpc/orpc.better-auth.md`           | `src/lib/orpc/procedures.ts` |

### 🔹 UI & Frontend

| Task                    | Entry Point                                                         | Deep Dive           | Implementation Reference        |
| ----------------------- | ------------------------------------------------------------------- | ------------------- | ------------------------------- |
| **Add UI component**    | `docs/shadcn/` (component-specific)                                 | shadcn docs         | `bunx shadcn@latest add <name>` |
| **Create form**         | `docs/shadcn/shadcn-ui.new-field.documentation.md`                  | —                   | `src/components/ui/`            |
| **Build data table**    | `docs/shadcn/shadcn-ui.data-table.md`                               | —                   | `src/components/ui/`            |
| **Empty state**         | `docs/shadcn/shadcn.empty.component.md`                             | —                   | `src/components/ui/empty.tsx`   |
| **Accessibility audit** | `.github/instructions/code-standards.instructions.md` (React & JSX) | WCAG 2.1 guidelines | Semantic HTML patterns          |

### 🔹 Internationalization

| Task                      | Entry Point                                   | Deep Dive                                | Implementation Reference |
| ------------------------- | --------------------------------------------- | ---------------------------------------- | ------------------------ |
| **Set up locale routing** | `docs/i18n/next-intl.internationalization.md` | —                                        | `src/lib/i18n/`          |
| **Add translations**      | `.github/instructions/i18n.instructions.md`   | `docs/i18n/file-organization.md`         | `messages/<locale>/`     |
| **Country selection**     | `docs/i18n/Country-Selection-Utils.md`        | `docs/i18n/Dynamic-Country_Flag-Data.md` | `src/lib/i18n/`          |
| **EU countries config**   | `docs/i18n/eu-countries-configuration.md`     | —                                        | —                        |

### 🔹 Questionnaire & Calculations

| Task                | Entry Point                                  | Deep Dive                               | Implementation Reference    |
| ------------------- | -------------------------------------------- | --------------------------------------- | --------------------------- |
| **Understand flow** | `docs/participate/flow.md`                   | `docs/participate/conditional-logic.md` | `src/features/participate/` |
| **Add calculation** | `docs/participate/emissions-calculations.md` | —                                       | `src/features/participate/` |
| **Write tests**     | `docs/participate/testing.md`                | —                                       | `src/__tests__/`            |

### 🔹 Project Management & Permissions

| Task                       | Entry Point                                           | Deep Dive                           | Implementation Reference |
| -------------------------- | ----------------------------------------------------- | ----------------------------------- | ------------------------ |
| **Understand permissions** | `docs/projects/permissions.md`                        | —                                   | `src/lib/better-auth/`   |
| **Sorting refactor**       | `docs/projects/sorting-centralization-refactoring.md` | `docs/projects/SORTING-QUICKREF.md` | Database queries         |

### 🔹 Email Templates

| Task                     | Entry Point                               | Deep Dive | Implementation Reference |
| ------------------------ | ----------------------------------------- | --------- | ------------------------ |
| **Set up React Email**   | `docs/react-email/setup-React_Email.md`   | —         | `src/lib/email/`         |
| **Use HTML components**  | `docs/react-email/use-HTML_Components.md` | —         | Email template files     |
| **Configure Nodemailer** | `docs/react-email/use-Nodemailer.md`      | —         | `src/lib/email/`         |
| **Style with Tailwind**  | `docs/react-email/use-Tailwind.md`        | —         | Email template files     |

### 🔹 Code Quality & Standards

| Task                     | Entry Point                                                         | Deep Dive          | Implementation Reference |
| ------------------------ | ------------------------------------------------------------------- | ------------------ | ------------------------ |
| **Understand linting**   | `docs/oxc/README.md`                                                | `docs/oxc/oxlint/` | Run `bun run lint`      |
| **Formatting rules**     | `docs/oxc/oxfmt/`                                                   | —                  | Run `bun run format`    |
| **TypeScript patterns**  | `.github/instructions/code-standards.instructions.md` (Type Safety) | —                  | Codebase examples        |
| **React best practices** | `.github/instructions/code-standards.instructions.md` (React & JSX) | —                  | Codebase examples        |

---

## Common Questions → Quick Answers

| Question                                | Answer                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Which endpoint should I use?**        | `docs/orpc/QUICKSTART.md` (decision tree)                                                               |
| **How do I add a protected procedure?** | `docs/orpc/DUAL-SETUP.md` (middleware patterns)                                                         |
| **Where are files located?**            | `.github/instructions/architecture.instructions.md` (project structure)                                 |
| **How do I test this?**                 | `docs/participate/testing.md` + `.github/instructions/code-standards.instructions.md` (testing section) |
| **What's the git workflow?**            | `.github/instructions/conventions.instructions.md` (git workflow)                                       |
| **How do I run the dev server?**        | **You don't** — forbidden command (see `.github/copilot-instructions.md`)                               |
| **How do I run tests?**                 | `bun run test` (allowed command)                                                                       |
| **What's the package manager?**         | `bun` exclusively (see `.github/instructions/conventions.instructions.md`)                              |

---

## First-Time Contributor Checklist

If you're joining the project for the first time:

1. ✅ **Read** `.github/copilot-instructions.md` (root file) — 5 minutes
2. ✅ **Scan** `.github/instructions/architecture.instructions.md` — Understand system layers
3. ✅ **Review** `.github/instructions/conventions.instructions.md` — Package manager, linting, workflows
4. ✅ **Bookmark** `docs/README.md` — Full documentation index
5. ✅ **Identify** your task from the table above
6. ✅ **Follow** the learning path sequence
7. ✅ **Run** `bun run lint && bun run format` before committing

---

## Architecture Deep Dive References

| Topic                  | File                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| **System design**      | `.github/instructions/architecture.instructions.md`                            |
| **File organization**  | `.github/instructions/architecture.instructions.md` (project structure)        |
| **SSR client split**   | `.github/instructions/architecture.instructions.md` (critical pattern)         |
| **Data flow patterns** | `.github/instructions/architecture.instructions.md` (server/client components) |
| **Key constraints**    | `.github/instructions/architecture.instructions.md` (constraints & gotchas)    |

---

## Progressive Disclosure Strategy

This guide follows **progressive disclosure**:

1. **Level 1**: `.github/copilot-instructions.md` — Essentials only (~120 lines)
2. **Level 2**: This file (quick-start) — Task-based navigation
3. **Level 3**: `.github/instructions/{architecture,conventions,code-standards}.instructions.md` — Patterns & best practices
4. **Level 4**: Topic-specific guides — `.github/instructions/TOPIC--*.instructions.md` files
5. **Level 5**: Comprehensive docs — `/docs/` folder (rich detail)

**Start broad, drill down as needed.**

---

## For More Details

- **Main instructions**: `.github/copilot-instructions.md`
- **Architecture**: `.github/instructions/architecture.instructions.md`
- **Conventions**: `.github/instructions/conventions.instructions.md`
- **Code standards**: `.github/instructions/code-standards.instructions.md`
- **Full docs**: `docs/README.md`
