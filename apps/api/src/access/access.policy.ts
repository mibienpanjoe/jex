import { Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { Actor } from "../types/express";

const prisma = new PrismaClient();

/**
 * Verify the actor belongs to this project.
 * Writes a 403 response and returns false if the check fails.
 * Caller must guard with `if (res.headersSent) return;` after calling.
 */
export async function requireMember(
  userId: string,
  projectId: string,
  res: Response
): Promise<boolean> {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership) {
    res.status(403).json({ error: "FORBIDDEN" });
    return false;
  }

  return true;
}

/**
 * Verify the actor is an Owner on this project.
 * Writes a 403 response and returns false if the check fails.
 */
export async function requireOwner(
  userId: string,
  projectId: string,
  res: Response
): Promise<boolean> {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || membership.role !== Role.Owner) {
    res.status(403).json({ error: "FORBIDDEN" });
    return false;
  }

  return true;
}

/**
 * Ensure the target user is not the last Owner of the project (INV-10).
 * Throws an error with code LAST_OWNER if the guard trips.
 */
export async function requireNotLastOwner(
  projectId: string,
  targetUserId: string
): Promise<void> {
  const ownerCount = await prisma.projectMember.count({
    where: { projectId, role: Role.Owner },
  });

  const targetIsOwner = await prisma.projectMember.findFirst({
    where: { projectId, userId: targetUserId, role: Role.Owner },
  });

  if (targetIsOwner && ownerCount <= 1) {
    throw Object.assign(new Error("Cannot remove or demote the last owner"), {
      code: "LAST_OWNER",
    });
  }
}

/**
 * RBAC matrix for secret operations (FR-052):
 *
 * | Operation | Owner | Developer | ReadOnly | CICDToken |
 * |-----------|-------|-----------|----------|-----------|
 * | read      |  ✓    |    ✓      |    ✓     |    ✓ *    |
 * | write     |  ✓    |    ✓      |    ✗     |    ✓ *    |
 *
 * * CICDToken: additionally restricted to actor.scopedEnv (INV-08)
 *
 * Throws ForbiddenError with code INSUFFICIENT_PERMISSIONS if denied.
 */
export async function authorize(
  actor: Actor,
  operation: "read" | "write",
  projectId: string,
  env: string
): Promise<void> {
  if (actor.actorType === "CICDToken") {
    // CI/CD tokens are scoped to one environment (INV-08)
    if (actor.scopedEnv !== env) {
      throw Object.assign(
        new Error("CI/CD token is not scoped to this environment"),
        { code: "INSUFFICIENT_PERMISSIONS" }
      );
    }
    // Tokens can always read and write within their scoped env
    return;
  }

  // User actor — look up role
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.userId } },
  });

  if (!membership) {
    throw Object.assign(new Error("Not a member of this project"), {
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  if (operation === "write" && membership.role === Role.ReadOnly) {
    throw Object.assign(
      new Error("ReadOnly members cannot write secrets"),
      { code: "INSUFFICIENT_PERMISSIONS" }
    );
  }
}
