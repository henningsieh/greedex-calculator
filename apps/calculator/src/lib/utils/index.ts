import type { ComponentType, SVGProps } from "react";

import { LANGUAGE_CODES, SUPPORTED_LANGUAGES } from "@greendex/config/languages";
import { type ClassValue, clsx } from "clsx";
import * as Flags from "country-flag-icons/react/3x2";
import countries from "i18n-iso-countries";
import deCountries from "i18n-iso-countries/langs/de.json";
import enCountries from "i18n-iso-countries/langs/en.json";
import { twMerge } from "tailwind-merge";

import { LocaleData, type LanguageCode } from "@/lib/i18n/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Load and register locale data for country names
countries.registerLocale(enCountries);
countries.registerLocale(deCountries);

const flagRegistry = Flags as Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
>;

export const getLocaleData = (): LocaleData[] => {
  return SUPPORTED_LANGUAGES.map((locale) => {
    // Handle locales without a specific country code (e.g., International English)
    const countryCode = "countryCode" in locale ? locale.countryCode : undefined;

    let nativeName: string;
    let englishName: string;
    let Flag: ComponentType<SVGProps<SVGSVGElement>> | undefined;

    if (countryCode) {
      // Locale has a country code - use i18n-iso-countries for names
      nativeName =
        countries.getName(countryCode, locale.code, {
          select: "official",
        }) ?? locale.label;

      englishName =
        countries.getName(countryCode, "en", {
          select: "official",
        }) ?? locale.label;

      Flag = flagRegistry[countryCode];
    } else {
      // Locale without country code (International) - use display region or label
      nativeName =
        (locale as { displayRegion?: string; label: string }).displayRegion ??
        locale.label;
      englishName =
        (locale as { displayRegion?: string; label: string }).displayRegion ??
        locale.label;
      Flag = undefined; // No flag for international locales
    }

    return {
      ...locale,
      nativeName,
      englishName,
      Flag,
    };
  }).map((entry) => {
    // Special case: Use UK flag for International English to indicate default fallback
    if (entry.code === "en") {
      entry.Flag = flagRegistry.GB;
    }
    return entry;
  });
};

export const isSupportedLocale = (
  value: string | undefined,
): value is LanguageCode =>
  !!value && LANGUAGE_CODES.includes(value as LanguageCode);
