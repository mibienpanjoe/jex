import { Router, Request, Response } from "express";
import {
  listEnvironments,
  createEnvironment,
  deleteEnvironment,
} from "../vault/vault.store";
import { requireMember, requireOwner } from "../access/access.policy";

const router = Router({ mergeParams: true });

// GET /api/v1/projects/:projectId/envs
router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as { userId: string };
  const projectId = req.params["projectId"] as string;

  await requireMember(userId, projectId, res);
  if (res.headersSent) return;

  const envs = await listEnvironments(projectId);
  res.json(envs);
});

// POST /api/v1/projects/:projectId/envs  (Owner only)
router.post("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as { userId: string };
  const projectId = req.params["projectId"] as string;
  const { name } = req.body as { name?: string };

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "VALIDATION_ERROR", field: "name" });
    return;
  }

  try {
    const env = await createEnvironment(projectId, name.trim().toLowerCase());
    res.status(201).json(env);
  } catch (err: any) {
    if (err?.code === "P2002") {
      res.status(409).json({ error: "ENV_ALREADY_EXISTS" });
      return;
    }
    throw err;
  }
});

// DELETE /api/v1/projects/:projectId/envs/:envName  (Owner only)
router.delete("/:envName", async (req: Request, res: Response) => {
  const { userId } = req.actor as { userId: string };
  const projectId = req.params["projectId"] as string;
  const envName = req.params["envName"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  try {
    await deleteEnvironment(projectId, envName);
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "DEFAULT_ENV") {
      res.status(409).json({ error: "CANNOT_DELETE_DEFAULT_ENV" });
      return;
    }
    if (err?.code === "P2025") {
      res.status(404).json({ error: "ENV_NOT_FOUND" });
      return;
    }
    throw err;
  }
});

export { router as envsRouter };
