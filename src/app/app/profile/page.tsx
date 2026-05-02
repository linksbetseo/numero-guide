export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { saveProfileAction } from "@/app/actions";
import { getCurrentAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type ProfilePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const [access, profile] = await Promise.all([
    getCurrentAccess(user.id),
    prisma.numerologyProfile.findUnique({ where: { userId: user.id } }),
  ]);

  if (!access) {
    redirect("/app/access");
  }

  const locked = Boolean(profile?.lockedAt);

  return (
    <section className="dashboardPanel">
      <p className="eyebrow">Onboarding profilu</p>
      <h1>{locked ? "Profil jest zablokowany" : "Utwórz swój profil"}</h1>
      <p className="heroLead">
        Dane są używane do symbolicznych obliczeń i zapisywane jako trace. W tym MVP profil można
        wypełnić tylko raz, chyba że admin wykona reset.
      </p>
      {params.error ? <div className="errorBox">{params.error}</div> : null}
      {locked ? (
        <>
          <div className="profileNumbers">
            <div className="profileNumber">
              <span>Droga życia</span>
              <strong>{profile?.lifePath}</strong>
            </div>
            <div className="profileNumber">
              <span>Ekspresja</span>
              <strong>{profile?.expression}</strong>
            </div>
            <div className="profileNumber">
              <span>Dojrzałość</span>
              <strong>{profile?.maturity}</strong>
            </div>
          </div>
        </>
      ) : (
        <form action={saveProfileAction} className="formGrid">
          <div className="field">
            <label htmlFor="firstNames">Imiona urzędowe</label>
            <input id="firstNames" name="firstNames" defaultValue={profile?.firstNames ?? ""} required />
          </div>
          <div className="field">
            <label htmlFor="lastNames">Nazwiska urzędowe</label>
            <input id="lastNames" name="lastNames" defaultValue={profile?.lastNames ?? ""} required />
          </div>
          <div className="field">
            <label htmlFor="previousNames">Poprzednie warianty imion lub nazwisk</label>
            <textarea id="previousNames" name="previousNames" defaultValue={profile?.previousNames ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="birthDate">Data urodzenia</label>
            <input id="birthDate" name="birthDate" type="date" defaultValue={profile?.birthDate ?? ""} required />
          </div>
          <button className="button primaryButton" type="submit">
            Zapisz i zablokuj profil
          </button>
        </form>
      )}
    </section>
  );
}
