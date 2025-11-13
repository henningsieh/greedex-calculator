import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["en", "de"] as const;
const DEFAULT_LOCALE: Locale = "en";
type Locale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(l: unknown): l is Locale {
  return (
    typeof l === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(l)
  );
}

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,de;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [localePart, qValue] = lang.trim().split(";");
      const quality = qValue ? parseFloat(qValue.split("=")[1]) : 1.0;
      const base = localePart.split("-")[0];
      return { locale: base, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    if (isSupportedLocale(locale)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  // 1. Check if locale is set in cookie (user preference)
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  if (isSupportedLocale(localeCookie)) {
    const locale = localeCookie;
    return {
      locale,
      messages: (await import(`../../../messages/${locale}.json`)).default,
    };
  }

  // 2. Detect from Accept-Language header (browser language)
  const acceptLanguage = headersList.get("accept-language");
  const detectedLocale = getLocaleFromAcceptLanguage(acceptLanguage ?? null);

  return {
    locale: detectedLocale,
    messages: (await import(`../../../messages/${detectedLocale}.json`))
      .default,
  };
});
