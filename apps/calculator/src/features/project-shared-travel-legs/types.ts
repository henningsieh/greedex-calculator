import type { z } from "zod";

import type {
  CreateProjectSharedTravelLegInputSchema,
  DeleteProjectSharedTravelLegInputSchema,
  ProjectSharedTravelLegSchema,
  ProjectSharedTravelLegWithRelationsSchema,
  UpdateProjectSharedTravelLegInputSchema,
} from "./validation-schemas";

export type ProjectSharedTravelLeg = z.infer<typeof ProjectSharedTravelLegSchema>;

export type ProjectSharedTravelLegWithRelations = z.infer<
  typeof ProjectSharedTravelLegWithRelationsSchema
>;

export type CreateProjectSharedTravelLegInput = z.infer<
  typeof CreateProjectSharedTravelLegInputSchema
>;

export type UpdateProjectSharedTravelLegInput = z.infer<
  typeof UpdateProjectSharedTravelLegInputSchema
>;

export type DeleteProjectSharedTravelLegInput = z.infer<
  typeof DeleteProjectSharedTravelLegInputSchema
>;

export type { ProjectSharedTransportEmissionProfile } from "@greendex/config/transport-emission-profiles";
