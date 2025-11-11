// Test setup file
// This file runs before all tests

import { vi } from "vitest";

// Mock the auth client to avoid environment variable validation during tests
vi.mock("@/lib/better-auth/auth-client", () => ({
  authClient: {
    organization: {
      checkSlug: vi.fn(),
    },
  },
}));

// Mock the env module to avoid environment variable validation
vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost:3000",
    GOOGLE_CLIENT_ID: "test-google-client-id",
    GOOGLE_CLIENT_SECRET: "test-google-client-secret",
    DISCORD_CLIENT_ID: "test-discord-client-id",
    DISCORD_CLIENT_SECRET: "test-discord-client-secret",
    GITHUB_CLIENT_ID: "test-github-client-id",
    GITHUB_CLIENT_SECRET: "test-github-client-secret",
    SMTP_HOST: "localhost",
    SMTP_PORT: 587,
    SMTP_SENDER: "test@example.com",
    SMTP_USERNAME: "test",
    SMTP_PASSWORD: "test",
    SMTP_SECURE: "false",
  },
}));
