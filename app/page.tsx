import styles from "./page.module.css";
import { euros, libelleMois, etatBudget } from "@/lib/format";

/* -------------------------------------------------------------------------
   Données de DÉMONSTRATION (Phase 1) — reprises des postes de la maquette.
   Elles seront remplacées par la base Neon en Phase 4.
   ------------------------------------------------------------------------- */
type Poste = { nom: string; budget: number; depense: number };
type Compte = {
  slug: string;
  nom: string;
  accent: string;
  postes: Poste[];
};

const MOIS = "2026-08-01";

const COMPTES: Compte[] = [
  {
    slug: "coleen",
    nom: "Coleen",
    accent: "var(--coleen)",
    postes: [
      { nom: "Prêt", budget: 320, depense: 320 },
      { nom: "Loyer", budget: 520, depense: 520 },
      { nom: "Nourriture", budget: 260, depense: 214.35 },
      { nom: "Abonnements", budget: 45, depense: 41.99 },
      { nom: "Loisirs", budget: 120, depense: 132.5 },
    ],
  },
  {
    slug: "raph",
    nom: "Raph",
    accent: "var(--raph)",
    postes: [
      { nom: "Loyer", budget: 520, depense: 520 },
      { nom: "Nourriture", budget: 240, depense: 198.7 },
      { nom: "Abonnements", budget: 60, depense: 59.97 },
      { nom: "Loisirs", budget: 150, depense: 88.2 },
    ],
  },
  {
    slug: "commun",
    nom: "Commun",
    accent: "var(--commun)",
    postes: [
      { nom: "Courses communes", budget: 400, depense: 356.8 },
      { nom: "Énergie & eau", budget: 180, depense: 173.42 },
      { nom: "Internet / téléphone", budget: 65, depense: 64.99 },
      { nom: "Assurances", budget: 110, depense: 110 },
      { nom: "Épargne projets", budget: 300, depense: 300 },
    ],
  },
];

function totaux(postes: Poste[]) {
  const budget = postes.reduce((s, p) => s + p.budget, 0);
  const depense = postes.reduce((s, p) => s + p.depense, 0);
  return { budget, depense, reste: budget - depense };
}

export default function TableauDeBord() {
  const foyer = COMPTES.reduce(
    (acc, c) => {
      const t = totaux(c.postes);
      return {
        budget: acc.budget + t.budget,
        depense: acc.depense + t.depense,
      };
    },
    { budget: 0, depense: 0 },
  );
  const resteFoyer = foyer.budget - foyer.depense;

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
        <button type="button" className={styles.mois}>
          {libelleMois(MOIS)}
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="m6 9 6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <section className={styles.synthese} aria-labelledby="synthese-titre">
        <h1 id="synthese-titre" className={styles.syntheseTitre}>
          Synthèse du foyer
        </h1>
        <div className={styles.reste}>
          <span className={styles.resteLabel}>Reste à vivre</span>
          <span className={`${styles.resteVal} chiffre`}>
            {euros(resteFoyer)}
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
              {euros(foyer.depense)}
            </span>
          </div>
        </div>
      </section>

      <h2 className={styles.sectionTitre}>Comptes</h2>
      <div className={styles.comptes}>
        {COMPTES.map((c) => {
          const t = totaux(c.postes);
          return (
            <article
              key={c.slug}
              className={styles.carte}
              style={{ ["--accent" as string]: c.accent }}
            >
              <div className={styles.carteTop}>
                <span className={styles.carteTitre}>
                  <span className={styles.pastille} aria-hidden="true" />
                  {c.nom}
                </span>
                <span className={styles.carteReste}>
                  <span className={`${styles.carteResteVal} chiffre`}>
                    {euros(t.reste)}
                  </span>
                  <span className={styles.carteResteLabel}> restant</span>
                </span>
              </div>

              <div className={styles.lignes}>
                {c.postes.map((p) => {
                  const etat = etatBudget(p.depense, p.budget);
                  const pct = Math.min(
                    100,
                    p.budget > 0 ? (p.depense / p.budget) * 100 : 0,
                  );
                  return (
                    <div className={styles.ligne} key={p.nom}>
                      <span className={styles.ligneNom}>{p.nom}</span>
                      <span className={`${styles.ligneChiffres} chiffre`}>
                        <b>{euros(p.depense)}</b> / {euros(p.budget)}
                      </span>
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
                          data-etat={etat}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
