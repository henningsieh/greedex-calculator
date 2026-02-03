import { SUPPORTED_LANGUAGES } from "@greendex/config/languages";

/**
 * Type definitions derived from supported languages
 * These are app-specific types for the documentation app
 */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type LanguageCode = SupportedLanguage["code"];
