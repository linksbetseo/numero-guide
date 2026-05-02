import { prisma } from "./db";
import { getAiAnswer, estimateCostCents } from "./ai";
import { getCurrentAccess } from "./access";
import { buildWelcomeMessage, detectCrisis, CRISIS_RESPONSE } from "./persona/ariadne";

export const chatLimits = {
  perHour: 15,
  perDay: 50,
  maxMessageLength: 4000,
};

export async function getOrCreateConversation(userId: string) {
  const existing = await prisma.conversation.findFirst({
    where: { userId },
    include: { path: true },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    return existing;
  }

  const activePath = await prisma.userPath.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { path: true },
    orderBy: { createdAt: "asc" },
  });

  const profile = await prisma.numerologyProfile.findUnique({ where: { userId } });

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      pathId: activePath?.pathId,
      title: activePath ? `Ścieżka: ${activePath.path.name}` : "Rozmowa przewodnia",
    },
    include: { path: true },
  });

  const welcomeContent = profile?.lockedAt
    ? buildWelcomeMessage({
        lifePath: profile.lifePath,
        expression: profile.expression,
        soul: profile.soul,
        pathName: activePath?.path.name,
      })
    : "Witaj. Jestem Ariadną. Gdy uzupełnisz profil, zacznę odpowiadać przez pryzmat Twoich liczb.";

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: welcomeContent,
      promptVersion: "ariadne-v1",
      knowledgeVersion: "kb-v1",
    },
  });

  return conversation;
}

export async function getConversationMessages(conversationId: string, offset = 0, limit = 20) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
  });

  return messages.reverse();
}

async function enforceChatLimits(userId: string, message: string) {
  if (message.length > chatLimits.maxMessageLength) {
    throw new Error(`Wiadomość może mieć maksymalnie ${chatLimits.maxMessageLength} znaków.`);
  }

  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000);
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);

  const [hourCount, dayCount] = await Promise.all([
    prisma.message.count({
      where: { userId, role: "USER", createdAt: { gte: hourAgo } },
    }),
    prisma.message.count({
      where: { userId, role: "USER", createdAt: { gte: dayAgo } },
    }),
  ]);

  if (hourCount >= chatLimits.perHour || dayCount >= chatLimits.perDay) {
    throw new Error("Wróć za chwilę. Ten dostęp ma miękki limit rozmów, żeby odpowiedzi pozostały uważne.");
  }
}

export async function sendChatMessage(userId: string, content: string) {
  const access = await getCurrentAccess(userId);

  if (!access) {
    throw new Error("Brak aktywnego dostępu.");
  }

  const message = content.trim();
  await enforceChatLimits(userId, message);

  if (!message) {
    throw new Error("Napisz pytanie przed wysłaniem.");
  }

  const profile = await prisma.numerologyProfile.findUnique({
    where: { userId },
  });

  if (!profile?.lockedAt) {
    throw new Error("Najpierw uzupełnij i zablokuj profil numerologiczny.");
  }

  if (detectCrisis(message)) {
    const conversation = await getOrCreateConversation(userId);
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: "USER",
        content: message,
        tokenEstimate: Math.ceil(message.length / 4),
      },
    });
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: CRISIS_RESPONSE,
        promptVersion: "crisis-v1",
        knowledgeVersion: "kb-v1",
        tokenEstimate: Math.ceil(CRISIS_RESPONSE.length / 4),
        costEstimateCents: 0,
      },
    });
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
    return { userMessage, assistantMessage };
  }

  const conversation = await getOrCreateConversation(userId);
  const [knowledge, recentMessages] = await Promise.all([
    prisma.knowledgeDocument.findMany({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.message.findMany({
      where: { conversationId: conversation.id, role: { in: ["USER", "ASSISTANT"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const history = recentMessages
    .reverse()
    .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
    .map((m) => ({ role: m.role === "USER" ? "user" as const : "assistant" as const, content: m.content }));

  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      userId,
      role: "USER",
      content: message,
      tokenEstimate: Math.ceil(message.length / 4),
    },
  });

  const answer = await getAiAnswer({
    question: message,
    profile,
    path: conversation.path,
    knowledge,
    history,
  });

  const outputTokens = Math.ceil(answer.length / 4);
  const inputTokens = Math.ceil((history.map(m => m.content).join("").length + message.length) / 4);

  const assistantMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: answer,
      promptVersion: "ariadne-v1",
      knowledgeVersion: knowledge[0]?.version ?? "kb-v1",
      tokenEstimate: outputTokens,
      costEstimateCents: estimateCostCents(inputTokens, outputTokens),
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return { userMessage, assistantMessage };
}
