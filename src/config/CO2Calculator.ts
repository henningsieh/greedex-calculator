import type { ActivityType } from "@/components/features/projects/types";

// CO₂ emission factors (kg CO₂ per km per person)
export const CO2_FACTORS: Record<ActivityType, number> = {
  car: 0.192, // Average car
  train: 0.041,
  bus: 0.089,
  boat: 0.115, // Ferry/cruise average
};
