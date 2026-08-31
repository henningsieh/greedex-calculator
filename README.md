# Greendex Calculator

Greendex Calculator is a multilingual participant and organization portal for
measuring the carbon footprint of Erasmus+ mobility projects. It combines
project administration, participant journeys, emissions calculations,
workshops, and sustainability education in one application.

> **Current stage:** active development. The only shared deployment is the
> Coolify `development` environment at
> [greendex.apps.sieh.org](https://greendex.apps.sieh.org). No separate
> production environment is configured yet.

## What the application supports

- Organization onboarding, user membership, invitations, and role-based permissions
- Project creation, editing, filtering, sorting, archiving, and batch actions
- Participant management and a public participation/questionnaire flow
- Project Shared Travel Legs, travel distances, and CO₂ statistics
- Email/password, magic-link, and Google/GitHub/Discord authentication
- Transactional verification, reset-password, and invitation emails
- Seven UI locales with a searchable language switcher
- Internal type-safe oRPC plus REST/OpenAPI and interactive Scalar documentation
- A separate Socket.IO proof of concept for future real-time features
- A Fumadocs application for project/user documentation

The broader Greendex initiative also includes workshop formats, educational
resources, sustainability challenges, and the Greendex E-Forest. Learn more at
[greendex.world](https://greendex.world).

### Domain language

Greendex uses these canonical terms for people in the system:

- **Organization Administrator** — manages an organization, its users, and its projects
- **Project Coordinator** — manages projects and coordinates Participants
- **Participant** — takes part in a project and submits participation data

These terms are the product language. The complete wording glossary, including
terms to avoid, is in [`DOMAIN-GLOSSARY.md`](DOMAIN-GLOSSARY.md).

---

## Current technology

| Area                 | Technology                                                    |
| -------------------- | ------------------------------------------------------------- |
| Web applications     | Next.js `16.3.2`, React `19.2.8`, App Router, React Compiler  |
| Language             | TypeScript `7.0.2`                                            |
| Monorepo             | Turborepo `2.10.12`, pnpm workspaces/catalog                  |
| Package manager      | pnpm `11.24.0`                                                |
| UI                   | shadcn/ui, Radix UI, cmdk, Tailwind CSS `4.3.3`               |
| Authentication       | Better Auth `1.7.1` with organization and social-auth plugins |
| API                  | oRPC `1.15.x`, TanStack Query, OpenAPI/Scalar                 |
| Database             | PostgreSQL, Drizzle ORM/Kit                                   |
| Tables               | TanStack Table `9.1.2`                                        |
| Internationalization | next-intl `4.13.7`                                            |
| Email                | React Email `6.9.2`, Nodemailer `9.0.5`                       |
| Real-time POC        | Socket.IO `4.8.3`                                             |
| Documentation        | Fumadocs + Next.js                                            |
| Tests                | Vitest `4.1.11`, Playwright `1.62.1`                          |
| Quality              | Oxlint `1.80.0`, Oxfmt `0.65.0`                               |

Core framework versions are centralized in the catalog in
`pnpm-workspace.yaml`. Formatter behavior — including import sorting — is
centralized in the root `.oxfmtrc.json`; per-app formatter configs were
removed.

---

## Repository layout

```text
.
├── apps/
│   ├── calculator/          # Main Next.js app, APIs, auth integration, tests, Socket.IO
│   └── documentation/       # Fumadocs app (local port 3001)
├── packages/
│   ├── auth/                # Shared Better Auth client types/utilities
│   ├── config/              # Domain, locale, metadata, and UI configuration
│   ├── database/            # Drizzle client, schemas, and migrations
│   ├── email/               # Shared React Email templates and SMTP helpers
│   └── i18n/                # next-intl exports and locale JSON files
├── docs/                    # Developer/reference documentation
├── .env.example             # Canonical environment-variable inventory
├── pnpm-workspace.yaml      # Workspaces and shared dependency catalog
├── turbo.json               # Task graph, caching, and env forwarding
└── package.json             # Root task entrypoints
```

The calculator's business features live under
`apps/calculator/src/features/`; framework/integration code lives under
`apps/calculator/src/lib/`.

### Important architecture constraint

Server-side oRPC initialization must happen before SSR consumers use the client.
The locale layout (`apps/calculator/src/app/[locale]/layout.tsx`) must
side-effect-import `@/lib/orpc/client.server`, alongside the import in
`src/instrumentation.ts`. If that import is missing, Server Components fall
back to the browser-only RPC link and existing project pages render as
spurious Next.js 404s — a regression diagnosed and fixed in August 2026. Do
not reorder these initialization imports. See
`AGENTS.md` and `docs/orpc/DUAL-SETUP.md` before
changing this area.

---

## Getting started

### Prerequisites

Use the current project toolchain where possible:

- Node.js 22+ (Node.js 24 recommended) — enforced via `engines.node >= 22` in
  the root `package.json` and pinned to `22` in `.node-version`
- Corepack
- pnpm `11.24.0` (declared by `packageManager`)
- PostgreSQL

### Install

```bash
git clone https://github.com/henningsieh/greendex-calculator.git
cd greendex-calculator
corepack enable
pnpm install
```

### Configure the environment

The project uses one repository-root `.env` file for local development. Do not
put the canonical environment file inside an individual app.

```bash
cp .env.example .env
```

Fill every required value in `.env.example`. The calculator validates variables
with `@t3-oss/env-nextjs`, including:

- Application URLs and ports
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- Google, GitHub, and Discord OAuth credentials
- SMTP connection credentials
- `NEXT_PUBLIC_SOCKET_URL`

Local scripts load the root file where needed. In Coolify, values are injected
by the platform and remain outside Git.

### Prepare the database

Drizzle schemas and migrations live in `packages/database/`.

```bash
# Apply committed migrations
pnpm run db:migrate

# Optional: seed local development data
pnpm run db:seed

# Optional: inspect with Drizzle Studio
pnpm run db:studio
```

Generate schema/migration changes with:

```bash
pnpm run db:generate

# Regenerate Better Auth's schema when its model changes
pnpm --filter @greendex/calculator auth:generate
```

Do not manually edit generated Better Auth schema output unless the generation
workflow explicitly requires it.

### Run locally

```bash
pnpm run dev
```

The root Turbo task starts:

| Service           | Default URL/port        |
| ----------------- | ----------------------- |
| Calculator        | <http://localhost:3000> |
| Documentation app | <http://localhost:3001> |
| Socket.IO         | <http://localhost:4000> |

---

## Common commands

Run these from the repository root:

| Command                                            | Purpose                                       |
| -------------------------------------------------- | --------------------------------------------- |
| `pnpm run dev`                                     | Start all development tasks                   |
| `pnpm run build`                                   | Build all apps/packages                       |
| `pnpm run start`                                   | Start persistent workspace services           |
| `pnpm run type-check`                              | Run workspace type checks                     |
| `pnpm run lint`                                    | Run Oxlint and agent-instruction drift checks |
| `pnpm run format`                                  | Check workspace formatting with Oxfmt         |
| `pnpm run check:agent-instructions`                | Validate scoped agent instructions            |
| `pnpm run test:run`                                | Run Vitest once                               |
| `pnpm --filter @greendex/calculator test:coverage` | Run calculator coverage                       |
| `pnpm run test:e2e`                                | Run Playwright tests                          |
| `pnpm run db:generate`                             | Generate Drizzle migrations                   |
| `pnpm run db:migrate`                              | Apply Drizzle migrations                      |
| `pnpm run db:seed`                                 | Seed local development data                   |

> **Deployment migration guarantee:** the calculator's `prestart` runs
> `pnpm --filter @greendex/database run db:migrate` before `start`. This uses
> the committed Drizzle migration history and the shell `&&` chain stops the
> application start if migration fails. A Coolify deployment therefore cannot
> make a new calculator container healthy with a database schema behind its
> shipped code. The calculator's `prebuild` applies the same migration before
> each calculator build. The Docker candidate gate also applies migrations
> explicitly before the workspace build and then exercises `prestart`. Before
> any local build or start, verify that `DATABASE_URL` points at the database
> you intend to migrate.
>
> The Scalar API reference bundle is served from the exact package version
> pinned in `pnpm-lock.yaml`; builds do not fetch documentation assets from a
> CDN.

---

## Application architecture

### Calculator routes and features

The calculator uses locale-prefixed App Router routes under
`apps/calculator/src/app/[locale]/`, including:

- Public landing, workshop, library, E-Forest, and educational pages
- Login, signup, verification, password reset, and OAuth flows
- Organization onboarding, dashboard, team, projects, archive, and settings
- Project details, Project Shared Travel Legs, participants, and live-view areas
- Public project participation/questionnaire routes

Feature modules cover authentication, organizations, projects, Project Shared
Travel Legs, participants, participation, landing pages, live view, and user
settings.

### API surfaces

| Endpoint             | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `/api/rpc`           | Internal oRPC endpoint used by the application |
| `/api/openapi`       | REST/OpenAPI endpoint for external consumers   |
| `/api/docs`          | Interactive Scalar API documentation           |
| `/api/openapi-spec`  | Generated OpenAPI JSON                         |
| `/api/rpc/health`    | Deployment health check                        |
| `/api/auth/[...all]` | Better Auth route                              |

Server Components call the server-side oRPC client directly; browser consumers
use the HTTP client and TanStack Query. See `docs/orpc/QUICKSTART.md` and
`docs/orpc/DUAL-SETUP.md`.

### Authentication and authorization

The app-specific Better Auth configuration is in:

```text
apps/calculator/src/lib/better-auth/index.ts
```

It provides:

- Email/password with mandatory verification
- Password reset and magic-link flows
- Google, GitHub, and Discord OAuth
- Organization membership and invitations
- Organization Administrator, Project Coordinator, and Participant access control (implemented with Better Auth roles)
- Active organization/project session fields

The database schema generated for Better Auth is stored in
`packages/database/src/schemas/auth-schema.ts`.

### Database and migrations

The database package exports the PostgreSQL/Drizzle client and combines auth,
Project, Project Participant, and Project Shared Travel Leg schemas. Migrations
are stored in:

```text
packages/database/src/migrations/
```

The canonical Project Shared Travel Leg table is
`project_shared_travel_leg`. Its `transport_emission_profile` column uses the
PostgreSQL enum `project_shared_transport_emission_profile`: `boat`, `bus`,
`train`, `car`, and `electricCar`. `plane` is valid only for non-persisted
Participant Travel Legs.

Migration `0010_enforce_project_shared_travel_legs.sql` is the historical
cutover migration. It preserves valid legacy rows while converting the old
`project_activity` table. Migration `0013_remove_project_activity_compatibility_view.sql`
removes the temporary legacy view after cutover. Do not edit applied migration
history; add a new migration for every schema change.

### Internationalization

Translations live in `packages/i18n/src/locales/` for:

- English (`en`)
- German (`de`)
- Spanish (`es`)
- Italian (`it`)
- French (`fr`)
- Dutch (`nl`)
- Slovenian (`si`)

The UI language menu is searchable by English language name, native label, and
locale code.

### Email

The repository contains a reusable `@greendex/email` workspace package and
calculator-specific email orchestration under
`apps/calculator/src/lib/email/`. Templates use the current `react-email`
package API; transport uses Nodemailer.

### Real-time proof of concept

`apps/calculator/src/socket-server.ts` is a separate Socket.IO process. It reads
validated process environment from `@/env`; local scripts inject the root `.env`
through `dotenv-cli`, while Coolify injects runtime values directly.

Clients connect through `NEXT_PUBLIC_SOCKET_URL`, so local ports and the deployed
socket hostname do not need URL-rewriting logic.

---

## Testing and quality

- Unit/integration tests: `apps/calculator/src/__tests__/`
- Feature tests: feature-local `__tests__/` directories
- End-to-end tests: `apps/calculator/src/__tests__/e2e/`
- Test runner: Vitest
- Browser runner: Playwright
- Lint/format: Oxlint and Oxfmt

Recent compatibility work strengthened OpenAPI/Scalar UI checks, project
statistics typing, invalid activity diagnostics, Next.js layout semantics, and
TanStack Table v9 behavior. A dedicated Playwright regression spec
(`src/__tests__/e2e/project-routing.spec.ts`) guards the SSR oRPC routing fix:
an authenticated user can open an existing internal project page, and a public
participation page loads for an existing project instead of returning 404.
The full Playwright suite (12 tests) is currently green when run against a
seeded local development server.

> **Current test-suite caveat:** `openapi-rest.test.ts` is an integration suite
> that expects the calculator server on `localhost:3000`. Its no-server skip
> path is not compatible with Vitest 4 yet. The remaining tests can be run with
> `pnpm --filter @greendex/calculator exec vitest run --exclude
src/__tests__/openapi-rest.test.ts`.

---

## Deployment

Greendex currently deploys only to a shared **Coolify development environment**:

- Calculator: <https://greendex.apps.sieh.org>
- Health check: `GET /api/rpc/health`
- App port: `3000`
- Socket port: `4000`, exposed through the configured public socket URL

Deployment uses the repository **Dockerfile** (multi-stage): a `test` stage
checks repository formatting, linting, type safety, and synchronized agent
instructions before exercising the full Vitest suite against a real candidate
(disposable PostgreSQL, migrations, seed). Every check must pass before the
`runtime` stage image is built, so a failing candidate aborts the build and is
never promoted. Credentials are injected as Docker build secrets (Coolify
"Build Variables" + `use_build_secrets`) and exist only in the test stage.

The final image then validates itself as the unprivileged `node` user through
its unchanged release command. Its runtime entrypoint exercises
migration-before-start, Calculator health, Documentation, Socket.IO, writable
cache/codegen paths, read-only application files, and graceful termination. It
starts the promotable process topology only after that validation run. The
Calculator health endpoint returns `503` while the other services are still
being checked, so Coolify cannot promote a partial or failed topology and the
previous release stays active. A secret-safe terminal JSON event identifies
the validating container; deployment evidence pairs that container ID with the
immutable digest reported by Docker, proving that the tested image is the image
selected for promotion.

Coolify injects runtime environment variables into that final image;
Turborepo forwards them to the application processes via the `"env": ["*"]`
setting on the `build` and `start` tasks in [`turbo.json`](turbo.json).

Every calculator deployment runs the existing Drizzle `db:migrate` command in
`prestart`, before Next.js and Socket.IO start. If a migration fails, the
process exits non-zero and Coolify cannot mark the new calculator container
healthy. This is the repository's database-as-code deployment contract.

Deployment secrets, database credentials, and infrastructure identifiers are
managed outside source control. Operational details for authorized maintainers
are documented in `AGENTS.md`.

---

## Documentation

Start with [`docs/README.md`](docs/README.md) for the developer-documentation
index. Agents can use [`docs/agent-workflows.md`](docs/agent-workflows.md) to
route cross-cutting tasks to the required scoped instructions and topic docs.
Important areas include:

- `docs/orpc/` — RPC/OpenAPI architecture
- `docs/better-auth/` — authentication and organizations
- `docs/database/` — Drizzle/PostgreSQL notes
- `docs/i18n/` — locale and country handling
- `docs/participate/` — questionnaire and emissions flows
- `docs/projects/` — permissions and project behavior
- `docs/react-email/` — templates and transport
- `docs/shadcn/` — UI patterns
- `docs/oxc/` — linting and formatting

`PROJECT_STATE_REPORT.md` contains the detailed August 20–23 commit ledger,
current branch/PR state, deployment model, and remaining cleanup decisions.

---

## Known follow-ups

- Close or resolve stale PR #11, which targets an old Copilot branch.
- Remove merged/orphaned dependency branches after review.
- Decide whether to delete the old `bun-runtime` branch.
- Replace the remaining executable `bunx` references to make the pnpm-only
  decision fully consistent.
- Merge or further review open PR #57 (`migrate-email-to-package`), which
  centralizes transactional email in `@greendex/email`.
- Make the OpenAPI integration suite select/skip tests correctly when no server
  is running.
- Select and add a project license.

---

## Contributing

1. Create a focused branch from `main`.
2. Read `AGENTS.md` and the relevant topic docs.
3. Make the smallest coherent change.
4. Run formatting, linting, tests, and type checks appropriate to the change.
5. Review `git diff`, commit with a descriptive message, and open a PR.

Do not commit `.env`, OAuth credentials, SMTP passwords, database passwords, or
Coolify credentials.

## Maintainer

- **Henning Sieh** ([@henningsieh](https://github.com/henningsieh))

## License

No license has been selected yet.
