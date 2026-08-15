import type { Metadata } from "next";
import styles from "../page.module.css";
import { CompteSection } from "@/components/compte-section";
import { derniersEvenements, nombreUtilisateurs } from "@/lib/auth/security";
import { dateHeure } from "@/lib/format";

export const metadata: Metadata = { title: "Réglages" };

// Lit la base + la session à chaque requête → pas de pré-rendu au build.
export const dynamic = "force-dynamic";

export default async function Reglages() {
  const [events, nbComptes] = await Promise.all([
    derniersEvenements(),
    nombreUtilisateurs(),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>Réglages</div>
      </header>

      <h2 className={styles.sectionTitre}>Compte &amp; sécurité</h2>
      <CompteSection />

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
        À venir
      </h2>
      <p style={{ color: "var(--encre-55)", fontSize: "var(--t-sm)" }}>
        Revenus mensuels (prorata du compte commun) en Phase 6, export CSV
        Actual Budget en Phase 8.
      </p>
    </div>
  );
}
