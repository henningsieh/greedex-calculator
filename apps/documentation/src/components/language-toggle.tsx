"use client";

import { SUPPORTED_LANGUAGES } from "@greendex/config/languages";
import * as Flags from "country-flag-icons/react/3x2";
import { CheckIcon, GlobeIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import type { LanguageCode } from "@/lib/types";

// shadcn DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Get the flag component for a given locale
 * Uses countryCode if available, otherwise falls back to Globe icon
 */
function getFlagComponent(locale: (typeof SUPPORTED_LANGUAGES)[number]) {
  const countryCode = "countryCode" in locale ? locale.countryCode : null;

  if (!countryCode) {
    return GlobeIcon;
  }

  const FlagComponent = Flags[countryCode as keyof typeof Flags];
  return FlagComponent || GlobeIcon;
}

/**
 * Inline Language Toggle for Navbar (shadcn version)
 * Compact version for horizontal navigation
 */
export function LanguageToggleInline() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentLang = (params?.lang as LanguageCode) || "en";
  const currentLocale = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  const handleLanguageChange = (newLang: LanguageCode) => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = newLang;
    const newPath = `/${segments.join("/")}`;
    router.push(newPath);
  };

  const CurrentFlag = currentLocale ? getFlagComponent(currentLocale) : GlobeIcon;
  const currentHasCountryCode = currentLocale && "countryCode" in currentLocale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors outline-none hover:bg-fd-accent">
        {currentHasCountryCode ? (
          <CurrentFlag className="h-3.5 w-5 rounded-sm shadow-sm" />
        ) : (
          <GlobeIcon className="size-4" />
        )}
        <span className="text-sm font-medium">
          {currentLocale?.code.toUpperCase()}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-50 bg-accent">
        {SUPPORTED_LANGUAGES.map((locale) => {
          const FlagIcon = getFlagComponent(locale);
          const isActive = locale.code === currentLang;
          const hasCountryCode = "countryCode" in locale;

          return (
            <DropdownMenuItem
              key={locale.code}
              onClick={() => handleLanguageChange(locale.code)}
              className="flex cursor-pointer items-center gap-3"
            >
              {hasCountryCode ? (
                <FlagIcon className="h-3.5 w-5 rounded-sm shadow-sm" />
              ) : (
                <GlobeIcon className="size-4" />
              )}
              <div className="flex flex-1 flex-col items-start">
                <span className={isActive ? "font-medium" : ""}>
                  {locale.label}
                </span>
                {locale.displayRegion && (
                  <span className="text-xs opacity-70">
                    {locale.displayRegion}
                  </span>
                )}
              </div>
              {isActive && <CheckIcon className="size-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
