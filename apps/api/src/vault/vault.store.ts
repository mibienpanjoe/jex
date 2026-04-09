import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_ENVIRONMENTS = ["dev", "staging", "prod"];

// ─── Project queries ──────────────────────────────────────────────────────────

export async function createProject(userId: string, name: string) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({ data: { name } });

    await tx.projectMember.create({
      data: { projectId: project.id, userId, role: Role.Owner },
    });

    await tx.environment.createMany({
      data: DEFAULT_ENVIRONMENTS.map((envName, i) => ({
        projectId: project.id,
        name: envName,
        isDefault: i === 0, // dev is default
      })),
    });

    return project;
  });
}

export async function listProjectsForUser(userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { project: { createdAt: "asc" } },
  });

  return memberships.map((m) => ({ ...m.project, role: m.role }));
}

export async function getProject(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { project: true },
  });

  return membership
    ? { ...membership.project, role: membership.role }
    : null;
}

export async function renameProject(projectId: string, name: string) {
  return prisma.project.update({ where: { id: projectId }, data: { name } });
}

export async function deleteProject(projectId: string) {
  // Cascade is handled by Prisma schema (onDelete: Cascade on all children)
  return prisma.project.delete({ where: { id: projectId } });
}

// ─── Environment queries ──────────────────────────────────────────────────────

export async function listEnvironments(projectId: string) {
  const envs = await prisma.environment.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const counts = await prisma.secret.groupBy({
    by: ["environment"],
    where: { projectId },
    _count: { id: true },
  });

  const countMap = new Map(counts.map((c) => [c.environment, c._count.id]));

  return envs.map((e) => ({ ...e, secretCount: countMap.get(e.name) ?? 0 }));
}

export async function createEnvironment(projectId: string, name: string) {
  return prisma.environment.create({ data: { projectId, name } });
}

export async function deleteEnvironment(projectId: string, name: string) {
  if (DEFAULT_ENVIRONMENTS.includes(name)) {
    throw Object.assign(new Error("Cannot delete a default environment"), {
      code: "DEFAULT_ENV",
    });
  }

  return prisma.environment.delete({
    where: { projectId_name: { projectId, name } },
  });
}
