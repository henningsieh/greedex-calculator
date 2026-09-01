---
applyTo: 'apps/calculator/src/features/projects/**/*.ts,apps/calculator/src/features/projects/**/*.tsx,apps/calculator/src/features/project-shared-travel-legs/**/*.ts,apps/calculator/src/features/project-shared-travel-legs/**/*.tsx,apps/calculator/src/lib/better-auth/**/*.ts,apps/calculator/src/lib/orpc/middleware.ts,packages/database/src/schemas/project-schema.ts'
description: Project permissions, Better Auth organization roles, ownership authorization, active-organization scoping, and client action visibility
---

# Project permissions

Greendex authorizes project operations through Better Auth organization roles and
an ownership check. `activeOrganizationId` is always the tenant boundary.

## Roles

| Product role | Better Auth role | Scope |
| --- | --- | --- |
| Organization Administrator | `owner` | Every project in the active organization |
| Project Coordinator | `admin` | Projects for which they are the responsible user |
| Participant | `member` | Read-only access to every project in the active organization |

## Project action matrix

| Action | Organization Administrator | Project Coordinator | Participant |
| --- | --- | --- | --- |
| Create | Any project (the creator becomes responsible) | Own project (the creator becomes responsible) | No |
| Read and select as active | Any project | Any project | Any project |
| Update | Any project | Own project | No |
| Archive or unarchive | Any project | Own project | No |
| Delete, including batch delete | Any project | No | No |

Project Shared Travel Legs inherit the parent project's update policy: an
Organization Administrator may manage legs on every project, while a Project
Coordinator may manage legs only on their own projects.

## Enforcement

The access-control statement and role definitions are in
[`apps/calculator/src/features/projects/permissions.ts`](../../apps/calculator/src/features/projects/permissions.ts).
Better Auth receives the same configuration on the server in
[`apps/calculator/src/lib/better-auth/index.ts`](../../apps/calculator/src/lib/better-auth/index.ts)
and in the browser client in
[`apps/calculator/src/lib/better-auth/auth-client.ts`](../../apps/calculator/src/lib/better-auth/auth-client.ts).

Every authenticated project procedure starts with `authorized`. Procedures then
apply `requireProjectPermissions()` for their role-based permission:

- `createProject` requires `create`.
- Project reads, participant reads, and `setActiveProject` require `read`.
- `updateProject` and Project Shared Travel Leg mutations require `update`.
- `archiveProject` requires `archive`.
- `deleteProject` and `batchDeleteProjects` require `delete`.

Role-based permissions cannot express ownership. Mutable project operations
therefore also call `assertProjectManagementAccess()` from
[`apps/calculator/src/features/projects/authorization.ts`](../../apps/calculator/src/features/projects/authorization.ts).
It verifies the active-organization scope and permits only an Organization
Administrator or the responsible Project Coordinator. Delete operations do not
use that ownership exception: `delete` is granted only to Organization
Administrators.

All persistence queries additionally constrain organization-owned resources by
`activeOrganizationId`.

## Client behavior

[`useProjectPermissions()`](../../apps/calculator/src/lib/better-auth/permissions-utils.ts)
uses Better Auth's synchronous `checkRolePermission` for UX only. Its
project-aware helpers (`canUpdateProject`, `canArchiveProject`, and
`canDeleteProject`) apply the same responsible-user rule before rendering
controls. This avoids showing an action that the server will reject, but the
server-side middleware and ownership assertion remain authoritative.

## Regression coverage

`apps/calculator/src/features/projects/__tests__/permissions.test.ts` checks the
ownership policy used by client action visibility. The adjacent
`procedures.integration.test.ts` exercises the authenticated procedure seam for
Coordinator ownership, Administrator deletion, and Participant permissions.
`apps/calculator/src/features/project-shared-travel-legs/__tests__/procedures.integration.test.ts`
checks inherited ownership for Project Shared Travel Leg mutations.
