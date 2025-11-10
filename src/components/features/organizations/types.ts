import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { organization } from "@/lib/drizzle/schema";

export type OrganizationType = InferSelectModel<typeof organization>;
export type InsertOrganizationType = InferInsertModel<typeof organization>;
