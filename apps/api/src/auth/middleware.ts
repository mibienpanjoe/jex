import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

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

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  const token = authHeader.slice(7);

  // CI/CD tokens are prefixed so we can dispatch without an extra DB round-trip
  if (token.startsWith("cicd_")) {
    const cicdToken = await prisma.cICDToken.findFirst({
      where: { tokenHash: token, revokedAt: null },
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

  // User session — look up by token; reject if revoked (INV-09, no cache)
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
  };

  next();
}
