import type {
  projectActivitiesTable,
  projectsTable,
} from "@greendex/database/schema";
import type { InferSelectModel } from "drizzle-orm";

import type { ProjectSharedTravelLegWithRelations } from "./types";

type PersistedTravelLeg = InferSelectModel<typeof projectActivitiesTable>;
type PersistedProject = InferSelectModel<typeof projectsTable>;

export type ExpandStageTravelLeg = PersistedTravelLeg & {
  project: PersistedProject;
};

/** Map legacy physical column names to the canonical contract. */
export function toProjectSharedTravelLeg(
  travelLeg: ExpandStageTravelLeg,
): ProjectSharedTravelLegWithRelations {
  return {
    id: travelLeg.id,
    projectId: travelLeg.projectId,
    transportEmissionProfile: travelLeg.activityType,
    distanceKm: travelLeg.distanceKm,
    description: travelLeg.description,
    travelDate: travelLeg.activityDate,
    createdAt: travelLeg.createdAt,
    updatedAt: travelLeg.updatedAt,
    project: travelLeg.project,
  };
}
