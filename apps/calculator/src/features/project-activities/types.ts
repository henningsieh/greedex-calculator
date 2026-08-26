import type { projectSharedTravelLegsTable } from "@greendex/database/schema";
import type { InferSelectModel } from "drizzle-orm";

// ============================================================================
// PROJECT ACTIVITY TYPES
// ============================================================================

/**
 * Project activity type inferred from DB schema
 */
export type ProjectActivityType = InferSelectModel<
  typeof projectSharedTravelLegsTable
>;

/**
 * Re-export activity value type from config for convenience
 */
export type { ProjectSharedTransportEmissionProfile as ActivityValueType } from "@greendex/config/transport-emission-profiles";
