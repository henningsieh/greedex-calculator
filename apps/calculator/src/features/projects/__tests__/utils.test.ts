import { TRANSPORT_EMISSION_FACTORS as ACTIVITY_EMISSION_FACTORS } from "@greendex/config/transport-emission-profiles";
import { describe, expect, it, vi } from "vitest";

import type { ProjectParticipantWithUser } from "@/features/participants/types";
import {
  calculateProjectDuration,
  getProjectStatistics,
} from "@/features/projects/utils";

describe("calculateProjectDuration", () => {
  it("returns 0 for invalid dates", () => {
    expect(calculateProjectDuration("invalid", "also-invalid")).toBe(0);
  });

  it("returns 0 when end is before start", () => {
    const start = new Date("2025-01-10");
    const end = new Date("2025-01-01");
    expect(calculateProjectDuration(start, end)).toBe(0);
  });

  it("uses ceil and returns whole days", () => {
    const start = new Date("2025-01-01T00:00:00Z");
    const end = new Date("2025-01-02T12:00:00Z"); // 1.5 days -> ceil -> 2
    expect(calculateProjectDuration(start, end)).toBe(2);
  });
});

describe("getProjectStatistics", () => {
  it("computes shared-travel-leg counts, distance, duration, and emissions", () => {
    const project = {
      startDate: "2025-01-01",
      endDate: "2025-01-05",
    };

    const participants: ProjectParticipantWithUser[] = [
      {
        id: "participant-1",
        projectId: "project-1",
        memberId: "member-1",
        userId: "user-1",
        country: "DE",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-1",
          name: "Participant One",
          email: "participant-1@example.com",
          image: null,
        },
      },
      {
        id: "participant-2",
        projectId: "project-1",
        memberId: "member-2",
        userId: "user-2",
        country: "DE",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-2",
          name: "Participant Two",
          email: "participant-2@example.com",
          image: null,
        },
      },
      {
        id: "participant-3",
        projectId: "project-1",
        memberId: "member-3",
        userId: "user-3",
        country: "DE",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-3",
          name: "Participant Three",
          email: "participant-3@example.com",
          image: null,
        },
      },
    ];

    const sharedTravelLegs = [
      { activityType: "car", distanceKm: 10 },
      { activityType: "train", distanceKm: 20.5 },
      // invalid activity should be ignored
      { activityType: "unknown", distanceKm: 15 },
      { activityType: "bus", distanceKm: -5 },
    ];

    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const stats = getProjectStatistics(
        project,
        participants,
        sharedTravelLegs as any,
      );

      expect(stats.participantsCount).toBe(3);
      expect(stats.sharedTravelLegsCount).toBe(4);
      // total distance sums numeric positive distances regardless of activity type
      // 10 + 20.5 + 15 = 45.5 (bus negative value ignored)
      expect(stats.totalDistanceKm).toBeCloseTo(45.5);
      expect(stats.durationDays).toBe(4);

      // CO2: car 10 * carFactor + train 20.5 * trainFactor (unknown ignored, negative ignored)
      const expectedCO2 =
        10 * ACTIVITY_EMISSION_FACTORS.car +
        20.5 * ACTIVITY_EMISSION_FACTORS.train;
      expect(stats.sharedTravelCO2Kg).toBeCloseTo(expectedCO2);
      expect(errorSpy).toHaveBeenCalledWith("Unknown activity type: unknown");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("handles missing or empty inputs safely", () => {
    const stats = getProjectStatistics(null, null, null);
    expect(stats.participantsCount).toBe(0);
    expect(stats.sharedTravelLegsCount).toBe(0);
    expect(stats.totalDistanceKm).toBe(0);
    expect(stats.durationDays).toBe(0);
    expect(stats.sharedTravelCO2Kg).toBe(0);
  });
});
