import { Router, Request, Response } from "express";
import { randomBytes, createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { requireOwner, requireUserActor } from "../access/access.policy";
import { listTokens } from "../vault/vault.store";
import { record } from "../audit/audit.log";

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// GET /api/v1/projects/:projectId/tokens
router.get("/", async (req: Request, res: Response) => {
  const actor = requireUserActor(req, res);
  if (!actor) return;

  const { userId } = actor;
  const projectId = req.params["projectId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  const tokens = await listTokens(projectId);
  res.json(tokens);
});

// POST /api/v1/projects/:projectId/tokens  { name, scopedEnv }
router.post("/", async (req: Request, res: Response) => {
  const actor = requireUserActor(req, res);
  if (!actor) return;

  const { userId } = actor;
  const projectId = req.params["projectId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  const { name, scopedEnv } = req.body as { name?: string; scopedEnv?: string };

  if (!name || !name.trim() || !scopedEnv || !scopedEnv.trim()) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  const environment = await prisma.environment.findUnique({
    where: { projectId_name: { projectId, name: scopedEnv.trim() } },
  });
  if (!environment) {
    res.status(404).json({ error: "ENVIRONMENT_NOT_FOUND" });
    return;
  }

  // Generate a random token with the jex_ prefix, store only the SHA-256 hash
  const rawToken = `jex_${randomBytes(32).toString("hex")}`;
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const meta = await prisma.$transaction(async (tx) => {
    const created = await tx.cICDToken.create({
      data: { projectId, name: name.trim(), scopedEnv: environment.name, tokenHash },
      select: {
        id: true,
        projectId: true,
        name: true,
        scopedEnv: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
    await record(tx, {
      projectId,
      actorId: userId,
      actorName: userId,
      actorType: "User",
      operation: "TOKEN_CREATE",
      env: environment.name,
      key: created.name,
    });
    return created;
  });

  // Return the plain token exactly once — it will never be retrievable again
  res.status(201).json({ token: rawToken, meta });
});

// DELETE /api/v1/projects/:projectId/tokens/:tokenId
router.delete("/:tokenId", async (req: Request, res: Response) => {
  const actor = requireUserActor(req, res);
  if (!actor) return;

  const { userId } = actor;
  const projectId = req.params["projectId"] as string;
  const tokenId = req.params["tokenId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  try {
    await prisma.$transaction(async (tx) => {
      const token = await tx.cICDToken.update({
        where: { id: tokenId, projectId },
        data: { revokedAt: new Date() },
      });
      await record(tx, {
        projectId,
        actorId: userId,
        actorName: userId,
        actorType: "User",
        operation: "TOKEN_REVOKE",
        env: token.scopedEnv,
        key: token.name,
      });
    });
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "P2025") {
      res.status(404).json({ error: "NOT_FOUND" });
    } else {
      throw err;
    }
  }
});

export { router as tokensRouter };
