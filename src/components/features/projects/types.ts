import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { project } from "@/lib/drizzle/schema";

export type ProjectType = InferSelectModel<typeof project>;
export type InsertProjectType = InferInsertModel<typeof project>;
