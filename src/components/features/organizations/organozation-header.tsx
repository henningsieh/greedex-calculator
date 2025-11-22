"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "@/lib/i18n/navigation";
import { orpcQuery } from "@/lib/orpc/orpc";

export function OrganizationHeader() {
  const t = useTranslations("organization.dashboard");

  const pathname = usePathname();

  // Using oRPC query for active organization details
  // Prefetched in page.tsx, so no loading state on mount
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organization.getActiveOrganizationDetails.queryOptions(),
  );

  return (
    <div className="flex items-center justify-between rounded-md border border-accent/70 bg-accent/10">
      <div className="flex w-full flex-row items-start justify-between p-4">
        <div className="space-y-2">
          <h1 className="flex items-center justify-start gap-3 font-bold text-3xl text-accent/60 dark:text-primary-foreground/60">
            <Building2Icon />
            {activeOrganization?.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("welcome-to-your-organizations-dashboard")}
          </p>
        </div>
        <div>
          {pathname !== "/org/create-project" && (
            <CreateProjectButton
              className="hidden sm:inline-flex"
              variant="secondary"
              showIcon={true}
            />
          )}
        </div>
      </div>
    </div>
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
