export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { ChatClient, type ChatMessage } from "@/components/ChatClient";
import { getCurrentAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { getConversationMessages, getOrCreateConversation } from "@/lib/chat";
import { daysLeft, formatDate } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { meaningFor } from "@/lib/numerology";

export default async function ChatPage() {
  const user = await requireUser();
  const access = await getCurrentAccess(user.id);

  if (!access) {
    redirect("/app/access");
  }

  const profile = await prisma.numerologyProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile?.lockedAt) {
    redirect("/app/profile");
  }

  const conversation = await getOrCreateConversation(user.id);
  const messages = await getConversationMessages(conversation.id, 0, 20);
  const initialMessages: ChatMessage[] = messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  }));

  const challenges: number[] = (() => {
    try {
      return JSON.parse(profile.challenges ?? "[]");
    } catch {
      return [];
    }
  })();

  return (
    <div className="chatLayout">
      <aside className="chatSidebar">
        <p className="eyebrow">Ariadna o Tobie</p>
        <h2>{conversation.path?.name ?? "Rozmowa przewodnia"}</h2>
        <dl>
          <div>
            <dt>Droga Życia</dt>
            <dd>
              {profile.lifePath} · {meaningFor(profile.lifePath, "short")}
            </dd>
          </div>
          <div>
            <dt>Ekspresja</dt>
            <dd>
              {profile.expression} · {meaningFor(profile.expression, "short")}
            </dd>
          </div>
          <div>
            <dt>Dusza</dt>
            <dd>
              {profile.soul} · {meaningFor(profile.soul, "short")}
            </dd>
          </div>
          <div>
            <dt>Osobowość</dt>
            <dd>
              {profile.personality} · {meaningFor(profile.personality, "short")}
            </dd>
          </div>
          {profile.personalYear ? (
            <div>
              <dt>Rok Osobisty</dt>
              <dd>
                {profile.personalYear} · {meaningFor(profile.personalYear, "short")}
              </dd>
            </div>
          ) : null}
          {challenges.length > 0 ? (
            <div>
              <dt>Wyzwania</dt>
              <dd>{challenges.slice(0, 2).join(" · ")}</dd>
            </div>
          ) : null}
          <div>
            <dt>Dostęp</dt>
            <dd>
              {daysLeft(access.endsAt)} dni · do {formatDate(access.endsAt)}
            </dd>
          </div>
          <div>
            <dt>Zasada Ariadny</dt>
            <dd>Wzorzec, nie wyrok. Refleksja, nie diagnoza.</dd>
          </div>
        </dl>
      </aside>
      <ChatClient initialMessages={initialMessages} />
    </div>
  );
}
