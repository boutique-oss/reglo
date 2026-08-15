import type { Metadata } from "next";
import Link from "next/link";
import styles from "./commun.module.css";
import { euros, libelleMois } from "@/lib/format";
import { moisCourant, normaliserMois } from "@/lib/mois";
import { getCommun } from "@/lib/data/commun";
import { definirContribution } from "@/lib/actions/commun";
import { MontantInline } from "@/components/montant-inline";

export const metadata: Metadata = { title: "Compte commun" };
export const dynamic = "force-dynamic";

export default async function Commun({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>;
}) {
  const sp = await searchParams;
  const mois = normaliserMois(sp?.mois) ?? moisCourant();
  const { totalCommun, totalRevenus, profils } = await getCommun(mois);
  const totalContribue = profils.reduce((s, p) => s + p.contribue, 0);

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>Compte commun</div>
        <span className={styles.mois}>{libelleMois(mois)}</span>
      </header>

      <section className={styles.bloc}>
        <div className={styles.entete}>
          <span className={styles.enteteLabel}>À financer ce mois</span>
          <span className={`${styles.enteteVal} chiffre`}>
            {euros(totalCommun)}
          </span>
        </div>
        <p className={styles.sousLigne}>
          Réparti au prorata des revenus. Déjà versé :{" "}
          <b className="chiffre">{euros(totalContribue)}</b>
        </p>

        {totalRevenus === 0 && (
          <p className={styles.hint}>
            Renseigne les revenus dans{" "}
            <Link href="/reglages" className={styles.lien}>
              Réglages
            </Link>{" "}
            pour calculer le prorata.
          </p>
        )}

        <div className={styles.personnes}>
          {profils.map((p) => {
            const soldePos = p.solde >= 0;
            return (
              <div
                key={p.id}
                className={styles.personne}
                style={{ ["--accent" as string]: p.color }}
              >
                <div className={styles.pTitre}>
                  <span className={styles.pastille} aria-hidden="true" />
                  {p.nom}
                  <span className={styles.part}>
                    {Math.round(p.part * 100)} %
                  </span>
                </div>

                <div className={styles.grille}>
                  <span className={styles.gLabel}>Revenu</span>
                  <span className={`${styles.gVal} chiffre`}>
                    {euros(p.revenu)}
                  </span>

                  <span className={styles.gLabel}>Doit (prorata)</span>
                  <span className={`${styles.gVal} chiffre`}>{euros(p.du)}</span>

                  <span className={styles.gLabel}>A versé</span>
                  <span className={styles.gEdit}>
                    <MontantInline
                      valeur={p.contribue}
                      action={definirContribution.bind(null, p.id, mois)}
                      ariaLabel={`Contribution de ${p.nom}`}
                    />
                  </span>

                  <span className={styles.gLabel}>Solde</span>
                  <span
                    className={`${styles.solde} chiffre ${soldePos ? styles.pos : styles.neg}`}
                  >
                    {soldePos ? "+" : ""}
                    {euros(p.solde)}
                  </span>
                </div>
                <p className={styles.explication}>
                  {soldePos
                    ? "À l'équilibre ou en avance."
                    : `Doit encore verser ${euros(-p.solde)}.`}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
