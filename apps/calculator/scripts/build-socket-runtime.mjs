import { build } from "esbuild";

await build({
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
  bundle: true,
  entryPoints: ["src/socket-server.ts"],
  format: "esm",
  minify: true,
  outfile: "dist/socket-server.mjs",
  platform: "node",
});
