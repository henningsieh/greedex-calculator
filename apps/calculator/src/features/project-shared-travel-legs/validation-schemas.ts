import { MAX_DISTANCE_KM, MIN_DISTANCE_KM } from "@greendex/config/activities";
import { PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES } from "@greendex/config/transport-emission-profiles";
import { projectActivitiesTable, projectsTable } from "@greendex/database/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

const persistedInsertSchema = createInsertSchema(projectActivitiesTable);
const persistedSelectSchema = createSelectSchema(projectActivitiesTable);
const persistedUpdateSchema = createUpdateSchema(projectActivitiesTable);

export const TransportEmissionProfileSchema = z.enum(
  PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES,
);

const distanceKmSchema = z
  .number()
  .min(MIN_DISTANCE_KM)
  .max(MAX_DISTANCE_KM)
  .refine((distanceKm) => Number.isInteger(distanceKm * 10), {
    message: "Distance must use increments of 0.1 km",
  });

/**
 * Canonical persisted contract derived from the expand-stage Drizzle model.
 * The database still uses legacy physical column names until the contract
 * migration, so canonical names are mapped only at this explicit seam.
 */
export const ProjectSharedTravelLegSchema = z.object({
  id: persistedSelectSchema.shape.id,
  projectId: persistedSelectSchema.shape.projectId,
  transportEmissionProfile: TransportEmissionProfileSchema,
  distanceKm: persistedSelectSchema.shape.distanceKm,
  description: persistedSelectSchema.shape.description,
  travelDate: persistedSelectSchema.shape.activityDate,
  createdAt: persistedSelectSchema.shape.createdAt,
  updatedAt: persistedSelectSchema.shape.updatedAt,
});

export const ProjectSharedTravelLegWithRelationsSchema =
  ProjectSharedTravelLegSchema.extend({
    project: createSelectSchema(projectsTable),
  });

export const ListProjectSharedTravelLegsInputSchema = z.object({
  projectId: z.string(),
});

export const CreateProjectSharedTravelLegInputSchema = z.object({
  projectId: persistedInsertSchema.shape.projectId,
  transportEmissionProfile: TransportEmissionProfileSchema,
  distanceKm: distanceKmSchema,
  description: persistedInsertSchema.shape.description,
  travelDate: persistedInsertSchema.shape.activityDate,
});

const projectSharedTravelLegUpdateSchema = z.object({
  transportEmissionProfile: TransportEmissionProfileSchema.optional(),
  distanceKm: distanceKmSchema.optional(),
  description: persistedUpdateSchema.shape.description,
  travelDate: persistedUpdateSchema.shape.activityDate,
});

export const UpdateProjectSharedTravelLegInputSchema = z.object({
  projectId: persistedSelectSchema.shape.projectId,
  id: persistedSelectSchema.shape.id,
  data: projectSharedTravelLegUpdateSchema,
});

export const DeleteProjectSharedTravelLegInputSchema = z.object({
  projectId: persistedSelectSchema.shape.projectId,
  id: persistedSelectSchema.shape.id,
});
