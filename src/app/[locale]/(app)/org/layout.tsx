import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  // Await prefetch to ensure data is in cache before dehydrate() in parent layout
  await queryClient.prefetchQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  return (
    <>
      {/* Organization header card removed — breadcrumb provides context now */}
      {children}
    </>
  );
}
