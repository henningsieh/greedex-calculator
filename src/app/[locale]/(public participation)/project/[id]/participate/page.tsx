import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuestionnaireForm } from "@/components/participate/questionnaire-form";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc/orpc";

interface ParticipatePageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Retrieves project data (including activities) for participation by id.
 *
 * @param projectId - The project identifier to fetch.
 * @returns The project data including activities, or `null` if the fetch fails.
 */
async function getProjectData(projectId: string) {
  try {
    return await orpc.projects.getForParticipation({ id: projectId });
  } catch (error) {
    console.error("Failed to fetch project data:", error);
    return null;
  }
}

export default async function ParticipatePage({ params }: ParticipatePageProps) {
  const { id } = await params;

  const project = await getProjectData(id);

  if (!project) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <QuestionnaireForm project={project} />
    </Suspense>
  );
}