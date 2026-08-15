import styles from "./page.module.css";
import { euros } from "@/lib/format";
import { moisCourant, normaliserMois } from "@/lib/mois";
import { getBudgetFoyer } from "@/lib/data/budget";
import { getParPersonne } from "@/lib/data/commun";
import { MontantEditable } from "@/components/montant-editable";
import { NomEditable } from "@/components/nom-editable";
import { SupprimerPoste } from "@/components/supprimer-poste";
import { AjoutPoste } from "@/components/ajout-poste";
import { SelecteurMois } from "@/components/selecteur-mois";
import { CopierBudgets, ReporterRestes } from "@/components/actions-mois";

// Lit la base + la session à chaque requête.
export const dynamic = "force-dynamic";

const ACCENTS: Record<string, string> = {
  coleen: "var(--coleen)",
  raph: "var(--raph)",
  commun: "var(--commun)",
};

export default async function TableauDeBord({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>;
}) {
  const sp = await searchParams;
  const mois = normaliserMois(sp?.mois) ?? moisCourant();
  const [foyer, personnes] = await Promise.all([
    getBudgetFoyer(mois),
    getParPersonne(mois),
  ]);
  const moisVide = foyer.budget === 0 && foyer.spent === 0;

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
        <SelecteurMois mois={mois} />
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

      {moisVide && <CopierBudgets mois={mois} />}

      <h2 className={styles.sectionTitre}>Par personne</h2>
      <div className={styles.personnes}>
        {personnes.map((p) => (
          <div
            key={p.id}
            className={styles.personne}
            style={{ ["--accent" as string]: p.color }}
          >
            <div className={styles.personneTop}>
              <span className={styles.personneNom}>
                <span className={styles.pastille} aria-hidden="true" />
                {p.nom}
              </span>
              <span
                className={`${styles.personneReste} chiffre`}
                data-neg={p.reste < 0 || undefined}
              >
                {euros(p.reste)}
              </span>
            </div>
            <div className={styles.personneDetail}>
              <span>Salaire {euros(p.revenu)}</span>
              <span>· Dépensé {euros(p.depense)}</span>
              <span>· Commun {euros(p.commun)}</span>
            </div>
          </div>
        ))}
      </div>

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
                        {p.carryover !== 0 && (
                          <span className={styles.reporte}>
                            {" "}
                            report {euros(p.carryover)}
                          </span>
                        )}
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

      <ReporterRestes mois={mois} />
    </div>
  );
}
