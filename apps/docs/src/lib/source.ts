// apps/docs/src/lib/source.ts
import { loader } from "fumadocs-core/source";
import { resolveFiles } from "fumadocs-mdx";
import { docs } from "fumadocs-mdx:collections/server";

export const source = loader({
  baseUrl: "/docs",
  // source: docs.toFumadocsSource(),
  source: {
    files: resolveFiles({ docs: docs.docs, meta: docs.meta }),
  },
});
