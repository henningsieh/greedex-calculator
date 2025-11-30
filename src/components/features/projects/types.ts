import type { InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import { type ActivityType, activityTypeValues } from "@/lib/activity-types";
import { projectTable } from "@/lib/drizzle/schema";
import { organization, user } from "@/lib/drizzle/schemas/auth-schema";

// Re-export for convenience
export { activityTypeValues, type ActivityType };

export const ProjectSelectSchema = createSelectSchema(projectTable);

export type ProjectType = InferSelectModel<typeof projectTable>;
// export type InsertProjectType = InferInsertModel<typeof projectTable>;

// Schema for project with responsible user included
export const ProjectWithRelationsSchema = ProjectSelectSchema.extend({
  responsibleUser: createSelectSchema(user),
  organization: createSelectSchema(organization),
});

// Inferred type from the schema
export type ProjectWithRelations = z.infer<typeof ProjectWithRelationsSchema>;

// Full insert schema (includes all DB fields) with refinements
const ProjectInsertSchema = createInsertSchema(projectTable);

// Update schema for projects with refinements
const ProjectUpdateSchema = createUpdateSchema(projectTable);

// Form schema (only user-provided fields)
export const ProjectFormSchema = ProjectInsertSchema.omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});

// Update form schema (only user-provided fields for updates)
export const ProjectUpdateFormSchema = ProjectUpdateSchema.omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectFormSchemaType = z.infer<typeof ProjectFormSchema>;

// Sort options for projects
export const SORT_OPTIONS = {
  name: "name",
  startDate: "startDate",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

// Default sort option
export const DEFAULT_PROJECT_SORT: SortOption = SORT_OPTIONS.createdAt;
