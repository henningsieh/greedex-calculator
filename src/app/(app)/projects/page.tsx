import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ListProjects from "@/components/features/projects/list-projects";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export default function ProjectsPage() {
  const queryClient = getQueryClient();

  // Prefetch the projects data on the server
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <HydrateClient client={queryClient}>
          <ListProjects />
        </HydrateClient>
      </ErrorBoundary>
    </Suspense>
  );
}
