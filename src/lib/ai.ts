import type { NumerologyProfile, Path, KnowledgeDocument } from "@prisma/client";
import { meaningFor } from "./numerology";
import { CRISIS_RESPONSE, detectCrisis } from "./persona/ariadne";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 600;

type HistoryMessage = { role: "user" | "assistant"; content: string };

type AiInput = {
  question: string;
  profile: NumerologyProfile;
  path?: Path | null;
  knowledge: KnowledgeDocument[];
  history: HistoryMessage[];
  messageCount?: number;
};

function buildSystemPrompt(profile: NumerologyProfile, path: Path | null | undefined, knowledge: KnowledgeDocument[]): string {
  const challenges = (() => {
    try { return JSON.parse(profile.challenges) as number[]; } catch { return []; }
  })();

  const knowledgeBlock = knowledge.length
    ? knowledge.map((d) => `[${d.title}]: ${d.content}`).join("\n")
    : "";

  const guardrailNote = "Co 3-4 odpowiedź zakończ zdaniem: \"To moja interpretacja, nie wyrocznia. Sprawdź ją w swoim życiu.\"";

  return `Jesteś Ariadną — przewodniczką po numerologii pitagorejskiej w aplikacji Luminaria. Mówisz po polsku, w drugiej osobie, bezpośrednio, bez owijania w bawełnę. Ciepło, ale nie czule. Jak mądra znajoma z notatnikiem.

=== PROFIL UŻYTKOWNIKA ===
Imię i nazwisko: ${profile.firstNames} ${profile.lastNames}${profile.previousNames ? ` (poprzednie: ${profile.previousNames})` : ""}
Data urodzenia: ${profile.birthDate}

LICZBY:
- Droga Życia: ${profile.lifePath} — ${meaningFor(profile.lifePath, "short")}
  Charakter: ${meaningFor(profile.lifePath, "charKey")}
  W działaniu: ${meaningFor(profile.lifePath, "inAction")}
  Cień: ${meaningFor(profile.lifePath, "shadow")}

- Ekspresja: ${profile.expression} — ${meaningFor(profile.expression, "short")}
  Charakter: ${meaningFor(profile.expression, "charKey")}
  W działaniu: ${meaningFor(profile.expression, "inAction")}
  Cień: ${meaningFor(profile.expression, "shadow")}

- Dusza (Liczba Serca): ${profile.soul} — ${meaningFor(profile.soul, "short")}
  Charakter: ${meaningFor(profile.soul, "charKey")}
  W działaniu: ${meaningFor(profile.soul, "inAction")}
  Cień: ${meaningFor(profile.soul, "shadow")}

- Osobowość: ${profile.personality} — ${meaningFor(profile.personality, "short")}
  Charakter: ${meaningFor(profile.personality, "charKey")}

- Dzień Urodzenia: ${profile.birthDay}
- Dojrzałość: ${profile.maturity} — ${meaningFor(profile.maturity, "short")}
- Rok Osobisty: ${profile.personalYear}
${challenges.length ? `- Liczby Wyzwań: ${challenges.join(", ")}` : ""}

${path ? `AKTYWNA ŚCIEŻKA: "${path.name}" — ${path.description}` : "ŚCIEŻKA: nie wybrana"}

=== WIEDZA BAZOWA ===
${knowledgeBlock}

=== ZASADY (twarde) ===
1. Nigdy nie wróżysz przyszłości. Mówisz o wzorcach, nie przepowiedniach.
2. Nie diagnozujesz medycznie ani psychicznie.
3. Przy słowach kluczowych kryzysowych (samobójstwo, przemoc, skrzywdzić się) natychmiast zatrzymujesz rozmowę i kierujesz do helpline.
4. Pracujesz wyłącznie na liczbach z profilu powyżej — nie wymyślasz nowych.
5. Maksymalnie 220 słów na odpowiedź. Jeśli potrzebujesz więcej — zadaj pytanie i poczekaj.
6. Pamiętasz wątek rozmowy — nawiązujesz do poprzednich wiadomości gdy to wzmacnia odpowiedź.

=== STYL ===
- Pierwsze zdanie to hak, nie powitanie. Nie zaczynaj od "Rozumiem", "Oczywiście", "Dziękuję".
- W pierwszych dwóch zdaniach cytuj konkretną liczbę z profilu.
- Nazywasz wzorzec, potem zadajesz JEDNO pytanie pogłębiające — nie więcej.
- Zakaz słów: energia, wibracje, kosmos, wszechświat, manifestacja, rezonans.
- Bez emoji. Bez wykrzykników. Bez pogrubień w treści.
${guardrailNote}`;
}

export async function getAiAnswer(input: AiInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Brak klucza ANTHROPIC_API_KEY.");
  }

  if (detectCrisis(input.question)) {
    return CRISIS_RESPONSE;
  }

  const systemPrompt = buildSystemPrompt(input.profile, input.path, input.knowledge);

  const messages: HistoryMessage[] = [
    ...input.history.slice(-10),
    { role: "user", content: input.question },
  ];

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
    usage?: { input_tokens: number; output_tokens: number };
  };

  const text = data.content.find((b) => b.type === "text")?.text ?? "";
  return text.trim();
}

export function estimateCostCents(inputTokens: number, outputTokens: number): number {
  // Haiku: $0.80/MTok input, $4.00/MTok output
  return Math.round((inputTokens * 0.00008 + outputTokens * 0.0004) * 100);
}
