import express from "express";
import { healthHandler } from "./health";
import { authRouter } from "./auth/auth.router";
import { sessionsRouter } from "./auth/sessions.router";
import { authenticate } from "./auth/middleware";
import { projectsRouter } from "./projects/projects.router";
import { envsRouter } from "./projects/envs.router";
import { secretsRouter } from "./secrets/secrets.router";
import { auditRouter } from "./audit/audit.router";
import { membersRouter } from "./members/members.router";
import { tokensRouter } from "./tokens/tokens.router";

export function createApp() {
  const app = express();

  const dashboardOrigin =
    process.env.DASHBOARD_ORIGIN ?? process.env.WEB_ORIGIN ?? "http://localhost:3000";

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin === dashboardOrigin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

    if (req.method === "OPTIONS") {
      res.status(204).send();
      return;
    }

    next();
  });

  // Public routes - no authentication required.
  app.get("/api/v1/health", healthHandler);

  // Custom session management lives under /auth but must not be swallowed by
  // the Better Auth catch-all handler.
  app.use("/api/v1/auth/sessions", authenticate, sessionsRouter);

  // Better Auth parses its own request bodies, so keep this before express.json().
  app.use("/api/v1/auth", authRouter);

  app.use(express.json());

  // All routes mounted below this line require a valid session or CI/CD token.
  app.use(authenticate);

  app.use("/api/v1/projects", projectsRouter);
  app.use("/api/v1/projects/:projectId/envs", envsRouter);
  app.use("/api/v1/projects/:projectId/secrets", secretsRouter);
  app.use("/api/v1/projects/:projectId/audit", auditRouter);
  app.use("/api/v1/projects/:projectId/members", membersRouter);
  app.use("/api/v1/projects/:projectId/tokens", tokensRouter);

  return app;
}
