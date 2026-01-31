import { DEFAULT_LOCALE, LOCALE_CODES } from "@greendex/config/languages";
import { defineI18n } from "fumadocs-core/i18n";

export const i18n = defineI18n({
  defaultLanguage: DEFAULT_LOCALE,
  languages: LOCALE_CODES,
});
