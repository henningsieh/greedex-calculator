import { ApiReference } from "@scalar/api-reference";

/**
 * API Documentation page using Scalar
 * Provides an interactive Swagger-like UI for the OpenAPI specification
 *
 * Access this page at /api-docs to explore and test the API
 */
export default function ApiDocsPage() {
  return (
    <ApiReference
      configuration={{
        spec: {
          url: "/api/openapi-spec",
        },
        darkMode: true,
        layout: "modern",
        theme: "purple",
        showSidebar: true,
      }}
    />
  );
}
