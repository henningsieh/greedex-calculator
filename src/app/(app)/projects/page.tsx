import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ProjectsGrid } from "@/components/features/projects/projects-grid";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export default function ProjectsPage() {
  // Prefetch the projects data on the server
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <HydrateClient client={queryClient}>
          <ProjectsGrid />
        </HydrateClient>
      </ErrorBoundary>
    </Suspense>
  );
}
