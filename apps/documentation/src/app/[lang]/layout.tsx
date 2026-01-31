import { SUPPORTED_LOCALES } from "@greendex/config/languages";
import { defineI18nUI } from "fumadocs-ui/i18n";
import { RootProvider } from "fumadocs-ui/provider/next";

import "./global.css";
import { Inter } from "next/font/google";

import { i18n } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
});

const { provider } = defineI18nUI(i18n, {
  translations: SUPPORTED_LOCALES.reduce(
    (acc, locale) => {
      acc[locale.code] = {
        displayName: locale.label,
      };
      return acc;
    },
    {} as {
      [key: string]: Partial<{
        displayName: string;
      }>;
    },
  ),
});

// export default function Layout({ children }: LayoutProps<"">) {
export default async function RootLayout({
  params,
  children,
}: LayoutProps<"/[lang]">) {
  const lang = (await params).lang;
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={provider(lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}
