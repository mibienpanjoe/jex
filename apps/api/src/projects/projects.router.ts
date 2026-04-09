import { Router, Request, Response } from "express";
import {
  createProject,
  listProjectsForUser,
  getProject,
  renameProject,
  deleteProject,
} from "../vault/vault.store";
import { requireMember, requireOwner } from "../access/access.policy";

const router = Router();

// GET /api/v1/projects
router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as { userId: string };
  const projects = await listProjectsForUser(userId);
  res.json(projects);
});

// POST /api/v1/projects
router.post("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as { userId: string };
  const { name } = req.body as { name?: string };

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "VALIDATION_ERROR", field: "name" });
    return;
  }

  const project = await createProject(userId, name.trim());
  res.status(201).json(project);
});

// GET /api/v1/projects/:projectId
router.get("/:projectId", async (req: Request, res: Response) => {
  const { userId } = req.actor as { userId: string };
  const projectId = req.params["projectId"] as string;

  await requireMember(userId, projectId, res);
  if (res.headersSent) return;

  const project = await getProject(projectId, userId);
  res.json(project);
});

// PATCH /api/v1/projects/:projectId
router.patch("/:projectId", async (req: Request, res: Response) => {
  const { userId } = req.actor as { userId: string };
  const projectId = req.params["projectId"] as string;
  const { name } = req.body as { name?: string };

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "VALIDATION_ERROR", field: "name" });
    return;
  }

  const project = await renameProject(projectId, name.trim());
  res.json(project);
});

// DELETE /api/v1/projects/:projectId
router.delete("/:projectId", async (req: Request, res: Response) => {
  const { userId } = req.actor as { userId: string };
  const projectId = req.params["projectId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  await deleteProject(projectId);
  res.status(204).send();
});

export { router as projectsRouter };
