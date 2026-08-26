import {
  PARTICIPANT_TRANSPORT_EMISSION_PROFILES,
  PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES,
  TRANSPORT_EMISSION_FACTORS,
} from "@greendex/config/transport-emission-profiles";
import { describe, expect, it } from "vitest";

import type {
  ParticipantTravelLeg,
  ParticipantTravelLegTransportEmissionProfile,
} from "@/features/participate/types";

describe("Participant Travel Leg types", () => {
  it("models every Project Shared Travel profile as a Participant Travel Leg", () => {
    for (const transportEmissionProfile of PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES) {
      const travelLeg: ParticipantTravelLeg = {
        id: "test-id",
        transportEmissionProfile,
        distanceKm: 100,
        co2Kg: 10,
      };

      expect(travelLeg.transportEmissionProfile).toBe(transportEmissionProfile);
    }
  });

  it("models plane as a Participant Travel Leg-only profile", () => {
    const transportEmissionProfile: ParticipantTravelLegTransportEmissionProfile =
      "plane";
    const travelLeg: ParticipantTravelLeg = {
      id: "test-id",
      transportEmissionProfile,
      distanceKm: 100,
      co2Kg: 10,
    };

    expect(travelLeg.transportEmissionProfile).toBe("plane");
  });

  it("provides an emission factor for every Participant Travel Leg profile", () => {
    for (const transportEmissionProfile of PARTICIPANT_TRANSPORT_EMISSION_PROFILES) {
      expect(TRANSPORT_EMISSION_FACTORS).toHaveProperty(transportEmissionProfile);
      expect(
        TRANSPORT_EMISSION_FACTORS[transportEmissionProfile],
      ).toBeGreaterThan(0);
    }
  });

  it("keeps Project Shared Travel restricted to electric car and excludes plane", () => {
    expect(PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES).toContain("electricCar");
    expect(PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES).not.toContain("plane");
  });

  it("builds the Participant Travel Leg profile set from every shared profile plus plane", () => {
    expect(PARTICIPANT_TRANSPORT_EMISSION_PROFILES).toEqual([
      ...PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES,
      "plane",
    ]);
  });
});
