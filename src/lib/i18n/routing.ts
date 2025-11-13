import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // All supported locales
  locales: ["en", "de"],

  // Default locale when none is specified
  defaultLocale: "en",

  // Add locale prefix to all routes (e.g., /en/about, /de/about)
  localePrefix: "always",
});

// Lightweight wrappers around Next.js navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
