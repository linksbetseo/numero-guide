import Link from "next/link";
import { LogIn } from "lucide-react";
import { loginAction } from "@/app/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="authPage">
      <section className="authPanel">
        <Link href="/" className="brand">
          <span className="brandMark">L</span>
          <span>Luminaria</span>
        </Link>
        <h1>Wejdź do panelu</h1>
        <p>
          Konto demo z seed: <strong>demo@example.test</strong> / <strong>demo12345</strong>.
          Admin: <strong>admin@example.test</strong> / <strong>admin12345</strong>.
        </p>
        {params.error ? <div className="errorBox">{params.error}</div> : null}
        <form action={loginAction} className="formGrid">
          <input type="hidden" name="next" value={params.next ?? "/app"} />
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Hasło</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <button className="button primaryButton" type="submit">
            <LogIn size={18} aria-hidden="true" />
            Zaloguj
          </button>
        </form>
      </section>
    </main>
  );
}
