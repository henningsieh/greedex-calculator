import type { MetadataRoute } from "next";

import { LANGUAGE_CODES } from "@greendex/config/languages";
import { BASE_URL } from "@greendex/config/metadata";

// Regex for removing trailing slash - moved to top level for performance
const TRAILING_SLASH_REGEX = /\/$/;

/**
 * Generates dynamic sitemap for all public pages
 * Next.js App Router will automatically serve this at /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BASE_URL.replace(TRAILING_SLASH_REGEX, ""); // Remove trailing slash

  // Public pages that should be indexed
  const publicPages = [
    "", // Home
    "/workshops",
    "/e-forest",
    "/tips-and-tricks",
    "/library",
    "/about",
    "/login",
    "/signup",
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate entries for each locale and page combination
  for (const locale of LANGUAGE_CODES) {
    for (const page of publicPages) {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LANGUAGE_CODES.map((loc) => [loc, `${baseUrl}/${loc}${page}`]),
          ),
        },
      });
    }
  }

  return sitemap;
}
