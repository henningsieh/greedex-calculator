"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { ProjectsGrid } from "@/components/features/projects/dashboard/projects-grid";
import { ProjectsTable } from "@/components/features/projects/dashboard/projects-table";
import { ProjectsViewSelect } from "@/components/features/projects/projects-view-select";
import { DEFAULT_PROJECT_SORTING } from "@/components/features/projects/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ProjectsTab() {
  const t = useTranslations("organization.projects");
  const [view, setView] = useState<"grid" | "table">("table");
  // Grid sorting is handled within ProjectsGrid; table keeps its own internal sorting.

  const { data: allProjects, error } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: DEFAULT_PROJECT_SORTING[0].id,
      },
    }),
  );

  // Filter out archived projects - show only active projects
  const projects = allProjects?.filter((project) => !project.archived) || [];

  // Get active organization to use as key for resetting table state on org switch
  const { data: activeOrg } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  // Grid sorting is handled inside ProjectsGrid to keep sorting logic
  // consistent with the table view and avoid duplicating `sortedProjects`.

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  if (!projects || projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("no-projects-yet.title")}</EmptyTitle>
          <EmptyDescription>
            {t("no-projects-yet.description")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateProjectButton />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center" />
      <ProjectsViewSelect setView={setView} view={view} />
      {view === "grid" ? (
        <ProjectsGrid key={activeOrg.id} projects={projects} />
      ) : (
        <ProjectsTable key={activeOrg.id} projects={projects} />
      )}
    </div>
  );
}

/**
 * Skeleton component for ProjectsTab loading state
 */
export function ProjectsTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* View selector skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto rounded-md border">
        <div className="mb-4 w-full sm:mb-0">
          {/* Table header skeleton */}
          <div className="border-b bg-muted/50">
            <div className="flex h-12 items-center px-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="ml-4 h-4 w-20" />
              <Skeleton className="ml-4 h-4 w-16" />
              <Skeleton className="ml-4 h-4 w-24" />
              <Skeleton className="ml-4 h-4 w-20" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          </div>

          {/* Table body skeleton */}
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div className="flex items-center space-x-4" key={i}>
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
