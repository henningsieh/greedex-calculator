import {
  DEFAULT_LANGUAGE,
  LANGUAGE_CODES,
  SUPPORTED_LANGUAGES,
} from "@greendex/config/languages";
import * as Flags from "country-flag-icons/react/3x2";
import { defineI18n } from "fumadocs-core/i18n";
import { GlobeIcon } from "lucide-react";

/**
 * i18n configuration for Fumadocs
 */
export const i18n = defineI18n({
  defaultLanguage: DEFAULT_LANGUAGE,
  languages: LANGUAGE_CODES,
});

/**
 * Get the flag component for a given locale
 * Uses countryCode if available, otherwise falls back to Globe icon
 */
export function getFlagComponent(locale: (typeof SUPPORTED_LANGUAGES)[number]) {
  const countryCode = "countryCode" in locale ? locale.countryCode : null;

  if (!countryCode) {
    return GlobeIcon;
  }

  const FlagComponent = Flags[countryCode as keyof typeof Flags];
  return FlagComponent || GlobeIcon;
}
