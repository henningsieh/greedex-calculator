import type { ProjectSharedTransportEmissionProfile } from "@greendex/config/transport-emission-profiles";
import { BusIcon, CarIcon, ShipIcon, TrainIcon } from "lucide-react";

const transportEmissionProfileIcons = {
  boat: ShipIcon,
  bus: BusIcon,
  train: TrainIcon,
  car: CarIcon,
  electricCar: CarIcon,
} satisfies Record<ProjectSharedTransportEmissionProfile, typeof CarIcon>;

interface TransportEmissionProfileIconProps {
  profile: ProjectSharedTransportEmissionProfile;
  className?: string;
}

export function TransportEmissionProfileIcon({
  profile,
  className = "size-4",
}: TransportEmissionProfileIconProps) {
  const Icon = transportEmissionProfileIcons[profile];

  return <Icon className={className} />;
}
