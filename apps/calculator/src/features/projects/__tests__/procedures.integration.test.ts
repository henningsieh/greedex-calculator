import { randomUUID } from "node:crypto";

import type { EUCountryCode } from "@greendex/config/eu-countries";
import { db } from "@greendex/database";
import {
  organization,
  projectsTable,
  session as sessionTable,
  user,
} from "@greendex/database/schema";
import { createRouterClient } from "@orpc/server";
import { eq } from "drizzle-orm";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { MEMBER_ROLES, type MemberRole } from "@/features/organizations/types";

const authMocks = vi.hoisted(() => ({
  getActiveMemberRole: vi.fn(),
  getSession: vi.fn(),
  hasPermission: vi.fn(),
}));

vi.mock("@/lib/better-auth", () => ({
  auth: {
    api: authMocks,
  },
}));

import { router } from "@/lib/orpc/router";

const organizationId = randomUUID();
const coordinatorUserId = randomUUID();
const otherUserId = randomUUID();
const participantUserId = randomUUID();
const sessionId = randomUUID();
const coordinatorProjectId = randomUUID();
const otherProjectId = randomUUID();
const headers = new Headers();

let activeRole: MemberRole;
let activeUserId: string;

const client = createRouterClient(router, {
  context: async () => ({ headers }),
});

function hasProjectPermission(role: MemberRole, permissions: string[]) {
  const permissionsByRole: Record<MemberRole, ReadonlySet<string>> = {
    [MEMBER_ROLES.OrganizationAdministrator]: new Set([
      "create",
      "read",
      "update",
      "archive",
      "delete",
    ]),
    [MEMBER_ROLES.ProjectCoordinator]: new Set([
      "create",
      "read",
      "update",
      "archive",
    ]),
    [MEMBER_ROLES.Participant]: new Set(["read"]),
  };

  return permissions.every((permission) =>
    permissionsByRole[role].has(permission),
  );
}

beforeAll(async () => {
  await db.insert(user).values([
    {
      id: coordinatorUserId,
      name: "Project Coordinator",
      email: `project-coordinator-${coordinatorUserId}@sieh.org`,
      emailVerified: true,
    },
    {
      id: otherUserId,
      name: "Other Project Coordinator",
      email: `other-project-coordinator-${otherUserId}@sieh.org`,
      emailVerified: true,
    },
    {
      id: participantUserId,
      name: "Project Participant",
      email: `project-participant-${participantUserId}@sieh.org`,
      emailVerified: true,
    },
  ]);
  await db.insert(organization).values({
    id: organizationId,
    name: "Project Permissions Contract Organization",
    slug: `project-permissions-${organizationId}`,
    createdAt: new Date(),
  });
  await db.insert(projectsTable).values([
    {
      id: coordinatorProjectId,
      name: "Coordinator Project",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      location: "Berlin",
      country: "DE" as EUCountryCode,
      responsibleUserId: coordinatorUserId,
      organizationId,
    },
    {
      id: otherProjectId,
      name: "Other Coordinator Project",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      location: "Paris",
      country: "FR" as EUCountryCode,
      responsibleUserId: otherUserId,
      organizationId,
    },
  ]);
  await db.insert(sessionTable).values({
    id: sessionId,
    token: randomUUID(),
    userId: coordinatorUserId,
    expiresAt: new Date("2027-01-01T00:00:00.000Z"),
    activeOrganizationId: organizationId,
  });
});

beforeEach(() => {
  activeRole = MEMBER_ROLES.ProjectCoordinator;
  activeUserId = coordinatorUserId;
  authMocks.getSession.mockImplementation(async () => ({
    session: {
      id: sessionId,
      userId: activeUserId,
      activeOrganizationId: organizationId,
    },
    user: {
      id: activeUserId,
      name: "Project Permissions User",
      email: `project-permissions-${activeUserId}@sieh.org`,
    },
  }));
  authMocks.getActiveMemberRole.mockImplementation(async () => ({
    role: activeRole,
  }));
  authMocks.hasPermission.mockImplementation(async (input) =>
    hasProjectPermission(activeRole, input.body.permissions.project),
  );
});

afterEach(async () => {
  await db
    .update(projectsTable)
    .set({ archived: false, name: "Coordinator Project" })
    .where(eq(projectsTable.id, coordinatorProjectId));
  await db
    .update(projectsTable)
    .set({ archived: false, name: "Other Coordinator Project" })
    .where(eq(projectsTable.id, otherProjectId));
  await db
    .update(sessionTable)
    .set({ activeProjectId: null, userId: coordinatorUserId })
    .where(eq(sessionTable.id, sessionId));
  vi.clearAllMocks();
});

afterAll(async () => {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
  await db
    .delete(projectsTable)
    .where(eq(projectsTable.organizationId, organizationId));
  await db.delete(organization).where(eq(organization.id, organizationId));
  await db.delete(user).where(eq(user.id, coordinatorUserId));
  await db.delete(user).where(eq(user.id, otherUserId));
  await db.delete(user).where(eq(user.id, participantUserId));
});

describe("project permission procedures", () => {
  it("lets a Project Coordinator update and archive their own project", async () => {
    await expect(
      client.projects.update({
        id: coordinatorProjectId,
        data: {
          name: "Coordinator Project Updated",
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          endDate: new Date("2026-12-31T00:00:00.000Z"),
        },
      }),
    ).resolves.toMatchObject({
      success: true,
      project: { name: "Coordinator Project Updated" },
    });

    await expect(
      client.projects.archive({
        id: coordinatorProjectId,
        archived: true,
      }),
    ).resolves.toMatchObject({
      success: true,
      project: { archived: true },
    });
    expect(authMocks.hasPermission).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { permissions: { project: ["archive"] } },
      }),
    );
  });

  it("blocks a Project Coordinator from managing another coordinator's project", async () => {
    await expect(
      client.projects.update({
        id: otherProjectId,
        data: {
          name: "Unauthorized update",
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          endDate: new Date("2026-12-31T00:00:00.000Z"),
        },
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      client.projects.archive({
        id: otherProjectId,
        archived: true,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    await expect(
      db
        .select({ name: projectsTable.name, archived: projectsTable.archived })
        .from(projectsTable)
        .where(eq(projectsTable.id, otherProjectId)),
    ).resolves.toEqual([{ name: "Other Coordinator Project", archived: false }]);
  });

  it("blocks a Project Coordinator from deleting even their own project", async () => {
    await expect(
      client.projects.delete({ id: coordinatorProjectId }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      db
        .select({ id: projectsTable.id })
        .from(projectsTable)
        .where(eq(projectsTable.id, coordinatorProjectId)),
    ).resolves.toEqual([{ id: coordinatorProjectId }]);
  });

  it("blocks a Participant from archiving a project", async () => {
    activeRole = MEMBER_ROLES.Participant;
    activeUserId = participantUserId;

    await expect(
      client.projects.archive({
        id: coordinatorProjectId,
        archived: true,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      db
        .select({ archived: projectsTable.archived })
        .from(projectsTable)
        .where(eq(projectsTable.id, coordinatorProjectId)),
    ).resolves.toEqual([{ archived: false }]);
  });

  it("lets a Participant select a readable project as active", async () => {
    activeRole = MEMBER_ROLES.Participant;
    activeUserId = participantUserId;
    await db
      .update(sessionTable)
      .set({ userId: participantUserId })
      .where(eq(sessionTable.id, sessionId));

    await expect(
      client.projects.setActive({ projectId: coordinatorProjectId }),
    ).resolves.toEqual({ success: true });
    expect(authMocks.hasPermission).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { permissions: { project: ["read"] } },
      }),
    );
    await expect(
      db
        .select({ activeProjectId: sessionTable.activeProjectId })
        .from(sessionTable)
        .where(eq(sessionTable.id, sessionId)),
    ).resolves.toEqual([{ activeProjectId: coordinatorProjectId }]);
  });

  it("lets an Organization Administrator delete any project in the organization", async () => {
    activeRole = MEMBER_ROLES.OrganizationAdministrator;
    const projectId = randomUUID();
    await db.insert(projectsTable).values({
      id: projectId,
      name: "Administrator Deletable Project",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      location: "Munich",
      country: "DE" as EUCountryCode,
      responsibleUserId: otherUserId,
      organizationId,
    });

    await expect(client.projects.delete({ id: projectId })).resolves.toEqual({
      success: true,
    });
  });
});
