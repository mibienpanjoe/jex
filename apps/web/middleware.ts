import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for internal Next.js paths, API routes, docs,
  // and static files. Human-facing app routes are locale-prefixed.
  matcher: [
    "/((?!_next|_vercel|api|docs|favicon.ico|.*\\..*).*)",
  ],
};
