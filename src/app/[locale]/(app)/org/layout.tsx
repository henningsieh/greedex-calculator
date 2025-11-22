import { Suspense } from "react";
import {
  DashboardHeaderSkeleton,
  OrganizationHeader,
} from "@/components/features/organizations/organozation-header";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/react-query/hydration";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    orpcQuery.organization.getActiveOrganizationDetails.queryOptions(),
  );

  return (
    <HydrateClient client={queryClient}>
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <OrganizationHeader />
      </Suspense>
      {children}
    </HydrateClient>
  );
}
