"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { Skeleton } from "@/components/ui/skeleton";
import { CREATE_PROJECT_PATH } from "@/lib/config/app";
import { usePathname } from "@/lib/i18n/navigation";
import { orpcQuery } from "@/lib/orpc/orpc";

export function OrganizationHeader() {
  const t = useTranslations("organization.dashboard");

  const pathname = usePathname();

  // Using oRPC query for active organization details
  // Prefetched in page.tsx, so no loading state on mount
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organization.getActiveOrganization.queryOptions(),
  );

  return (
    <div className="flex items-center justify-between rounded-md border bg-accent/20 dark:border-accent-foreground/40">
      <div className="flex w-full flex-row items-start justify-between p-4">
        <div className="space-y-2">
          <h1 className="flex items-center justify-start gap-3 font-bold text-3xl text-primary-foreground dark:text-accent-foreground">
            <Building2Icon />
            {activeOrganization?.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("welcome-to-your-organizations-dashboard")}
          </p>
        </div>
        <div>
          {pathname !== CREATE_PROJECT_PATH && (
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
