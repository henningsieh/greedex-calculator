"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/lib/i18n/navigation";
import { orpcQuery } from "@/lib/orpc/orpc";

export function DashboardHeader() {
  // Use oRPC queries with proper type safety
  // TEMPORARY: Add 5s delay to test Suspense skeleton
  const { data: session } = useSuspenseQuery({
    ...orpcQuery.auth.getSession.queryOptions(),
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return orpcQuery.auth.getSession.call();
    },
  });

  const { data: organizations } = useSuspenseQuery(
    orpcQuery.auth.listOrganizations.queryOptions(),
  );

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations?.[0]?.id || "";

  const activeOrganization = organizations?.find(
    (org) => org.id === activeOrganizationId,
  );

  if (!organizations) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Loading...</h1>
          <p className="text-muted-foreground">
            Welcome to your organization's dashboard
          </p>
        </div>
        <Button asChild variant="link">
          <Link href="/adsf">Create New Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-bold text-3xl">{activeOrganization?.name}</h1>
        <p className="text-muted-foreground">
          Welcome to your organization's dashboard
        </p>
      </div>

      <Button asChild variant="link">
        <Link href="/create-project">Create New Project</Link>
      </Button>
    </div>
  );
}

export function DashboardHeaderWrapper() {
  return (
    <Suspense fallback={<DashboardHeaderSkeleton />}>
      <DashboardHeader />
    </Suspense>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
