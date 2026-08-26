import {
  PARTICIPANT_TRANSPORT_EMISSION_PROFILES,
  TRANSPORT_EMISSION_FACTORS,
} from "@greendex/config/transport-emission-profiles";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { calculateLiveViewStats } from "@/features/liveview/mock-participant-travel";
import { TransportBreakdown } from "@/features/liveview/transport-breakdown";
import type { LiveViewParticipant } from "@/features/liveview/types";

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe("TransportBreakdown", () => {
  it("renders each Participant Travel Leg profile and its aggregated totals", () => {
    const participant: LiveViewParticipant = {
      id: "participant-1",
      name: "Ada Lovelace",
      country: "United Kingdom",
      totalCO2: PARTICIPANT_TRANSPORT_EMISSION_PROFILES.reduce(
        (total, profile) => total + TRANSPORT_EMISSION_FACTORS[profile],
        0,
      ),
      participantTravelLegs: PARTICIPANT_TRANSPORT_EMISSION_PROFILES.map(
        (transportEmissionProfile, index) => ({
          id: `leg-${transportEmissionProfile}`,
          transportEmissionProfile,
          distanceKm: index + 1,
          co2Kg: TRANSPORT_EMISSION_FACTORS[transportEmissionProfile],
        }),
      ),
    };
    const stats = calculateLiveViewStats([participant]);

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      root?.render(<TransportBreakdown stats={stats} />);
    });

    expect(container.textContent).toContain(
      "Participant Travel Leg CO₂ Breakdown",
    );
    for (const profile of PARTICIPANT_TRANSPORT_EMISSION_PROFILES) {
      expect(container.textContent).toContain(
        profile === "plane"
          ? "Plane"
          : profile === "electricCar"
            ? "Electric car"
            : `${profile[0].toUpperCase()}${profile.slice(1)}`,
      );
      expect(container.textContent).toContain(
        `${TRANSPORT_EMISSION_FACTORS[profile].toFixed(1)}`,
      );
      expect(container.textContent).toContain(
        `${stats.breakdownByProfile[profile].distance} km`,
      );
    }
  });
});
