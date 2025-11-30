import type { InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { projectActivity } from "@/lib/drizzle/schema";
import {
  type ActivityType,
  activityTypeValues,
  ProjectSelectSchema,
} from "../types";

// ============================================================================
// PROJECT ACTIVITY TYPES & SCHEMAS
// ============================================================================

// Single source of truth for activity types
export { activityTypeValues, type ActivityType };

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
  createdAt: true,
  updatedAt: true,
}).extend({
  isNew: z.boolean().optional(), // Track if activity is new
  isDeleted: z.boolean().optional(), // Track if activity should be deleted
});
