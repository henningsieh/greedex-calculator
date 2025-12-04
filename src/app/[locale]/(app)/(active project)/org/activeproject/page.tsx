import { headers } from "next/headers";
import { Suspense } from "react";
import { AppBreadcrumbSkeleton } from "@/components/app-breadcrumb";
import ActiveProjectPage from "@/components/features/active-project/active-project-page";
import { ParticipationControlsClientSkeleton } from "@/components/features/participants/participants-link-controls";
import ParticipantsList, {
  ParticipantsListSkeleton,
} from "@/components/features/participants/participants-list";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function ControlActiveProjectPage() {
  const queryClient = getQueryClient();

  // Get session for server-side data
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get active project ID for conditional prefetch
  const activeProjectId = session?.session?.activeProjectId;

  // Prefetch all necessary data. These must be awaited to ensure data is in cache
  // before dehydrate() is called, otherwise client may receive incomplete data.
  await Promise.all([
    queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.projects.list.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.list.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.getActive.queryOptions()),
    // Prefetch participants data if we have an active project
    activeProjectId
      ? queryClient.prefetchQuery(
          orpcQuery.projects.getParticipants.queryOptions({
            input: {
              projectId: activeProjectId,
            },
          }),
        )
      : Promise.resolve(),
  ]);

  return (
    <>
      <Suspense
        fallback={
          <>
            <AppBreadcrumbSkeleton />
            <ParticipationControlsClientSkeleton />
          </>
        }
      >
        <ActiveProjectPage />
      </Suspense>
      <Suspense fallback={<ParticipantsListSkeleton />}>
        {activeProjectId ? (
          <ParticipantsList activeProjectId={activeProjectId} />
        ) : null}
      </Suspense>
    </>
  );
}
