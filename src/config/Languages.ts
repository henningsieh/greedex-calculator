// Centralized i18n configuration
// This file contains all internationalization-related settings

import { LOCALE_CODES, type LocaleCode } from "@/lib/i18n/locales";

export const SUPPORTED_LOCALES = [
  {
    code: "en",
    label: "English",
    countryCode: "GB",
  },
  {
    code: "de",
    label: "Deutsch",
    countryCode: "DE",
  },
] as const;

export const DEFAULT_LOCALE: LocaleCode = LOCALE_CODES[0];
