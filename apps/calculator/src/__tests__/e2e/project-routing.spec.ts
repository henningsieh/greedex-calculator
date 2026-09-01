import { db } from "@greendex/database";
import { organization, projectsTable } from "@greendex/database/schema";
import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";

import { TestProjectFixture } from "./fixtures/test-project";

const SEED_ORGANIZATION_SLUG = "seed-org";

async function getSeedProject() {
  const [project] = await db
    .select({
      id: projectsTable.id,
      name: projectsTable.name,
    })
    .from(projectsTable)
    .innerJoin(organization, eq(projectsTable.organizationId, organization.id))
    .where(eq(organization.slug, SEED_ORGANIZATION_SLUG))
    .limit(1);

  if (!project) {
    throw new Error(
      `The E2E seed organization "${SEED_ORGANIZATION_SLUG}" must have a project. Run pnpm run db:seed first.`,
    );
  }

  return project;
}

test.describe("project routing", () => {
  const fixture = new TestProjectFixture();
  let publicProjectId: string;

  test.beforeAll(async () => {
    publicProjectId = await fixture.setup();
  });

  test.afterAll(async () => {
    await fixture.teardown();
  });

  test("shows an authenticated user an existing project", async ({ page }) => {
    const project = await getSeedProject();

    await page.goto(`/en/org/projects/${project.id}`);

    await expect(page.getByRole("heading", { name: project.name })).toBeVisible();
    await expect(page.locator('input[readonly][value*="/project/"]')).toHaveValue(
      `${process.env.NEXT_PUBLIC_BASE_URL}/project/${project.id}/participate`,
    );
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).not.toBeVisible();
  });

  test("shows a public participation page for an existing project", async ({
    page,
  }) => {
    await page.goto(`/en/project/${publicProjectId}/participate`);

    await expect(page.getByRole("button", { name: /start/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).not.toBeVisible();
  });
});
