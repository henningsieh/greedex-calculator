---
url: https://orpc.dev/docs/openapi/plugins/openapi-reference.md
description: >-
  OpenAPI Reference Plugin - serves interactive API documentation and the OpenAPI 
  specification for your API
---

# OpenAPI Reference Plugin: Scalar UI & Spec

This plugin serves both an **interactive API documentation UI** and the **OpenAPI 3.x JSON specification** from a single handler.

**For architecture overview**, see [DUAL-SETUP.md](./DUAL-SETUP.md) — this document covers plugin-specific details.

## Usage in Greendex

This is the standard approach used by Greendex Calculator for API documentation.

**File**: [`src/lib/orpc/openapi-handler.ts`](../../src/lib/orpc/openapi-handler.ts)

**Endpoints served:**
- 📖 `/api/docs` — Interactive Scalar UI
- 📝 `/api/openapi-spec` — OpenAPI 3.x JSON specification
- 📡 `/api/openapi/*` — REST API endpoints (via same handler)

**Configuration**:
```typescript
export const openapiHandler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
    new OpenAPIReferencePlugin({
      docsProvider: "scalar",        // Use Scalar UI (modern alternative to Swagger)
      docsPath: "/api/docs",         // Where UI is served
      specPath: "/api/openapi-spec", // Where OpenAPI spec JSON is served
      specGenerateOptions: {
        info: {
          title: "Greendex Calculator API",
          version: "1.0.0",
        },
      },
    }),
  ],
  interceptors: [
    onError((error) => {
      // Minimal logging for expected errors (unauthorized, bad request, etc.)
      // Verbose logging for unexpected server errors
      const isExpectedClientError = ...
      if (isExpectedClientError) return;
      console.error("[OpenAPI Error]", error);
    }),
  ],
});
```

### Access the UI

```
http://localhost:3000/api/docs
```

### Scalar UI Features

✨ **Modern, fast, and feature-rich**
- 🧪 **Test endpoints** directly in the browser
- 🔐 **Authenticate** with bearer tokens or session cookies
- 📋 **View request/response schemas** with validation
- 🌙 **Dark mode** built-in
- 💾 **Export OpenAPI spec** for code generation
- 📱 **Mobile-friendly** responsive design

---

## Project notes (Greendex)

### Self-Hosted Scalar Bundle

Greendex does not load the Scalar browser bundle from a CDN. The exact
`@scalar/api-reference` dependency is pinned by `pnpm-lock.yaml`, and a
same-origin Next.js route serves its standalone browser bundle. Default Scalar
web fonts are disabled so the page does not fetch third-party font assets:

```typescript
new OpenAPIReferencePlugin({
  docsProvider: "scalar",
  docsPath: "/api/docs",
  docsScriptUrl: "/api/scalar-reference",
  docsConfig: { withDefaultFonts: false },
  specPath: "/api/openapi-spec",
})
```

The custom documentation HTML embeds the generated OpenAPI document in the
format expected by the installed standalone bundle. This path is used without
environment-specific overrides in local development, candidate images, and
Coolify deployments.

**Benefits:**
- ✅ Removes runtime dependence on jsDelivr
- ✅ Uses lockfile integrity verification and an exact package version
- ✅ Keeps clean-checkout and local image inputs equivalent
- ✅ Makes candidate browser tests deterministic without request interception

**Files involved:**
- [`package.json`](../../apps/calculator/package.json) — Exact Scalar dependency
- [`src/lib/orpc/openapi-handler.ts`](../../apps/calculator/src/lib/orpc/openapi-handler.ts) — Documentation HTML and script URL
- [`src/app/api/scalar-reference/route.ts`](../../apps/calculator/src/app/api/scalar-reference/route.ts) — Same-origin bundle endpoint
