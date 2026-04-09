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

const app = express();
const port = process.env.PORT ?? 3001;

app.use(express.json());

// Public routes — no authentication required
app.get("/api/v1/health", healthHandler);
app.use("/api/v1/auth", authRouter);

// All routes mounted below this line require a valid session or CI/CD token
app.use(authenticate);

app.use("/api/v1/auth/sessions", sessionsRouter);
app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/projects/:projectId/envs", envsRouter);
app.use("/api/v1/projects/:projectId/secrets", secretsRouter);
app.use("/api/v1/projects/:projectId/audit", auditRouter);
app.use("/api/v1/projects/:projectId/members", membersRouter);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
