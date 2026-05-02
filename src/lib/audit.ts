import { prisma } from "./db";

export async function writeAuditLog(input: {
  eventType: string;
  actorUserId?: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      eventType: input.eventType,
      actorUserId: input.actorUserId,
      targetUserId: input.targetUserId,
      metadata: JSON.stringify(input.metadata ?? {}),
    },
  });
}
