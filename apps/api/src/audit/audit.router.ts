import { Router, Request, Response } from "express";
import { requireMember } from "../access/access.policy";
import { query } from "./audit.log";
import { OperationType } from "@prisma/client";

const router = Router({ mergeParams: true });

// GET /api/v1/projects/:projectId/audit?env=&operation=&since=&until=&limit=
router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as any;
  const projectId = req.params["projectId"] as string;

  await requireMember(userId, projectId, res);
  if (res.headersSent) return;

  const env = req.query["env"] as string | undefined;
  const operation = req.query["operation"] as OperationType | undefined;
  const since = req.query["since"] ? new Date(req.query["since"] as string) : undefined;
  const until = req.query["until"] ? new Date(req.query["until"] as string) : undefined;
  const limit = req.query["limit"] ? parseInt(req.query["limit"] as string, 10) : 100;

  const events = await query(projectId, { env, operation, since, until, limit });
  res.json(events);
});

export { router as auditRouter };
