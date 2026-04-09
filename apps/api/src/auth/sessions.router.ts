import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// GET /api/v1/auth/sessions — list all non-revoked sessions for the current user
router.get("/", async (req: Request, res: Response) => {
  const actor = (req as any).actor as { userId: string };

  const sessions = await prisma.session.findMany({
    where: {
      userId: actor.userId,
      revokedAt: null,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      userAgent: true,
      ipAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(sessions);
});

// DELETE /api/v1/auth/sessions/:sessionId — revoke a specific session
router.delete("/:sessionId", async (req: Request, res: Response) => {
  const actor = (req as any).actor as { userId: string };
  const sessionId = req.params["sessionId"] as string;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== actor.userId) {
    res.status(404).json({ error: "SESSION_NOT_FOUND" });
    return;
  }

  if (session.revokedAt) {
    res.status(409).json({ error: "SESSION_ALREADY_REVOKED" });
    return;
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });

  res.status(204).send();
});

export { router as sessionsRouter };
