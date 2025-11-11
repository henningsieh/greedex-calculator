import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { authClient } from "@/lib/better-auth/auth-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date using Intl.DateTimeFormat for consistent, locale-aware formatting.
 * Supports all EU timezones by using the user's browser locale and timezone settings.
 *
 * Database timestamps are assumed to be in UTC. This function automatically converts
 * them to the user's local timezone for display.
 *
 * EU Timezone Support:
 * - Automatically detects user's browser timezone
 * - Supports all European timezones (Portugal to Romania/Bulgaria)
 * - Falls back to German locale if browser locale unavailable
 * - Handles daylight saving time automatically
 *
 * @param date - Date object, ISO string, or timestamp
 * @param options - Formatting options
 * @returns Formatted date string in user's local timezone
 */
export function formatDate(
  date: Date | string | number | undefined | null,
  options?: {
    locale?: string | string[];
    format?: "short" | "medium" | "long" | "full" | "custom";
    customOptions?: Intl.DateTimeFormatOptions;
    timezone?: "local" | "utc" | string;
  },
): string {
  if (!date) return "";

  let dateObj: Date;

  if (typeof date === "string" || typeof date === "number") {
    // Assume database timestamps are in UTC
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!dateObj || Number.isNaN(dateObj.getTime())) return "";

  const {
    locale = "de-DE",
    format = "short",
    customOptions,
    timezone = "local",
  } = options || {};

  let dateTimeFormatOptions: Intl.DateTimeFormatOptions;

  if (customOptions) {
    dateTimeFormatOptions = { ...customOptions };
  } else {
    switch (format) {
      case "short":
        dateTimeFormatOptions = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };
        break;
      case "medium":
        dateTimeFormatOptions = {
          day: "2-digit",
          month: "short",
          year: "numeric",
        };
        break;
      case "long":
        dateTimeFormatOptions = {
          day: "2-digit",
          month: "long",
          year: "numeric",
        };
        break;
      case "full":
        dateTimeFormatOptions = {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        };
        break;
      default:
        dateTimeFormatOptions = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };
    }
  }

  // Handle timezone settings
  if (timezone === "utc") {
    dateTimeFormatOptions.timeZone = "UTC";
  } else if (timezone === "local") {
    // Use browser's local timezone (default behavior)
    // Don't set timeZone to let browser use its local timezone
  } else if (typeof timezone === "string") {
    dateTimeFormatOptions.timeZone = timezone;
  }

  // Use provided locale, or browser's locale if available, fallback to German
  const resolvedLocale =
    locale ||
    (typeof window !== "undefined" ? navigator.language || "de-DE" : "de-DE");

  return new Intl.DateTimeFormat(resolvedLocale, dateTimeFormatOptions).format(
    dateObj,
  );
}

/**
 * Transform a string into a URL-friendly slug.
 * - trims, lowercases
 * - replaces groups of non-alphanumeric characters with a single `-`
 * - collapses multiple `-` and trims leading/trailing `-`
 */
function slugify(input: string) {
  if (!input) return "";
  return (
    input
      .toString()
      .trim()
      .toLowerCase()
      // replace anything that's not a-z0-9 with -
      .replace(/[^a-z0-9]+/g, "-")
      // collapse multiple -
      .replace(/-+/g, "-")
      // remove leading/trailing -
      .replace(/^-|-$/g, "")
  );
}

/**
 * Generate a short random alphanumeric string (lowercase) of given length.
 */
function randomString(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Find an available slug by checking with the backend.
 * Appends random suffixes if needed, up to a max number of attempts.
 */
export const findAvailableSlug = async (baseName: string): Promise<string> => {
  const baseSlug = slugify(baseName) || randomString(6);
  let candidate = baseSlug;
  let attempt = 0;
  const maxAttempts = 10;

  while (attempt < maxAttempts) {
    try {
      const { error } = await authClient.organization.checkSlug({
        slug: candidate,
      });

      // If no error, slug is available
      if (!error) {
        return candidate;
      }

      // Slug is taken, try another variant
      attempt++;
      candidate = `${baseSlug}-${randomString(4)}`;
    } catch (_err) {
      // If error is thrown, slug is likely taken
      attempt++;
      candidate = `${baseSlug}-${randomString(4)}`;
    }
  }

  // Fallback: use completely random slug
  return randomString(8);
};
