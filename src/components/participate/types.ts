import type { ActivityType } from "@/components/features/projects/types";

export interface Participant {
  id: string;
  name: string;
  country: string;
  totalCO2: number;
  activities: Activity[];
  rank?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  distanceKm: number;
  co2Kg: number;
}

export interface ProjectStats {
  totalParticipants: number;
  totalCO2: number;
  averageCO2: number;
  breakdownByType: Record<
    ActivityType,
    {
      distance: number;
      co2: number;
      count: number;
    }
  >;
  treesNeeded: number; // Average tree absorbs ~22kg CO₂ per year, ~1 ton in lifetime (~45 years)
}
