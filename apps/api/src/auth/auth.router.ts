import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./better-auth.config";

const router = Router();

// Better Auth handles all /api/v1/auth/* paths.
// toNodeHandler converts Better Auth's fetch-based handler to a Node.js
// IncomingMessage/ServerResponse handler that Express accepts.
router.all("/*", toNodeHandler(auth));

export { router as authRouter };
