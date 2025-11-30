// src/components/features/projects/types.ts:

import type { InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { projectActivity, projectTable } from "@/lib/drizzle/schema";
import { organization, user } from "@/lib/drizzle/schemas/auth-schema";

export type ProjectType = InferSelectModel<typeof projectTable>;
// export type InsertProjectType = InferInsertModel<typeof projectTable>;

const ProjectSelectSchema = createSelectSchema(projectTable);

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

// Define activity types as a const array (single source of truth)
export const activityTypeValues = ["boat", "bus", "train", "car"] as const;
export type ActivityType = (typeof activityTypeValues)[number];

// ============================================================================
// PROJECT ACTIVITY TYPES & SCHEMAS
// ============================================================================

// Type inferred from DB schema
export type ProjectActivityType = InferSelectModel<typeof projectActivity>;

// Select schema for ProjectActivity
const ProjectActivitySelectSchema = createSelectSchema(projectActivity);

// Schema for project activity with project relation included
export const ProjectActivityWithRelationsSchema =
  ProjectActivitySelectSchema.extend({
    project: ProjectSelectSchema.optional(),
  });

// Inferred type from schema
export type ProjectActivityWithRelations = z.infer<
  typeof ProjectActivityWithRelationsSchema
>;

// Insert schema for ProjectActivity with refinements
const ProjectActivityInsertSchema = createInsertSchema(projectActivity);

// Update schema for ProjectActivity with refinements
const ProjectActivityUpdateSchema = createUpdateSchema(projectActivity);

// Form schema for ProjectActivity (only user-provided fields)
export const ProjectActivityFormSchema = ProjectActivityInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectActivityFormSchemaType = z.infer<
  typeof ProjectActivityFormSchema
>;

// Array schema for multiple activities
export const ProjectActivitiesArraySchema = z.array(
  ProjectActivityWithRelationsSchema,
);

// ============================================================================
// FORM SCHEMAS (derived from DB schemas for single source of truth)
// ============================================================================

// Base activity form item schema for creation (accepts strings from HTML inputs, coerces to numbers)
export const ActivityFormItemSchema = ProjectActivityFormSchema.omit({
  projectId: true,
});

// Schema for edit form (update operation, inferred from DB update schema)
export const EditActivityFormItemSchema = ProjectActivityUpdateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().optional(), // Track activity ID for updates
  isNew: z.boolean().optional(), // Track if activity is new
  isDeleted: z.boolean().optional(), // Track if activity should be deleted
});
