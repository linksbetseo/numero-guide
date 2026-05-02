export const dynamic = "force-dynamic";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="appFrame">
      <header className="appTopbar">
        <Link href="/app" className="brand">
          <span className="brandMark">
            <LogoMark size={22} />
          </span>
          <span>Luminaria · Ariadna</span>
        </Link>
        <nav className="appNav" aria-label="Panel">
          <Link href="/app">Dashboard</Link>
          <Link href="/app/profile">Profil</Link>
          <Link href="/app/chat">Czat</Link>
          {user.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
          <form action={logoutAction}>
            <button className="button ghostButton" type="submit">
              <LogOut size={17} aria-hidden="true" />
              Wyloguj
            </button>
          </form>
        </nav>
      </header>
      <main className="appContent">{children}</main>
    </div>
  );
}
