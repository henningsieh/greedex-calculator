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
    countryCode: "DE", // Germany is an EUc member
  },
  {
    code: "es",
    label: "Spanish",
    displayRegion: "Spain",
    countryCode: "ES", // Spain is an EU member
  },
  {
    code: "it",
    label: "Italian",
    displayRegion: "Italy",
    countryCode: "IT", // Italy is an EU member
  },
  {
    code: "fr",
    label: "French",
    displayRegion: "France",
    countryCode: "FR", // France is an EU member
  },
  {
    code: "nl",
    label: "Dutch",
    displayRegion: "Netherlands",
    countryCode: "NL", // Netherlands is an EU member
  },
  {
    code: "si",
    label: "Slovenian",
    displayRegion: "Slovenia",
    countryCode: "SI", // Slovenia is an EU member
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
