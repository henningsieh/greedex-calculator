---
applyTo: "docs/database/**/*.md,.env.example"
description: "Greendex Coolify database connection boundary"
---

# Coolify Database Connections

The deployed Calculator reaches PostgreSQL through the private Coolify Docker network. The current live database has SSL disabled because the platform-generated SSL mount was invalid. Do not add `sslmode` parameters or certificate settings from an old connection string without first checking the managed resource in Coolify.

- Retrieve the active connection details from Coolify; never commit credentials or a complete connection string.
- Applications use the database resource UUID hostname on port `5432`, not a host public port.
- Keep connection and deployment changes in Coolify-managed configuration. Generated compose files are not source files.
- For schema and migration work, follow the [Drizzle map](../agents/instructions/drizzle.md). For platform behavior, use the [Coolify route](../agents/integrations.md#coolify-deployment-and-api).

If a future managed database enables SSL, use the current Coolify connection guidance and installed PostgreSQL driver documentation to derive the connection string for that resource.
