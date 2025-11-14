import { auth } from "@/lib/better-auth";
import { base } from "@/lib/orpc/context";

/**
 * List user's organizations using Better Auth
 * Uses Better Auth's implicit organization.list endpoint
 */
export const listOrganizations = base.handler(async ({ context }) => {
  const organizations = await auth.api.listOrganizations({
    headers: context.headers,
  });
  return organizations || [];
});
