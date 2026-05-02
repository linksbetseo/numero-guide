import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getConversationMessages, getOrCreateConversation } from "@/lib/chat";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
  const conversation = await getOrCreateConversation(user.id);
  const messages = await getConversationMessages(conversation.id, offset, limit);

  return NextResponse.json({ messages });
}
