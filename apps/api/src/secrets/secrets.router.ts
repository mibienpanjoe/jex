import { Router, Request, Response } from "express";
import { requireMember } from "../access/access.policy";
import {
  listKeys,
  getSecretValue,
  exportSecrets,
  setSecret,
  removeSecret,
  importSecrets,
} from "./secrets.service";
import { Actor } from "../types/express";

const router = Router({ mergeParams: true });

function actor(req: Request): Actor {
  return req.actor as Actor;
}

function getEnv(req: Request, res: Response): string | null {
  const env = req.query["env"] as string | undefined;
  if (!env) {
    res.status(400).json({ error: "VALIDATION_ERROR", field: "env" });
    return null;
  }
  return env;
}

// GET /api/v1/projects/:projectId/secrets?env=
router.get("/", async (req: Request, res: Response) => {
  const projectId = req.params["projectId"] as string;
  const { userId } = actor(req) as any;

  await requireMember(userId, projectId, res);
  if (res.headersSent) return;

  const env = getEnv(req, res);
  if (!env) return;

  try {
    const keys = await listKeys(actor(req), projectId, env);
    res.json(keys);
  } catch (err: any) {
    if (err?.code === "INSUFFICIENT_PERMISSIONS") {
      res.status(403).json({ error: "INSUFFICIENT_PERMISSIONS" });
    } else {
      throw err;
    }
  }
});

// GET /api/v1/projects/:projectId/secrets/export?env=&format=
router.get("/export", async (req: Request, res: Response) => {
  const projectId = req.params["projectId"] as string;
  const env = getEnv(req, res);
  if (!env) return;

  const format = (req.query["format"] as string) ?? "json";

  try {
    const secrets = await exportSecrets(actor(req), projectId, env);

    if (format === "dotenv") {
      const body = Object.entries(secrets)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join("\n");
      res.type("text/plain").send(body);
    } else {
      res.json(secrets);
    }
  } catch (err: any) {
    if (err?.code === "INSUFFICIENT_PERMISSIONS") {
      res.status(403).json({ error: "INSUFFICIENT_PERMISSIONS" });
    } else {
      throw err;
    }
  }
});

// GET /api/v1/projects/:projectId/secrets/:key?env=
router.get("/:key", async (req: Request, res: Response) => {
  const projectId = req.params["projectId"] as string;
  const key = req.params["key"] as string;
  const env = getEnv(req, res);
  if (!env) return;

  try {
    const value = await getSecretValue(actor(req), projectId, env, key);
    res.json({ key, value });
  } catch (err: any) {
    if (err?.code === "NOT_FOUND") {
      res.status(404).json({ error: "NOT_FOUND" });
    } else if (err?.code === "INSUFFICIENT_PERMISSIONS") {
      res.status(403).json({ error: "INSUFFICIENT_PERMISSIONS" });
    } else {
      throw err;
    }
  }
});

// POST /api/v1/projects/:projectId/secrets  { key, value, env }
router.post("/", async (req: Request, res: Response) => {
  const projectId = req.params["projectId"] as string;
  const { key, value, env } = req.body as { key?: string; value?: string; env?: string };

  if (!key || !value || !env) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  try {
    await setSecret(actor(req), projectId, env, key, value, false);
    res.status(201).json({ key, env });
  } catch (err: any) {
    if (err?.code === "INSUFFICIENT_PERMISSIONS") {
      res.status(403).json({ error: "INSUFFICIENT_PERMISSIONS" });
    } else {
      throw err;
    }
  }
});

// PUT /api/v1/projects/:projectId/secrets/:key?env=  { value }
router.put("/:key", async (req: Request, res: Response) => {
  const projectId = req.params["projectId"] as string;
  const key = req.params["key"] as string;
  const env = getEnv(req, res);
  if (!env) return;

  const { value } = req.body as { value?: string };
  if (!value) {
    res.status(400).json({ error: "VALIDATION_ERROR", field: "value" });
    return;
  }

  try {
    await setSecret(actor(req), projectId, env, key, value, true);
    res.json({ key, env });
  } catch (err: any) {
    if (err?.code === "INSUFFICIENT_PERMISSIONS") {
      res.status(403).json({ error: "INSUFFICIENT_PERMISSIONS" });
    } else {
      throw err;
    }
  }
});

// DELETE /api/v1/projects/:projectId/secrets/:key?env=
router.delete("/:key", async (req: Request, res: Response) => {
  const projectId = req.params["projectId"] as string;
  const key = req.params["key"] as string;
  const env = getEnv(req, res);
  if (!env) return;

  try {
    await removeSecret(actor(req), projectId, env, key);
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "INSUFFICIENT_PERMISSIONS") {
      res.status(403).json({ error: "INSUFFICIENT_PERMISSIONS" });
    } else if (err?.code === "NOT_FOUND" || (err as any)?.code === "P2025") {
      res.status(404).json({ error: "NOT_FOUND" });
    } else {
      throw err;
    }
  }
});

// POST /api/v1/projects/:projectId/secrets/import  { env, secrets: { KEY: VALUE } }
router.post("/import", async (req: Request, res: Response) => {
  const projectId = req.params["projectId"] as string;
  const { env, secrets } = req.body as { env?: string; secrets?: Record<string, string> };

  if (!env || !secrets || typeof secrets !== "object") {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  try {
    await importSecrets(actor(req), projectId, env, secrets);
    res.status(201).json({ imported: Object.keys(secrets).length });
  } catch (err: any) {
    if (err?.code === "INSUFFICIENT_PERMISSIONS") {
      res.status(403).json({ error: "INSUFFICIENT_PERMISSIONS" });
    } else {
      throw err;
    }
  }
});

export { router as secretsRouter };
