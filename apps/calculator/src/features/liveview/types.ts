import type { ParticipantTransportEmissionProfile } from "@greendex/config/transport-emission-profiles";

/** A generated travel record displayed only in the mock live view. */
export interface ParticipantTravelLeg {
  id: string;
  transportEmissionProfile: ParticipantTransportEmissionProfile;
  distanceKm: number;
  co2Kg: number;
}

/** Generated participant data displayed only in the mock live view. */
export interface LiveViewParticipant {
  id: string;
  name: string;
  country: string;
  totalCO2: number;
  participantTravelLegs: ParticipantTravelLeg[];
}

export interface LiveViewProjectStats {
  totalParticipants: number;
  totalCO2: number;
  averageCO2: number;
  breakdownByProfile: Record<
    ParticipantTransportEmissionProfile,
    {
      distance: number;
      co2: number;
      count: number;
    }
  >;
  treesNeeded: number;
}
