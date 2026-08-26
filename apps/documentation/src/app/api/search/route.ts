import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

// Create Orama search server. The default multilingual tokenizer already
// supports every configured locale, so no per-language localeMap is needed.

const server = createFromSource(source);

export const { GET } = server;
