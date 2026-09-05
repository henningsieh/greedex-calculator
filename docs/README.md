---
applyTo: "**"
description: "Developer documentation index and online vendor-reference routes"
---

# Documentation Index

## Agent navigation

- [Task routes for agents](agents/agent-workflows.md)
- **Vendor-documentation migration:** follow the [temporary online migration instructions](agents/online-documentation-migration.md) before retiring checked-in upstream docs.
- [Domain documentation and glossary](agents/domain.md)
- [Canonical domain glossary](../DOMAIN-GLOSSARY.md)
- Repository-wide rules and scoped instruction index: [`AGENTS.md`](../AGENTS.md)

## Online vendor references

Vendor API documentation is retrieved from versioned official sources instead of cached in this repository:

| Concern | Project rules | Official index |
| --- | --- | --- |
| oRPC procedures, clients, SSR, and OpenAPI | [oRPC instruction](../.github/instructions/orpc.instructions.md) | [oRPC v1](https://v1.orpc.dev/llms.txt) |
| TanStack Query caching, prefetching, and hydration | [TanStack Query instruction](../.github/instructions/tanstack-react-query.instructions.md) | [TanStack Query v5](https://tanstack.com/query/v5/llms.txt) |
| Better Auth and organizations | [Better Auth instruction](../.github/instructions/better-auth.instructions.md) | [Better Auth v1.7](https://better-auth.com/docs/llms.txt) |
| Oxc linting and formatting | [Repository conventions](../.github/instructions/conventions.instructions.md) | [Oxc](https://oxc.rs/llms.txt) |
| React Email templates and Nodemailer transport | [Email instruction](../.github/instructions/email.instructions.md) | [React Email](https://react.email/llms.txt) |
| Documentation application | [Documentation app instruction](../.github/instructions/documentation-app.instructions.md) | [Fumadocs](https://fumadocs.vercel.app/llms.txt) |

The scoped instructions own Greendex invariants and route each task to the smallest relevant official Markdown page.

## Project documentation

### Agent and domain guidance

- [Issue tracker](agents/issue-tracker.md)
- [Triage labels](agents/triage-labels.md)
- [Domain model](agents/domain.md)

### Authentication and authorization

- [Better Auth project rules](../.github/instructions/better-auth.instructions.md)
- [Project permissions](projects/permissions.md)

### Database, locale, and delivery

- [Database documentation](database/README.md)
- [Coolify SSL connection](database/coolify-ssl-connection.md)
- [Internationalization](i18n/next-intl.internationalization.md)
- [Country flag data](i18n/Dynamic-Country_Flag-Data.md)
- [Email project rules](../.github/instructions/email.instructions.md)

### Features and UI

- [Participation flow](participate/README.md)
- [Emissions calculations](participate/emissions-calculations.md)
- [Conditional logic](participate/conditional-logic.md)
- [Participation testing](participate/testing.md)
- [Projects](projects/README.md)
- [shadcn/ui](shadcn/)

### Tooling

- [Oxc project rules](../.github/instructions/conventions.instructions.md)
