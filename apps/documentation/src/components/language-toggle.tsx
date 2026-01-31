"use client";

import { SUPPORTED_LOCALES, type LocaleCode } from "@greendex/config/languages";
import * as Flags from "country-flag-icons/react/3x2";
import { Globe, Check } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

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
function getFlagComponent(locale: (typeof SUPPORTED_LOCALES)[number]) {
  const countryCode = "countryCode" in locale ? locale.countryCode : null;

  if (!countryCode) {
    return Globe;
  }

  const FlagComponent = Flags[countryCode as keyof typeof Flags];
  return FlagComponent || Globe;
}

/**
 * Custom Language Toggle with Flags (shadcn version)
 * Displays in the sidebar footer with country flags
 */
export function LanguageToggle() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentLang = (params?.lang as LocaleCode) || "en";
  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === currentLang);

  const handleLanguageChange = (newLang: LocaleCode) => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = newLang;
    const newPath = `/${segments.join("/")}`;
    router.push(newPath);
  };

  const CurrentFlag = currentLocale ? getFlagComponent(currentLocale) : Globe;
  const currentHasCountryCode = currentLocale && "countryCode" in currentLocale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 w-full rounded-lg hover:bg-fd-accent transition-colors text-sm text-fd-muted-foreground hover:text-fd-foreground outline-none">
        <div className="flex items-center gap-2 flex-1">
          {currentHasCountryCode ? (
            <CurrentFlag className="w-5 h-3.5 rounded-sm shadow-sm" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          <span className="font-medium">
            {currentLocale?.label || "Language"}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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

      <DropdownMenuContent align="start" side="top" className="w-fit">
        {SUPPORTED_LOCALES.map((locale) => {
          const FlagIcon = getFlagComponent(locale);
          const isActive = locale.code === currentLang;
          const hasCountryCode = "countryCode" in locale;

          return (
            <DropdownMenuItem
              key={locale.code}
              onClick={() => handleLanguageChange(locale.code)}
              className="flex items-center gap-3 cursor-pointer"
            >
              {hasCountryCode ? (
                <FlagIcon className="w-5 h-3.5 rounded-sm shadow-sm shrink-0" />
              ) : (
                <Globe className="w-4 h-4 shrink-0" />
              )}
              <div className="flex flex-col items-start flex-1">
                <span className={isActive ? "font-medium" : ""}>
                  {locale.label}
                </span>
                {locale.displayRegion && (
                  <span className="text-xs opacity-70">
                    {locale.displayRegion}
                  </span>
                )}
              </div>
              {isActive && <Check className="w-4 h-4 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Inline Language Toggle for Navbar (shadcn version)
 * Compact version for horizontal navigation
 */
export function LanguageToggleInline() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentLang = (params?.lang as LocaleCode) || "en";
  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === currentLang);

  const handleLanguageChange = (newLang: LocaleCode) => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = newLang;
    const newPath = `/${segments.join("/")}`;
    router.push(newPath);
  };

  const CurrentFlag = currentLocale ? getFlagComponent(currentLocale) : Globe;
  const currentHasCountryCode = currentLocale && "countryCode" in currentLocale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-fd-accent transition-colors outline-none">
        {currentHasCountryCode ? (
          <CurrentFlag className="w-5 h-3.5 rounded-sm shadow-sm" />
        ) : (
          <Globe className="w-4 h-4" />
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
        {SUPPORTED_LOCALES.map((locale) => {
          const FlagIcon = getFlagComponent(locale);
          const isActive = locale.code === currentLang;
          const hasCountryCode = "countryCode" in locale;

          return (
            <DropdownMenuItem
              key={locale.code}
              onClick={() => handleLanguageChange(locale.code)}
              className="flex items-center gap-3 cursor-pointer"
            >
              {hasCountryCode ? (
                <FlagIcon className="w-5 h-3.5 rounded-sm shadow-sm" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <div className="flex flex-col items-start flex-1">
                <span className={isActive ? "font-medium" : ""}>
                  {locale.label}
                </span>
                {locale.displayRegion && (
                  <span className="text-xs opacity-70">
                    {locale.displayRegion}
                  </span>
                )}
              </div>
              {isActive && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
