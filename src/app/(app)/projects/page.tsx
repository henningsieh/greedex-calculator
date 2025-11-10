import ListProjects from "@/components/features/projects/list-projects";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  // Prefetch the projects data on the server
  await queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  return (
    <HydrateClient client={queryClient}>
      <ListProjects />
    </HydrateClient>
  );
}
