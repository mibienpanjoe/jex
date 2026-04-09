import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for internal Next.js paths,
  // dashboard, and auth routes (those are English-only for v0.1).
  matcher: [
    "/((?!_next|_vercel|dashboard|api|docs|favicon.ico|.*\\..*).*)",
  ],
};
