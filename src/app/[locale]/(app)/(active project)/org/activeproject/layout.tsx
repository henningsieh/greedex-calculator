import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";
import { headers } from "next/headers";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Prefetch common data
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  void queryClient.prefetchQuery(orpcQuery.organization.list.queryOptions());
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  // Prefetch participants for active project if available

  // Get session to determine active project
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.session?.activeProjectId) {
    void queryClient.prefetchQuery(
      orpcQuery.project.getParticipants.queryOptions({
        input: { projectId: session.session.activeProjectId },
      }),
    );
  }

  return (
    <Suspense fallback={<Loader2Icon className="animate-spin" />}>
      {children}
    </Suspense>
  );
}
