/**
 * Questionnaire utility functions for emission calculations
 *
 * This file contains helper functions and the main emission calculation logic
 * used in the participant questionnaire flow.
 */

import {
  CO2_PER_TREE_PER_YEAR,
  CONVENTIONAL_ENERGY_FACTOR,
  DEFAULT_CAR_PASSENGERS,
  GREEN_ENERGY_REDUCTION_FACTOR,
  ROOM_OCCUPANCY_FACTORS,
  ROUND_TRIP_MULTIPLIER,
} from "@greendex/config/participate";
import { TRANSPORT_EMISSION_FACTORS } from "@greendex/config/transport-emission-profiles";

import { calculateProjectSharedTravelCO2 } from "@/features/project-shared-travel-legs/calculations";
import type { ProjectSharedTravelLeg } from "@/features/project-shared-travel-legs/types";

import {
  ACCOMMODATION_FACTORS,
  type ElectricityType,
  type EmissionCalculation,
  FOOD_FACTORS,
  type ParticipantAnswers,
  type RoomOccupancy,
} from "./types";

/**
 * Get the emission reduction factor for a given room occupancy.
 *
 * @param occupancy - The room occupancy type
 * @returns The occupancy factor (1.0 = full emissions, <1.0 = reduced emissions)
 */
export function getOccupancyFactor(occupancy: RoomOccupancy | undefined): number {
  if (!occupancy) {
    return ROOM_OCCUPANCY_FACTORS.alone;
  }
  return ROOM_OCCUPANCY_FACTORS[occupancy];
}

/**
 * Get the emission factor for electricity type.
 *
 * @param electricity - The electricity type used
 * @returns The electricity factor (0.75 for green energy, 1.0 otherwise)
 */
export function getElectricityFactor(
  electricity: ElectricityType | undefined,
): number {
  if (electricity === "green energy") {
    return GREEN_ENERGY_REDUCTION_FACTOR;
  }
  return CONVENTIONAL_ENERGY_FACTOR;
}

/**
 * Calculate CO₂ emissions from participant answers and estimate the number of trees required to offset the total.
 *
 * @param answers - Partial participant responses. Uses fields: `flightKm`, `boatKm`, `trainKm`, `busKm`, `carKm`, `carType`, `carPassengers`, `days`, `accommodationCategory`, `roomOccupancy`, `electricity`, and `food`
 * @param sharedTravelLegs - Optional Project Shared Travel Legs that contribute their full emissions once
 * @returns An EmissionCalculation object containing participant travel, project
 * shared travel, accommodation, food, total, and required-tree emissions.
 */
export function calculateEmissions(
  answers: Partial<ParticipantAnswers>,
  sharedTravelLegs?: ProjectSharedTravelLeg[],
): EmissionCalculation {
  let participantTravelCO2 = 0;
  let accommodationCO2 = 0;
  let foodCO2 = 0;

  // Calculate Participant Travel Leg emissions (round trip: TO and FROM project).
  if (answers.flightKm) {
    participantTravelCO2 += answers.flightKm * TRANSPORT_EMISSION_FACTORS.plane;
  }
  if (answers.boatKm) {
    participantTravelCO2 += answers.boatKm * TRANSPORT_EMISSION_FACTORS.boat;
  }
  if (answers.trainKm) {
    participantTravelCO2 += answers.trainKm * TRANSPORT_EMISSION_FACTORS.train;
  }
  if (answers.busKm) {
    participantTravelCO2 += answers.busKm * TRANSPORT_EMISSION_FACTORS.bus;
  }
  if (answers.carKm) {
    const carFactor =
      answers.carType === "electricCar"
        ? TRANSPORT_EMISSION_FACTORS.electricCar
        : TRANSPORT_EMISSION_FACTORS.car;
    const passengers = answers.carPassengers || DEFAULT_CAR_PASSENGERS;
    participantTravelCO2 += (answers.carKm * carFactor) / passengers;
  }

  // Participant travel is a round trip; shared travel is not.
  participantTravelCO2 *= ROUND_TRIP_MULTIPLIER;

  // Calculate accommodation emissions
  if (answers.days && answers.accommodationCategory) {
    const baseFactor = ACCOMMODATION_FACTORS[answers.accommodationCategory];
    const occupancyFactor = getOccupancyFactor(answers.roomOccupancy);
    const electricityFactor = getElectricityFactor(answers.electricity);

    accommodationCO2 =
      answers.days * baseFactor * occupancyFactor * electricityFactor;
  }

  // Calculate food emissions
  if (answers.days && answers.food) {
    foodCO2 = answers.days * FOOD_FACTORS[answers.food];
  }

  const projectSharedTravelCO2 = sharedTravelLegs
    ? calculateProjectSharedTravelCO2(sharedTravelLegs)
    : 0;

  const totalCO2 =
    participantTravelCO2 + projectSharedTravelCO2 + accommodationCO2 + foodCO2;
  const treesNeeded = Math.ceil(totalCO2 / CO2_PER_TREE_PER_YEAR);

  return {
    participantTravelCO2,
    projectSharedTravelCO2,
    accommodationCO2,
    foodCO2,
    totalCO2,
    treesNeeded,
  };
}

/**
 * Utility functions for form validation
 */

/**
 * Determine whether a string contains non-whitespace characters.
 *
 * @param value - The string to check
 * @returns `true` if `value` exists and contains characters other than whitespace, `false` otherwise
 */
export function isNonEmptyString(value: string | undefined): boolean {
  return !!value?.trim();
}

/**
 * Determines whether a value is a positive number greater than 0.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a finite number greater than 0, `false` otherwise.
 */
export function isPositiveNumber(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    !Number.isNaN(value) &&
    value > 0
  );
}

/**
 * Determine whether a value is a number greater than or equal to 0.
 *
 * @param value - The value to validate
 * @returns `true` if `value` is a finite number greater than or equal to 0, `false` otherwise.
 */
export function isNonNegativeNumber(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    !Number.isNaN(value) &&
    value >= 0
  );
}

/**
 * Determines whether a value is greater than or equal to a specified minimum.
 *
 * @param value - The value to validate
 * @param min - The minimum allowed value (inclusive)
 * @returns `true` if the value is a finite number greater than or equal to `min`, `false` otherwise.
 */
export function isNumberAtLeast(value: unknown, min: number): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    !Number.isNaN(value) &&
    value >= min
  );
}

/**
 * Determine whether every provided string contains non-whitespace characters.
 *
 * @returns `true` if every value is a non-empty string after trimming, `false` otherwise.
 */
export function areAllNonEmpty(...values: (string | undefined)[]): boolean {
  return values.every((value) => isNonEmptyString(value));
}

/**
 * Determine whether a value is truthy.
 *
 * @param value - The value to evaluate for truthiness
 * @returns `true` if `value` is truthy, `false` otherwise
 */
export function isTruthy(value: unknown): boolean {
  return !!value;
}
