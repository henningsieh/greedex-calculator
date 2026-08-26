"use client";

import type { ProjectSharedTransportEmissionProfile } from "@greendex/config/transport-emission-profiles";
import { useTranslations } from "@greendex/i18n/client";

import { TransportEmissionProfileIcon } from "./transport-emission-profile-icon";

interface TransportEmissionProfilePresentationProps {
  profile: ProjectSharedTransportEmissionProfile;
}

export function TransportEmissionProfilePresentation({
  profile,
}: TransportEmissionProfilePresentationProps) {
  const t = useTranslations("project.shared-travel");

  return (
    <div className="flex items-center gap-2">
      <TransportEmissionProfileIcon profile={profile} />
      <span>{t(`types.${profile}`)}</span>
    </div>
  );
}
