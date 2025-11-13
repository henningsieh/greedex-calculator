import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - files ending with extensions (e.g., .jpg, .css)
  // - files in the _next folder
  // - API routes
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
