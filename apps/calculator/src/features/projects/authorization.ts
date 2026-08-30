import { db } from "@greendex/database";
import { projectsTable } from "@greendex/database/schema";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/better-auth";

import { canManageProject } from "./permissions";

type ProjectManagementContext = {
  headers: Headers;
  session: {
    activeOrganizationId?: string | null;
  };
  user: {
    id: string;
  };
};

type ErrorFactory = (options: { message: string }) => Error;

type ProjectManagementErrors = {
  BAD_REQUEST: ErrorFactory;
  FORBIDDEN: ErrorFactory;
  NOT_FOUND: ErrorFactory;
};

/**
 * Verifies that the current user can manage a project in their active organization.
 *
 * Organization Administrators can manage every project. Project Coordinators can
 * manage only projects for which they are responsible. Callers must still apply
 * their action-specific RBAC middleware before this ownership check.
 */
export async function assertProjectManagementAccess(
  projectId: string,
  context: ProjectManagementContext,
  errors: ProjectManagementErrors,
) {
  const organizationId = context.session.activeOrganizationId;
  if (!organizationId) {
    throw errors.BAD_REQUEST({
      message: "No active organization. Please select an organization first.",
    });
  }

  const [project] = await db
    .select({
      id: projectsTable.id,
      responsibleUserId: projectsTable.responsibleUserId,
    })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!project) {
    throw errors.NOT_FOUND({ message: "Project not found" });
  }

  const { role } = await auth.api.getActiveMemberRole({
    headers: context.headers,
  });
  if (!canManageProject(role, context.user.id, project)) {
    throw errors.FORBIDDEN({
      message: "You don't have permission to manage this project.",
    });
  }

  return project;
}
