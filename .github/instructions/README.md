# .github/instructions

Minimal instruction sets for AI agents working in this repository. Detailed, longer-form documentation lives under `docs/instructions/` — use that content when agents need deeper context.

Purpose
- Keep short, actionable guidance in this folder for quick agent use.
- Use `docs/instructions/` as the authoritative, detailed source of truth.

How to use
- Copy or extract snippets from `docs/instructions/<topic>/` into this folder when a concise agent-focused subset is required.
- Avoid duplicating large docs here; keep only essential, always-needed guidance in `.github/instructions/`.

Available detailed docs (exact files)
- `docs/instructions/better-auth/`
	- `better-auth.options.md`
	- `better-auth.organizations.md`
- `docs/instructions/i18n/`
	- `next-intl.internationalization.md`
- `docs/instructions/orpc/`
	- `orpc.better-auth.md`
	- `orpc.init.installation.md`
	- `orpc.Optimize-Server-Side-Rendering.SSR.md`
	- `orpc.procedure.md`
	- `orpc.router.md`
	- `orpc.tanstack-query.md`
	- `orpcNextjs.adapter.md`
- `docs/instructions/react-email/`
	- `setup-React_Email.md`
	- `use-HTML_Components.md`
	- `use-Nodemailer.md`
	- `use-Tailwind.md`
- `docs/instructions/shadcn/`
	- `shadcn-ui.new-field.documentation.md`
	- `shadcn.empty.component.md`

Notes
- If you update `docs/instructions/*`, consider whether a short summary should be copied to `.github/instructions/` for fast agent access.
- When creating agent-facing instructions, reference the exact file paths above so agents can find the canonical docs quickly.

If you'd like, I can produce a minimal `.github/instructions/copilot-instructions.md` derived from these files — tell me which topics to include.
