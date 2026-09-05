---
name: "Coolify"
description: "Greendex deployment ownership, managed resources, and operational boundaries"
applyTo: "apps/*/Dockerfile,apps/*/Dockerfile.*,docker-compose*.yml,docker-compose*.yaml,docs/database/**/*.md,.env.example,turbo.json"
---

# Coolify

## Official documentation

Start with the [Coolify `llms.txt` index](https://coolify.io/docs/llms.txt). Use the [full index](https://coolify.io/docs/llms-full.txt) only when the focused index does not expose the required page. Fetch only the pages needed for the current deployment task.

No official Coolify project skill is adopted. These official pages and the live managed-resource state are the authorities. The [integration registry](../integrations.md#coolify-deployment-and-api) is only the aggregate navigation surface.

- Coolify is the owner of persistent deployment configuration. Make changes through its UI or API; generated compose files are outputs, not source.
- The Calculator uses the shared `development` environment described in `AGENTS.md`. Keep credentials and resource identifiers out of repository files and logs.
- Application-to-database traffic uses the private Coolify network hostname and port `5432`; do not substitute a host public port.
- Wait for a requested deployment to reach a terminal status before requesting another. Verify the deployment record, not an older container's health.
- For database changes, follow the [Drizzle map](drizzle.md) and the operational migration rules in `AGENTS.md`.
