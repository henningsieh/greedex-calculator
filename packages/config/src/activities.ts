import {
  PARTICIPANT_TRANSPORT_EMISSION_PROFILES,
  PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES,
  TRANSPORT_EMISSION_FACTORS,
} from "./transport-emission-profiles";
import type {
  ParticipantTransportEmissionProfile,
  ProjectSharedTransportEmissionProfile,
} from "./transport-emission-profiles";

/** @deprecated Use `PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES`. */
export const ACTIVITY_VALUES = PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES;

/** @deprecated Use `ProjectSharedTransportEmissionProfile`. */
export type ActivityValueType = ProjectSharedTransportEmissionProfile;

/** @deprecated Use `PARTICIPANT_TRANSPORT_EMISSION_PROFILES`. */
export const PARTICIPANT_ACTIVITY_VALUES =
  PARTICIPANT_TRANSPORT_EMISSION_PROFILES;

/** @deprecated Use `ParticipantTransportEmissionProfile`. */
export type ParticipantActivityValueType = ParticipantTransportEmissionProfile;

// ============================================================================
// DISTANCE CONFIGURATIONS
// ============================================================================

/**
 * Minimum distance in kilometers for project activities
 * Activities must have at least this distance to be valid
 */
export const MIN_DISTANCE_KM = 0.1;

/**
 * Maximum distance in kilometers for project activities.
 * Activities must not exceed this value to be considered valid.
 *
 * Recommendation for form validation:
 * - Use a hard upper bound slightly above realistic values to avoid edge-case rounding.
 * - Suggested max distance: 6,000 km.
 *
 * Why not higher?
 * - Erasmus+ funding bands do not support intercontinental EU distances.
 * - Official calculators never reach 10,000+ km.
 * - Distances above ~6,000 km are effectively guaranteed invalid in the Erasmus+ context.
 */
export const MAX_DISTANCE_KM = 6000;

/**
 * Step increment for distance input fields
 * Distance values must be multiples of this step
 */
export const DISTANCE_KM_STEP = 0.1;

/**
 * Database decimal precision for distance_km column
 * Total number of digits (both before and after decimal point)
 */
export const DECIMAL_PRECISION = 10;

/**
 * Database decimal scale for distance_km column
 * Number of digits after the decimal point
 * Scale of 1 supports step of 0.1 (one decimal place)
 */
export const DECIMAL_SCALE = 1;

/** @deprecated Use `TRANSPORT_EMISSION_FACTORS`. */
export const ACTIVITY_EMISSION_FACTORS = TRANSPORT_EMISSION_FACTORS;
