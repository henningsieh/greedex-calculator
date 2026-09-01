---
title: "oRPC Quick Start for AI Agents"
description: "Five-minute guide to understanding the oRPC dual-endpoint setup in Greendex"
---

# oRPC Quick Start Guide

> **For AI agents**: This is the minimal mental model you need to work effectively.

## 30-Second Summary

Greendex has **two API endpoints**:

1. **`/api/rpc`** — Fast binary protocol for internal Next.js app
2. **`/api/openapi`** — Standard HTTP REST for external tools

Both endpoints use the **same router and procedures**. The difference is *how* they send data.

```
Client wants to call createProject()
        ↓
        ├─ From React/Node? → Use `/api/rpc` (via `orpc` client) ✨
        └─ From curl/Postman? → Use `/api/openapi` (REST) 🌐
```

---

## The Three Files You Need to Know

### 1. [DUAL-SETUP.md](./DUAL-SETUP.md) — Architecture Overview
**Read this first.** Explains *why* we have two endpoints.

Key concepts:
- RPC = optimized for Next.js
- REST = compatible with external tools
- Both use the same procedures

### 2. [src/lib/orpc/README.md](../../src/lib/orpc/README.md) — Implementation Guide
**Read this second.** Shows how to:
- Create new procedures
- Use the `orpc` client
- Protect procedures with auth
- Set up SSR correctly

### 3. [src/lib/orpc/openapi-handler.ts](../../src/lib/orpc/openapi-handler.ts) — Configuration
**Reference this for details.** Shows:
- How OpenAPI handler is configured
- Where Scalar UI comes from
- How the self-hosted Scalar bundle works

---

## Quick Decision Tree

```
I'm writing code and need to call an API procedure:
    ├─ Is this code in Next.js (React, Server Component, API route)? 
    │  └─ YES → Import orpc client:
    │      import { orpc } from "@/lib/orpc/orpc";
    │      const result = await orpc.procedure.name();
    │
    └─ Is this curl, Postman, or another service?
       └─ YES → Use REST endpoint:
           curl http://localhost:3000/api/openapi/procedure
```

---

## Five-Minute Deep Dive

### What Happens When You Call `orpc.projects.create()`?

**In Server Component (SSR)**:
```typescript
// src/app/page.tsx
import { orpc } from "@/lib/orpc/orpc";

export default async function Page() {
  // Direct function call (no network overhead!)
  const projects = await orpc.projects.list();  
  //                       ↑ Uses globalThis.$client
  return <div>{projects.length}</div>;
}
```

**In Client Component (Browser)**:
```typescript
// src/components/CreateProject.tsx
"use client";
import { orpc } from "@/lib/orpc/orpc";

export function CreateProject() {
  const handleClick = async () => {
    // HTTP POST to /api/rpc (binary protocol)
    const project = await orpc.projects.create({...});
    //               ↑ Uses RPCLink internally
  };
}
```

**Key insight**: Same import, different behavior based on context. Magic!

---

### What's in the Router?

```typescript
// src/lib/orpc/router.ts
export const router = {
  projects: {
    list: listProjects,      // GET /projects (REST)
    create: createProject,   // POST /projects (REST)
    delete: deleteProject,   // DELETE /projects/:id (REST)
  },
  organizations: {
    getActive: getFullOrganization,  // GET /organizations/active
    list: listOrganizations,         // GET /organizations
  },
  // ... more procedures
};
```

Each procedure is available on:
- **RPC**: `orpc.projects.list()` (app code)
- **REST**: `GET /api/openapi/projects` (external tools)

---

### What's `.route()` For?

```typescript
// WITHOUT .route() → Not documented, not accessible via REST
export const silentProcedure = base.handler(async () => ({ ... }));

// WITH .route() → Documented, accessible via both protocols
export const listedProcedure = base
  .route({ 
    method: "POST", 
    path: "/items",
    summary: "Create a new item"
  })
  .handler(async () => ({ ... }));
```

**Rule of thumb**: Always add `.route()` to public procedures.

---

### Scalar UI: The API Explorer

**Access**: `http://localhost:3000/api/docs`

What it is:
- Interactive web UI for testing API endpoints
- Auto-generated from OpenAPI specification
- Hosted by `OpenAPIReferencePlugin`
- Loads the lockfile-pinned Scalar bundle from the same application origin

What you can do:
- Test endpoints without code
- See request/response schemas
- Include authentication tokens
- Export OpenAPI spec

---

## File Reference

**Core files**:
- `src/lib/orpc/router.ts` — Where procedures are registered
- `src/lib/orpc/procedures.ts` — Where procedures are defined
- `src/lib/orpc/context.ts` — Context type definition
- `src/lib/orpc/middleware.ts` — Auth middleware
- `src/lib/orpc/orpc.ts` — Client (use this!)
- `src/lib/orpc/client.server.ts` — Server-side client

**Handler files**:
- `src/lib/orpc/openapi-handler.ts` — OpenAPI handler config
- `src/app/api/rpc/[[...rest]]/route.ts` — RPC endpoint
- `src/app/api/openapi/[[...rest]]/route.ts` — REST endpoint
- `src/app/api/docs/route.ts` — Scalar UI endpoint
- `src/app/api/scalar-reference/route.ts` — Self-hosted Scalar browser bundle

**Documentation**:
- [DUAL-SETUP.md](./DUAL-SETUP.md) — Full architecture
- [src/lib/orpc/README.md](../../src/lib/orpc/README.md) — Implementation
- [orpc.openapi-reference.md](./orpc.openapi-reference.md) — Plugin details
- [orpc.openapi.scalar.md](./orpc.openapi.scalar.md) — Scalar UI details

---

## Common Patterns

### Creating a Protected Procedure

```typescript
import { authorized } from "@/lib/orpc/middleware";

export const deleteProject = authorized
  .route({
    method: "DELETE",
    path: "/projects/:id",
    summary: "Delete a project"
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    // context.user is guaranteed to exist here
    // context.session has activeOrganizationId
    
    const project = await db.projects.findById(input.id);
    if (!project) {
      throw errors.NOT_FOUND();
    }
    
    await db.projects.delete(input.id);
    return { success: true };
  });
```

### Using it in Code

```typescript
// App code (type-safe, both client & server)
const result = await orpc.projects.delete({ id: "123" });

// REST API (standard HTTP)
curl -X DELETE http://localhost:3000/api/openapi/projects/123
```

---

## Cheat Sheet

| Task | Code |
|------|------|
| Call procedure from app | `await orpc.namespace.procedure()` |
| Call REST API | `curl http://localhost:3000/api/openapi/path` |
| Test in browser | Visit `http://localhost:3000/api/docs` |
| Create public procedure | `.route({ method, path }).handler(...)` |
| Create protected procedure | Use `authorized` base instead of `base` |
| Add input validation | `.input(ZodSchema)` |
| Add output validation | `.output(ZodSchema)` |
| Access user | `context.user` (in authorized procedures) |
| Access organization | `context.session.activeOrganizationId` |

---

## Next Steps

1. **Understand the architecture**: Read [DUAL-SETUP.md](./DUAL-SETUP.md)
2. **Implement a feature**: Follow patterns in [src/lib/orpc/README.md](../../src/lib/orpc/README.md)
3. **Test endpoints**: Use Scalar UI at `/api/docs`
4. **Debug issues**: Check [DUAL-SETUP.md troubleshooting section](./DUAL-SETUP.md#troubleshooting)

---

## Quick Answers

**Q: Which endpoint should my code use?**  
A: If it's in Next.js, use `orpc` client → `/api/rpc`. External tools use REST → `/api/openapi`.

**Q: Why do I get "Cannot read property X"?**  
A: You're importing from wrong location. Use `import { orpc } from "@/lib/orpc/orpc"`.

**Q: Why isn't my procedure showing in Scalar UI?**  
A: Add `.route({ method, path })` metadata to the procedure.

**Q: Why does SSR fail?**  
A: Ensure `src/instrumentation.ts` imports `@/lib/orpc/client.server.ts` first.

**Q: Can I use REST endpoint from React?**  
A: Technically yes, but don't. Use `orpc` client instead for better performance.
