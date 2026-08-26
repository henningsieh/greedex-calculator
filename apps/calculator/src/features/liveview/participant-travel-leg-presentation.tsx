import type { ParticipantTransportEmissionProfile } from "@greendex/config/transport-emission-profiles";
import { BusIcon, CarIcon, PlaneIcon, ShipIcon, TrainIcon } from "lucide-react";

const participantTravelLegPresentation = {
  boat: { label: "Boat", color: "bg-blue-500", Icon: ShipIcon },
  bus: { label: "Bus", color: "bg-orange-500", Icon: BusIcon },
  train: { label: "Train", color: "bg-green-500", Icon: TrainIcon },
  car: { label: "Car", color: "bg-red-500", Icon: CarIcon },
  electricCar: {
    label: "Electric car",
    color: "bg-emerald-500",
    Icon: CarIcon,
  },
  plane: { label: "Plane", color: "bg-sky-500", Icon: PlaneIcon },
} satisfies Record<
  ParticipantTransportEmissionProfile,
  { label: string; color: string; Icon: typeof CarIcon }
>;

export function getParticipantTravelLegPresentation(
  profile: ParticipantTransportEmissionProfile,
) {
  return participantTravelLegPresentation[profile];
}
