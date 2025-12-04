import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  return (
    <>
      {/* Organization header card removed — breadcrumb provides context now */}
      {children}
    </>
  );
}
