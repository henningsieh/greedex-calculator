import { Suspense } from "react";
import Dashboard from "./dashboard-content";

// Server component wrapper for PPR compatibility
export default function LiveViewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>}>
      <Dashboard />
    </Suspense>
  );
}
