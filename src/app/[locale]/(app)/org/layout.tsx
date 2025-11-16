import { Suspense } from "react";
import {
  DashboardHeaderSkeleton,
  OrganizationHeader,
} from "@/components/features/organizations/organozation-header";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <OrganizationHeader />
      </Suspense>
      {children}
    </>
  );
}
