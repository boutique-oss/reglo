"use client";

import { useRouter } from "next/navigation";
import { decalerMois } from "@/lib/mois";
import { libelleMois } from "@/lib/format";
import styles from "./selecteur-mois.module.css";

export function SelecteurMois({ mois }: { mois: string }) {
  const router = useRouter();

  function aller(m: string) {
    router.push(`/?mois=${m}`);
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.chev}
        aria-label="Mois précédent"
        onClick={() => aller(decalerMois(mois, -1))}
      >
        ‹
      </button>

      <label className={styles.pill}>
        <span className={styles.label}>{libelleMois(mois)}</span>
        <input
          type="month"
          className={styles.input}
          value={mois.slice(0, 7)}
          onChange={(e) => {
            if (e.target.value) aller(`${e.target.value}-01`);
          }}
          aria-label="Choisir le mois et l'année"
        />
      </label>

      <button
        type="button"
        className={styles.chev}
        aria-label="Mois suivant"
        onClick={() => aller(decalerMois(mois, 1))}
      >
        ›
      </button>
    </div>
  );
}
