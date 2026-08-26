/**
 * Runtime Transport Emission Profile sets used across configuration,
 * validation, persistence, presentation, and Participant Footprint calculations.
 */

/** Profiles allowed for travel owned by a Project. */
export const PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES = [
  "boat",
  "bus",
  "train",
  "car",
  "electricCar",
] as const;

export type ProjectSharedTransportEmissionProfile =
  (typeof PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES)[number];

/**
 * Profiles allowed for travel owned by a Project Participant.
 * Participant travel includes every Project Shared Travel profile plus plane.
 */
export const PARTICIPANT_TRANSPORT_EMISSION_PROFILES = [
  ...PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES,
  "plane",
] as const;

export type ParticipantTransportEmissionProfile =
  (typeof PARTICIPANT_TRANSPORT_EMISSION_PROFILES)[number];

/** CO₂ emission factors in kilograms of CO₂ per kilometre. */
export const TRANSPORT_EMISSION_FACTORS: Readonly<
  Record<ParticipantTransportEmissionProfile, number>
> = {
  boat: 0.05,
  bus: 0.032,
  train: 0.035,
  car: 0.168,
  electricCar: 0.053,
  plane: 0.154,
};
