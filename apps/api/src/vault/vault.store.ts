import { PrismaClient, Role } from "@prisma/client";

// Prisma transaction client type (reused by callers)
export type PrismaTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

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

// ─── Secret queries ───────────────────────────────────────────────────────────

export async function listSecretKeys(projectId: string, env: string) {
  return prisma.secret.findMany({
    where: { projectId, environment: env },
    select: { key: true, createdAt: true, updatedAt: true },
    orderBy: { key: "asc" },
  });
}

export async function getSecret(projectId: string, env: string, key: string) {
  return prisma.secret.findUnique({
    where: { projectId_environment_key: { projectId, environment: env, key } },
    select: { ciphertext: true, iv: true },
  });
}

export async function getAllSecrets(projectId: string, env: string) {
  return prisma.secret.findMany({
    where: { projectId, environment: env },
    select: { key: true, ciphertext: true, iv: true },
    orderBy: { key: "asc" },
  });
}

export async function upsertSecret(
  tx: PrismaTx,
  projectId: string,
  env: string,
  key: string,
  ciphertext: string,
  iv: string
) {
  return tx.secret.upsert({
    where: { projectId_environment_key: { projectId, environment: env, key } },
    create: { projectId, environment: env, key, ciphertext, iv },
    update: { ciphertext, iv },
  });
}

export async function deleteSecret(
  tx: PrismaTx,
  projectId: string,
  env: string,
  key: string
) {
  return tx.secret.delete({
    where: { projectId_environment_key: { projectId, environment: env, key } },
  });
}

// ─── Member queries ───────────────────────────────────────────────────────────

export async function listMembers(projectId: string) {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });
}

export async function getMember(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function addMember(projectId: string, userId: string, role: Role) {
  return prisma.projectMember.create({
    data: { projectId, userId, role },
  });
}

export async function updateMemberRole(
  tx: PrismaTx,
  projectId: string,
  userId: string,
  role: Role
) {
  return tx.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role },
  });
}

export async function removeMember(tx: PrismaTx, projectId: string, userId: string) {
  return tx.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
}

// ─── CI/CD token queries ──────────────────────────────────────────────────────

export async function listTokens(projectId: string) {
  return prisma.cICDToken.findMany({
    where: { projectId, revokedAt: null },
    select: {
      id: true,
      projectId: true,
      name: true,
      scopedEnv: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createToken(
  projectId: string,
  name: string,
  scopedEnv: string,
  tokenHash: string
) {
  return prisma.cICDToken.create({
    data: { projectId, name, scopedEnv, tokenHash },
  });
}

export async function getTokenByHash(tokenHash: string) {
  return prisma.cICDToken.findFirst({
    where: { tokenHash },
  });
}

export async function revokeToken(projectId: string, tokenId: string) {
  return prisma.cICDToken.update({
    where: { id: tokenId, projectId },
    data: { revokedAt: new Date() },
  });
}
