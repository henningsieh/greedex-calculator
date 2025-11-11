// src/components/features/projects/types.ts:

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { project } from "@/lib/drizzle/schema";

export type ProjectType = InferSelectModel<typeof project>;
export type InsertProjectType = InferInsertModel<typeof project>;

export const ProjectSelectSchema = createSelectSchema(project);

// Full insert schema (includes all DB fields) with refinements
export const ProjectInsertSchema = createInsertSchema(project, {
  name: (schema) => schema.min(1, "Project name is required"),
  country: (schema) => schema.min(1, "Country is required"),
  organizationId: (schema) => schema.min(1, "Organization is required"),
  startDate: (schema) => schema,
  endDate: (schema) => schema,
});

// Form schema (only user-provided fields)
export const ProjectFormSchema = ProjectInsertSchema.omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectFormInput = z.infer<typeof ProjectFormSchema>;
