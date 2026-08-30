import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const scalarBundlePath = resolve(
  process.cwd(),
  "node_modules/@scalar/api-reference/dist/browser/standalone.js",
);
const scalarBundle = readFile(scalarBundlePath, "utf8");

export const runtime = "nodejs";

/** Serves the lockfile-pinned Scalar browser bundle from the application origin. */
export async function GET() {
  return new Response(await scalarBundle, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "text/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
