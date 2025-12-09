import type { z } from "zod";
import type {
  ParticipantComputedFields,
  ParticipantSchema,
} from "@/components/features/participants/validation-schemas";
import type { ActivityType } from "@/components/features/projects/types";

/**
 * Participant type for UI display with computed fields
 * This extends the inferred database type with calculated values
 */
export type Participant = z.infer<typeof ParticipantSchema> & {
  activities: ParticipantActivity[];
} & ParticipantComputedFields;

/**
 * Participation activity type - computed values for UI display
 * Represents individual travel segments calculated from participant questionnaire responses
 * Not stored in database, computed at runtime for display purposes
 */
export type ParticipantActivity = {
  id: string;
  type: ActivityType;
  distanceKm: number;
  co2Kg: number;
};

/**
 * Project statistics type - computed values only, not persisted
 * This is calculated on-the-fly from participant and activity data
 */
export type ProjectStats = {
  totalParticipants: number;
  totalCO2: number;
  averageCO2: number;
  breakdownByType: Record<
    ActivityType,
    {
      distance: number;
      co2: number;
      count: number;
    }
  >;
  treesNeeded: number; // Average tree absorbs ~22kg CO₂ per year, ~1 ton in lifetime (~45 years)
};
