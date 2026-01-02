---
url: https://orpc.dev/docs/openapi/scalar.md
description: Create a beautiful API documentation UI using Scalar
---

# Scalar API Documentation UI

[Scalar](https://github.com/scalar/scalar) is a modern alternative to Swagger UI for browsing OpenAPI specifications.

**⚠️ For Greedex**: Use the [`OpenAPIReferencePlugin`](./orpc.openapi-reference.md) instead of this manual setup. The plugin is simpler and handles SRI security automatically.

---

## Why Scalar Over Swagger?

| Feature | Swagger UI | Scalar |
|---------|-----------|--------|
| Dark mode | ❌ Plugin needed | ✅ Built-in |
| Modern UI | ⚠️ Dated | ✅ Fresh & polished |
| Mobile responsive | ⚠️ Limited | ✅ Excellent |
| Bundle size | 300KB+ | ⚡ ~200KB |
| Performance | ⚠️ Slower | ✅ Fast |
| Active maintenance | ⚠️ Limited | ✅ Actively maintained |

**Recommendation**: Use Scalar for new projects.

## Manual Setup (Custom HTML)

If you need full control, you can serve Scalar with custom HTML (not recommended for production):

```typescript
// src/app/api/docs/custom/route.ts
export function GET() {
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="scalar-api-reference"></div>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference/dist/browser/standalone.js"></script>
        <script>
          Scalar.createApiReference('#scalar-api-reference', {
            url: '/api/openapi-spec',
            authentication: {
              preferredSecurityScheme: 'bearerAuth',
              securitySchemes: {
                bearerAuth: {
                  token: localStorage.getItem('auth_token') || '',
                },
              },
            },
          });
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

---

## Greedex Approach (Recommended)

Greedex uses the `OpenAPIReferencePlugin` to avoid manual setup:

```typescript
// src/lib/orpc/openapi-handler.ts
new OpenAPIReferencePlugin({
  docsProvider: "scalar",  ← This value matters
  docsPath: "/api/docs",
  specPath: "/api/openapi-spec",
})
```

**Benefits over manual approach:**
- ✅ Automatic SRI generation for bundle integrity
- ✅ Single configuration point
- ✅ Handles versioning automatically
- ✅ No custom HTML to maintain

See [OpenAPI Reference Plugin](./orpc.openapi-reference.md) for details.