import { prisma } from "./db";
import { writeAuditLog } from "./audit";

export async function getCurrentAccess(userId: string) {
  const now = new Date();

  return prisma.accessGrant.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    include: { plan: true },
    orderBy: { endsAt: "desc" },
  });
}

export async function getAccessState(userId: string) {
  const current = await getCurrentAccess(userId);

  if (current) {
    return { status: "active" as const, grant: current };
  }

  const latest = await prisma.accessGrant.findFirst({
    where: { userId },
    include: { plan: true },
    orderBy: { endsAt: "desc" },
  });

  return { status: latest ? ("expired" as const) : ("missing" as const), grant: latest };
}

export async function grantAccessForPlan(input: {
  userId: string;
  planId: string;
  actorUserId?: string;
  providerOrderId?: string;
}) {
  const plan = await prisma.plan.findUniqueOrThrow({
    where: { id: input.planId },
  });
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + plan.durationDays);

  const grant = await prisma.accessGrant.create({
    data: {
      userId: input.userId,
      planId: plan.id,
      startsAt,
      endsAt,
      status: "ACTIVE",
    },
  });

  const paths = await prisma.path.findMany({
    orderBy: { sortOrder: "asc" },
    take: plan.pathLimit,
  });

  for (const [index, path] of paths.entries()) {
    await prisma.userPath.upsert({
      where: {
        userId_pathId: {
          userId: input.userId,
          pathId: path.id,
        },
      },
      create: {
        userId: input.userId,
        pathId: path.id,
        status: index === 0 ? "ACTIVE" : "AVAILABLE",
      },
      update: {},
    });
  }

  await writeAuditLog({
    eventType: "access.granted",
    actorUserId: input.actorUserId,
    targetUserId: input.userId,
    metadata: {
      plan: plan.slug,
      endsAt: endsAt.toISOString(),
      providerOrderId: input.providerOrderId,
    },
  });

  return grant;
}

export async function revokeActiveAccess(input: { userId: string; actorUserId: string }) {
  const now = new Date();
  const result = await prisma.accessGrant.updateMany({
    where: { userId: input.userId, status: "ACTIVE", endsAt: { gt: now } },
    data: { status: "REVOKED", revokedAt: now },
  });

  await writeAuditLog({
    eventType: "access.revoked",
    actorUserId: input.actorUserId,
    targetUserId: input.userId,
    metadata: { count: result.count },
  });

  return result;
}
