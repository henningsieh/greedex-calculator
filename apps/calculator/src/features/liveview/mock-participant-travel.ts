import {
  PARTICIPANT_TRANSPORT_EMISSION_PROFILES,
  TRANSPORT_EMISSION_FACTORS,
} from "@greendex/config/transport-emission-profiles";

import type {
  LiveViewParticipant,
  LiveViewProjectStats,
  ParticipantTravelLeg,
} from "./types";

export const PARTICIPANT_TRAVEL_LEG_PROFILES =
  PARTICIPANT_TRANSPORT_EMISSION_PROFILES;

export function createMockParticipantTravelLeg(id: string): ParticipantTravelLeg {
  const transportEmissionProfile =
    PARTICIPANT_TRAVEL_LEG_PROFILES[
      Math.floor(Math.random() * PARTICIPANT_TRAVEL_LEG_PROFILES.length)
    ];
  const distanceKm = Math.floor(Math.random() * 1500) + 100;

  return {
    id,
    transportEmissionProfile,
    distanceKm,
    co2Kg: distanceKm * TRANSPORT_EMISSION_FACTORS[transportEmissionProfile],
  };
}

export function calculateLiveViewStats(
  participants: LiveViewParticipant[],
): LiveViewProjectStats {
  const totalParticipants = participants.length;
  const totalCO2 = participants.reduce(
    (sum, participant) => sum + participant.totalCO2,
    0,
  );
  const breakdownByProfile = Object.fromEntries(
    PARTICIPANT_TRAVEL_LEG_PROFILES.map((profile) => [
      profile,
      { distance: 0, co2: 0, count: 0 },
    ]),
  ) as LiveViewProjectStats["breakdownByProfile"];

  for (const participant of participants) {
    for (const leg of participant.participantTravelLegs) {
      const breakdown = breakdownByProfile[leg.transportEmissionProfile];
      breakdown.distance += leg.distanceKm;
      breakdown.co2 += leg.co2Kg;
      breakdown.count += 1;
    }
  }

  return {
    totalParticipants,
    totalCO2,
    averageCO2: totalParticipants > 0 ? totalCO2 / totalParticipants : 0,
    breakdownByProfile,
    treesNeeded: Math.ceil(totalCO2 / 1000),
  };
}
