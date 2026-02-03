import { Route } from "next";

import { LanguageCode } from "@/lib/types";

/**
 *
 * @param newLang The new language code to set in the path
 * @param pathname The current pathname
 * @returns
 */
export const buildLocalizedPath = (
  newLang: LanguageCode,
  pathname: string,
): Route => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    segments[0] = newLang;
  } else {
    segments.push(newLang);
  }
  return `/${segments.join("/")}` as Route;
};
