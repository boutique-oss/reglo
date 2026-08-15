import type { Metadata } from "next";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Réglages" };

export default function Reglages() {
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>Réglages</div>
      </header>
      <div className={styles.aVenir}>
        <h2>Réglages du foyer</h2>
        <p>
          Passkeys, revenus mensuels (prorata du compte commun) et export CSV
          Actual Budget. Auth en Phase 3, revenus en Phase 6.
        </p>
      </div>
    </div>
  );
}
