import { SUPPORTED_LOCALES, type LocaleCode } from "@greendex/config/languages";
import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

// Create Orama search server with locale-specific configurations

const server = createFromSource(source, {
  localeMap: SUPPORTED_LOCALES.reduce(
    (acc, locale) => {
      acc[locale.code] = { language: locale.label.toLowerCase() };
      return acc;
    },
    {} as Record<LocaleCode, { language: string }>,
  ),
});

export const { GET } = server;
