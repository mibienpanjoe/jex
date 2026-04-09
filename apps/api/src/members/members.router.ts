import { Router, Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import {
  requireOwner,
  requireMember,
  requireNotLastOwner,
} from "../access/access.policy";
import {
  listMembers,
  getMember,
  addMember,
  updateMemberRole,
  removeMember,
} from "../vault/vault.store";
import { record } from "../audit/audit.log";

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// GET /api/v1/projects/:projectId/members
router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as any;
  const projectId = req.params["projectId"] as string;

  await requireMember(userId, projectId, res);
  if (res.headersSent) return;

  const members = await listMembers(projectId);
  res.json(members);
});

// POST /api/v1/projects/:projectId/members  { email, role }
router.post("/", async (req: Request, res: Response) => {
  const { userId } = req.actor as any;
  const projectId = req.params["projectId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  const { email, role } = req.body as { email?: string; role?: string };

  if (!email || !role || !["Owner", "Developer", "ReadOnly"].includes(role)) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  // Look up user by email
  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) {
    // User doesn't exist yet — pending invite not implemented in this phase
    res.status(404).json({ error: "USER_NOT_FOUND" });
    return;
  }

  // Check not already a member
  const existing = await getMember(projectId, target.id);
  if (existing) {
    res.status(409).json({ error: "ALREADY_MEMBER" });
    return;
  }

  const member = await addMember(projectId, target.id, role as Role);

  await prisma.$transaction(async (tx) => {
    await record(tx, {
      projectId,
      actorId: userId,
      actorName: userId,
      actorType: "User",
      operation: "MEMBER_INVITE",
    });
  });

  res.status(201).json(member);
});

// PATCH /api/v1/projects/:projectId/members/:targetUserId  { role }
router.patch("/:targetUserId", async (req: Request, res: Response) => {
  const { userId } = req.actor as any;
  const projectId = req.params["projectId"] as string;
  const targetUserId = req.params["targetUserId"] as string;
  const { role } = req.body as { role?: string };

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  if (!role || !["Owner", "Developer", "ReadOnly"].includes(role)) {
    res.status(400).json({ error: "VALIDATION_ERROR", field: "role" });
    return;
  }

  // Guard: demoting to non-Owner counts as potential last-owner removal
  if (role !== "Owner") {
    try {
      await requireNotLastOwner(projectId, targetUserId);
    } catch (err: any) {
      if (err?.code === "LAST_OWNER") {
        res.status(409).json({ error: "LAST_OWNER" });
        return;
      }
      throw err;
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const member = await updateMemberRole(tx, projectId, targetUserId, role as Role);
    await record(tx, {
      projectId,
      actorId: userId,
      actorName: userId,
      actorType: "User",
      operation: "MEMBER_ROLE_CHANGE",
    });
    return member;
  });

  res.json(updated);
});

// DELETE /api/v1/projects/:projectId/members/:targetUserId
router.delete("/:targetUserId", async (req: Request, res: Response) => {
  const { userId } = req.actor as any;
  const projectId = req.params["projectId"] as string;
  const targetUserId = req.params["targetUserId"] as string;

  await requireOwner(userId, projectId, res);
  if (res.headersSent) return;

  try {
    await requireNotLastOwner(projectId, targetUserId);
  } catch (err: any) {
    if (err?.code === "LAST_OWNER") {
      res.status(409).json({ error: "LAST_OWNER" });
      return;
    }
    throw err;
  }

  await prisma.$transaction(async (tx) => {
    await removeMember(tx, projectId, targetUserId);
    await record(tx, {
      projectId,
      actorId: userId,
      actorName: userId,
      actorType: "User",
      operation: "MEMBER_REMOVE",
    });
  });

  res.status(204).send();
});

export { router as membersRouter };
