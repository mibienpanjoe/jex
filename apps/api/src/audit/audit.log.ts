import { PrismaClient, ActorType, OperationType, AuditEvent } from "@prisma/client";

// Prisma transaction client type
type PrismaTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface AuditEventInput {
  projectId: string;
  actorId: string;
  actorName: string;
  actorType: ActorType;
  operation: OperationType;
  env?: string;
  key?: string;
}

export interface AuditQueryFilters {
  env?: string;
  operation?: OperationType;
  since?: Date;
  until?: Date;
  limit?: number;
}

const prisma = new PrismaClient();

export async function record(tx: PrismaTx, event: AuditEventInput): Promise<void> {
  await tx.auditEvent.create({ data: event });
}

export async function query(
  projectId: string,
  filters: AuditQueryFilters = {}
): Promise<AuditEvent[]> {
  const { env, operation, since, until, limit = 100 } = filters;

  return prisma.auditEvent.findMany({
    where: {
      projectId,
      ...(env ? { env } : {}),
      ...(operation ? { operation } : {}),
      ...(since || until
        ? { timestamp: { ...(since ? { gte: since } : {}), ...(until ? { lte: until } : {}) } }
        : {}),
    },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}
