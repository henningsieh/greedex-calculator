import { type AppRoute, PROJECT_DETAIL_PATH } from "@/config/AppRoutes";
import { orpc } from "@/lib/orpc/orpc";

/**
 * Get the project detail path for a given project ID
 * @param projectId
 * @returns The project detail path with the project ID inserted
 */
export const getProjectDetailPath = (projectId: string): AppRoute =>
  PROJECT_DETAIL_PATH.replace("[id]", projectId) as AppRoute;

/**
 * Fetch project data with activities from the database
 * @param projectId
 * @returns Project data including activities or null if not found
 */
export async function getProjectData(projectId: string) {
  try {
    const data = await orpc.projects.getForParticipation({ id: projectId });
    return {
      ...data.project,
      activities: data.activities,
    };
  } catch (error) {
    console.error("Failed to fetch project data:", error);
    return null;
  }
}
