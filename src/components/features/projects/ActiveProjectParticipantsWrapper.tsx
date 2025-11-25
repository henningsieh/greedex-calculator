"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import ParticipantsList from "@/components/features/projects/ParticipantsList";
import { orpcQuery } from "@/lib/orpc/orpc";

/**
 * Wrapper component for ParticipantsList that fetches the active project ID
 * and passes it down. This enables server-side Suspense boundaries.
 *
 * Reactively updates when session query is invalidated (e.g., after setActiveProject)
 */
export default function ActiveProjectParticipantsWrapper() {
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  const activeProjectId = session?.session.activeProjectId;

  return activeProjectId ? (
    <ParticipantsList activeProjectId={activeProjectId} />
  ) : null;
}
