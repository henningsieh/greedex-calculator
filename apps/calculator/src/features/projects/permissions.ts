/**
 * Better Auth Custom Permissions for Projects
 *
 * This file defines the access control structure for projects within organizations.
 * Projects are resources that belong to organizations, and access is controlled
 * through organization membership roles.
 */

import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

import { MEMBER_ROLES } from "@/features/organizations/types";

/**
 * Define all available actions for the project resource
 *
 * - create: Create new projects
 * - read: View project details
 * - update: Modify project information
 * - delete: Remove projects
 * - archive: Archive projects (soft delete)
 */
const statement = {
  ...defaultStatements, // Includes default organization, member, invitation and team permissions
  project: ["create", "read", "update", "delete", "archive"],
} as const;

/**
 * Create the access controller with our custom statement
 */
export const ac = createAccessControl(statement);

/**
 * Organization Administrator role (Better Auth `owner`)
 * - Full control over all resources including projects
 * - Can create, read, update, delete, and archive projects in their organization
 */
export const OrganizationAdministratorRole = ac.newRole({
  ...ownerAc.statements,
  // Organization Administrators can manage all projects in their organization
  project: ["create", "read", "update", "archive", "delete"],
});

/**
 * Project Coordinator role (Better Auth `admin`)
 * - Can manage own projects (owner relation)
 * - Can create, read, update and archive own projects
 * - Cannot delete projects (reserved for Organization Administrators)
 */
export const ProjectCoordinatorRole = ac.newRole({
  ...adminAc.statements,
  // Project Coordinators can manage own projects, but cannot delete them
  project: ["create", "read", "update", "archive"],
});

/**
 * Project Participant role (Better Auth `member`)
 * - Can only read projects within their organization
 * - Cannot create, update, delete, or archive projects
 */
export const ProjectParticipantRole = ac.newRole({
  ...memberAc.statements,
  // Project Participants can only read projects
  project: ["read"],
});

/**
 * Export types for use throughout the application
 */
export type ProjectPermission = (typeof statement)["project"][number];

/**
 * Determines whether a role may manage a project's mutable content.
 *
 * Organization Administrators can manage every project. Project Coordinators
 * can manage only projects for which they are responsible. Deletion remains a
 * separate, Organization-Administrator-only permission.
 */
export function canManageProject(
  role: string | undefined,
  userId: string | undefined,
  project: { responsibleUserId: string },
): boolean {
  return (
    role === MEMBER_ROLES.OrganizationAdministrator ||
    (role === MEMBER_ROLES.ProjectCoordinator &&
      userId === project.responsibleUserId)
  );
}
