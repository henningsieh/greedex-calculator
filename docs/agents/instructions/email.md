---
name: "Email"
description: "Greendex transactional templates, rendering, localization, and SMTP injection"
applyTo: "packages/email/src/**/*.ts,packages/email/src/**/*.tsx,apps/calculator/src/lib/email.ts"
---

# Email

## Official documentation

Confirm installed React Email and Nodemailer versions before changing email code. Start with the official [React Email `llms.txt` index](https://react.email/docs/llms.txt) for templates and [Nodemailer documentation](https://nodemailer.com/) for transport APIs; fetch only the needed pages and compare them with installed declarations. The broad React Email provider/editor skill is not installed because it does not match this SMTP-focused integration.

- Reusable transactional templates, rendering, and delivery primitives belong in `packages/email/`.
- The Calculator owns SMTP configuration, application URLs, and the injected sender in `apps/calculator/src/lib/email.ts`.
- Keep templates localized through their caller-provided content. Do not put Calculator environment access in `@greendex/email`.
- Do not log SMTP credentials, reset links, invitation tokens, or rendered private data.
