import { Router, Request, Response } from "express";
import { randomBytes, createHash } from "crypto";
import { requireOwner } from "../access/access.policy";
import { listTokens, createToken, revokeToken } from "../vault/vault.store";

const router = Router({ mergeParams: true });

// GET /api/v1/projects/:projectId/tokens
router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as any;
  const projectId = req.params["projectId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  const tokens = await listTokens(projectId);
  res.json(tokens);
});

// POST /api/v1/projects/:projectId/tokens  { name, scopedEnv }
router.post("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as any;
  const projectId = req.params["projectId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  const { name, scopedEnv } = req.body as { name?: string; scopedEnv?: string };

  if (!name || !scopedEnv) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  // Generate a random token with the jex_ prefix, store only the SHA-256 hash
  const rawToken = `jex_${randomBytes(32).toString("hex")}`;
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const meta = await createToken(projectId, name.trim(), scopedEnv, tokenHash);

  // Return the plain token exactly once — it will never be retrievable again
  res.status(201).json({ token: rawToken, meta });
});

// DELETE /api/v1/projects/:projectId/tokens/:tokenId
router.delete("/:tokenId", async (req: Request, res: Response) => {
  const { userId } = req.actor as any;
  const projectId = req.params["projectId"] as string;
  const tokenId = req.params["tokenId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  try {
    await revokeToken(projectId, tokenId);
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
