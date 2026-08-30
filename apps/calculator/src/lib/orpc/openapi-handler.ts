import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

import { router } from "@/lib/orpc/router";

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function serializeJsonForHtml(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

/**
 * Centralized OpenAPI handler used by both `/api/openapi` and `/api/docs`.
 *
 * - Serves the OpenAPI REST endpoints under `/api/openapi/*`
 * - Serves the interactive API reference UI at `/api/docs` (Scalar)
 */
export const openapiHandler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Disposition"],
      credentials: true,
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      docsProvider: "scalar",
      docsPath: "/api/docs",
      docsScriptUrl: "/api/scalar-reference",
      docsConfig: { withDefaultFonts: false },
      specPath: "/api/openapi-spec",
      renderDocsHtml: (
        _specUrl,
        title,
        head,
        scriptUrl,
        config,
        spec,
      ) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtmlAttribute(title)}</title>
    ${head}
  </head>
  <body>
    <script id="api-reference" type="application/json" data-configuration="${escapeHtmlAttribute(JSON.stringify(config ?? {}))}">${serializeJsonForHtml(spec)}</script>
    <script src="${escapeHtmlAttribute(scriptUrl)}"></script>
  </body>
</html>`,
      specGenerateOptions: {
        info: {
          title: "Greendex Calculator API",
          version: "1.0.0",
        },
        // The OpenAPI `servers` property sets the base URL used by the
        // generated spec and documentation UI. We serve REST endpoints under
        // `/api/openapi/*`, so expose that as the server URL. This makes
        // tools like Scalar and generated curl examples include the correct
        // `/api/openapi` prefix (e.g. `/api/openapi/health`).
        servers: [{ url: "/api/openapi" }],
      },
    }),
  ],
  interceptors: [
    onError((error) => {
      const isParsingError = error instanceof SyntaxError;
      const isClientError =
        error && typeof error === "object" && "status" in error
          ? (error.status as number) >= 400 && (error.status as number) < 500
          : false;

      if (isParsingError || isClientError) {
        return;
      }

      console.error("[OpenAPI Error]", error);
    }),
  ],
});
