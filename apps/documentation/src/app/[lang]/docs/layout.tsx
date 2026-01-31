// apps/documentation/src/app/[lang]/docs/layout.tsx
import { DocsLayout } from "fumadocs-ui/layouts/docs";

import {
  LanguageToggle,
  LanguageToggleInline,
} from "@/components/language-toggle";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default async function Layout({
  params,
  children,
}: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;

  const options = baseOptions(lang);
  return (
    <DocsLayout
      {...options}
      tree={source.getPageTree(lang)}
      // Option 1: Add language toggle to sidebar footer (replaces default)
      i18n={true}
      // sidebar={{
      //   footer: <LanguageToggle />,
      // }}
      // Option 2: Add language toggle to navbar (inline version)
      nav={{
        ...options.nav, // ✅ Keeps existing nav config (title, links, etc.)
        children: <LanguageToggleInline />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
