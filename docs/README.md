---
applyTo: "**"
description: "Developer documentation index and online vendor-reference routes"
---

# Documentation Index

## Agent navigation

- [Task routes for agents](agents/agent-workflows.md)
- [Domain documentation and glossary](agents/domain.md)
- [Canonical domain glossary](../DOMAIN-GLOSSARY.md)
- Repository-wide rules and scoped instruction index: [`AGENTS.md`](../AGENTS.md)

## Online vendor references

Vendor API documentation is retrieved from versioned official sources instead of cached in this repository:

| Concern | Project rules | Official index |
| --- | --- | --- |
| oRPC procedures, clients, SSR, and OpenAPI | [oRPC instruction](agents/instructions/orpc.md) | [oRPC v1](https://v1.orpc.dev/llms.txt) |
| TanStack Query caching, prefetching, and hydration | [TanStack Query instruction](agents/instructions/tanstack-query.md) | [TanStack Query v5](https://tanstack.com/query/v5/llms.txt) |
| Better Auth and organizations | [Better Auth instruction](agents/instructions/better-auth.md) | [Better Auth v1.7](https://better-auth.com/docs/llms.txt) |
| Oxc linting and formatting | [Repository conventions](agents/instructions/conventions.md) | [Oxc](https://oxc.rs/llms.txt) |
| React Email templates and Nodemailer transport | [Email instruction](agents/instructions/email.md) | [React Email](https://react.email/llms.txt) |
| Documentation application | [Documentation app instruction](agents/instructions/documentation-app.md) | [Fumadocs](https://fumadocs.vercel.app/llms.txt) |

The scoped instructions own Greendex invariants and route each task to the smallest relevant official Markdown page.

## Project documentation

### Agent and domain guidance

- [Issue tracker](agents/issue-tracker.md)
- [Triage labels](agents/triage-labels.md)
- [Domain model](agents/domain.md)

### Authentication and authorization

- [Better Auth project rules](agents/instructions/better-auth.md)
- [Project permissions](projects/permissions.md)

### Database, locale, and delivery

- [Database documentation](database/README.md)
- [Coolify SSL connection](database/coolify-ssl-connection.md)
- [Internationalization project rules](agents/instructions/i18n.md)
- [Email project rules](agents/instructions/email.md)

### Features and UI

- [Participation flow](participate/README.md)
- [Emissions calculations](participate/emissions-calculations.md)
- [Conditional logic](participate/conditional-logic.md)
- [Participation testing](participate/testing.md)
- [Projects](projects/README.md)
- [shadcn project rules](agents/instructions/shadcn.md)

### Tooling

- [Oxc project rules](agents/instructions/conventions.md)
