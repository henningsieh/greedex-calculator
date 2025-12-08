import * as Flags from "country-flag-icons/react/3x2";
import countries from "i18n-iso-countries";
import deCountries from "i18n-iso-countries/langs/de.json";
import enCountries from "i18n-iso-countries/langs/en.json";
import type { ComponentType, SVGProps } from "react";
import { SUPPORTED_LOCALES } from "../../config/Languages";

countries.registerLocale(enCountries);
countries.registerLocale(deCountries);

export type LocaleData = SupportedLocale & {
  nativeName: string;
  englishName: string;
  Flag?: ComponentType<SVGProps<SVGSVGElement>>;
};

const flagRegistry = Flags as Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
>;

export const getLocaleData = (): LocaleData[] => {
  return SUPPORTED_LOCALES.map((locale) => {
    const nativeName =
      countries.getName(locale.countryCode, locale.code, {
        select: "official",
      }) ?? locale.label;

    let englishName =
      countries.getName(locale.countryCode, "en", {
        select: "official",
      }) ?? locale.label;

    if (englishName === `United Kingdom`) {
      englishName = `International`;
    }

    const Flag = flagRegistry[locale.countryCode];

    return {
      ...locale,
      nativeName,
      englishName,
      Flag,
    };
  });
};

export const LOCALE_CODES: LocaleCode[] = SUPPORTED_LOCALES.map(
  (locale) => locale.code,
);

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleCode = SupportedLocale["code"];

export const isSupportedLocale = (
  value: string | undefined,
): value is LocaleCode => !!value && LOCALE_CODES.includes(value as LocaleCode);
