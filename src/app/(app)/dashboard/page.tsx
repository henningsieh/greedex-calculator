import { headers } from "next/headers";
import CreateOrganizationModal from "@/components/features/organizations/create-organization-modal";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { DashboardTabs } from "./_components/dashboard-tabs";

export default async function DashboardPage() {
  // Prefetch the projects data on the server
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  // Get active organization members using Better Auth API
  const session = await auth.api.getSession({ headers: await headers() });
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  const activeOrganization = organizations.find(
    (org) => org.id === activeOrganizationId,
  );

  const membersResult = await auth.api.listMembers({
    query: { organizationId: activeOrganizationId },
    headers: await headers(),
  });

  const members = membersResult.members || [];

  return (
    <HydrateClient client={queryClient}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">{activeOrganization?.name}</h1>
            <p className="text-muted-foreground">
              Welcome to your organization's dashboard
            </p>
          </div>

          <CreateOrganizationModal label="Create New Organization" />
        </div>

        <DashboardTabs members={members} />
      </div>
    </HydrateClient>
  );
}
