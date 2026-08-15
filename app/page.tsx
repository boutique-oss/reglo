import styles from "./page.module.css";
import { euros, libelleMois } from "@/lib/format";
import { moisCourant } from "@/lib/mois";
import { getBudgetFoyer } from "@/lib/data/budget";
import { MontantEditable } from "@/components/montant-editable";
import { NomEditable } from "@/components/nom-editable";
import { SupprimerPoste } from "@/components/supprimer-poste";
import { AjoutPoste } from "@/components/ajout-poste";

// Lit la base + la session à chaque requête.
export const dynamic = "force-dynamic";

const ACCENTS: Record<string, string> = {
  coleen: "var(--coleen)",
  raph: "var(--raph)",
  commun: "var(--commun)",
};

export default async function TableauDeBord() {
  const mois = moisCourant();
  const foyer = await getBudgetFoyer(mois);

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>
          reglo
          <span className={styles.brandDots} aria-hidden="true">
            <span style={{ background: "var(--coleen)" }} />
            <span style={{ background: "var(--raph)" }} />
            <span style={{ background: "var(--commun)" }} />
          </span>
        </div>
        <span className={styles.mois}>{libelleMois(mois)}</span>
      </header>

      <section className={styles.synthese} aria-labelledby="synthese-titre">
        <h1 id="synthese-titre" className={styles.syntheseTitre}>
          Synthèse du foyer
        </h1>
        <div className={styles.reste}>
          <span className={styles.resteLabel}>Reste à vivre</span>
          <span className={`${styles.resteVal} chiffre`}>
            {euros(foyer.reste)}
          </span>
        </div>
        <div className={styles.duo}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Budgété</span>
            <span className={`${styles.statVal} chiffre`}>
              {euros(foyer.budget)}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Dépensé</span>
            <span className={`${styles.statVal} chiffre`}>
              {euros(foyer.spent)}
            </span>
          </div>
        </div>
      </section>

      <h2 className={styles.sectionTitre}>Comptes</h2>
      <div className={styles.comptes}>
        {foyer.comptes.map((c) => (
          <article
            key={c.id}
            className={styles.carte}
            style={{ ["--accent" as string]: ACCENTS[c.slug] ?? "var(--commun)" }}
          >
            <div className={styles.carteTop}>
              <span className={styles.carteTitre}>
                <span className={styles.pastille} aria-hidden="true" />
                {c.nom}
              </span>
              <span className={styles.carteReste}>
                <span className={`${styles.carteResteVal} chiffre`}>
                  {euros(c.reste)}
                </span>
                <span className={styles.carteResteLabel}> restant</span>
              </span>
            </div>

            {c.postes.length > 0 && (
              <div className={styles.lignes}>
                {c.postes.map((p) => {
                  const pct = Math.min(
                    100,
                    p.budget > 0 ? (p.spent / p.budget) * 100 : 0,
                  );
                  return (
                    <div className={styles.ligne} key={p.envelopeId}>
                      <NomEditable envelopeId={p.envelopeId} valeur={p.nom} />
                      <span className={styles.ligneChiffres}>
                        <MontantEditable
                          envelopeId={p.envelopeId}
                          mois={mois}
                          champ="spent"
                          valeur={p.spent}
                          emphase="fort"
                        />
                        {" / "}
                        <MontantEditable
                          envelopeId={p.envelopeId}
                          mois={mois}
                          champ="budget"
                          valeur={p.budget}
                        />
                      </span>
                      <SupprimerPoste envelopeId={p.envelopeId} nom={p.nom} />
                      <div
                        className={styles.piste}
                        role="progressbar"
                        aria-label={`${p.nom} : ${Math.round(pct)}% dépensé`}
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className={styles.barre}
                          data-etat={p.etat}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <AjoutPoste accountId={c.id} />
          </article>
        ))}
      </div>
    </div>
  );
}
