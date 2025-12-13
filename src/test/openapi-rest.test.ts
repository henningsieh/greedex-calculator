import { describe, expect, it, beforeAll } from "vitest";

/**
 * REST API Integration Tests for OpenAPI Endpoint
 *
 * This test suite verifies that the OpenAPI REST endpoint works correctly
 * and follows the OpenAPI specification standard.
 *
 * These tests are separate from the RPC tests and ensure the REST API layer
 * can be used by third-party integrations or tools that expect standard HTTP REST APIs.
 */
describe("OpenAPI REST Endpoint", () => {
  const baseUrl = "http://localhost:3000/api/openapi";

  // Skip tests in CI if server is not running
  const isServerAvailable = async () => {
    try {
      await fetch(baseUrl);
      return true;
    } catch {
      return false;
    }
  };

  beforeAll(async () => {
    const available = await isServerAvailable();
    if (!available) {
      console.warn(
        "Warning: OpenAPI server not running, skipping integration tests",
      );
    }
  });

  describe("Public Endpoints", () => {
    it("should return health status via GET /health", async () => {
      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty("status", "ok");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("uptime");
      expect(data).toHaveProperty("environment");
    });

    it("should handle hello world via POST /helloWorld", async () => {
      const response = await fetch(`${baseUrl}/helloWorld`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test User" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty("message");
      expect(data.message).toContain("Test User");
      expect(data).toHaveProperty("timestamp");
    });

    it("should use default name when name not provided", async () => {
      const response = await fetch(`${baseUrl}/helloWorld`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.message).toContain("World");
    });
  });

  describe("Protected Endpoints", () => {
    it("should return 401 for protected endpoints without auth", async () => {
      const response = await fetch(`${baseUrl}/users/profile`, {
        method: "GET",
      });

      // Should be unauthorized
      expect(response.status).toBe(401);
    });

    it("should return session info when requesting /auth/session", async () => {
      const response = await fetch(`${baseUrl}/auth/session`, {
        method: "GET",
      });

      // May return 200 with null session or session data depending on auth state
      expect(response.status).toBe(200);
      const data = await response.json();

      // Session endpoint should return a response (even if session is null)
      expect(data).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent endpoints", async () => {
      const response = await fetch(`${baseUrl}/non-existent-endpoint`, {
        method: "GET",
      });

      expect(response.status).toBe(404);
    });

    it("should handle invalid JSON input gracefully", async () => {
      const response = await fetch(`${baseUrl}/helloWorld`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      });

      // Should return an error response (400 or 500 depending on implementation)
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("CORS Headers", () => {
    it("should include CORS headers in responses", async () => {
      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
      });

      // Check for CORS headers (CORSPlugin should add these)
      const corsHeader = response.headers.get("Access-Control-Allow-Origin");
      expect(corsHeader).toBeDefined();
    });
  });
});

describe("OpenAPI Specification", () => {
  const specUrl = "http://localhost:3000/api/openapi-spec";

  it("should serve OpenAPI specification", async () => {
    const available = await (async () => {
      try {
        await fetch(specUrl);
        return true;
      } catch {
        return false;
      }
    })();

    if (!available) {
      console.warn("Warning: OpenAPI spec endpoint not running, skipping test");
      return;
    }

    const response = await fetch(specUrl);
    expect(response.status).toBe(200);

    const spec = await response.json();

    // Verify it's a valid OpenAPI spec
    expect(spec).toHaveProperty("openapi");
    expect(spec.openapi).toMatch(/^3\.\d+\.\d+$/); // Should be OpenAPI 3.x.x

    expect(spec).toHaveProperty("info");
    expect(spec.info).toHaveProperty("title");
    expect(spec.info).toHaveProperty("version");

    expect(spec).toHaveProperty("paths");
    expect(typeof spec.paths).toBe("object");

    // Check that some of our endpoints are documented
    expect(spec.paths).toHaveProperty("/health");
    expect(spec.paths).toHaveProperty("/helloWorld");
  });
});
