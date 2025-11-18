"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Users2Icon } from "lucide-react";
import { Suspense } from "react";
import ActiveProjectHeaderClient from "@/components/features/projects/ActiveProjectHeaderClient";
import ParticipantsList, {
  ParticipantsListSkeleton,
} from "@/components/features/projects/ParticipantsList";
import ParticipationControlsClient from "@/components/features/projects/ParticipationControlsClient";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default function ControlActiveProjectPage() {
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  const activeProjectId = session?.session.activeProjectId;

  const { data: projects } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions(),
  );

  const activeProject = projects?.find(
    (project) => project.id === session?.session?.activeProjectId,
  );

  if (!activeProjectId || !activeProject) {
    return (
      <div className="rounded-md border border-secondary/70 bg-secondary/10 p-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users2Icon className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>No active project</EmptyTitle>
            <EmptyDescription>
              Select a project to view participants.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  // Prefetch data
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  void queryClient.prefetchQuery(
    orpcQuery.project.getParticipants.queryOptions({
      input: { projectId: activeProjectId },
    }),
  );

  return (
    <>
      <ActiveProjectHeaderClient activeProject={activeProject} />
      <ParticipationControlsClient activeProjectId={activeProjectId} />
      <Suspense fallback={<ParticipantsListSkeleton />}>
        <ParticipantsList activeProjectId={activeProjectId} />
      </Suspense>
    </>
  );
}
