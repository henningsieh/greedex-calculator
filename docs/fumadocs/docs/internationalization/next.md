# Fumadocs (Framework Mode): Next.js
URL: /docs/internationalization/next
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/(framework)/internationalization/next.mdx

Support i18n routing on your Next.js + Fumadocs app
        


<Callout title="New to Next.js?">
  You can [learn more about i18n in
  Next.js](https://nextjs.org/docs/app/building-your-application/routing/internationalization).
</Callout>

Setup [#setup]

<FeedbackBlock id="68e83cd7e7ea2c22" body="Define the i18n configurations in a file, we will import it with @/lib/i18n in this guide.">
  Define the i18n configurations in a file, we will import it with `@/lib/i18n` in this guide.
</FeedbackBlock>

```ts title="lib/i18n.ts"
import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'cn'],
});

```

> <FeedbackBlock id="f97b8076a44553cb" body="See available options for i18n config.">
>   See [available options](/docs/headless/internationalization) for i18n config.
> </FeedbackBlock>

Middleware [#middleware]

<FeedbackBlock id="556cfdacd3eb1ae7" body="Create a middleware that redirects users to appropriate locale.">
  Create a middleware that redirects users to appropriate locale.
</FeedbackBlock>

```ts title="proxy.ts"
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  // You may need to adjust it to ignore static assets in `/public` folder
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

```

<Callout title="Using your own middleware?">
  The default middleware is optional, you can also use your own middleware or the one provided by i18n libraries.

  Make sure its behaviour aligns with the [`hidePrefix`](/docs/headless/internationalization#hide-locale-prefix) option you set in your i18n config.
</Callout>

Routing [#routing]

<FeedbackBlock id="e0d0d44dc227714a" body="Create a /app/[lang] folder, and move your pages/layouts into it, except route handlers.">
  Create a `/app/[lang]` folder, and move your pages/layouts into it, except route handlers.
</FeedbackBlock>

<Files>
  <Folder name="app" defaultOpen>
    <File name="api/search/route.ts" />

    <Folder name="[lang]" defaultOpen>
      <File name="layout.tsx" />

      <File name="(home)/page.tsx" />

      <File name="..." />
    </Folder>
  </Folder>
</Files>

<Callout title="Common Mistake" type="error">
  Did you accidentally find your styles lost? Make sure the import path to `global.css` is still
  correct!
</Callout>

<FeedbackBlock id="c835c17d3389bae1" body="Provide UI translations and other config to <RootProvider />, the English translations are used when translations is not specified.">
  Provide UI translations and other config to `<RootProvider />`, the English translations are used when `translations` is not specified.
</FeedbackBlock>

```tsx title="app/[lang]/layout.tsx"
import { RootProvider } from 'fumadocs-ui/provider/next';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { i18n } from '@/lib/i18n';

// [!code ++:11]
const { provider } = defineI18nUI(i18n, {
  translations: {
    en: {
      displayName: 'English',
    },
    cn: {
      displayName: 'Chinese',
      search: '搜尋文檔',
    },
  },
});

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const lang = (await params).lang;

  return (
    <html lang={lang}>
      <body>
        <RootProvider
          // [!code ++]
          i18n={provider(lang)}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
```

Pass Locale [#pass-locale]

<FeedbackBlock id="2deebc3396d7ee93" body="Add locale parameter to baseOptions() and add i18n into it:">
  Add `locale` parameter to `baseOptions()` and add `i18n` into it:
</FeedbackBlock>

```tsx title="lib/layout.shared.tsx"
import { i18n } from '@/lib/i18n';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

// [!code highlight]
export function baseOptions(locale: string): BaseLayoutProps {
  return {
    i18n, // [!code ++]
    // different props based on `locale`
  };
}
```

<FeedbackBlock id="3e651b8610b87b65" body="Pass the locale to Fumadocs in your pages and layouts.">
  Pass the locale to Fumadocs in your pages and layouts.
</FeedbackBlock>

<CodeBlockTabs defaultValue="lib/source.ts">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="lib/source.ts">
      lib/source.ts
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Home Layout">
      Home Layout
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Docs Layout">
      Docs Layout
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Docs Page">
      Docs Page
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="lib/source.ts">
    ```ts
    import { i18n } from '@/lib/i18n';
    import { loader } from 'fumadocs-core/source';

    export const source = loader({
      i18n, // [!code ++]
      // other options
    });
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Home Layout">
    ```tsx  title="app/[lang]/(home)/layout.tsx"
    import type { ReactNode } from 'react';
    import { HomeLayout } from 'fumadocs-ui/layouts/home';
    import { baseOptions } from '@/lib/layout.shared';

    export default async function Layout({
      params,
      children,
    }: {
      params: Promise<{ lang: string }>;
      children: ReactNode;
    }) {
      const { lang } = await params;

      return <HomeLayout {...baseOptions(lang)}>{children}</HomeLayout>; // [!code highlight]
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Docs Layout">
    ```tsx  title="app/[lang]/docs/layout.tsx"
    import type { ReactNode } from 'react';
    import { source } from '@/lib/source';
    import { DocsLayout } from 'fumadocs-ui/layouts/docs';
    import { baseOptions } from '@/lib/layout.shared';

    export default async function Layout({
      params,
      children,
    }: {
      params: Promise<{ lang: string }>;
      children: ReactNode;
    }) {
      const { lang } = await params;

      return (
        // [!code highlight]
        <DocsLayout {...baseOptions(lang)} tree={source.getPageTree(lang)}>
          {children}
        </DocsLayout>
      );
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Docs Page">
    ```ts  title="app/[lang]/docs/[[...slug]]/page.tsx"
    import { source } from '@/lib/source';

    export default async function Page({
      params,
    }: {
      params: Promise<{ lang: string; slug?: string[] }>;
    }) {
      const { slug, lang } = await params;
      // get page
      source.getPage(slug); // [!code --]
      source.getPage(slug, lang); // [!code ++]

      // get pages
      source.getPages(); // [!code --]
      source.getPages(lang); // [!code ++]
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<Callout title={<>Using another name for <code>lang</code> dynamic segment?</>}>
  If you're using another name like `app/[locale]`, you also need to update `generateStaticParams()` in docs page:

  ```tsx
  export function generateStaticParams() {
    return source.generateParams(); // [!code --]
    return source.generateParams('slug', 'locale'); // [!code ++] new param name
  }
  ```
</Callout>

Search [#search]

<FeedbackBlock id="45b21a9c840a57f5" body="Configure i18n on your search solution.">
  Configure i18n on your search solution.
</FeedbackBlock>

<FeedbackBlock id="02c7dc6faba192b5" body="Built-in Search (Orama): See Internationalization.Cloud Solutions (e.g. Algolia): They usually have official support for multilingual.">
  * **Built-in Search (Orama):** See [Internationalization](/docs/headless/search/orama#internationalization).
  * **Cloud Solutions (e.g. Algolia):** They usually have official support for multilingual.
</FeedbackBlock>

Writing Documents [#writing-documents]

<FeedbackBlock id="c0d8b07e16fa9e55" body="See i18n routing to learn how to create pages for specific locales.">
  See [i18n-routing](../page-conventions.md#i18n-routing) to learn how to create pages for specific locales.
</FeedbackBlock>

Navigation [#navigation]

<FeedbackBlock
  id="9a7b2239e63e6511"
  body="Fumadocs only handles navigation for its own layouts (e.g. sidebar).
For other places, you can use the useParams hook to get the locale from url, and prepend it to href."
>
  Fumadocs only handles navigation for its own layouts (e.g. sidebar).
  For other places, you can use the `useParams` hook to get the locale from url, and prepend it to `href`.
</FeedbackBlock>

```tsx
import Link from 'next/link';
import { useParams } from 'next/navigation';

const { lang } = useParams();

return <Link href={`/${lang}/another-page`}>This is a link</Link>;
```

<FeedbackBlock
  id="3a4286c09fea879f"
  body="In addition, the fumadocs-core/dynamic-link component supports dynamic hrefs, you can use it to prepend the locale prefix.
It is useful for Markdown/MDX content."
>
  In addition, the [`fumadocs-core/dynamic-link`](../headless/components/link.md#dynamic-hrefs) component supports dynamic hrefs, you can use it to prepend the locale prefix.
  It is useful for Markdown/MDX content.
</FeedbackBlock>

```mdx title="content.mdx"
import { DynamicLink } from 'fumadocs-core/dynamic-link';

<DynamicLink href="/[lang]/another-page">This is a link</DynamicLink>
```
