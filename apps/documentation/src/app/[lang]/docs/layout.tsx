import type { ReactNode } from "react";

import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default async function Layout({
  params,
  children,
}: // {
//   params: Promise<{ lang: string }>;
//   children: ReactNode;
// }
LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;

  return (
    <DocsLayout {...baseOptions(lang)} tree={source.getPageTree(lang)}>
      {children}
    </DocsLayout>
  );
}
