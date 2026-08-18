"use client";

import { useLocale, useTranslations } from "@greendex/i18n/client";
import { useMemo, useTransition } from "react";

import type { LanguageCode, LocaleData } from "@/lib/i18n/types";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { getLocaleData } from "@/lib/i18n/locales";
import { usePathname, useRouter } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("app");

  const locales = useMemo(() => getLocaleData(), []);
  const currentLocale = useMemo(
    () => locales.find((entry) => entry.code === locale),
    [locales, locale],
  );

  function handleLocaleChange(newLocale: LocaleData | null) {
    if (!newLocale || newLocale.code === locale || isPending) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, {
        locale: newLocale.code as LanguageCode,
      });
    });
  }

  return (
    <Combobox
      items={locales}
      itemToStringValue={(entry: LocaleData) =>
        `${entry.englishName} ${entry.label} ${entry.code}`
      }
      value={currentLocale ?? null}
      onValueChange={handleLocaleChange}
    >
      <ComboboxTrigger
        aria-label={`Select language, current: ${currentLocale?.englishName || locale}`}
        className={cn(
          "hover:text-accent-accent-foreground flex items-center gap-1 rounded-full bg-transparent p-1 ring-1 ring-border hover:bg-accent/40 hover:ring-primary",
          isPending && "opacity-70",
          className,
        )}
        disabled={isPending}
      >
        {currentLocale?.Flag && (
          <currentLocale.Flag className="size-6 rounded-sm border-none" />
        )}
      </ComboboxTrigger>
      <ComboboxContent align="end" className="w-60">
        <ComboboxInput
          placeholder={t("localeSwitcher.searchPlaceholder")}
          showTrigger={false}
        />
        <ComboboxEmpty>{t("localeSwitcher.noLanguageFound")}</ComboboxEmpty>
        <ComboboxList>
          {(entry: LocaleData) => (
            <ComboboxItem key={entry.code} value={entry}>
              <span className="flex items-center gap-2">
                {entry.Flag && (
                  <entry.Flag className="h-4 w-6 rounded-sm border border-border/20" />
                )}
                <span className="flex flex-col gap-0.5 leading-tight">
                  <span className="text-sm font-semibold">
                    {entry.englishName} | {entry.code}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.label}
                  </span>
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
