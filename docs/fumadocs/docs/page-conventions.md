# Fumadocs (Framework Mode): Page Slugs & Page Tree
URL: /docs/page-conventions
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/(framework)/page-conventions.mdx

A shared convention for organizing your documents
        


> <FeedbackBlock id="2ba8f6afd71b364a" body="This guide only applies for content sources that uses loader() API, such as Fumadocs MDX.">
>   This guide only applies for content sources that uses `loader()` API, such as **Fumadocs MDX**.
> </FeedbackBlock>

Overview [#overview]

<FeedbackBlock
  id="c3297cd0a1596d4e"
  body="Fumadocs generates page slugs and page tree (sidebar items) from your content directory using loader(),
the routing functionality will be handled by your React framework."
>
  Fumadocs generates **page slugs** and **page tree** (sidebar items) from your content directory using [`loader()`](/docs/headless/source-api),
  the routing functionality will be handled by your React framework.
</FeedbackBlock>

<FeedbackBlock id="ae26f363f21b2ec3" body="You can define folders and pages similar to file-system based routing.">
  You can define folders and pages similar to file-system based routing.
</FeedbackBlock>

<Files>
  <Folder name="content/docs (content directory)" defaultOpen>
    <File name="index.mdx" />

    <File name="getting-started.mdx" />
  </Folder>
</Files>

<FeedbackBlock id="e29368215c94e66e" body="To customise its output further, you may use Loader Plugins.">
  To customise its output further, you may use [Loader Plugins](/docs/headless/source-api/plugins).
</FeedbackBlock>

File [#file]

<FeedbackBlock id="8d4483901f04882d" body="For MDX & Markdown file, you can customise page information from frontmatter.">
  For [MDX](https://mdxjs.com) & Markdown file, you can customise page information from frontmatter.
</FeedbackBlock>

```mdx
---
title: My Page
description: Best document ever
icon: HomeIcon
---

## Learn More
```

<FeedbackBlock id="ffca444b909da2fb" body="Fumadocs detects from the following properties to construct page trees.">
  Fumadocs detects from the following properties to construct page trees.
</FeedbackBlock>

| name          | description                           |
| ------------- | ------------------------------------- |
| `title`       | The title of page                     |
| `description` | The description of page               |
| `icon`        | The name of icon, see [Icons](#icons) |

<Callout title="Good to Know">
  Page information is supplied by the content source such as **Fumadocs MDX**.

  On Fumadocs MDX, you can specify a [`schema`](/docs/mdx/collections#schema-1) option to customise frontmatter schema.
</Callout>

Slugs [#slugs]

<FeedbackBlock id="38f3fccd21191ad9" body="The slugs of a page are generated from its file path.">
  The slugs of a page are generated from its file path.
</FeedbackBlock>

| path (relative to content folder) | slugs             |
| --------------------------------- | ----------------- |
| `./dir/page.mdx`                  | `['dir', 'page']` |
| `./dir/index.mdx`                 | `['dir']`         |

Folder [#folder]

<FeedbackBlock id="6cf5460491a81609" body="Organize multiple pages, you can create a Meta file to customise folders.">
  Organize multiple pages, you can create a [Meta file](#meta) to customise folders.
</FeedbackBlock>

Folder Group [#folder-group]

<FeedbackBlock
  id="ef788b53be3ddc9d"
  body="By default, putting a file into folder will change its slugs.
You can wrap the folder name in parentheses to avoid impacting the slugs of child files."
>
  By default, putting a file into folder will change its slugs.
  You can wrap the folder name in parentheses to avoid impacting the slugs of child files.
</FeedbackBlock>

| path (relative to content folder) | slugs      |
| --------------------------------- | ---------- |
| `./(group-name)/page.mdx`         | `['page']` |

Root Folder [#root-folder]

<FeedbackBlock id="0508cbc852a90397" body="Marks the folder as a root folder, only items in the opened root folder will be visible.">
  Marks the folder as a root folder, only items in the opened root folder will be visible.
</FeedbackBlock>

```json title="meta.json"
{
  "title": "Name of Folder",
  "description": "The description of root folder (optional)",
  "root": true
}
```

<FeedbackBlock id="2bd5bac871e66d36" body="For example, when you are opening root folder framework, the other folders (e.g. headless) are not shown on the sidebar and other navigation elements.">
  For example, when you are opening root folder `framework`, the other folders (e.g. `headless`) are not shown on the sidebar and other navigation elements.
</FeedbackBlock>

<Files>
  <Folder name="framework" defaultOpen>
    <File name="index.mdx" />

    <File name="current-page.mdx" className="!text-fd-primary !bg-fd-primary/10" />

    <File name="other-pages.mdx" />
  </Folder>

  <Folder name="headless (hidden)" className="opacity-50" disabled defaultOpen>
    <File name="my-page.mdx" />
  </Folder>
</Files>

<Callout title="Fumadocs UI">
  Fumadocs UI renders root folders as [Sidebar Tabs](/docs/ui/layouts/docs#sidebar-tabs), which allows user to switch between them.
</Callout>

Meta [#meta]

<FeedbackBlock id="3ae1c2cf17a9e2c5" body="Customise folders by creating a meta.json file in the folder.">
  Customise folders by creating a `meta.json` file in the folder.
</FeedbackBlock>

```json title="meta.json"
{
  "title": "Display Name",
  "icon": "MyIcon",
  "pages": ["index", "getting-started"],
  "defaultOpen": true
}
```

| name          | description                                  |
| ------------- | -------------------------------------------- |
| `title`       | Display name                                 |
| `icon`        | The name of icon, see [Icons](#icons)        |
| `defaultOpen` | Open the folder by default                   |
| `collapsible` | Collapsible folder content (default: `true`) |
| `pages`       | Folder items (see below)                     |

Pages [#pages]

<FeedbackBlock id="d20407e35b41dd43" body="Folder items are sorted alphabetically by default, you can add or control the order of items using pages.">
  Folder items are sorted alphabetically by default, you can add or control the order of items using `pages`.
</FeedbackBlock>

```json title="meta.json"
{
  "pages": ["index", "getting-started"]
}
```

> <FeedbackBlock id="4a9fba71f651c233" body="When specified, items are not included unless they are listed in pages.">
>   When specified, items are not included unless they are listed in `pages`.
> </FeedbackBlock>

| Type              | Syntax                                                             | Description                                                                            |
| ----------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **Path**          | `./path/to/page`                                                   | a path to page or folder.                                                              |
| **Separator**     | `---Label---`<br />`---[Icon]Label---`                             | a separator between two sections (icon supported).                                     |
| **Link**          | `[Text](url)`<br />`[Icon][Text](url)`<br />`external:[Text](url)` | insert links (icon supported)<br />add a `external:` prefix to mark links as external. |
| **Rest**          | `...`                                                              | include remaining pages (sorted alphabetically).                                       |
| **Reversed Rest** | `z...a`                                                            | reversed **Rest** item.                                                                |
| **Extract**       | `...folder`                                                        | extract the items from a folder.                                                       |
| **Except**        | `!item`                                                            | Exclude an item from `...` or `z...a`.                                                 |

```json title="meta.json"
{
  "pages": [
    "components",
    "---My Separator---",
    "...folder",
    "...",
    "!file",
    "!otherFolder",
    "[Vercel](https://vercel.com)",
    "[Triangle][Vercel](https://vercel.com)"
  ]
}
```

Icons [#icons]

<FeedbackBlock id="b3f799e422fc9eef" body="Since Fumadocs doesn't include an icon library, you have to convert the icon names to JSX elements in runtime, and render it as a component.">
  Since Fumadocs doesn't include an icon library, you have to convert the icon names to JSX elements in runtime, and render it as a component.
</FeedbackBlock>

<FeedbackBlock id="ca3829a071647a3a" body="You can add an icon handler to loader().">
  You can add an [`icon` handler](/docs/headless/source-api#icons) to `loader()`.
</FeedbackBlock>

i18n Routing [#i18n-routing]

<FeedbackBlock id="e76219eeb6d65ec9" body="You can define different style for i18n routing.">
  You can define different style for i18n routing.
</FeedbackBlock>

```ts title="lib/i18n.ts"
import type { I18nConfig } from 'fumadocs-core/i18n';

export const i18n: I18nConfig = {
  // default
  parser: 'dot',
  // or
  parser: 'dir',
};
```

<Tabs items={['dot', 'dir']}>
  <Tab>
    Add Markdown/meta files for different languages by attending `.{locale}` to your file name, like:

    <Files>
      <Folder name="content/docs" defaultOpen>
        <File name="meta.json" />

        <File name="meta.cn.json" />

        <File name="get-started.mdx" />

        <File name="get-started.cn.mdx" />
      </Folder>
    </Files>

    For the default locale, the locale code is optional.
  </Tab>

  <Tab>
    All content files are grouped by language folders:

    <Files>
      <Folder name="content/docs" defaultOpen>
        <Folder name="en" defaultOpen>
          <File name="meta.json" />

          <File name="get-started.mdx" />
        </Folder>

        <Folder name="cn" defaultOpen>
          <File name="meta.json" />

          <File name="get-started.mdx" />
        </Folder>
      </Folder>
    </Files>
  </Tab>
</Tabs>
