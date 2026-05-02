import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendChatMessage } from "@/lib/chat";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { message?: string };
    const result = await sendChatMessage(user.id, body.message ?? "");

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udało się wysłać wiadomości." },
      { status: 400 },
    );
  }
}
