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

### SRI Security for Scalar Bundle

Greendex uses **Subresource Integrity (SRI)** to ensure the Scalar bundle loaded from CDN matches the expected version.

**How it works:**
1. Version defined in [`package.json`](../../package.json):
   ```json
   {
     "config": {
       "scalarVersion": "1.25.0"
     }
   }
   ```

2. Build time: `scripts/generate-sri.js` computes hash
   ```bash
   pnpm run generate:sri
   # → Fetches exact bundle from CDN
   # → Computes SHA-384 hash
   # → Writes to src/lib/orpc/scalar-sri.ts
   ```

3. Runtime: Scalar UI uses SRI when loading from CDN
   ```html
   <script 
     src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.0/.../standalone.js"
     integrity="sha384-xxxxx..." 
     crossorigin="anonymous">
   </script>
   ```

**Benefits:**
- ✅ Ensures exact version is loaded
- ✅ Prevents tampering (man-in-the-middle attacks)
- ✅ Single source of truth (package.json)
- ✅ Automatic on every build (prebuild hook)

**Files involved:**
- [`package.json`](../../package.json) — Version source
- [`scripts/generate-sri.js`](../../scripts/generate-sri.js) — SRI generator
- [`src/lib/orpc/scalar-sri.ts`](../../src/lib/orpc/scalar-sri.ts) — Generated (git-ignored)