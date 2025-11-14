"use client";

import { Suspense } from "react";
import { DashboardHeader, DashboardHeaderSkeleton } from "./dashboard-header";

/**
 * Client-side wrapper to ensure Suspense boundary works correctly.
 * This prevents hydration mismatches by making the entire Suspense
 * boundary render only on the client.
 */
export function DashboardHeaderWrapper() {
  return (
    <Suspense fallback={<DashboardHeaderSkeleton />}>
      <DashboardHeader />
    </Suspense>
  );
}
