"use client";

import { useState, useTransition } from "react";
import { euros } from "@/lib/format";
import styles from "./poste.module.css";

/**
 * Édition en ligne d'un montant générique. `action` est une server action
 * liée à ses identifiants (ex. definirRevenu.bind(null, profileId, mois)).
 */
export function MontantInline({
  valeur,
  action,
  emphase = "fort",
  ariaLabel = "Montant",
}: {
  valeur: number;
  action: (montant: number) => Promise<void>;
  emphase?: "fort" | "doux";
  ariaLabel?: string;
}) {
  const [edition, setEdition] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [pending, start] = useTransition();

  function valider() {
    setEdition(false);
    const n = parseFloat(saisie.replace(",", "."));
    if (!Number.isNaN(n) && n !== valeur) start(() => action(n));
  }

  if (edition) {
    return (
      <input
        className={styles.montantInput}
        type="text"
        inputMode="decimal"
        value={saisie}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setSaisie(e.target.value)}
        onBlur={valider}
        onKeyDown={(e) => {
          if (e.key === "Enter") valider();
          if (e.key === "Escape") setEdition(false);
        }}
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <button
      type="button"
      className={`${styles.montantBtn} ${styles[emphase]} ${pending ? styles.pending : ""}`}
      onClick={() => {
        setSaisie(valeur.toFixed(2));
        setEdition(true);
      }}
    >
      {euros(valeur)}
    </button>
  );
}
