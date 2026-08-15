import type { Metadata } from "next";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Épargne" };

export default function Epargne() {
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>Épargne</div>
      </header>
      <div className={styles.aVenir}>
        <h2>Projets d’épargne</h2>
        <p>
          Bébé, chien, pro, retraite — objectif, montant cumulé et progression.
          Arrive en Phase 7.
        </p>
      </div>
    </div>
  );
}
