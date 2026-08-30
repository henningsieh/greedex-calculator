/**
 * Client-side permission utilities
 *
 * These utilities help check permissions in the UI without making server requests.
 * They use Better Auth's checkRolePermission for synchronous role-based checks.
 *
 * Note: For server-side or dynamic role checks, use auth.api.hasPermission instead.
 */

import { MEMBER_ROLES, type MemberRole } from "@/features/organizations/types";
import {
  canManageProject,
  type ProjectPermission,
} from "@/features/projects/permissions";
import type { ProjectType } from "@/features/projects/types";
import { authClient } from "@/lib/better-auth/auth-client";

/**
 * Determine whether a role has all specified project permissions via a client-side check.
 *
 * This check is performed client-side and does not account for server-side or dynamic roles.
 *
 * @param role - The member role to evaluate
 * @param permissions - The project permissions to require
 * @returns `true` if the role has all specified project permissions, `false` otherwise.
 */
function checkProjectPermission(
  role: MemberRole,
  permissions: ProjectPermission[],
): boolean {
  return authClient.organization.checkRolePermission({
    role,
    permissions: {
      project: permissions,
    },
  });
}

/**
 * Hook to check if current user can perform project actions
 *
 * @returns Object with permission check functions and current role
 *
 * @example
 * ```tsx
 * function ProjectActions({ project }: { project: ProjectType }) {
 *   const {
 *     canCreate,
 *     canUpdateProject,
 *     canDeleteProject,
 *   } = useProjectPermissions();
 *
 *   return (
 *     <div>
 *       {canCreate && <Button>New Project</Button>}
 *       {canUpdateProject(project) && <Button>Edit</Button>}
 *       {canDeleteProject(project) && <Button>Delete</Button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProjectPermissions() {
  // Get session and active organization
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending: orgPending } =
    authClient.useActiveOrganization();

  // Default to least privileged role
  let role: MemberRole = MEMBER_ROLES.Participant;

  // Find current user's role in the active organization
  if (activeOrg && session?.user?.id) {
    const currentMember = activeOrg.members.find(
      (member) => member.userId === session.user.id,
    );
    if (currentMember?.role) {
      role = currentMember.role;
    }
  }

  const isPending = sessionPending || orgPending;
  const canCreate = checkProjectPermission(role, ["create"]);
  const canRead = checkProjectPermission(role, ["read"]);
  const canUpdate = checkProjectPermission(role, ["update"]);
  const canDelete = checkProjectPermission(role, ["delete"]);
  const canArchive = checkProjectPermission(role, ["archive"]);
  const canManage = (project: Pick<ProjectType, "responsibleUserId">) =>
    canManageProject(role, session?.user?.id, project);

  return {
    role,
    isPending,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canArchive,
    canUpdateProject: (project: Pick<ProjectType, "responsibleUserId">) =>
      canUpdate && canManage(project),
    canDeleteProject: (project: Pick<ProjectType, "responsibleUserId">) =>
      canDelete && canManage(project),
    canArchiveProject: (project: Pick<ProjectType, "responsibleUserId">) =>
      canArchive && canManage(project),
  };
}
