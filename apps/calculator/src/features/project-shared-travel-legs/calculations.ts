import { TRANSPORT_EMISSION_FACTORS } from "@greendex/config/transport-emission-profiles";

import type { ProjectSharedTravelLeg } from "./types";

export type ProjectSharedTravelLegForCalculation = Pick<
  ProjectSharedTravelLeg,
  "distanceKm" | "transportEmissionProfile"
>;

/**
 * Calculate the full CO₂ contribution of Project Shared Travel Legs.
 *
 * Each leg is included exactly once. Participant round-trip and passenger
 * adjustments belong to Participant Travel Legs and do not apply here.
 */
export function calculateProjectSharedTravelCO2(
  sharedTravelLegs: readonly ProjectSharedTravelLegForCalculation[],
): number {
  return sharedTravelLegs.reduce((totalCO2, sharedTravelLeg) => {
    const distanceKm = Number(sharedTravelLeg.distanceKm);
    const emissionFactor =
      TRANSPORT_EMISSION_FACTORS[sharedTravelLeg.transportEmissionProfile];

    if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !emissionFactor) {
      return totalCO2;
    }

    return totalCO2 + distanceKm * emissionFactor;
  }, 0);
}
