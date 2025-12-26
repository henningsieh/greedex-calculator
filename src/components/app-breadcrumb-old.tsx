"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ArchiveIcon,
  Building2Icon,
  Edit2Icon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  SettingsIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { EditProjectForm } from "@/components/features/projects/edit-project-form";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CREATE_PROJECT_PATH,
  DASHBOARD_PATH,
  PROJECTS_PATH,
  SETTINGS_PATH,
  TEAM_PATH,
} from "@/config/app-routes";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { Link, usePathname } from "@/lib/i18n/routing";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

/**
 * Render the application breadcrumb navigation.
 * Shows organization > section > project hierarchy based on current URL.
 *
 * @returns The breadcrumb navigation JSX element.
 */
export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  
  // Check if we're on a project detail page (/org/projects/[id])
  const isProjectDetail = segments[0] === "org" && segments[1] === "projects" && segments[2];
  const projectId = isProjectDetail ? segments[2] : null;

  if (projectId) {
    return <ProjectBreadcrumb projectId={projectId} />;
  }

  return <OrgBreadcrumb />;
}

/**
 * Breadcrumb for organization-level routes (no project needed)
 */
function OrgBreadcrumb() {
  const t = useTranslations("app.sidebar");

  // Fetch active organization
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  const { canCreate } = useProjectPermissions();

  return (
    <div className="flex w-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Organization name */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                className="flex items-center gap-2 text-primary transition-colors duration-300 hover:text-primary-foreground"
                href={DASHBOARD_PATH}
              >
                <span className="rounded-full bg-primary/40 p-1.5 text-primary-foreground">
                  <Building2Icon className="size-4" />
                </span>
                <span className="font-semibold text-base">
                  {activeOrganization?.name ?? "Organization"}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Action toolbar */}
      <div className="flex items-center gap-2">
        {canCreate && (
          <CreateProjectButton
            className="hidden sm:inline-flex"
            showIcon={true}
            variant="secondary"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Breadcrumb for project detail routes (requires project data)
 */
function AppBreadcrumbWithProject({ projectId }: { projectId: string }) {
  const t = useTranslations("app.sidebar");
  const tProject = useTranslations("organization.projects");

  // Fetch active organization
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  // Fetch project data
  const { data: currentProject } = useSuspenseQuery(
    orpcQuery.projects.getById.queryOptions({
      input: { id: projectId },
    }),
  );

  // Permission helpers - get user info
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  // Check if user can archive (owner OR responsible employee)
  const canArchive =
    session?.user?.id === currentProject.responsibleUserId ||
    session?.session.activeOrganizationId === currentProject.organizationId;

  const {
    canUpdate,
    canDelete,
    isPending: permissionsPending,
  } = useProjectPermissions();

  const [open, setOpen] = useState(false);

  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteProjectMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: () =>
        orpc.projects.delete({
          id: currentProject.id,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Project deleted");
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
        } else {
          toast.error("Unable to delete project");
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || "Unable to delete project");
      },
    });

  const { mutateAsync: archiveProjectMutation, isPending: isArchiving } =
    useMutation({
      mutationFn: (archived: boolean) =>
        orpc.projects.archive({
          id: currentProject.id,
          archived,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success(
            result.project.archived
              ? tProject("archive.toast-success")
              : tProject("archive.toast-unarchive-success"),
          );
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.getById.queryKey({
              input: { id: currentProject.id },
            }),
          });
        } else {
          toast.error(tProject("archive.toast-error"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || tProject("archive.toast-error-generic"));
      },
    });

  const primaryColorClasses = "text-secondary hover:text-secondary-foreground";
  const iconBgClasses = "bg-secondary/30 text-secondary-foreground";
  const separatorClasses = "text-secondary/50";
  const pageColorClasses = "text-secondary dark:text-secondary-foreground";

  return (
    <div className="flex w-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Organization name */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                className={cn(
                  "flex items-center gap-2 transition-colors duration-300",
                  primaryColorClasses,
                )}
                href={DASHBOARD_PATH}
              >
                <span className={cn("rounded-md p-1.5", iconBgClasses)}>
                  <Building2Icon className="size-4" />
                </span>
                <span className="font-semibold text-base">
                  {activeOrganization?.name ?? "Organization"}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className={separatorClasses} />

          {/* Projects */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                className={cn(
                  "flex items-center gap-2 transition-colors duration-300",
                  primaryColorClasses,
                )}
                href={PROJECTS_PATH}
              >
                <PROJECT_ICONS.projects className="size-4" />
                <span className="font-semibold">
                  {t("organization.projects")}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className={separatorClasses} />

          {/* Project name */}
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn("flex items-center gap-2", pageColorClasses)}
            >
              <PROJECT_ICONS.project className="size-4" />
              <span className="font-semibold">{currentProject.name}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Action toolbar */}
      <div className="flex items-center gap-2">
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button
              className="border-secondary/40 text-secondary"
              disabled={!canUpdate || permissionsPending}
              size="sm"
              variant="secondaryghost"
            >
              <Edit2Icon className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Edit</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit project</DialogTitle>
            </DialogHeader>
            <EditProjectForm
              onSuccess={() => setOpen(false)}
              project={currentProject}
            />
          </DialogContent>
        </Dialog>

        <Button
          disabled={!canArchive || isArchiving || permissionsPending}
          onClick={async () => {
            const isCurrentlyArchived = currentProject.archived ?? false;
            const confirmed = await confirm({
              title: isCurrentlyArchived
                ? tProject("archive.unarchive-title")
                : tProject("archive.confirm-title"),
              description: isCurrentlyArchived
                ? tProject("archive.unarchive-description", {
                    name: currentProject.name,
                  })
                : tProject("archive.confirm-description", {
                    name: currentProject.name,
                  }),
              confirmText: isCurrentlyArchived
                ? tProject("archive.unarchive-button")
                : tProject("archive.confirm-button"),
              cancelText: tProject("archive.cancel-button"),
              isDestructive: false,
            });
            if (confirmed) {
              try {
                await archiveProjectMutation(!isCurrentlyArchived);
              } catch (err) {
                console.error(err);
              }
            }
          }}
          size="sm"
          variant="outline"
        >
          <ArchiveIcon className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">
            {currentProject.archived
              ? tProject("archive.unarchive")
              : tProject("archive.archive")}
          </span>
        </Button>

        <Button
          disabled={!canDelete || isDeleting || permissionsPending}
          onClick={async () => {
            const confirmed = await confirm({
              title: "Delete project",
              description: `Delete project ${currentProject.name}?`,
              confirmText: "Delete",
              cancelText: "Cancel",
              isDestructive: true,
            });
            if (confirmed) {
              try {
                await deleteProjectMutation();
              } catch (err) {
                console.error(err);
              }
            }
          }}
          size="sm"
          variant="destructive"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
        <ConfirmDialogComponent />
      </div>
    </div>
  );
}

export function AppBreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="size-7 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
      <Skeleton className="h-4 w-4 rounded-md" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
    </div>
  );
}
