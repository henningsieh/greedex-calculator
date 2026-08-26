import {
  PARTICIPANT_TRANSPORT_EMISSION_PROFILES,
  PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES,
  TRANSPORT_EMISSION_FACTORS,
} from "@greendex/config/transport-emission-profiles";
import { describe, expect, it } from "vitest";

describe("Transport Emission Profile configuration", () => {
  it("builds the Participant Travel Leg profiles from the complete Project Shared Travel Leg set plus plane", () => {
    expect(PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES).toEqual([
      "boat",
      "bus",
      "train",
      "car",
      "electricCar",
    ]);
    expect(PARTICIPANT_TRANSPORT_EMISSION_PROFILES).toEqual([
      ...PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES,
      "plane",
    ]);

    expect(new Set(PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES).size).toBe(
      PROJECT_SHARED_TRANSPORT_EMISSION_PROFILES.length,
    );
    expect(new Set(PARTICIPANT_TRANSPORT_EMISSION_PROFILES).size).toBe(
      PARTICIPANT_TRANSPORT_EMISSION_PROFILES.length,
    );
  });

  it("defines the existing emission factor for every participant profile", () => {
    expect(TRANSPORT_EMISSION_FACTORS).toEqual({
      boat: 0.05,
      bus: 0.032,
      train: 0.035,
      car: 0.168,
      electricCar: 0.053,
      plane: 0.154,
    });

    expect(Object.keys(TRANSPORT_EMISSION_FACTORS).sort()).toEqual(
      [...PARTICIPANT_TRANSPORT_EMISSION_PROFILES].sort(),
    );
  });
});
