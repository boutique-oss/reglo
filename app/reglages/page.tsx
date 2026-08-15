import type { Metadata } from "next";
import styles from "../page.module.css";
import { CompteSection } from "@/components/compte-section";
import { MontantInline } from "@/components/montant-inline";
import { derniersEvenements, nombreUtilisateurs } from "@/lib/auth/security";
import { getRevenus } from "@/lib/data/commun";
import { definirRevenu } from "@/lib/actions/commun";
import { dateHeure, euros, libelleMois } from "@/lib/format";
import { moisCourant } from "@/lib/mois";

export const metadata: Metadata = { title: "Réglages" };

// Lit la base + la session à chaque requête → pas de pré-rendu au build.
export const dynamic = "force-dynamic";

export default async function Reglages() {
  const mois = moisCourant();
  const [events, nbComptes, revenus] = await Promise.all([
    derniersEvenements(),
    nombreUtilisateurs(),
    getRevenus(mois),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>Réglages</div>
      </header>

      <h2 className={styles.sectionTitre}>Compte &amp; sécurité</h2>
      <CompteSection />

      <h2 className={styles.sectionTitre} style={{ marginTop: "var(--e-6)" }}>
        Revenus — {libelleMois(mois)}
      </h2>
      <div className={styles.revenus}>
        {revenus.map((r) => (
          <div key={r.id} className={styles.revenuLigne}>
            <span className={styles.revenuNom}>
              <span
                className={styles.revenuPastille}
                style={{ background: r.color }}
                aria-hidden="true"
              />
              {r.nom}
            </span>
            <MontantInline
              valeur={r.revenu}
              action={definirRevenu.bind(null, r.id, mois)}
              ariaLabel={`Revenu de ${r.nom}`}
            />
          </div>
        ))}
        <p className={styles.revenusNote}>
          Sert au calcul du prorata sur le{" "}
          <a href="/commun" className={styles.revenuLien}>
            compte commun
          </a>
          . {revenus.length > 0 && `Total : ${euros(
            revenus.reduce((s, r) => s + r.revenu, 0),
          )}.`}
        </p>
      </div>

      <h2 className={styles.sectionTitre} style={{ marginTop: "var(--e-6)" }}>
        Note de sécurité
      </h2>
      <div className={styles.noteSecu}>
        <p className={styles.noteSecuEtat}>
          <span aria-hidden="true">{nbComptes >= 2 ? "🔒" : "🔓"}</span>{" "}
          {nbComptes} / 2 compte{nbComptes > 1 ? "s" : ""} du foyer
          {nbComptes >= 2
            ? " — accès verrouillé, aucune nouvelle connexion possible."
            : " — un second compte peut encore être créé."}
        </p>
        {events.length === 0 ? (
          <p className={styles.noteSecuVide}>
            Aucune tentative de connexion bloquée. 👍
          </p>
        ) : (
          <ul className={styles.noteSecuListe}>
            {events.map((e) => (
              <li key={e.id} className={styles.noteSecuItem}>
                <span className={styles.noteSecuRaison}>{e.reason}</span>
                <span className={styles.noteSecuMeta}>
                  {e.email ?? "—"} · {dateHeure(e.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className={styles.sectionTitre} style={{ marginTop: "var(--e-6)" }}>
        Données
      </h2>
      <a href="/api/export" className={styles.exportBtn} download>
        Exporter en CSV
      </a>
      <p style={{ color: "var(--encre-55)", fontSize: "var(--t-xs)", marginTop: "var(--e-2)" }}>
        Toutes les données (compte, poste, mois, budget, dépensé, reste).
        Colonnes mappables à l’import d’Actual Budget — jamais enfermé dans l’outil.
      </p>
    </div>
  );
}
