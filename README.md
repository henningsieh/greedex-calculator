# Greendex v2 — Carbon Footprint Calculator Portal

**Greendex v2** is a specialized web application and participant portal for managing and calculating the carbon footprint of **Erasmus+ projects** (youth exchanges, training courses, and mobility events). Built for educators, organizers, and participants to raise environmental awareness and inspire sustainable action.

## Overview

Greendex v2 provides a modern, user-friendly portal where project organizers can:

- 🏢 **Create and manage organizations** for their Erasmus+ projects
- 🧒 **Invite participants** and track team members across mobility events
- 👥 **Team member invitations** (Organization Owners and Employees)
- 🔐 **role-based access** (Owner / Employee / Participant)
- 🌍 **Calculate CO₂ emissions** from participant journeys (transport modes, accommodation, energy)
- 📊 **Visualize sustainability impact** with individual and group-level analytics
- 🌱 **Organize sustainability challenges** to reduce carbon footprint during projects
- 🌳 **Plant trees** to offset calculated emissions and join the Greendex movement
- 🕒 **Support workflows** including Green Moment (30 min), Green Deal (60 min), and Green Day (180 min) workshop formats

This next iteration (v2) redesigns the carbon calculator experience as a **multi-tenant SaaS portal** with:

- Real-time organization and team management via Better Auth
- Secure role-based access control (owner, admin, member)
- Ready-to-scale WebSocket infrastructure for real-time collaboration
- Database-first approach with Drizzle ORM + PostgreSQL

Learn more at [greendex.world](https://greendex.world) and [calculator.greendex.world](https://app.greendex.world/).

---

## Tech Stack

| Layer                | Technology                         | Purpose                                             |
| -------------------- | ---------------------------------- | --------------------------------------------------- |
| **Frontend**         | Next.js 16 (App Router) + React 19 | Server & client components, type-safe UI            |
| **Language**         | TypeScript 6.x                     | Type safety across the stack                        |
| **UI Framework**     | shadcn/ui + Tailwind CSS 4         | Component library + responsive design               |
| **Authentication**   | Better Auth + Organization Plugin  | Multi-tenant auth, org/member management            |
| **State Management** | nuqs                               | URL-based tab persistence (no extra backend state)  |
| **Database**         | PostgreSQL + Drizzle ORM           | Type-safe migrations and queries                    |
| **Server**           | Node.js + Socket.IO                | Custom server for WebSocket POC, real-time features |
| **Monorepo**         | Turborepo + bun workspaces         | Build system, caching, task orchestration           |
| **Code Quality**     | Oxc (oxlint + oxfmt)               | Rust-based linting & formatting                     |
| **Package Manager**  | bun                                | Fast, efficient workspace management                |

---

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/) and [bun](https://bun.sh/)
- PostgreSQL database
- Environment variables (see `.env` setup below)

### Installation

```bash
# Clone the repository
git clone https://github.com/henningsieh/greedex-calculator.git
cd greedex-calculator

# Install dependencies (Turborepo will install all workspace packages)
bun install
```

### Environment Setup

**Important**: This is a **Turborepo monorepo**. The `.env` file must be placed at the **repository root** (not inside `apps/calculator/`).

Create a `.env` file at the root of the repository:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/greendex

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
ORPC_DEV_DELAY_MS=0
NEXT_DIST_DIR=.next

# Socket.IO
SOCKET_PORT=4000

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-secret-key

# Email (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SENDER=your-email@example.com
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_SECURE=false

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

**Why at root?**

- The `apps/calculator/` app and future `packages/` both need these variables
- `next.config.ts` and `socket-server.ts` are configured to load `.env` from the repository root
- This follows Turborepo best practices for shared environment configuration

### Development

Run the development server with Socket.IO support (runs both Next.js and Socket.IO servers):

```bash
# Run dev server for calculator app
bun run dev

# Run all workspace tasks (if you have multiple apps)
bun turbo run dev

# Run type checking across all packages
bun turbo run type-check
```

Visit your configured `NEXT_PUBLIC_BASE_URL` in your browser (default: `http://localhost:3000`). The Socket.IO server runs separately on port 4000.

### Build & Production

```bash
# Build all packages and apps
bun turbo run build

# Build only the calculator app
bun --filter @greendex/calculator build

# Start production server
bun --filter @greendex/calculator start

# Lint & format
bun turbo run lint
bun turbo run format
```

---

## Project Structure (Turborepo Monorepo)

```
├── apps/
│   ├── calculator/                   # Main Next.js application
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router
│   │   │   │   ├── (app)/           # Protected routes (authenticated users)
│   │   │   │   │   ├── dashboard/   # Org dashboard with tabs
│   │   │   │   │   ├── org/create/  # Organization creation onboarding
│   │   │   │   │   └── layout.tsx   # Auth guard, redirect to /org/create if no org
│   │   │   │   ├── (auth)/          # Auth routes (login, signup, verify email)
│   │   │   │   ├── api/auth/[...all]/ # Better Auth API route
│   │   │   │   └── layout.tsx       # Root layout + metadata
│   │   │   ├── lib/
│   │   │   │   ├── better-auth/     # Auth config, client initialization
│   │   │   │   ├── drizzle/         # Database schema, migrations
│   │   │   │   ├── email/           # Email templates & Nodemailer config
│   │   │   │   └── validations/     # Zod schemas (shared client/server)
│   │   │   ├── components/
│   │   │   │   ├── features/        # Feature-specific components
│   │   │   │   │   ├── authentication/ # Login, signup, session UI
│   │   │   │   │   └── organizations/  # Org creation forms, modals
│   │   │   │   └── ui/              # shadcn/ui + custom components
│   │   │   ├── hooks/               # React hooks (e.g., use-mobile)
│   │   │   └── socket-server.ts     # Socket.IO server
│   │   └── package.json
│   └── docs/                         # Fumadocs documentation (placeholder)
├── packages/
│   ├── types/                        # Shared TypeScript types
│   ├── config/                       # Shared configuration constants
│   ├── database/                     # Drizzle ORM schemas + client factory
│   ├── i18n/                         # next-intl config + translations
│   ├── auth/                         # Better Auth client utilities
│   └── email/                        # React Email templates + Nodemailer
├── .env                              # ⚠️ Environment variables (root level, not in apps/calculator/)
├── turbo.json                        # Turborepo pipeline configuration
└── package.json                      # Root package.json (delegates to turbo)
```

---

## Key Features — Phase 1 (Organization Registration & Dashboard)

✅ **Organization Onboarding** (US1)

- New verified users are redirected to create their first organization
- Only one org required to access the dashboard
- Unique slug validation with clear error handling

✅ **Dashboard Navigation** (US2)

- Sidebar navigation separating organization and project concerns
- Archive functionality for projects
- URL-based persistence (via `nuqs`)
- Responsive layout ready for mobile

✅ **Team Members Overview** (US3)

- Display all organization members in a table
- Show name, email, role (owner/admin/member), and join date
- Real-time integration with Better Auth organization schema

✅ **Projects Grid** (US4)

- Empty state with shadcn Empty component
- Placeholder for future project creation & management
- Responsive grid layout

---

## Database & Migrations

The project uses **Drizzle ORM** with **PostgreSQL**. Better Auth automatically manages its own tables (user, session, account, verification, organization, member, invitation) and generates the schema in `apps/calculator/src/lib/drizzle/schemas/auth-schema.ts`.

**Important:** Never edit `auth-schema.ts` manually. To add custom fields to Better Auth tables, use the `additionalFields` option in the Better Auth configuration (see `apps/calculator/src/lib/better-auth/index.ts`). Custom database schema (e.g., projects, participants) are combined in `apps/calculator/src/lib/drizzle/schema.ts`.

### Run migrations

```bash
# Generate Better Auth schema (auto-generates auth-schema.ts)
bun --filter @greendex/calculator auth:generate

# Generate migration files for custom schema
bun --filter @greendex/calculator db:generate

# Apply migrations
bun --filter @greendex/calculator db:migrate

# Open Drizzle Studio (database GUI)
bun --filter @greendex/calculator db:studio
```

Migrations are stored in `apps/calculator/src/lib/drizzle/migrations/`.

---

## Authentication & Authorization

This project uses **Better Auth** with the **Organization Plugin** for:

- Email/password + OAuth (GitHub, Discord, Google) authentication
- Multi-tenant organization management
- Role-based access control (owner, admin, member)
- Invitation workflows for adding team members

Configuration: `apps/calculator/src/lib/better-auth/index.ts`  
Client: `apps/calculator/src/lib/better-auth/auth-client.ts`

---

## WebSocket & Real-Time (Socket.IO)

A POC for **Socket.IO** is implemented in `apps/calculator/src/socket-server.ts` (decoupled from the Next.js server):

- Run both servers in dev with `bun run dev` from `apps/calculator/` (starts Next.js on 3000 and Socket.IO on 4000)
- Use `bun run dev:inspect` to run an inspect/dev instance on `3001` and a socket server on `4001` (helps avoid port collisions while debugging)
- Production requires `bun turbo run build` then `bun --filter @greendex/calculator start` (both Next.js and Socket.IO will be launched)

To add real-time features (e.g., live team updates), attach Socket.IO event handlers in `apps/calculator/src/socket-server.ts` and import the client in your React components.

---

## Code Quality & Linting

This project uses **Oxc** for extremely fast linting and formatting (Rust-based).

```bash
# Lint all packages
bun turbo run lint

# Format all packages
bun turbo run format

# Lint only calculator app
bun --filter @greendex/calculator lint

# Format only calculator app
bun --filter @greendex/calculator format
```

Configuration: `apps/calculator/.oxlintrc.json` and formatting rules in `docs/oxc/`

---

## Deployment

### Recommended: Vercel

1. Push your code to GitHub
2. Connect the repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (Vercel automatically runs `bun run build` and `bun run start`)

### Self-Hosted (Docker / VPS)

1. Build locally or in CI/CD: `bun run build`
2. Set production env vars
3. Run: `bun run start` (expects `out/server.js` from build step)
4. Use a process manager (PM2, systemd) to keep the server running

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally with `bun run dev`
3. Lint & format: `bun run lint && bun run format`
4. Commit with descriptive messages
5. Push and open a PR

For detailed development guidance, see `.github/copilot-instructions.md`.

---

## Roadmap

- **Phase 2**: Carbon Calculator Integration — mobility & accommodation CO₂ calculation
- **Phase 3**: Sustainability Challenges & Leaderboards
- **Phase 4**: Tree Planting Integration & E-Forest
- **Phase 5**: Social Impact & Analytics Dashboard

---

## Support & Resources

- **Greendex Main Site**: [greendex.world](https://greendex.world/)
- **Carbon Calculator Workshops**: [greendex.world/calculator](https://greendex.world/calculator/)
- **Erasmus+**: [erasmus-plus.ec.europa.eu](https://erasmus-plus.ec.europa.eu/)

---

## License

(Add your license here, e.g., MIT, GPL-3.0, etc.)

---

## Maintainers

- **Henning Sieh** (@henningsieh) — Project lead
- Greendex team

---

**Join the movement. Calculate. Offset. Inspire. 🌱 #greendex**
