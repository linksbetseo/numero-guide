import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { checkoutAction } from "@/app/actions";
import { formatMoney, getPlans } from "@/lib/plans";

type CheckoutPageProps = {
  searchParams: Promise<{ plan?: string; error?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const plans = await getPlans();
  const selected = plans.find((plan) => plan.slug === params.plan) ?? plans[1] ?? plans[0];

  return (
    <main className="authPage">
      <section className="authPanel">
        <Link href="/" className="brand">
          <span className="brandMark">L</span>
          <span>Luminaria</span>
        </Link>
        <h1>Checkout demo</h1>
        <p>
          Plan <strong>{selected.name}</strong>, {formatMoney(selected.priceCents, selected.currency)},{" "}
          {selected.durationDays} dni dostępu. Ten sprint nie łączy się jeszcze z bramką płatności.
        </p>
        {params.error ? <div className="errorBox">{params.error}</div> : null}
        <form action={checkoutAction} className="formGrid">
          <div className="field">
            <label htmlFor="planSelect">Plan</label>
            <select id="planSelect" name="plan" defaultValue={selected.slug}>
              {plans.map((plan) => (
                <option value={plan.slug} key={plan.id}>
                  {plan.name} - {formatMoney(plan.priceCents, plan.currency)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="displayName">Imię w panelu</label>
            <input id="displayName" name="displayName" autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Hasło</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <label className="checkboxLabel">
            <input name="terms" type="checkbox" required />
            Akceptuję regulamin serwisu w wersji MVP.
          </label>
          <label className="checkboxLabel">
            <input name="aiTerms" type="checkbox" required />
            Akceptuję zasady usługi AI i wiem, że odpowiedzi są automatycznymi interpretacjami.
          </label>
          <label className="checkboxLabel">
            <input name="privacy" type="checkbox" required />
            Akceptuję politykę prywatności i zapis danych profilu oraz rozmów.
          </label>
          <label className="checkboxLabel">
            <input name="immediateService" type="checkbox" required />
            Chcę rozpocząć świadczenie usługi cyfrowej od razu po aktywacji demo.
          </label>
          <button className="button primaryButton" type="submit">
            <CreditCard size={18} aria-hidden="true" />
            Aktywuj dostęp demo
          </button>
        </form>
        <p className="panelActions">
          <ShieldCheck size={18} aria-hidden="true" />
          Zgody są zapisywane przy zamówieniu razem z wersjami dokumentów.
        </p>
      </section>
    </main>
  );
}
