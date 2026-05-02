import type { KnowledgeDocument, NumerologyProfile, Path } from "@prisma/client";
import { meaningFor } from "./numerology";

type FakeAiInput = {
  question: string;
  profile: NumerologyProfile;
  path?: Path | null;
  knowledge: KnowledgeDocument[];
  messageCount?: number;
};

function sentenceTrim(value: string, maxLength = 360) {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}…` : compact;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const GUARDRAIL = "To moja interpretacja, nie wyrocznia. Sprawdź ją w swoim życiu.";

export function createFakeAiAnswer({ question, profile, path, knowledge, messageCount = 0 }: FakeAiInput) {
  const focus = path?.name ?? "obecny temat";
  const knowledgeHint =
    knowledge[0]?.content ??
    "Odpowiedź ma wspierać refleksję, a nie zastępować samodzielną decyzję.";
  const lp = profile.lifePath;
  const exp = profile.expression;
  const soul = profile.soul;
  const lpShort = meaningFor(lp, "short");
  const lpChar = meaningFor(lp, "charKey");
  const expShort = meaningFor(exp, "short");
  const expShadow = meaningFor(exp, "shadow");
  const soulShort = meaningFor(soul, "short");

  const variant = hashStr(question + String(lp)) % 5;
  const addGuardrail = (messageCount + 1) % 4 === 0;

  let answer: string;

  switch (variant) {
    case 0:
      answer = [
        `Zatrzymuję się na jednym słowie z Twojego pytania.`,
        "",
        `Droga Życia ${lp} — ${lpShort} — mówi, że Twój wzorzec w takich momentach to: ${lpChar}`,
        "",
        `Ekspresja ${exp} dodaje do tego ${expShort.toLowerCase()}. To może być atut albo pułapka — zależy, czy widzisz w sobie tendencję: ${expShadow}`,
        "",
        `Ścieżka "${focus}" sugeruje, że warto przyjrzeć się jednemu pytaniu: co byś zrobiła(-ął), gdybyś nie musiała(-ał) się nikomu tłumaczyć?`,
        "",
        `Kontekst dodatkowy: ${sentenceTrim(knowledgeHint)}`,
      ].join("\n");
      break;

    case 1:
      answer = [
        `Mam dwa odczyty tej sytuacji.`,
        "",
        `Pierwszy: przez Drogę Życia ${lp} widzę ${lpChar} To jest Twój dominujący wzorzec.`,
        "",
        `Drugi: Dusza ${soul} — ${soulShort} — może mówić coś innego niż to, co pokazujesz na zewnątrz. Napięcie między tymi dwoma głosami jest często właśnie tym, czego szukasz.`,
        "",
        `Powiedz mi: co w tej sytuacji jest faktem, a co jest tylko lękiem, że tak będzie?`,
        "",
        `Kontekst: ${sentenceTrim(knowledgeHint)}`,
      ].join("\n");
      break;

    case 2:
      answer = [
        `Słuchaj.`,
        "",
        `To, co opisujesz, ma odcisk Drogi Życia ${lp}. ${lpChar}`,
        "",
        `W ścieżce "${focus}" ten wzorzec pojawia się szczególnie wyraźnie. Nie jako problem — jako sygnał, że coś wymaga nazwania.`,
        "",
        `Trzy tropy do sprawdzenia:`,
        `- Co jest teraz faktem, a co przewidywaniem napięcia?`,
        `- Gdzie możesz zrobić jeden mały ruch zgodny z liczbą ${lp}?`,
        `- Co chciałabyś(-byś) powiedzieć, ale jeszcze tego nie powiedziałaś(-eś)?`,
        "",
        `Kontekst: ${sentenceTrim(knowledgeHint)}`,
      ].join("\n");
      break;

    case 3:
      answer = [
        `Zacznę od tego, czego nie powiedziałaś(-eś).`,
        "",
        `Za każdym pytaniem o "co zrobić" jest pytanie o to, czy mam prawo. Droga Życia ${lp} odpowiada na to bardzo konkretnie: ${meaningFor(lp, "inAction")}`,
        "",
        `Ekspresja ${exp} to Twój sposób działania. ${meaningFor(exp, "inAction")}`,
        "",
        `Gdzie w tej sytuacji widzisz te dwa głosy? Który teraz mówi głośniej?`,
      ].join("\n");
      break;

    default:
      answer = [
        `Spójrzmy na to z bliska.`,
        "",
        `Liczba ${lp} — Droga Życia — daje Ci wzorzec: ${lpShort}. ${lpChar}`,
        "",
        `W kontekście tego, o co pytasz, warto pamiętać o cieniu tej liczby: ${meaningFor(lp, "shadow")}`,
        "",
        `Ścieżka "${focus}" to obszar, w którym ten wzorzec może działać na Twoją korzyść — albo pod prąd.`,
        "",
        `Jedno pytanie na koniec: co w tej sytuacji zrobiłabyś(-byś), gdybyś miała(-ał) pewność, że to właściwy kierunek?`,
        "",
        `Kontekst: ${sentenceTrim(knowledgeHint)}`,
      ].join("\n");
  }

  if (addGuardrail) {
    answer += `\n\n${GUARDRAIL}`;
  }

  return answer;
}
