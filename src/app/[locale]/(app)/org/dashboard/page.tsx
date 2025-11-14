import { headers } from "next/headers";
import { DashboardHeaderWrapper } from "@/app/[locale]/(app)/org/dashboard/_components/dashboard-header";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";
import { DashboardTabs } from "./_components/dashboard-tabs";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch all data using oRPC procedures
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  // Prefetch session using oRPC (wraps Better Auth)
  // TEMPORARY: Comment out to test Suspense skeleton with client-side delay
  // void queryClient.prefetchQuery(orpcQuery.auth.getSession.queryOptions());

  // Prefetch organizations using oRPC (wraps Better Auth)
  // TEMPORARY: Comment out to test Suspense skeleton with client-side delay
  // void queryClient.prefetchQuery(orpcQuery.auth.listOrganizations.queryOptions());

  // Get session and organizations for server-side data (for members)
  const session = await auth.api.getSession({ headers: await headers() });
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  const membersResult = await auth.api.listMembers({
    query: {
      organizationId: activeOrganizationId,
      filterField: "role",
      filterOperator: "eq",
      filterValue: "member",
    },
    headers: await headers(),
  });

  const members = membersResult.members || [];

  return (
    <div className="space-y-8">
      <DashboardHeaderWrapper />

      <DashboardTabs members={members} />
    </div>
  );
}
