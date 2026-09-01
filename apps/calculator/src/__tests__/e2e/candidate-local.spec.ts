import { expect, test, type Request } from "@playwright/test";

const candidateBaseUrl = process.env.CANDIDATE_BASE_URL;
const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const publicSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
const scalarScriptPath = "/api/scalar-reference";

test.describe("candidate-local browser coverage", () => {
  test.skip(
    !candidateBaseUrl,
    "Candidate-local coverage runs only when CANDIDATE_BASE_URL is configured.",
  );

  test("renders Scalar documentation using the self-hosted bundle", async ({
    page,
  }) => {
    let scalarRequestUrl: string | undefined;
    const externalDocumentationRequests: string[] = [];
    const candidateOrigin = new URL(candidateBaseUrl!).origin;

    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname === scalarScriptPath) {
        scalarRequestUrl = request.url();
      }
      if (url.origin !== candidateOrigin) {
        externalDocumentationRequests.push(request.url());
      }
    });

    await page.goto("/api/docs");

    expect(new URL(page.url()).origin).toBe(new URL(candidateBaseUrl!).origin);
    await expect
      .poll(() => scalarRequestUrl)
      .toBe(new URL(scalarScriptPath, candidateBaseUrl).toString());
    expect(externalDocumentationRequests).toEqual([]);
    await expect(page.locator(".scalar-api-reference")).toBeVisible();
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
    const pageErrors: Error[] = [];
    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    let authRequest: Request | undefined;
    let unexpectedPublicAuthRequest: Request | undefined;

    await context.route(`${candidateBaseUrl}/api/auth/**`, async (route) => {
      authRequest = route.request();
      await route.fulfill({
        body: JSON.stringify({
          redirect: false,
          url: "https://accounts.google.com/o/oauth2/v2/auth",
        }),
        contentType: "application/json",
        status: 200,
      });
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
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
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
