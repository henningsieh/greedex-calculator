/**
 * Centralized i18n configuration
 * This file contains all internationalization-related settings
 */

/**
 * Supported languages configuration
 *
 * Note: "en" represents International English and is NOT tied to a specific EU country.
 * The countryCode is optional and only used when a language directly represents an EU member state.
 */
export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    label: "English",
    displayRegion: "International",
    // No countryCode - International English is not tied to UK/GB (non-EU)
  },
  {
    code: "de",
    label: "German",
    displayRegion: "Germany",
    countryCode: "DE", // Germany is an EU member
  },
] as const;

/**
 * Array of supported language codes (derived constant, not a type)
 */
export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

/**
 * Default language code (derived constant, not a type)
 */
export const DEFAULT_LANGUAGE = LANGUAGE_CODES[0];
