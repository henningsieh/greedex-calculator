import { randomUUID } from "node:crypto";

import { db } from "@greendex/database";
import { organization, projectsTable } from "@greendex/database/schema";
import de from "@greendex/i18n/locales/de.json" with { type: "json" };
import en from "@greendex/i18n/locales/en.json" with { type: "json" };
import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";

const SEED_ORGANIZATION_SLUG = "seed-org";
const sharedTravelLegDescription = `Shared travel E2E ${randomUUID()}`;

async function createProjectForSeedOrganization() {
  const [seedProject] = await db
    .select({
      organizationId: projectsTable.organizationId,
      responsibleUserId: projectsTable.responsibleUserId,
    })
    .from(projectsTable)
    .innerJoin(organization, eq(projectsTable.organizationId, organization.id))
    .where(eq(organization.slug, SEED_ORGANIZATION_SLUG))
    .limit(1);

  if (!seedProject) {
    throw new Error(
      `The E2E seed organization "${SEED_ORGANIZATION_SLUG}" must have a project. Run pnpm run db:seed first.`,
    );
  }

  const projectId = randomUUID();
  await db.insert(projectsTable).values({
    id: projectId,
    name: `Shared Travel E2E ${projectId}`,
    location: "Berlin",
    country: "DE",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-01-05"),
    organizationId: seedProject.organizationId,
    responsibleUserId: seedProject.responsibleUserId,
  });

  return projectId;
}

test.describe("Project Shared Travel Legs", () => {
  let projectId: string;

  test.beforeAll(async () => {
    projectId = await createProjectForSeedOrganization();
  });

  test.afterAll(async () => {
    await db.delete(projectsTable).where(eq(projectsTable.id, projectId));
  });

  test("switches project-detail tabs and renders their content", async ({
    page,
  }) => {
    await page.goto(`/en/org/projects/${projectId}`);
    // The route is server-rendered; wait for its client-side tab controls to hydrate.
    await page.waitForTimeout(2_000);

    const detailsTab = page.getByRole("tab", {
      name: en.project.details.tabs.details,
    });
    const activitiesTab = page.getByRole("tab", {
      name: en.project.details.tabs.activities,
    });
    const participantsTab = page.getByRole("tab", {
      name: en.project.details.tabs.participants,
    });

    await expect(detailsTab).toHaveAttribute("data-state", "active");

    await activitiesTab.click();
    await expect(activitiesTab).toHaveAttribute("data-state", "active");
    await expect(
      page.locator('[data-slot="card-title"]', {
        hasText: en.project.activities.title,
      }),
    ).toBeVisible();

    await participantsTab.click();
    await expect(participantsTab).toHaveAttribute("data-state", "active");
    await expect(
      page.locator('[data-slot="card-title"]', {
        hasText: en.project.details.participants,
      }),
    ).toBeVisible();

    await detailsTab.click();
    await expect(detailsTab).toHaveAttribute("data-state", "active");
  });

  test("allows an administrator to manage electric-car shared travel", async ({
    page,
  }) => {
    await page.goto(`/en/org/projects/${projectId}`);
    // The route is server-rendered; wait for its client-side tab controls to hydrate.
    await page.waitForTimeout(2_000);
    const activitiesTab = page.getByRole("tab", {
      name: en.project.details.tabs.activities,
    });
    await activitiesTab.click();
    await expect(activitiesTab).toHaveAttribute("data-state", "active");

    await expect(
      page.locator('[data-slot="card-title"]', {
        hasText: en.project.activities.title,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(en.project.activities.empty.title, { exact: true }),
    ).toBeVisible();

    await page.getByLabel(en.project.activities.form.title).click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: en.project.activities.form.title }),
    ).toBeVisible();

    await dialog
      .getByLabel(en.project.activities.form["transport-emission-profile"])
      .click();
    await expect(
      page.getByRole("option", { name: en.project.activities.types.electricCar }),
    ).toBeVisible();
    await expect(page.getByRole("option", { name: "Plane" })).toHaveCount(0);
    await page
      .getByRole("option", { name: en.project.activities.types.electricCar })
      .click();

    await dialog.getByLabel(en.project.activities.form.distance).fill("123.4");
    await dialog
      .getByLabel(en.project.activities.form.description)
      .fill(sharedTravelLegDescription);
    await expect(
      dialog.getByLabel(en.project.activities.form["travel-date"]),
    ).toBeVisible();
    await dialog
      .getByRole("button", { name: en.project.activities.form.submit })
      .click();

    const sharedTravelLegRow = page
      .getByRole("row")
      .filter({ hasText: sharedTravelLegDescription });
    await expect(sharedTravelLegRow).toContainText(
      en.project.activities.types.electricCar,
    );
    await expect(sharedTravelLegRow).toContainText("123.4");

    await sharedTravelLegRow
      .getByRole("button", { name: en.project.activities.table.edit })
      .click();
    await dialog
      .getByLabel(en.project.activities.form.description)
      .fill(`${sharedTravelLegDescription} updated`);
    await dialog
      .getByRole("button", { name: en.project.activities.form.update })
      .click();

    const updatedSharedTravelLegRow = page
      .getByRole("row")
      .filter({ hasText: `${sharedTravelLegDescription} updated` });
    await expect(updatedSharedTravelLegRow).toContainText(
      en.project.activities.types.electricCar,
    );

    await updatedSharedTravelLegRow
      .getByRole("button", { name: en.project.activities.table.delete })
      .click();
    const confirmation = page.getByRole("alertdialog");
    await expect(
      confirmation.getByRole("heading", {
        name: en.project.activities.delete["confirm-title"],
      }),
    ).toBeVisible();
    await confirmation
      .getByRole("button", {
        name: en.project.activities.delete["confirm-button"],
      })
      .click();

    await expect(
      page.getByText(`${sharedTravelLegDescription} updated`),
    ).toHaveCount(0);
  });

  test("renders shared-travel translations from the active locale", async ({
    page,
  }) => {
    for (const [locale, messages] of [
      ["en", en],
      ["de", de],
    ] as const) {
      await page.goto(`/${locale}/org/projects/${projectId}`);
      // The route is server-rendered; wait for its client-side tab controls to hydrate.
      await page.waitForTimeout(2_000);
      const activitiesTab = page.getByRole("tab", {
        name: messages.project.details.tabs.activities,
      });
      await activitiesTab.click();
      await expect(activitiesTab).toHaveAttribute("data-state", "active");

      await expect(
        page.locator('[data-slot="card-title"]', {
          hasText: messages.project.activities.title,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(messages.project.activities.empty.title, { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText(messages.project.activities.empty.description, {
          exact: true,
        }),
      ).toBeVisible();

      await page.getByLabel(messages.project.activities.form.title).click();
      const dialog = page.getByRole("dialog");
      await expect(
        dialog.getByRole("heading", {
          name: messages.project.activities.form.title,
        }),
      ).toBeVisible();
      await expect(
        dialog.getByLabel(
          messages.project.activities.form["transport-emission-profile"],
        ),
      ).toBeVisible();
      await expect(
        dialog.getByLabel(messages.project.activities.form["travel-date"]),
      ).toBeVisible();
      await dialog.getByRole("button", { name: "Close" }).click();
    }
  });
});
