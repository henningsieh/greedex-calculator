import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

import { expect, test, type Request } from "@playwright/test";

import { SCALAR_URL } from "@/lib/orpc/scalar-sri";

const candidateBaseUrl = process.env.CANDIDATE_BASE_URL;
const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const publicSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
const require = createRequire(import.meta.url);
const scalarBundlePath = resolve(
  dirname(require.resolve("@scalar/api-reference")),
  "browser/standalone.js",
);

test.describe("candidate-local browser coverage", () => {
  test.skip(
    !candidateBaseUrl,
    "Candidate-local coverage runs only when CANDIDATE_BASE_URL is configured.",
  );

  test("renders Scalar documentation using the local bundle", async ({
    page,
  }) => {
    await page.route(SCALAR_URL, (route) =>
      route.fulfill({ path: scalarBundlePath }),
    );

    await page.goto("/api/docs");

    expect(new URL(page.url()).origin).toBe(new URL(candidateBaseUrl!).origin);
    await expect(page.locator("div#app")).toBeVisible();
    await expect(
      page.getByRole("main", {
        name: "API documentation for Greendex Calculator API",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Greendex Calculator API" }),
    ).toBeVisible();
  });

  test("keeps auth transport candidate-local while constructing the public callback", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    let authRequest: Request | undefined;
    let unexpectedPublicAuthRequest: Request | undefined;

    await context.route(`${candidateBaseUrl}/api/auth/**`, async (route) => {
      authRequest = route.request();
      await route.abort();
    });
    await context.route(`${publicBaseUrl}/api/auth/**`, async (route) => {
      unexpectedPublicAuthRequest = route.request();
      await route.abort();
    });

    try {
      await page.goto(new URL("/en/login", candidateBaseUrl).toString());
      await expect(
        page.getByRole("heading", { name: "Welcome back, Greendexer!" }),
      ).toBeVisible();
      await page.getByRole("button", { name: /Google/ }).click();

      await expect
        .poll(() => authRequest?.url())
        .toContain(`${candidateBaseUrl}/api/auth/sign-in/social`);
      expect(authRequest?.postDataJSON()).toMatchObject({
        callbackURL: `${publicBaseUrl}/org/dashboard`,
        provider: "google",
      });
      expect(unexpectedPublicAuthRequest).toBeUndefined();
      expect(new URL(page.url()).origin).toBe(new URL(candidateBaseUrl!).origin);
    } finally {
      await context.close();
    }
  });

  test("uses the configured public Socket.IO URL without contacting it", async ({
    page,
  }) => {
    let socketRequestUrl: string | undefined;
    await page.route(`${publicSocketUrl}/socket.io/**`, async (route) => {
      socketRequestUrl = route.request().url();
      await route.abort();
    });

    await page.goto("/en/socket-test");

    expect(new URL(page.url()).origin).toBe(new URL(candidateBaseUrl!).origin);
    await expect
      .poll(() => socketRequestUrl)
      .toContain(`${publicSocketUrl}/socket.io/`);
  });
});
