// apps/documentation/src/app/[lang]/docs/layout.tsx
import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { LanguageToggleInline } from "@/components/language-toggle";
import { baseOptions } from "@/components/layout.shared";
import { source } from "@/lib/source";

export default async function Layout({
  params,
  children,
}: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;
  const options = baseOptions();

  return (
    <DocsLayout
      {...options}
      tree={source.getPageTree(lang)}
      i18n={false}
      nav={{
        ...options.nav, // ✅ Keeps existing nav config (title, links, etc.)
        children: <LanguageToggleInline />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
