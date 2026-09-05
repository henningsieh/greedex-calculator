---
name: "Email"
description: "Greendex transactional templates, rendering, localization, and SMTP injection"
applyTo: "packages/email/src/**/*.ts,packages/email/src/**/*.tsx,apps/calculator/src/lib/email.ts"
---

# Email

Confirm installed React Email and Nodemailer versions before changing email code. Read the [React Email index](https://react.email/llms.txt) for templates and [Nodemailer documentation](https://nodemailer.com/) for transport APIs; compare with installed declarations.

- Reusable transactional templates, rendering, and delivery primitives belong in `packages/email/`.
- The Calculator owns SMTP configuration, application URLs, and the injected sender in `apps/calculator/src/lib/email.ts`.
- Keep templates localized through their caller-provided content. Do not put Calculator environment access in `@greendex/email`.
- Do not log SMTP credentials, reset links, invitation tokens, or rendered private data.
