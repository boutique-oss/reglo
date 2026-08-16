import type { Metadata } from "next";
import styles from "./analytics.module.css";
import { euros, libelleMois } from "@/lib/format";
import { moisCourant, normaliserMois } from "@/lib/mois";
import {
  getEvolutionMensuelle,
  getRepartitionParCompte,
  getTopPostes,
} from "@/lib/data/analytics";
import { getBudgetFoyer } from "@/lib/data/budget";
import { getParPersonne } from "@/lib/data/commun";
import { getProjets } from "@/lib/data/epargne";
import { EvoChart } from "./evo-chart";

export const metadata: Metadata = { title: "Stats" };
export const dynamic = "force-dynamic";

function moisCourt(m: string): string {
  const d = new Date(`${m}T00:00:00`);
  return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d);
}

export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>;
}) {
  const sp = await searchParams;
  const mois = normaliserMois(sp?.mois) ?? moisCourant();
  const [evolution, parCompte, topPostes, foyer, personnes, projets] =
    await Promise.all([
      getEvolutionMensuelle(),
      getRepartitionParCompte(mois),
      getTopPostes(mois),
      getBudgetFoyer(mois),
      getParPersonne(mois),
      getProjets(),
    ]);

  const maxEvo = Math.max(
    1,
    ...evolution.map((p) => Math.max(p.budget, p.depense)),
  );
  const totalCompte = parCompte.reduce((s, p) => s + p.valeur, 0);
  const maxPoste = Math.max(1, ...topPostes.map((p) => p.valeur));

  const taux = foyer.budget > 0 ? (foyer.spent / foyer.budget) * 100 : 0;
  const epargneCumulee = projets.reduce((s, p) => s + p.cumule, 0);
  const maxPersonne = Math.max(1, ...personnes.map((p) => p.depense));

  const evoPoints = evolution.map((p) => ({
    mois: p.mois,
    label: moisCourt(p.mois),
    budgetLabel: euros(p.budget),
    depenseLabel: euros(p.depense),
    hBudget: (p.budget / maxEvo) * 100,
    hDepense: (p.depense / maxEvo) * 100,
  }));

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>Statistiques</div>
      </header>

      {/* Indicateurs clés */}
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Taux de dépense</span>
          <span className={`${styles.kpiVal} chiffre`}>{Math.round(taux)} %</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Reste à vivre</span>
          <span className={`${styles.kpiVal} chiffre`}>{euros(foyer.reste)}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Épargne cumulée</span>
          <span className={`${styles.kpiVal} chiffre`}>
            {euros(epargneCumulee)}
          </span>
        </div>
      </div>

      {/* Évolution mensuelle */}
      <section className={styles.carte}>
        <h2 className={styles.titre}>Budgété vs dépensé</h2>
        <EvoChart points={evoPoints} />
      </section>

      {/* Répartition par compte */}
      <section className={styles.carte}>
        <h2 className={styles.titre}>Dépenses par compte — {libelleMois(mois)}</h2>
        {parCompte.length === 0 ? (
          <p className={styles.vide}>
            Aucune dépense saisie pour ce mois. Les graphiques se remplissent au
            fur et à mesure.
          </p>
        ) : (
          <div className={styles.barres}>
            {parCompte.map((p) => (
              <div className={styles.ligne} key={p.nom}>
                <span className={styles.ligneNom}>{p.nom}</span>
                <div className={styles.piste}>
                  <div
                    className={styles.remplissage}
                    style={{
                      width: `${(p.valeur / totalCompte) * 100}%`,
                      background: p.couleur,
                    }}
                  />
                </div>
                <span className={`${styles.ligneVal} chiffre`}>
                  {euros(p.valeur)}
                  <span className={styles.pct}>
                    {" "}
                    {Math.round((p.valeur / totalCompte) * 100)} %
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top postes */}
      {topPostes.length > 0 && (
        <section className={styles.carte}>
          <h2 className={styles.titre}>Postes les plus dépensés</h2>
          <div className={styles.barres}>
            {topPostes.map((p) => (
              <div className={styles.ligne} key={p.nom}>
                <span className={styles.ligneNom}>{p.nom}</span>
                <div className={styles.piste}>
                  <div
                    className={styles.remplissage}
                    style={{
                      width: `${(p.valeur / maxPoste) * 100}%`,
                      background: p.couleur,
                    }}
                  />
                </div>
                <span className={`${styles.ligneVal} chiffre`}>
                  {euros(p.valeur)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dépenses par personne */}
      {personnes.some((p) => p.depense > 0) && (
        <section className={styles.carte}>
          <h2 className={styles.titre}>
            Dépenses par personne — {libelleMois(mois)}
          </h2>
          <div className={styles.barres}>
            {personnes.map((p) => (
              <div className={styles.ligne} key={p.id}>
                <span className={styles.ligneNom}>{p.nom}</span>
                <div className={styles.piste}>
                  <div
                    className={styles.remplissage}
                    style={{
                      width: `${(p.depense / maxPersonne) * 100}%`,
                      background: p.color,
                    }}
                  />
                </div>
                <span className={`${styles.ligneVal} chiffre`}>
                  {euros(p.depense)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Épargne par projet */}
      {projets.length > 0 && (
        <section className={styles.carte}>
          <h2 className={styles.titre}>Progression de l’épargne</h2>
          <div className={styles.barres}>
            {projets.map((p) => (
              <div className={styles.ligne} key={p.envelopeId}>
                <span className={styles.ligneNom}>{p.nom}</span>
                <div className={styles.piste}>
                  <div
                    className={styles.remplissage}
                    style={{
                      width: `${Math.min(100, p.progression * 100)}%`,
                      background: "var(--commun)",
                    }}
                  />
                </div>
                <span className={`${styles.ligneVal} chiffre`}>
                  {Math.round(p.progression * 100)} %
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
