"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(newLocale: string) {
    startTransition(() => {
      // Set cookie to persist user's locale preference
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Refresh Server Components to pick up new locale
      // This is smoother than window.location.reload() - keeps client state
      router.refresh();
    });
  }

  return (
    <div className="fixed top-4 right-4 z-50 rounded-lg border bg-background p-3 shadow-lg">
      <label htmlFor="locale-select" className="mb-2 block font-medium text-sm">
        Language / Sprache
      </label>
      <select
        id="locale-select"
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        disabled={isPending}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {LOCALES.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.label}
          </option>
        ))}
      </select>
      {isPending && (
        <p className="mt-1 text-muted-foreground text-xs">Switching...</p>
      )}
    </div>
  );
}
