import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  // Prefetch active organization - await to ensure hydration consistency
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
