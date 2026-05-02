"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

function renderMessage(content: string) {
  const blocks = content.split("\n\n").filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split("\n");
    const isList = lines.every((line) => line.startsWith("- "));

    if (isList) {
      return (
        <ul key={index}>
          {lines.map((line) => (
            <li key={line}>{line.slice(2)}</li>
          ))}
        </ul>
      );
    }

    return <p key={index}>{block}</p>;
  });
}

export function ChatClient({ initialMessages }: { initialMessages: ChatMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [olderLoading, setOlderLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function loadOlder() {
    setOlderLoading(true);
    setError("");

    const response = await fetch(`/api/chat/messages?offset=${messages.length}&limit=20`);
    const payload = (await response.json()) as { messages?: ChatMessage[]; error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Nie udało się pobrać starszych wiadomości.");
    } else if (payload.messages?.length) {
      setMessages((current) => [...payload.messages!, ...current]);
    }

    setOlderLoading(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();

    if (!message || loading) {
      return;
    }

    const tempUser: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: "USER",
      content: message,
      createdAt: new Date().toISOString(),
    };
    const tempAssistant: ChatMessage = {
      id: `temp-assistant-${Date.now()}`,
      role: "ASSISTANT",
      content: "Piszę odpowiedź...",
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, tempUser, tempAssistant]);
    setDraft("");
    setLoading(true);
    setError("");

    const response = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const payload = (await response.json()) as {
      userMessage?: ChatMessage;
      assistantMessage?: ChatMessage;
      error?: string;
    };

    if (!response.ok || !payload.userMessage || !payload.assistantMessage) {
      setMessages((current) =>
        current.filter((item) => item.id !== tempUser.id && item.id !== tempAssistant.id),
      );
      setError(payload.error ?? "Nie udało się wysłać wiadomości.");
    } else {
      setMessages((current) =>
        current.map((item) => {
          if (item.id === tempUser.id) return payload.userMessage!;
          if (item.id === tempAssistant.id) return payload.assistantMessage!;
          return item;
        }),
      );
    }

    setLoading(false);
  }

  return (
    <section className="chatMain">
      <div className="chatHeader">
        <div>
          <p className="eyebrow">Czat AI</p>
          <h2>Rozmowa przewodnia</h2>
        </div>
        <button className="button secondaryButton" type="button" onClick={loadOlder} disabled={olderLoading}>
          {olderLoading ? <Loader2 size={17} aria-hidden="true" /> : null}
          Starsze
        </button>
      </div>
      <div className="messageList" ref={listRef}>
        {messages.map((message) => (
          <article className={`messageBubble ${message.role === "USER" ? "user" : "assistant"}`} key={message.id}>
            {renderMessage(message.content)}
          </article>
        ))}
      </div>
      {error ? <div className="errorBox">{error}</div> : null}
      <form className="chatComposer" onSubmit={submit}>
        <textarea
          aria-label="Wiadomość"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Napisz pytanie albo poproś o pytanie pogłębiające..."
          rows={1}
        />
        <button className="iconButton primaryButton" type="submit" disabled={loading} title="Wyślij">
          {loading ? <Loader2 size={20} aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
        </button>
      </form>
    </section>
  );
}
