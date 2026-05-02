import Link from "next/link";
import { adminGrantAccessAction, adminResetProfileAction, adminRevokeAccessAction, logoutAction } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { daysLeft, formatDate } from "@/lib/dates";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  await requireAdmin();
  const [users, plans] = await Promise.all([
    prisma.user.findMany({
      include: {
        profile: true,
        accessGrants: {
          include: { plan: true },
          orderBy: { endsAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true, orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.plan.findMany({ orderBy: { priceCents: "asc" } }),
  ]);

  return (
    <main className="appFrame">
      <header className="appTopbar">
        <Link href="/app" className="brand">
          <span className="brandMark">L</span>
          <span>Luminaria Admin</span>
        </Link>
        <nav className="appNav" aria-label="Admin">
          <Link href="/app">Panel</Link>
          <form action={logoutAction}>
            <button className="button ghostButton" type="submit">
              Wyloguj
            </button>
          </form>
        </nav>
      </header>
      <section className="appContent">
        <p className="eyebrow">Admin lite</p>
        <h1>Użytkownicy i dostępy</h1>
        <div className="adminList">
          {users.map((user) => {
            const grant = user.accessGrants[0];
            const active = grant && grant.status === "ACTIVE" && grant.endsAt > new Date();

            return (
              <article className="adminRow" key={user.id}>
                <div>
                  <h3>{user.email}</h3>
                  <p>
                    Rola: {user.role} · Profil: {user.profile?.lockedAt ? "zablokowany" : user.profile ? "odblokowany" : "brak"} ·
                    Wiadomości: {user._count.messages} · Zamówienia: {user._count.orders}
                  </p>
                  <p>
                    Dostęp:{" "}
                    {grant
                      ? `${grant.plan.name}, ${active ? `${daysLeft(grant.endsAt)} dni` : "nieaktywny"} (do ${formatDate(
                          grant.endsAt,
                        )})`
                      : "brak"}
                  </p>
                </div>
                <div className="adminActions">
                  <form action={adminResetProfileAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button className="button secondaryButton" type="submit">
                      Reset profilu
                    </button>
                  </form>
                  <form action={adminRevokeAccessAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button className="button dangerButton" type="submit">
                      Cofnij dostęp
                    </button>
                  </form>
                  <form action={adminGrantAccessAction} className="tinyForm">
                    <input type="hidden" name="userId" value={user.id} />
                    <select name="plan" aria-label="Plan">
                      {plans.map((plan) => (
                        <option value={plan.slug} key={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                    <button className="button primaryButton" type="submit">
                      Nadaj
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
