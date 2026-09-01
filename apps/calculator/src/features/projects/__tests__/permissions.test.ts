import { describe, expect, it } from "vitest";

import { MEMBER_ROLES } from "@/features/organizations/types";
import { canManageProject } from "@/features/projects/permissions";

const responsibleUserId = "responsible-user";
const project = { responsibleUserId };

describe("project ownership permissions", () => {
  it("lets an Organization Administrator manage every project", () => {
    expect(
      canManageProject(
        MEMBER_ROLES.OrganizationAdministrator,
        "another-user",
        project,
      ),
    ).toBe(true);
  });

  it("lets a Project Coordinator manage only their own project", () => {
    expect(
      canManageProject(
        MEMBER_ROLES.ProjectCoordinator,
        responsibleUserId,
        project,
      ),
    ).toBe(true);
    expect(
      canManageProject(MEMBER_ROLES.ProjectCoordinator, "another-user", project),
    ).toBe(false);
  });

  it("does not let a Participant manage a project", () => {
    expect(
      canManageProject(MEMBER_ROLES.Participant, responsibleUserId, project),
    ).toBe(false);
  });
});
