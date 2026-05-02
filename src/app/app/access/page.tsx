import Link from "next/link";
import { getAccessState } from "@/lib/access";
import { requireUser } from "@/lib/auth";

export default async function AccessPage() {
  const user = await requireUser();
  const access = await getAccessState(user.id);

  return (
    <section className="dashboardPanel">
      <p className="eyebrow">Dostęp</p>
      <h1>{access.status === "expired" ? "Dostęp wygasł" : "Brak aktywnego dostępu"}</h1>
      <p className="heroLead">
        Czat jest zamknięty do czasu aktywacji planu. W MVP możesz przejść przez checkout demo
        albo poprosić admina o ręczne nadanie dostępu.
      </p>
      <div className="panelActions">
        <Link className="button primaryButton" href="/#pricing">
          Wybierz plan
        </Link>
        <Link className="button secondaryButton" href="/app">
          Wróć do panelu
        </Link>
      </div>
    </section>
  );
}
