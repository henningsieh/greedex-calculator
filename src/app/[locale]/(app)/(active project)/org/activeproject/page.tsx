import { Suspense } from "react";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/react-query/hydration";
import ActiveProjectContent from "./active-project-content";

// Server component that wraps client component with Suspense for PPR
export default async function ControlActiveProjectPage() {
  // Prefetch data on the server for optimal performance
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  return (
    <HydrateClient client={queryClient}>
      <Suspense fallback={<div>Loading active project...</div>}>
        <ActiveProjectContent />
      </Suspense>
    </HydrateClient>
  );
}
