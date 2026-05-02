import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { selectPathAction } from "@/app/actions";
import { getAccessState } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { daysLeft, formatDate } from "@/lib/dates";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();
  const [access, profile, userPaths] = await Promise.all([
    getAccessState(user.id),
    prisma.numerologyProfile.findUnique({ where: { userId: user.id } }),
    prisma.userPath.findMany({
      where: { userId: user.id },
      include: { path: true },
      orderBy: { path: { sortOrder: "asc" } },
    }),
  ]);

  return (
    <>
      <p className="eyebrow">Panel użytkownika</p>
      <h1>Witaj{user.displayName ? `, ${user.displayName}` : ""}</h1>
      <div className="dashboardGrid">
        <section className="dashboardPanel">
          <h2>Aktualny status</h2>
          {access.status === "active" && access.grant ? (
            <>
              <div className="metricGrid">
                <div className="metric">
                  <strong>{access.grant.plan.name}</strong>
                  <p>aktywny plan</p>
                </div>
                <div className="metric">
                  <strong>{daysLeft(access.grant.endsAt)}</strong>
                  <p>dni do końca</p>
                </div>
                <div className="metric">
                  <strong>{access.grant.plan.pathLimit}</strong>
                  <p>ścieżki w planie</p>
                </div>
              </div>
              <p className="panelActions">
                Dostęp trwa do <strong>{formatDate(access.grant.endsAt)}</strong>.
              </p>
            </>
          ) : (
            <div className="emptyState">
              <h3>{access.status === "expired" ? "Dostęp wygasł" : "Brak dostępu"}</h3>
              <p>Czat i profil wymagają aktywnego planu.</p>
              <div className="panelActions">
                <Link className="button primaryButton" href="/#pricing">
                  Wybierz plan
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="dashboardPanel">
          <h2>Profil</h2>
          {profile?.lockedAt ? (
            <>
              <p>
                Profil jest zablokowany dla jednej osoby i jednego zestawu danych. Reset wykonuje admin.
              </p>
              <div className="profileNumbers">
                <div className="profileNumber">
                  <span>Droga życia</span>
                  <strong>{profile.lifePath}</strong>
                </div>
                <div className="profileNumber">
                  <span>Ekspresja</span>
                  <strong>{profile.expression}</strong>
                </div>
                <div className="profileNumber">
                  <span>Dusza</span>
                  <strong>{profile.soul}</strong>
                </div>
              </div>
              <div className="panelActions">
                <Link className="button primaryButton" href="/app/chat">
                  <MessageCircle size={18} aria-hidden="true" />
                  Kontynuuj rozmowę
                </Link>
              </div>
            </>
          ) : (
            <div className="emptyState">
              <h3>{profile ? "Profil odblokowany do poprawy" : "Utwórz swój profil"}</h3>
              <p>Bez profilu czat nie generuje prywatnego kontekstu.</p>
              <div className="panelActions">
                <Link className="button primaryButton" href="/app/profile">
                  <Sparkles size={18} aria-hidden="true" />
                  Przejdź do profilu
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="dashboardPanel" style={{ marginTop: 18 }}>
        <p className="eyebrow">Ścieżki w dostępie</p>
        <h2>Wybierz aktualny obszar rozmowy</h2>
        {userPaths.length > 0 ? (
          <div className="pathList">
            {userPaths.map((userPath) => (
              <div className="pathChoice" key={userPath.id}>
                <div>
                  <h3>{userPath.path.name}</h3>
                  <p>{userPath.path.description}</p>
                </div>
                <form action={selectPathAction}>
                  <input type="hidden" name="pathId" value={userPath.pathId} />
                  <button
                    className={`button ${userPath.status === "ACTIVE" ? "secondaryButton" : "primaryButton"}`}
                    type="submit"
                    disabled={userPath.status === "ACTIVE"}
                  >
                    {userPath.status === "ACTIVE" ? "Aktywna" : "Wybierz"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="emptyState">
            <p>Ścieżki pojawią się po aktywacji planu.</p>
          </div>
        )}
      </section>
    </>
  );
}
