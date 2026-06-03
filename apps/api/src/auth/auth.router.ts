import { Router, Request, Response } from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { PrismaClient } from "@prisma/client";
import { auth } from "./better-auth.config";

const router = Router();
const prisma = new PrismaClient();

function getPublicAPIURL(req: Request): string {
  const proto = req.get("x-forwarded-proto") ?? req.protocol;
  const host = req.get("host");
  return `${proto}://${host}`;
}

function getWebOrigin(): string {
  return process.env.WEB_ORIGIN ?? process.env.DASHBOARD_ORIGIN ?? "http://localhost:3000";
}

function isAllowedLoopbackRedirect(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "http:" &&
      (url.hostname === "127.0.0.1" || url.hostname === "localhost")
    );
  } catch {
    return false;
  }
}

// GET /api/v1/auth/cli-callback?redirect=http://127.0.0.1:<port>/callback
// Exchanges an existing browser session cookie for the raw session token that
// the CLI stores in ~/.jex/token. The redirect target is restricted to loopback.
router.get("/cli-callback", async (req: Request, res: Response) => {
  const redirect = req.query["redirect"];
  if (typeof redirect !== "string" || !isAllowedLoopbackRedirect(redirect)) {
    res.status(400).json({ error: "INVALID_REDIRECT" });
    return;
  }

  const sessionResult = await auth.api
    .getSession({
      headers: fromNodeHeaders(req.headers),
      query: { disableCookieCache: true, disableRefresh: true },
    })
    .catch(() => null);

  if (!sessionResult?.session) {
    const callbackURL = `${getPublicAPIURL(req)}${req.originalUrl}`;
    const loginURL = new URL("/login", getWebOrigin());
    loginURL.searchParams.set("callbackURL", callbackURL);
    res.redirect(loginURL.toString());
    return;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionResult.session.id },
  });

  if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  const target = new URL(redirect);
  target.searchParams.set("token", session.token);
  res.redirect(target.toString());
});

// Better Auth handles all /api/v1/auth/* paths.
// toNodeHandler converts Better Auth's fetch-based handler to a Node.js
// IncomingMessage/ServerResponse handler that Express accepts.
router.all("/*", toNodeHandler(auth));

export { router as authRouter };
