import { Suspense } from "react";
import { CreateProjectContent } from "./create-project-content";

// Server component wrapper for PPR - wraps runtime data access in Suspense
export default function CreateProjectPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl p-6">Loading...</div>}>
      <CreateProjectContent />
    </Suspense>
  );
}
