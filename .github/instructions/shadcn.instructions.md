---
name: "UI Components"
description: "shadcn primitives, feature components, forms, and accessibility"
applyTo: "apps/calculator/src/components/**/*.ts,apps/calculator/src/components/**/*.tsx,apps/calculator/src/features/**/components/**/*.ts,apps/calculator/src/features/**/components/**/*.tsx"
---

# UI Components

Use existing local primitives before adding another abstraction. Component references live in [`docs/shadcn/`](../../docs/shadcn/).

## Locations

- Shared shadcn primitives: `apps/calculator/src/components/ui/`
- Shared composed components: `apps/calculator/src/components/`
- Feature-specific components: `apps/calculator/src/features/<feature>/components/`
- Global styles: `apps/calculator/src/app/globals.css`
- shadcn configuration: `apps/calculator/components.json`

Add a missing upstream component with:

```bash
pnpm --dir apps/calculator dlx shadcn@latest add <component>
```

Review generated dependencies and code before retaining them.

## Composition

- Import each primitive from its concrete module, such as `@/components/ui/button`.
- Prefer composition over adding domain-specific props to shared primitives.
- Keep feature behavior and translations outside low-level UI primitives.
- Use `cn`, existing variants, and Tailwind tokens before introducing custom styling APIs.
- Preserve Server Components unless interaction or browser APIs require a Client Component.

## Forms

- Keep Zod schema, React Hook Form values, defaults, and optionality aligned.
- Use the local field/form primitives for labels, descriptions, controls, and errors.
- Disable or show pending state during mutations and surface success/failure accessibly.
- Optional fields must remain optional in both schema and UI.

## Accessibility

- Use native semantic controls whenever possible.
- Every interactive control needs an accessible name and keyboard behavior.
- Dialogs require a title; form controls require labels; icon-only buttons require accessible text.
- Preserve focus management supplied by Radix primitives.
- Verify loading, empty, error, disabled, and narrow-screen states.

References:

- [Field](../../docs/shadcn/shadcn-ui.new-field.documentation.md)
- [Data table](../../docs/shadcn/shadcn-ui.data-table.md)
- [Empty state](../../docs/shadcn/shadcn.empty.component.md)
- [Sidebar](../../docs/shadcn/shadcn-ui.sidebar.md)
- [Code standards](code-standards.instructions.md)
