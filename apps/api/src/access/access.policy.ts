import { Response } from "express";
import { PrismaClient, Role } from "@prisma/client";

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
