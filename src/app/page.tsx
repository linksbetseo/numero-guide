export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, Sparkles } from "lucide-react";
import { getPaths, getPlans, formatMoney } from "@/lib/plans";
import { LogoMark } from "@/components/Logo";

const EXAMPLE_DIALOGUES = [
  {
    q: "Nie wiem, czy zostawić tę pracę. Mam ofertę, ale boję się.",
    a: "Droga Życia 5 to Odkrywca — ale strach, który opisujesz, nie pochodzi z lęku przed zmianą. Pochodzi z pytania: czy zasługuję na to, żeby wybrać. Co by się stało, gdybyś przez tydzień zachowywała się tak, jakbyś już podjęła decyzję?",
  },
  {
    q: "Ciągle daję z siebie wszystko w relacji i nic nie dostaję w zamian.",
    a: "Szóstka jako Dusza — Opiekun — ma tendencję do dawania bez proszenia o wzajemność. Nie dlatego, że jesteś słaba. Dlatego, że nikt Cię tego nie nauczył. Powiedz mi: kiedy ostatnio powiedziałaś wprost, czego potrzebujesz?",
  },
  {
    q: "Mam 40 lat i wrażenie, że zmarnowałam połowę życia.",
    a: "Liczba Dojrzałości aktywuje się właśnie teraz — około 35-45 roku życia. To nie żal, że 'zmarnowałaś'. To sygnał, że zaczyna się drugi rozdział. Co zrobiłabyś dziś, gdybyś wiedziała, że masz przed sobą tyle samo czasu, ile minęło?",
  },
];

export default async function Home() {
  const [plans, paths] = await Promise.all([getPlans(), getPaths()]);

  return (
    <main>
      <section className="hero">
        <div className="navBar">
          <Link href="/" className="brand heroBrand">
            <span className="brandMark">
              <LogoMark size={22} />
            </span>
            <span>Luminaria</span>
          </Link>
          <nav className="navLinks" aria-label="Główna nawigacja">
            <Link href="#ariadna">O Ariadnie</Link>
            <Link href="#paths">Ścieżki</Link>
            <Link href="#pricing">Plany</Link>
            <Link href="/login">Logowanie</Link>
          </nav>
        </div>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">Ariadna — przewodniczka po liczbach Twojego życia</p>
            <h1>Wyjdź z labiryntu.</h1>
            <p className="heroLead">
              Jestem Ariadną. Czytam Twoją datę urodzenia i imię tak, jak czyta się mapę —
              bez wróżenia, bez obietnic. Wskażę Ci wzorzec, który prowadzi przez decyzję,
              relację albo zmianę. Resztę robisz sam(a).
            </p>
            <div className="heroActions">
              <Link href="#pricing" className="button primaryButton">
                <Sparkles size={18} aria-hidden="true" />
                Zacznij rozmowę z Ariadną
              </Link>
              <Link href="/login" className="button secondaryButton">
                <LockKeyhole size={18} aria-hidden="true" />
                Mam konto
              </Link>
            </div>
          </div>
          <div className="heroPhoto">
            <img src="/ariadna.png" alt="Ariadna — przewodniczka po liczbach życia" />
            <div className="floatingNote" aria-hidden="true">
              <span>Z labiryntu</span>
              <strong>w 5 minut do mapy.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="ariadna">
        <div className="sectionIntro">
          <p className="eyebrow">Kim jest Ariadna</p>
          <h2>Nie wróżka. Nie terapeuta. Przewodniczka po wzorcach.</h2>
          <p>
            Ariadna nie jest człowiekiem — jest interpretacyjnym przewodnikiem opartym
            o pitagorejski system numerologii. Mówi tak, jakby siedziała naprzeciw Ciebie
            z notatnikiem, bo dokładnie po to powstała.
          </p>
        </div>
        <div className="processGrid">
          {[
            [
              "Powiedz mi, kim jesteś",
              "Imię, nazwisko i data urodzenia — nic więcej. Z tego wyliczam sześć liczb i blokuję profil. Jeden człowiek, jeden zestaw danych.",
            ],
            [
              "Obliczam Twój wzorzec",
              "Droga Życia, Ekspresja, Dusza, Osobowość, Dzień Urodzenia, Dojrzałość. Każda liczba to inny głos w tej samej historii.",
            ],
            [
              "Rozmawiamy",
              "Piszesz do mnie jak do mądrej znajomej. Odpowiadam w kilka sekund, konkretnie, przez pryzmat Twoich liczb — nie ogólniki.",
            ],
          ].map(([title, body]) => (
            <article className="processStep" key={title}>
              <span aria-hidden="true">✦</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section accentBand" id="dialogues">
        <div className="sectionIntro">
          <p className="eyebrow">Tak rozmawia Ariadna</p>
          <h2>Konkretne pytania, konkretne odpowiedzi.</h2>
          <p>Przykładowe fragmenty rozmów — anonimizowane.</p>
        </div>
        <div className="dialogueGrid">
          {EXAMPLE_DIALOGUES.map(({ q, a }) => (
            <article className="dialogueCard" key={q}>
              <div className="dialogueBubble user">
                <p>{q}</p>
              </div>
              <div className="dialogueBubble assistant">
                <p>{a}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="paths">
        <div className="sectionIntro">
          <p className="eyebrow">Ścieżki</p>
          <h2>Obszary pracy zamiast listy funkcji.</h2>
          <p>
            Każda rozmowa z Ariadną toczy się w jednej z sześciu ścieżek.
            Wybierasz ją w panelu — możesz zmieniać w trakcie.
          </p>
        </div>
        <div className="pathGrid">
          {paths.map((path) => (
            <article className="pathCard" key={path.id}>
              <span className="pathIcon" aria-hidden="true">◈</span>
              <h3>{path.name}</h3>
              <p>{path.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="sectionIntro">
          <p className="eyebrow">Plany</p>
          <h2>Proste pakiety z czasowym dostępem.</h2>
          <p>
            Kup plan, uzupełnij profil, zacznij rozmawiać z Ariadną.
            Ten sprint nie łączy się jeszcze z zewnętrzną bramką płatności — to demo.
          </p>
        </div>
        <div className="pricingGrid">
          {plans.map((plan) => (
            <article className={`priceCard ${plan.highlighted ? "featured" : ""}`} key={plan.id}>
              {plan.highlighted ? <span className="badge">Polecany</span> : null}
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <strong>{formatMoney(plan.priceCents, plan.currency)}</strong>
              <ul>
                <li>
                  <Check size={16} aria-hidden="true" /> {plan.durationDays} dni dostępu
                </li>
                <li>
                  <Check size={16} aria-hidden="true" /> {plan.pathLimit} ścieżki w panelu
                </li>
                <li>
                  <Check size={16} aria-hidden="true" /> historia rozmowy i profil
                </li>
              </ul>
              <Link className="button primaryButton fullWidth" href={`/checkout?plan=${plan.slug}`}>
                Aktywuj dostęp
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section legalBand">
        <div>
          <p className="eyebrow">Co Ariadna robi, a czego nie zrobi</p>
          <h2>Narzędzie refleksyjne, nie diagnoza ani przepowiednia.</h2>
        </div>
        <ul className="legalList">
          <li>
            <span className="legalCheck yes" aria-hidden="true">✓</span>
            Pokażę wzorzec liczbowy i nazwę napięcie między Twoimi liczbami.
          </li>
          <li>
            <span className="legalCheck yes" aria-hidden="true">✓</span>
            Zadam pytanie pogłębiające, które możesz sprawdzić w swoim życiu.
          </li>
          <li>
            <span className="legalCheck no" aria-hidden="true">✗</span>
            Nie wróżę przyszłości ani nie obiecuję konkretnych zdarzeń.
          </li>
          <li>
            <span className="legalCheck no" aria-hidden="true">✗</span>
            Nie zastąpię terapeuty, lekarza ani żadnego specjalisty.
          </li>
        </ul>
      </section>

      <footer className="footerBand">
        <p>
          <strong>Luminaria</strong> — projekt Adriana G., mentora, który przez 12 lat uczył się słuchać.
          Ariadna to jego sposób, by te rozmowy były dostępne w każdej chwili, bez umawiania.
        </p>
        <p className="footerMuted">
          Odpowiedzi są automatycznie generowanymi interpretacjami symbolicznymi.
          Produkt nie zastępuje terapii, konsultacji medycznej, prawnej ani finansowej.
        </p>
      </footer>
    </main>
  );
}
