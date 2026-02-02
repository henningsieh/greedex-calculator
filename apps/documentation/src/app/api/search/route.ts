import { SUPPORTED_LANGUAGES } from "@greendex/config/languages";
import { createFromSource } from "fumadocs-core/search/server";

import type { LanguageCode } from "@/lib/types";

import { source } from "@/lib/source";

// Create Orama search server with locale-specific configurations

const server = createFromSource(source, {
  localeMap: SUPPORTED_LANGUAGES.reduce(
    (acc, locale) => {
      acc[locale.code] = { language: locale.label.toLowerCase() };
      return acc;
    },
    {} as Record<LanguageCode, { language: string }>,
  ),
});

export const { GET } = server;
