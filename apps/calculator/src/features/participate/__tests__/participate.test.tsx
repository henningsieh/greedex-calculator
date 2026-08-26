import {
  ACCOMMODATION_DATA,
  CO2_PER_TREE_PER_YEAR,
  CONVENTIONAL_ENERGY_FACTOR,
  FOOD_DATA,
  GREEN_ENERGY_REDUCTION_FACTOR,
  ROOM_OCCUPANCY_FACTORS,
} from "@greendex/config/participate";
import { TRANSPORT_EMISSION_FACTORS } from "@greendex/config/transport-emission-profiles";
import { describe, expect, it } from "vitest";

import {
  ACCOMMODATION_FACTORS,
  FOOD_FACTORS,
  type ParticipantAnswers,
} from "@/features/participate/types";
import { calculateEmissions } from "@/features/participate/utils";
import type { ProjectSharedTravelLeg } from "@/features/project-shared-travel-legs/types";

describe("Questionnaire Types and Calculations", () => {
  describe("CO₂ Emission Factors", () => {
    it("should have correct transport emission factors", () => {
      // Verify all factors are defined and positive (values from config)
      expect(TRANSPORT_EMISSION_FACTORS.plane).toBeGreaterThan(0);
      expect(TRANSPORT_EMISSION_FACTORS.boat).toBeGreaterThan(0);
      expect(TRANSPORT_EMISSION_FACTORS.train).toBeGreaterThan(0);
      expect(TRANSPORT_EMISSION_FACTORS.bus).toBeGreaterThan(0);
      expect(TRANSPORT_EMISSION_FACTORS.car).toBeGreaterThan(0);
      expect(TRANSPORT_EMISSION_FACTORS.electricCar).toBeGreaterThan(0);
    });

    it("should have accommodation factors for all types", () => {
      // Verify config values match expected business requirements from ACCOMMODATION_DATA
      for (const [type, factor] of ACCOMMODATION_DATA) {
        expect(ACCOMMODATION_FACTORS[type]).toBe(factor);
      }
    });

    it("should have food factors for all types", () => {
      // Verify config values match expected business requirements from FOOD_DATA
      for (const [type, factor] of FOOD_DATA) {
        expect(FOOD_FACTORS[type]).toBe(factor);
      }
    });
  });

  describe("Emission Calculations", () => {
    it("should calculate transport emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        flightKm: 100,
        trainKm: 50,
        busKm: 20,
        carKm: 0,
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factors
      const expected =
        (100 * TRANSPORT_EMISSION_FACTORS.plane +
          50 * TRANSPORT_EMISSION_FACTORS.train +
          20 * TRANSPORT_EMISSION_FACTORS.bus) *
        2; // round trip
      expect(emissions.participantTravelCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate car emissions with passengers correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        carKm: 100,
        carType: "car",
        carPassengers: 4,
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factor
      const expected = ((100 * TRANSPORT_EMISSION_FACTORS.car) / 4) * 2; // round trip
      expect(emissions.participantTravelCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate electric car emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        carKm: 100,
        carType: "electricCar",
        carPassengers: 1,
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factor
      const expected = ((100 * TRANSPORT_EMISSION_FACTORS.electricCar) / 1) * 2; // round trip
      expect(emissions.participantTravelCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate accommodation emissions correctly with green energy", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        accommodationCategory: "Hostel",
        roomOccupancy: "2 people",
        electricity: "green energy",
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factors
      const expected =
        7 *
        ACCOMMODATION_FACTORS.Hostel *
        ROOM_OCCUPANCY_FACTORS["2 people"] *
        GREEN_ENERGY_REDUCTION_FACTOR;
      expect(emissions.accommodationCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate accommodation emissions correctly with conventional energy", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        accommodationCategory: "Hostel",
        roomOccupancy: "2 people",
        electricity: "conventional energy",
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factors (conventional energy = no reduction)
      const expected =
        7 *
        ACCOMMODATION_FACTORS.Hostel *
        ROOM_OCCUPANCY_FACTORS["2 people"] *
        CONVENTIONAL_ENERGY_FACTOR;
      expect(emissions.accommodationCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate food emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        food: "sometimes",
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factor
      const expected = 7 * FOOD_FACTORS.sometimes;
      expect(emissions.foodCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate total emissions and trees needed", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        accommodationCategory: "Camping",
        roomOccupancy: "4+ people",
        electricity: "green energy",
        food: "never",
        flightKm: 500,
        trainKm: 0,
        busKm: 0,
        boatKm: 0,
        carKm: 0,
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected values using config factors
      const expectedTransport = 500 * TRANSPORT_EMISSION_FACTORS.plane * 2; // round trip
      const expectedAccommodation =
        7 *
        ACCOMMODATION_FACTORS.Camping *
        ROOM_OCCUPANCY_FACTORS["4+ people"] *
        GREEN_ENERGY_REDUCTION_FACTOR;
      const expectedFood = 7 * FOOD_FACTORS.never;
      const expectedTotal =
        expectedTransport + expectedAccommodation + expectedFood;

      expect(emissions.totalCO2).toBeCloseTo(expectedTotal, 1);
      expect(emissions.treesNeeded).toBe(
        Math.ceil(expectedTotal / CO2_PER_TREE_PER_YEAR),
      );
    });

    it("should handle zero values correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 0,
        flightKm: 0,
        trainKm: 0,
        busKm: 0,
        boatKm: 0,
        carKm: 0,
      };

      const emissions = calculateEmissions(answers);

      expect(emissions.totalCO2).toBe(0);
      expect(emissions.treesNeeded).toBe(0);
    });
  });

  describe("Project Shared Travel calculations", () => {
    const sharedTravelLeg = (
      id: string,
      transportEmissionProfile: ProjectSharedTravelLeg["transportEmissionProfile"],
      distanceKm: number,
    ): ProjectSharedTravelLeg => ({
      id,
      projectId: "project-1",
      transportEmissionProfile,
      distanceKm,
      description: null,
      travelDate: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    it("returns no project shared travel emissions for an empty leg list", () => {
      const emissions = calculateEmissions({}, []);

      expect(emissions.projectSharedTravelCO2).toBe(0);
      expect(emissions.totalCO2).toBe(0);
      expect(emissions.treesNeeded).toBe(0);
    });

    it("adds an electric-car shared leg once without participant travel adjustments", () => {
      const answers: Partial<ParticipantAnswers> = {
        flightKm: 100,
        carKm: 100,
        carType: "car",
        carPassengers: 4,
      };
      const sharedTravelLegs = [
        sharedTravelLeg("electric-leg", "electricCar", 100),
      ];

      const emissions = calculateEmissions(answers, sharedTravelLegs);
      const expectedParticipantTravel =
        (100 * TRANSPORT_EMISSION_FACTORS.plane +
          (100 * TRANSPORT_EMISSION_FACTORS.car) / 4) *
        2;
      const expectedSharedTravel = 100 * TRANSPORT_EMISSION_FACTORS.electricCar;

      expect(emissions.participantTravelCO2).toBeCloseTo(
        expectedParticipantTravel,
        2,
      );
      expect(emissions.projectSharedTravelCO2).toBeCloseTo(
        expectedSharedTravel,
        2,
      );
      expect(emissions.totalCO2).toBeCloseTo(
        expectedParticipantTravel + expectedSharedTravel,
        2,
      );
    });

    it("sums multiple shared legs while preserving total and tree calculations", () => {
      const sharedTravelLegs = [
        sharedTravelLeg("boat-leg", "boat", 20),
        sharedTravelLeg("bus-leg", "bus", 40),
        sharedTravelLeg("train-leg", "train", 15),
      ];

      const emissions = calculateEmissions({}, sharedTravelLegs);
      const expectedSharedTravel =
        20 * TRANSPORT_EMISSION_FACTORS.boat +
        40 * TRANSPORT_EMISSION_FACTORS.bus +
        15 * TRANSPORT_EMISSION_FACTORS.train;

      expect(emissions.projectSharedTravelCO2).toBeCloseTo(
        expectedSharedTravel,
        2,
      );
      expect(emissions.totalCO2).toBeCloseTo(expectedSharedTravel, 2);
      expect(emissions.treesNeeded).toBe(
        Math.ceil(expectedSharedTravel / CO2_PER_TREE_PER_YEAR),
      );
    });
  });
});
