import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./better-auth.config";

const prisma = new PrismaClient();

/**
 * Validates every authenticated request by checking the session/token in the
 * database on each call — no in-memory cache (INV-09).
 *
 * Supports two actor types:
 *  - User sessions:  Authorization: Bearer <session token>
 *  - CI/CD tokens:   Authorization: Bearer <cicd token>  (prefixed "cicd_")
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // CI/CD tokens are prefixed jex_ — hash the value before DB lookup (INV-09, no cache)
  if (token?.startsWith("jex_")) {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const cicdToken = await prisma.cICDToken.findFirst({
      where: { tokenHash, revokedAt: null },
    });

    if (!cicdToken) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }

    req.actor = {
      actorType: "CICDToken",
      tokenId: cicdToken.id,
      scopedEnv: cicdToken.scopedEnv,
    };

    next();
    return;
  }

  // User bearer session — look up by token; reject if revoked (INV-09, no cache)
  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }

    req.actor = {
      actorType: "User",
      userId: session.userId,
      sessionId: session.id,
    };

    next();
    return;
  }

  // Browser session cookie — resolve through Better Auth, then enforce our
  // database revocation field on every request.
  const sessionResult = await auth.api
    .getSession({
      headers: fromNodeHeaders(req.headers),
      query: { disableCookieCache: true, disableRefresh: true },
    })
    .catch(() => null);

  if (!sessionResult?.session) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  const dbSession = await prisma.session.findUnique({
    where: { id: sessionResult.session.id },
  });

  if (!dbSession || dbSession.revokedAt !== null || dbSession.expiresAt < new Date()) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  req.actor = {
    actorType: "User",
    userId: dbSession.userId,
    sessionId: dbSession.id,
  };

  next();
}
